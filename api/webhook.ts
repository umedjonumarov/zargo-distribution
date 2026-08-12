 import { supabase, Shop } from "../lib/supabase.js";
 import { sendMessage, answerCallbackQuery, InlineButton } from "../lib/telegram.js";
 import { t, langLabel, Lang } from "../lib/i18n.js";

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
    // TZ 5.3 — to'liq katalog oqimi keyingi bosqichda qo'shiladi
    await sendMessage(chatId, t.orderComingSoon[lang]);
  }
}

// ---------------------------------------------------------
// Vercel handler — Telegram webhook shu manzilga POST qiladi
// ---------------------------------------------------------
//export default async function handler(req: VercelRequest, res: VercelResponse) {
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
