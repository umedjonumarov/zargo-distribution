import { createHmac } from "crypto";
import { supabase } from "../lib/supabase.js";
import { sendMessage } from "../lib/telegram.js";
import { fmtSomoni } from "../lib/i18n.js";

// Telegram WebApp initData'ni tekshirish — bu so'rov HAQIQATAN HAM
// Telegram'ning o'zidan kelganini va hech kim soxtalashtirmaganini isbotlaydi.
// Rasmiy Telegram algoritmi: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
function validateInitData(initData: string): { valid: boolean; userId?: number } {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return { valid: false };
    params.delete("hash");

    const pairs: string[] = [];
    params.forEach((value, key) => pairs.push(`${key}=${value}`));
    pairs.sort();
    const dataCheckString = pairs.join("\n");

    const secretKey = createHmac("sha256", "WebAppData")
      .update(process.env.TELEGRAM_BOT_TOKEN!)
      .digest();
    const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    if (computedHash !== hash) return { valid: false };

    const userStr = params.get("user");
    if (!userStr) return { valid: false };
    const user = JSON.parse(userStr);
    return { valid: true, userId: user.id };
  } catch {
    return { valid: false };
  }
}

type CartItem = { product_id: string; qty: number };

async function getCartItems(shopId: string): Promise<CartItem[]> {
  const { data } = await supabase.from("carts").select("items").eq("shop_id", shopId).maybeSingle();
  return (data?.items as CartItem[]) ?? [];
}

async function saveCartItems(shopId: string, items: CartItem[]) {
  await supabase.from("carts").upsert({ shop_id: shopId, items, updated_at: new Date().toISOString() });
}

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { initData, action } = req.body;
  const validation = validateInitData(initData || "");
  if (!validation.valid) {
    res.status(401).json({ error: "Telegram tasdiqlashi muvaffaqiyatsiz" });
    return;
  }

  try {
    const { data: shop } = await supabase
      .from("shops")
      .select("*")
      .eq("telegram_chat_id", validation.userId)
      .maybeSingle();

    if (!shop) {
      res.status(404).json({ error: "not_registered" });
      return;
    }

    if (shop.status === "blocked") {
      res.status(403).json({ error: "blocked" });
      return;
    }

    if (action === "get_data") {
      const [{ data: products }, cartItems] = await Promise.all([
        supabase.from("products").select("*").eq("is_active", true).gt("stock_qty", 0),
        getCartItems(shop.id),
      ]);
      res.status(200).json({ ok: true, shop, products: products || [], cart: cartItems });
      return;
    }

    if (action === "update_cart") {
      const { productId, qty } = req.body;
      const items = await getCartItems(shop.id);
      const next =
        qty <= 0
          ? items.filter((i) => i.product_id !== productId)
          : (() => {
              const existing = items.find((i) => i.product_id === productId);
              if (existing) return items.map((i) => (i.product_id === productId ? { ...i, qty } : i));
              return [...items, { product_id: productId, qty }];
            })();
      await saveCartItems(shop.id, next);
      res.status(200).json({ ok: true, cart: next });
      return;
    }

    if (action === "checkout") {
      const items = await getCartItems(shop.id);
      if (items.length === 0) {
        res.status(400).json({ error: "Savat bo'sh" });
        return;
      }

      const { data: products } = await supabase
        .from("products")
        .select("*")
        .in(
          "id",
          items.map((i) => i.product_id)
        );
      const productMap = new Map((products || []).map((p: any) => [p.id, p]));

      let total = 0;
      for (const item of items) {
        const p = productMap.get(item.product_id);
        if (p) total += Number(p.price) * item.qty;
      }

      const oldDebt = Number(shop.current_debt);
      const willExceedLimit = oldDebt + total > Number(shop.debt_limit);

      const { data: order } = await supabase
        .from("orders")
        .insert({ shop_id: shop.id, status: "pending" })
        .select()
        .single();
      if (!order) throw new Error("Buyurtma yaratilmadi");

      const orderItemsPayload = items.map((item) => {
        const p = productMap.get(item.product_id)!;
        return { order_id: order.id, product_id: item.product_id, qty: item.qty, unit_price: p.price };
      });
      await supabase.from("order_items").insert(orderItemsPayload);

      // Limit ichida bo'lsa — avtomatik tasdiqlanadi (do'kon darhol tovarni "oldi" deb hisoblanadi).
      // Limitdan oshsa — "pending" holatda qoladi, admin ko'rib tasdiqlaydi.
      if (!willExceedLimit) {
        await supabase.from("orders").update({ status: "confirmed", confirmed_by: "auto" }).eq("id", order.id);
      }

      await saveCartItems(shop.id, []);

      const { data: updatedShop } = await supabase
        .from("shops")
        .select("current_debt")
        .eq("id", shop.id)
        .maybeSingle();
      const newDebt = Number(updatedShop?.current_debt ?? oldDebt + total);

      // Har bir yangi buyurtma haqida — holatidan qat'i nazar — adminga DARHOL xabar beramiz
      if (process.env.ADMIN_TELEGRAM_CHAT_ID) {
        const itemsText = items
          .map((i) => {
            const p = productMap.get(i.product_id);
            return `${p ? p.name : "?"} × ${i.qty}`;
          })
          .join("\n");
        const statusNote = willExceedLimit
          ? "⏳ Лимитдан ошди — тасдиқ кутмоқда"
          : "✅ Автоматик тасдиқланди";
        await sendMessage(
          process.env.ADMIN_TELEGRAM_CHAT_ID,
          `🆕 <b>Янги буюртма</b>\n\nДўкон: ${shop.name} (${shop.owner_name})\n\n${itemsText}\n\nЖами: ${fmtSomoni(
            total
          )}\n${statusNote}`
        );
      }

      res.status(200).json({
        ok: true,
        willExceedLimit,
        total,
        oldDebt,
        newDebt,
        orderId: order.id,
      });
      return;
    }

    res.status(400).json({ error: "Noma'lum amal" });
  } catch (err: any) {
    console.error("Miniapp API xato:", err);
    res.status(500).json({ error: err.message || "Server xatosi" });
  }
}
