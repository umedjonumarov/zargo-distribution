import { supabase } from "../lib/supabase.js";
import { sendMessage } from "../lib/telegram.js";
import { t, Lang } from "../lib/i18n.js";

function checkPassword(req: any): boolean {
  const provided = (
    req.headers["x-admin-password"] || req.query?.password || req.body?.password || ""
  )
    .toString()
    .trim();
  const expected = (process.env.ADMIN_PASSWORD || "").trim();
  return provided.length > 0 && provided === expected;
}

export default async function handler(req: any, res: any) {
  // Muhim: bu javob HECH QACHON keshlanmasligi kerak, aks holda
  // eski "noto'g'ri parol" javobi barcha keyingi urinishlarga qaytarilib qoladi
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");

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
        const { category, name, price, costPrice, unitsPerPackage, stockQty, lowStockThreshold, imageUrl } = req.body;
        const { error } = await supabase.from("products").insert({
          category,
          name,
          price,
          cost_price: costPrice || null,
          units_per_package: unitsPerPackage || null,
          stock_qty: stockQty || 0,
          low_stock_threshold: lowStockThreshold || 20,
          image_url: imageUrl || null,
          is_active: true,
        });
        if (error) throw new Error(error.message);
        res.status(200).json({ ok: true });
        return;
      }

      if (action === "update_product") {
        const { productId, category, name, price, costPrice, unitsPerPackage, stockQty, lowStockThreshold, imageUrl } = req.body;
        const updatePayload: any = {
          category,
          name,
          price,
          cost_price: costPrice || null,
          units_per_package: unitsPerPackage || null,
          stock_qty: stockQty,
          low_stock_threshold: lowStockThreshold,
        };
        // Rasm faqat yangisi yuborilganda yangilanadi (eskisi saqlanib qolishi uchun)
        if (imageUrl) updatePayload.image_url = imageUrl;

        const { error } = await supabase.from("products").update(updatePayload).eq("id", productId);
        if (error) throw new Error(error.message);
        res.status(200).json({ ok: true });
        return;
      }

      if (action === "upload_image") {
        const { base64Data, fileName, contentType } = req.body;
        if (!base64Data || !fileName) {
          res.status(400).json({ error: "Rasm ma'lumoti yetishmayapti" });
          return;
        }
        const buffer = Buffer.from(base64Data, "base64");
        const uniqueName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "")}`;

        const { error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(uniqueName, buffer, {
            contentType: contentType || "image/jpeg",
            upsert: false,
          });
        if (uploadErr) throw new Error(uploadErr.message);

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(uniqueName);

        res.status(200).json({ ok: true, url: publicUrlData.publicUrl });
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

      if (action === "create_manual_invoice") {
        const { customerName, customerPhone, existingShopId, items } = req.body;
        if (!customerName || !items || items.length === 0) {
          res.status(400).json({ error: "Mijoz nomi va tovarlar kerak" });
          return;
        }

        // 1) Mijozni (shop) topamiz yoki yaratamiz
        let shopId = existingShopId;
        if (!shopId) {
          const { data: existingShop } = await supabase
            .from("shops")
            .select("id")
            .eq("name", customerName)
            .maybeSingle();
          if (existingShop) {
            shopId = existingShop.id;
          } else {
            const { data: newShop, error: shopErr } = await supabase
              .from("shops")
              .insert({
                name: customerName,
                owner_name: customerName,
                owner_phone: customerPhone || null,
                debt_limit: 999999999,
                status: "active",
              })
              .select()
              .single();
            if (shopErr) throw new Error(shopErr.message);
            shopId = newShop.id;
          }
        }

        // 2) Har bir qator uchun tovarni topamiz yoki yaratamiz
        const orderItemsPayload: any[] = [];
        for (const item of items) {
          const { data: existingProduct } = await supabase
            .from("products")
            .select("id")
            .eq("name", item.name)
            .maybeSingle();

          let productId: string;
          if (existingProduct) {
            productId = existingProduct.id;
          } else {
            const { data: newProduct, error: prodErr } = await supabase
              .from("products")
              .insert({
                category: item.category || "Bozor",
                name: item.name,
                price: item.unitPrice,
                stock_qty: 999999,
                low_stock_threshold: 0,
                is_active: true,
              })
              .select()
              .single();
            if (prodErr) throw new Error(prodErr.message);
            productId = newProduct.id;
          }
          orderItemsPayload.push({ product_id: productId, qty: item.qty, unit_price: item.unitPrice });
        }

        // 3) Buyurtma (nakladnoy) yaratamiz — "pending" -> keyin "confirmed"
        //    (trigger'lar shu UPDATE orqali ishga tushadi: qarz qo'shiladi)
        const { data: order, error: orderErr } = await supabase
          .from("orders")
          .insert({ shop_id: shopId, status: "pending" })
          .select()
          .single();
        if (orderErr) throw new Error(orderErr.message);

        const itemsWithOrderId = orderItemsPayload.map((i) => ({ ...i, order_id: order.id }));
        const { error: itemsErr } = await supabase.from("order_items").insert(itemsWithOrderId);
        if (itemsErr) throw new Error(itemsErr.message);

        const { error: confirmErr } = await supabase
          .from("orders")
          .update({ status: "confirmed", confirmed_by: "admin" })
          .eq("id", order.id);
        if (confirmErr) throw new Error(confirmErr.message);

        res.status(200).json({ ok: true, orderId: order.id, shopId });
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
