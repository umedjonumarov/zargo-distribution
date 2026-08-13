import { supabase } from "../lib/supabase.js";
import { sendMessage } from "../lib/telegram.js";
import { t, Lang } from "../lib/i18n.js";

function checkPassword(req: any): boolean {
  const provided =
    req.headers["x-admin-password"] || req.query?.password || req.body?.password;
  return provided === process.env.ADMIN_PASSWORD;
}

export default async function handler(req: any, res: any) {
  // CORS emas — bir domendan (admin.html shu Vercel loyihasida) ishlatiladi
  if (!checkPassword(req)) {
    res.status(401).json({ error: "Noto'g'ri parol" });
    return;
  }

  try {
    if (req.method === "GET") {
      const [shops, products, orders] = await Promise.all([
        supabase.from("shops").select("*").order("current_debt", { ascending: false }),
        supabase.from("products").select("*").order("category"),
        supabase
          .from("orders")
          .select("*, shops(name,owner_name), order_items(qty,unit_price,products(name))")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (shops.error || products.error || orders.error) {
        throw new Error(
          shops.error?.message || products.error?.message || orders.error?.message
        );
      }

      res.status(200).json({
        shops: shops.data,
        products: products.data,
        orders: orders.data,
      });
      return;
    }

    if (req.method === "POST") {
      const { action } = req.body;

      if (action === "confirm_order") {
        const { orderId } = req.body;
        const { error } = await supabase
          .from("orders")
          .update({ status: "confirmed", confirmed_by: "admin" })
          .eq("id", orderId);
        if (error) throw new Error(error.message);

        // Do'kon egasiga tasdiqlanganini xabar qilamiz
        const { data: order } = await supabase
          .from("orders")
          .select("shop_id, total_amount")
          .eq("id", orderId)
          .maybeSingle();

        if (order) {
          const { data: shop } = await supabase
            .from("shops")
            .select("telegram_chat_id, language, current_debt")
            .eq("id", order.shop_id)
            .maybeSingle();

          if (shop?.telegram_chat_id && shop.language) {
            const lang = shop.language as Lang;
            const newDebt = Number(shop.current_debt);
            const oldDebt = newDebt - Number(order.total_amount);
            await sendMessage(shop.telegram_chat_id, t.orderConfirmed[lang](oldDebt, newDebt));
          }
        }

        res.status(200).json({ ok: true });
        return;
      }

      if (action === "add_payment") {
        const { shopId, amount } = req.body;
        if (!amount || amount <= 0) {
          res.status(400).json({ error: "Noto'g'ri summa" });
          return;
        }
        const { error } = await supabase.from("debt_transactions").insert({
          shop_id: shopId,
          type: "payment",
          amount,
          note: "Admin panel orqali qabul qilindi",
        });
        if (error) throw new Error(error.message);

        // Do'kon egasiga botdan avtomatik xabar yuboramiz
        const { data: shop } = await supabase
          .from("shops")
          .select("telegram_chat_id, language, current_debt")
          .eq("id", shopId)
          .maybeSingle();

        if (shop?.telegram_chat_id && shop.language) {
          const lang = shop.language as Lang;
          await sendMessage(
            shop.telegram_chat_id,
            t.paymentReceived[lang](amount, Number(shop.current_debt))
          );
        }

        res.status(200).json({ ok: true });
        return;
      }

      if (action === "add_shop") {
        const { name, ownerName, ownerPhone, debtLimit } = req.body;
        const { data, error } = await supabase
          .from("shops")
          .insert({
            name,
            owner_name: ownerName,
            owner_phone: ownerPhone || null,
            debt_limit: debtLimit || 0,
            status: "pending_link",
          })
          .select()
          .single();
        if (error) throw new Error(error.message);
        res.status(200).json({ ok: true, shop: data });
        return;
      }

      if (action === "add_product") {
        const { category, name, price, stockQty, lowStockThreshold, imageUrl } = req.body;
        const { error } = await supabase.from("products").insert({
          category,
          name,
          price,
          stock_qty: stockQty || 0,
          low_stock_threshold: lowStockThreshold || 20,
          image_url: imageUrl || null,
          is_active: true,
        });
        if (error) throw new Error(error.message);
        res.status(200).json({ ok: true });
        return;
      }

      if (action === "update_shop_limit") {
        const { shopId, debtLimit } = req.body;
        const { error } = await supabase
          .from("shops")
          .update({ debt_limit: debtLimit })
          .eq("id", shopId);
        if (error) throw new Error(error.message);
        res.status(200).json({ ok: true });
        return;
      }

      res.status(400).json({ error: "Noma'lum amal (action)" });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error("Admin API xato:", err);
    res.status(500).json({ error: err.message || "Server xatosi" });
  }
}
