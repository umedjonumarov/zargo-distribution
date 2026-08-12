import { supabase, Shop, Product, CartItem } from "../lib/supabase.js";
import { sendMessage, sendPhoto, answerCallbackQuery, editMessageReplyMarkup, InlineButton } from "../lib/telegram.js";
import { t, langLabel, Lang, getCategoryLabel } from "../lib/i18n.js";

// ---------------------------------------------------------
// Asosiy menyu tugmalarini chiqarish
// ---------------------------------------------------------
function mainMenuButtons(lang: Lang): InlineButton[][] {
  return [
    [{ text: t.menu.order[lang], callback_data: "menu_order" }],
    [{ text: t.menu.debt[lang], callback_data: "menu_debt" }],
    [{ text: t.menu.history[lang], callback_data: "menu_history" }],
    [{ text: t.menu.contact[lang], callback_data: "menu_contact" }],
  ];
}

async function sendGreetingAndMenu(chatId: number, shop: Shop) {
  const lang = shop.language as Lang;
  await sendMessage(chatId, t.greeting[lang](shop.owner_name));
  const menuTitle = { uz: "Танловни белгиланг:", tj: "Интихобро қайд кунед:", ru: "Выберите действие:" }[lang];
  await sendMessage(chatId, menuTitle, mainMenuButtons(lang));
}

// ---------------------------------------------------------
// /start — chat_id'ni do'konga bog'lash yoki topish
// ---------------------------------------------------------
async function handleStart(chatId: number, payload: string | undefined) {
  let shop: Shop | null = null;

  if (payload) {
    // Deep link orqali kelgan: t.me/ZarGoBot?start=<shop_id>
    const { data } = await supabase
      .from("shops")
      .select("*")
      .eq("id", payload)
      .maybeSingle();
    if (data) {
      shop = data as Shop;
      // Birinchi marta ulanayotgan bo'lsa, telegram_chat_id'ni yozamiz
      if (!shop.telegram_chat_id) {
        await supabase
          .from("shops")
          .update({ telegram_chat_id: chatId, status: "active" })
          .eq("id", shop.id);
        shop.telegram_chat_id = chatId;
      }
    }
  }

  if (!shop) {
    // payload yo'q yoki topilmadi -> chat_id bo'yicha qidiramiz
    const { data } = await supabase
      .from("shops")
      .select("*")
      .eq("telegram_chat_id", chatId)
      .maybeSingle();
    shop = data as Shop | null;
  }

  if (!shop) {
    // Hech qanday do'konga bog'lanmagan -> 3 tilda birga xabar
    const msg = [t.notLinked.uz, t.notLinked.tj, t.notLinked.ru].join("\n\n");
    await sendMessage(chatId, msg);
    return;
  }

  if (!shop.language) {
    // Til hali tanlanmagan -> tanlash tugmalarini chiqaramiz
    const buttons: InlineButton[][] = [
      [{ text: langLabel.uz, callback_data: `lang_uz_${shop.id}` }],
      [{ text: langLabel.tj, callback_data: `lang_tj_${shop.id}` }],
      [{ text: langLabel.ru, callback_data: `lang_ru_${shop.id}` }],
    ];
    await sendMessage(
      chatId,
      "Тилни танланг / Забонро интихоб кунед / Выберите язык",
      buttons
    );
    return;
  }

  // Til allaqachon tanlangan -> to'g'ridan-to'g'ri salomlashish + menyu
  await sendGreetingAndMenu(chatId, shop);
}

// ---------------------------------------------------------
// Til tanlanganda (callback_query: lang_uz_<shopId> va h.k.)
// ---------------------------------------------------------
async function handleLanguageChoice(
  chatId: number,
  callbackId: string,
  data: string
) {
  const [, lang, shopId] = data.split("_"); // "lang_uz_<uuid>" -> ["lang","uz","<uuid...>"]
  // uuid ichida ham "_" bo'lmaydi, lekin xavfsizlik uchun to'liq qismni qayta yig'amiz
  const shopIdFull = data.replace(`lang_${lang}_`, "");

  await supabase
    .from("shops")
    .update({ language: lang })
    .eq("id", shopIdFull);

  await answerCallbackQuery(callbackId);

  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("id", shopIdFull)
    .maybeSingle();

  if (shop) {
    await sendGreetingAndMenu(chatId, shop as Shop);
  }
}

// ---------------------------------------------------------
// Asosiy menyu tugmalari bosilganda
// ---------------------------------------------------------
async function handleMenuAction(chatId: number, callbackId: string, action: string) {
  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();

  await answerCallbackQuery(callbackId);
  if (!shop) return;
  const s = shop as Shop;
  const lang = s.language as Lang;

  if (action === "menu_debt") {
    await sendMessage(chatId, t.debtSummary[lang](s.current_debt, s.debt_limit));
  } else if (action === "menu_contact") {
    await sendMessage(chatId, t.contactAdmin[lang]);
  } else if (action === "menu_history") {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, total_amount, status, created_at")
      .eq("shop_id", s.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!orders || orders.length === 0) {
      await sendMessage(chatId, t.noHistory[lang]);
    } else {
      const lines = orders
        .map(
          (o) =>
            `• ${new Date(o.created_at).toLocaleDateString("ru-RU")} — ${Number(
              o.total_amount
            ).toLocaleString("ru-RU")} (${o.status})`
        )
        .join("\n");
      await sendMessage(chatId, lines);
    }
  } else if (action === "menu_order") {
    await handleShowCategories(chatId, s, lang);
  }
}

// ---------------------------------------------------------
// SAVAT (cart) yordamchi funksiyalari — Supabase "carts" jadvalida saqlanadi
// ---------------------------------------------------------
async function getCartItems(shopId: string): Promise<CartItem[]> {
  const { data } = await supabase
    .from("carts")
    .select("items")
    .eq("shop_id", shopId)
    .maybeSingle();
  return (data?.items as CartItem[]) ?? [];
}

async function saveCartItems(shopId: string, items: CartItem[]) {
  await supabase
    .from("carts")
    .upsert({ shop_id: shopId, items, updated_at: new Date().toISOString() });
}

async function addToCart(shopId: string, productId: string, qty: number) {
  const items = await getCartItems(shopId);
  const existing = items.find((i) => i.product_id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({ product_id: productId, qty });
  }
  await saveCartItems(shopId, items);
}

// Mahsulot uchun savatdagi miqdorni ANIQ shu songa o'rnatadi (0 bo'lsa o'chiradi)
async function setCartItemQty(shopId: string, productId: string, qty: number): Promise<CartItem[]> {
  const items = await getCartItems(shopId);
  const existing = items.find((i) => i.product_id === productId);
  if (qty <= 0) {
    const filtered = items.filter((i) => i.product_id !== productId);
    await saveCartItems(shopId, filtered);
    return filtered;
  }
  if (existing) {
    existing.qty = qty;
  } else {
    items.push({ product_id: productId, qty });
  }
  await saveCartItems(shopId, items);
  return items;
}

function getCartQty(items: CartItem[], productId: string): number {
  return items.find((i) => i.product_id === productId)?.qty ?? 0;
}

// ---------------------------------------------------------
// "Буюртма бериш" — kategoriyalarni ko'rsatish
// ---------------------------------------------------------
async function handleShowCategories(chatId: number, shop: Shop, lang: Lang) {
  const { data: products } = await supabase
    .from("products")
    .select("category")
    .eq("is_active", true)
    .gt("stock_qty", 0);

  const categories = Array.from(new Set((products ?? []).map((p: any) => p.category)));

  if (categories.length === 0) {
    await sendMessage(chatId, t.noCategories[lang]);
    return;
  }

  const buttons: InlineButton[][] = categories.map((cat) => [
    { text: getCategoryLabel(cat, lang), callback_data: `cat_${cat}` },
  ]);
  buttons.push([{ text: t.viewCart[lang], callback_data: "cart_view" }]);

  await sendMessage(chatId, t.chooseCategory[lang], buttons);
}

const QTY_STEP = 5;

// ---------------------------------------------------------
// Kategoriya tanlanganda — shu kategoriyadagi tovarlarni ko'rsatish
// (har tovar oldida jonli −/+ hisoblagich bilan)
// ---------------------------------------------------------
async function handleShowProducts(
  chatId: number,
  callbackId: string,
  category: string
) {
  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();

  await answerCallbackQuery(callbackId);
  if (!shop) return;
  const s = shop as Shop;
  const lang = s.language as Lang;

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .gt("stock_qty", 0);

  if (!products || products.length === 0) {
    await sendMessage(chatId, t.noCategories[lang]);
    return;
  }

  const cartItems = await getCartItems(s.id);

  for (const product of products as Product[]) {
    const currentQty = getCartQty(cartItems, product.id);
    const caption = `<b>${product.name}</b>\n${product.price.toLocaleString(
      "ru-RU"
    )} сўм / дона\nОмборда: ${product.stock_qty} дона`;

    const buttons: InlineButton[][] = [qtyStepperRow(product.id, currentQty)];

    if (product.image_url) {
      await sendPhoto(chatId, product.image_url, caption, buttons);
    } else {
      await sendMessage(chatId, caption, buttons);
    }
  }

  const navButtons: InlineButton[][] = [
    [{ text: t.viewCart[lang], callback_data: "cart_view" }],
    [{ text: t.backToCategories[lang], callback_data: "menu_order" }],
  ];
  await sendMessage(chatId, t.chooseCategory[lang], navButtons);
}

function qtyStepperRow(productId: string, qty: number): InlineButton[] {
  return [
    { text: "➖", callback_data: `dec_${productId}` },
    { text: `${qty} дона`, callback_data: "noop" },
    { text: "➕", callback_data: `inc_${productId}` },
  ];
}

// ---------------------------------------------------------
// −/+ tugmalari bosilganda — savatdagi miqdorni jonli yangilaydi
// ---------------------------------------------------------
async function handleQtyChange(
  chatId: number,
  callbackId: string,
  messageId: number,
  direction: "inc" | "dec",
  productId: string
) {
  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();

  if (!shop) {
    await answerCallbackQuery(callbackId);
    return;
  }
  const s = shop as Shop;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    await answerCallbackQuery(callbackId);
    return;
  }
  const p = product as Product;

  const items = await getCartItems(s.id);
  const current = getCartQty(items, productId);

  let next = direction === "inc" ? current + QTY_STEP : current - QTY_STEP;
  if (next < 0) next = 0;
  if (next > p.stock_qty) next = p.stock_qty;

  await setCartItemQty(s.id, productId, next);
  await answerCallbackQuery(callbackId);
  await editMessageReplyMarkup(chatId, messageId, [qtyStepperRow(productId, next)]);
}

// ---------------------------------------------------------
// Savatni ko'rish
// ---------------------------------------------------------
async function handleViewCart(chatId: number, callbackId: string) {
  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();

  await answerCallbackQuery(callbackId);
  if (!shop) return;
  const s = shop as Shop;
  const lang = s.language as Lang;

  const items = await getCartItems(s.id);
  if (items.length === 0) {
    await sendMessage(chatId, t.cartEmpty[lang]);
    return;
  }

  const productIds = items.map((i) => i.product_id);
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  const productMap = new Map((products as Product[]).map((p) => [p.id, p]));

  let total = 0;
  const lines = items.map((item) => {
    const p = productMap.get(item.product_id);
    if (!p) return "";
    const lineTotal = p.price * item.qty;
    total += lineTotal;
    return `${p.name} × ${item.qty} = ${lineTotal.toLocaleString("ru-RU")}`;
  });

  const text = [t.cartHeader[lang], ...lines, "", t.cartTotal[lang](total)].join("\n");

  const buttons: InlineButton[][] = [
    [{ text: t.confirmOrderBtn[lang], callback_data: "cart_confirm" }],
    [{ text: t.clearCartBtn[lang], callback_data: "cart_clear" }],
  ];

  await sendMessage(chatId, text, buttons);
}

// ---------------------------------------------------------
// Savatni tozalash
// ---------------------------------------------------------
async function handleClearCart(chatId: number, callbackId: string) {
  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();

  await answerCallbackQuery(callbackId);
  if (!shop) return;
  const s = shop as Shop;
  const lang = s.language as Lang;

  await saveCartItems(s.id, []);
  await sendMessage(chatId, t.cartCleared[lang]);
}

// ---------------------------------------------------------
// Buyurtmani tasdiqlash — orders + order_items yaratiladi, savat tozalanadi
// ---------------------------------------------------------
async function handleConfirmOrder(chatId: number, callbackId: string) {
  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();

  await answerCallbackQuery(callbackId);
  if (!shop) return;
  const s = shop as Shop;
  const lang = s.language as Lang;

  const items = await getCartItems(s.id);
  if (items.length === 0) {
    await sendMessage(chatId, t.cartEmpty[lang]);
    return;
  }

  const productIds = items.map((i) => i.product_id);
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  const productMap = new Map((products as Product[]).map((p) => [p.id, p]));
  let total = 0;
  for (const item of items) {
    const p = productMap.get(item.product_id);
    if (p) total += p.price * item.qty;
  }

  const oldDebt = Number(s.current_debt);
  const willExceedLimit = oldDebt + total > Number(s.debt_limit);

  // 1) Avval "pending" holatda buyurtma yaratamiz (trigger'lar UPDATE'da ishlaydi)
  const { data: order } = await supabase
    .from("orders")
    .insert({ shop_id: s.id, status: "pending" })
    .select()
    .single();

  if (!order) {
    await sendMessage(chatId, "Xatolik yuz berdi, qayta urinib ko'ring.");
    return;
  }

  // 2) order_items qo'shamiz (trigger orders.total_amount'ni avtomatik hisoblaydi)
  const orderItemsPayload = items.map((item) => {
    const p = productMap.get(item.product_id)!;
    return {
      order_id: order.id,
      product_id: item.product_id,
      qty: item.qty,
      unit_price: p.price,
    };
  });
  await supabase.from("order_items").insert(orderItemsPayload);

  // 3) Limit ichida bo'lsa — statusni "confirmed"ga o'tkazamiz.
  //    Shu UPDATE orqali SQL trigger'lar ishga tushadi: qarz qo'shiladi,
  //    tovar qoldig'i kamayadi. Limitdan oshsa — "pending" holida qoladi,
  //    admin panel orqali tasdiqlanguncha.
  if (!willExceedLimit) {
    await supabase
      .from("orders")
      .update({ status: "confirmed", confirmed_by: "auto" })
      .eq("id", order.id);
  }

  // 4) Savatni tozalaymiz
  await saveCartItems(s.id, []);

  // 5) Do'konga javob
  if (willExceedLimit) {
    await sendMessage(chatId, t.orderPendingApproval[lang]);
  } else {
    const { data: updatedShop } = await supabase
      .from("shops")
      .select("current_debt")
      .eq("id", s.id)
      .maybeSingle();
    const newDebt = Number(updatedShop?.current_debt ?? oldDebt + total);
    await sendMessage(chatId, t.orderConfirmed[lang](oldDebt, newDebt));
  }
}

// ---------------------------------------------------------
// Vercel handler — Telegram webhook shu manzilga POST qiladi
// ---------------------------------------------------------
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(200).send("ZarGo bot webhook ishlayapti");
    return;
  }

  try {
    const update = req.body;

    if (update.message?.text) {
      const chatId = update.message.chat.id as number;
      const text = update.message.text as string;

      if (text.startsWith("/start")) {
        const parts = text.split(" ");
        const payload = parts[1]; // /start <shop_id> bo'lsa shu yerda keladi
        await handleStart(chatId, payload);
      }
    }

    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id as number;
      const callbackId = update.callback_query.id as string;
      const data = update.callback_query.data as string;

      if (data.startsWith("lang_")) {
        await handleLanguageChoice(chatId, callbackId, data);
      } else if (data.startsWith("cat_")) {
        await handleShowProducts(chatId, callbackId, data.replace("cat_", ""));
      } else if (data.startsWith("dec_") || data.startsWith("inc_")) {
        const messageId = update.callback_query.message.message_id as number;
        const direction = data.startsWith("dec_") ? "dec" : "inc";
        const productId = data.replace(/^(dec_|inc_)/, "");
        await handleQtyChange(chatId, callbackId, messageId, direction, productId);
      } else if (data === "noop") {
        await answerCallbackQuery(callbackId);
      } else if (data === "cart_view") {
        await handleViewCart(chatId, callbackId);
      } else if (data === "cart_clear") {
        await handleClearCart(chatId, callbackId);
      } else if (data === "cart_confirm") {
        await handleConfirmOrder(chatId, callbackId);
      } else if (data.startsWith("menu_")) {
        await handleMenuAction(chatId, callbackId, data);
      }
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook xato:", err);
    res.status(200).json({ ok: true }); // Telegram qayta yubormasligi uchun 200 qaytaramiz
  }
}
