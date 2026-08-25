// Uch tilli tarjima lug'ati: uz (kirill), tj (tojik), ru (rus)
// Yangi xabar qo'shish kerak bo'lsa - shu faylga kalit qo'shiladi, kod ichida tarjima yozilmaydi

export type Lang = "uz" | "tj" | "ru";

// Pulni "14с50д" (14 сомонӣ 50 дирам) ko'rinishida formatlaydi.
// Butun son bo'lsa faqat "255с" ko'rsatiladi (dirham qismisiz).
export function fmtSomoni(n: number): string {
  const neg = n < 0;
  n = Math.abs(n);
  const som = Math.floor(n);
  const dir = Math.round((n - som) * 100);
  const somStr = som.toLocaleString("ru-RU");
  const result = dir === 0 ? `${somStr}с` : `${somStr}с${String(dir).padStart(2, "0")}д`;
  return neg ? "-" + result : result;
}

export const t = {
  chooseLanguage: {
    uz: "Тилни танланг:",
    tj: "Забонро интихоб кунед:",
    ru: "Выберите язык:",
  },
  notLinked: {
    uz: "Сиз ҳали тизимда рўйхатдан ўтмагансиз. Администратор билан боғланинг.",
    tj: "Шумо ҳанӯз дар низом сабти ном нашудаед. Бо администратор тамос гиред.",
    ru: "Вы ещё не зарегистрированы в системе. Свяжитесь с администратором.",
  },
  greeting: {
    uz: (name: string) => `Ассалому алайкум, ${name}! ZarGo botiga xush kelibsiz 👋`,
    tj: (name: string) => `Ассалому алайкум, ${name}! Ба боти ZarGo хуш омадед 👋`,
    ru: (name: string) => `Здравствуйте, ${name}! Добро пожаловать в бот ZarGo 👋`,
  },
  menu: {
    order: {
      uz: "🛒 Буюртма бериш",
      tj: "🛒 Фармоиш додан",
      ru: "🛒 Сделать заказ",
    },
    debt: {
      uz: "📋 Менинг қарзим",
      tj: "📋 Қарзи ман",
      ru: "📋 Мой долг",
    },
    history: {
      uz: "📦 Охирги буюртмаларим",
      tj: "📦 Фармоишҳои охирини ман",
      ru: "📦 Мои последние заказы",
    },
    contact: {
      uz: "☎️ Администратор билан боғланиш",
      tj: "☎️ Бо администратор тамос гирифтан",
      ru: "☎️ Связаться с администратором",
    },
  },
  debtSummary: {
    uz: (debt: number, limit: number) =>
      `💰 Жорий қарзингиз: ${fmtSomoni(debt)}\nЛимит: ${fmtSomoni(limit)}\nЛимитгача қолди: ${fmtSomoni(limit - debt)}`,
    tj: (debt: number, limit: number) =>
      `💰 Қарзи ҷории шумо: ${fmtSomoni(debt)}\nМаҳдудият: ${fmtSomoni(limit)}\nТо маҳдудият монд: ${fmtSomoni(limit - debt)}`,
    ru: (debt: number, limit: number) =>
      `💰 Ваш текущий долг: ${fmtSomoni(debt)}\nЛимит: ${fmtSomoni(limit)}\nОсталось до лимита: ${fmtSomoni(limit - debt)}`,
  },
  contactAdmin: {
    uz: "Администратор:\nTelegram: @umedjon20994\nМуҳаммаджон: +992931811121\nУмеджон: +992927909698",
    tj: "Администратор:\nTelegram: @umedjon20994\nМуҳаммадҷон: +992931811121\nУмеҷон: +992927909698",
    ru: "Администратор:\nTelegram: @umedjon20994\nМухаммаджон: +992931811121\nУмеджон: +992927909698",
  },
  noHistory: {
    uz: "Ҳали буюртмаларингиз йўқ.",
    tj: "Шумо то ҳол фармоише надоред.",
    ru: "У вас пока нет заказов.",
  },
  orderComingSoon: {
    uz: "Буюртма бериш бўлими тез орада ишга тушади 🚧",
    tj: "Бахши фармоиш додан ба зудӣ фаъол мешавад 🚧",
    ru: "Раздел заказа скоро заработает 🚧",
  },
  blocked: {
    uz: "Кечирасиз, қарз лимити тўлган. Администратор билан боғланинг.",
    tj: "Мебахшед, маҳдудияти қарз пур шудааст. Бо администратор тамос гиред.",
    ru: "Извините, лимит долга исчерпан. Свяжитесь с администратором.",
  },
  chooseCategory: {
    uz: "Категорияни танланг:",
    tj: "Категорияро интихоб кунед:",
    ru: "Выберите категорию:",
  },
  noCategories: {
    uz: "Ҳозирча тегишли тoвар йўқ.",
    tj: "Ҳоло мол мавҷуд нест.",
    ru: "Товаров пока нет.",
  },
  addedToCart: {
    uz: (name: string, qty: number) => `✅ Саватга қўшилди: ${name} × ${qty}`,
    tj: (name: string, qty: number) => `✅ Ба сабад илова шуд: ${name} × ${qty}`,
    ru: (name: string, qty: number) => `✅ Добавлено в корзину: ${name} × ${qty}`,
  },
  viewCart: {
    uz: "🧺 Саватни кўриш",
    tj: "🧺 Дидани сабад",
    ru: "🧺 Смотреть корзину",
  },
  backToCategories: {
    uz: "⬅️ Категорияларга қайтиш",
    tj: "⬅️ Бозгашт ба категорияҳо",
    ru: "⬅️ Назад к категориям",
  },
  cartEmpty: {
    uz: "Саватингиз бўш. Аввал товар танланг.",
    tj: "Сабади шумо холист. Аввал мол интихоб кунед.",
    ru: "Ваша корзина пуста. Сначала выберите товар.",
  },
  cartHeader: {
    uz: "🧾 Саватингиз:",
    tj: "🧾 Сабади шумо:",
    ru: "🧾 Ваша корзина:",
  },
  cartTotal: {
    uz: (total: number) => `Жами: ${fmtSomoni(total)}`,
    tj: (total: number) => `Ҳамагӣ: ${fmtSomoni(total)}`,
    ru: (total: number) => `Итого: ${fmtSomoni(total)}`,
  },
  confirmOrderBtn: {
    uz: "✅ Буюртмани тасдиқлаш",
    tj: "✅ Фармоишро тасдиқ кардан",
    ru: "✅ Подтвердить заказ",
  },
  clearCartBtn: {
    uz: "🗑 Саватни тозалаш",
    tj: "🗑 Тоза кардани сабад",
    ru: "🗑 Очистить корзину",
  },
  cartCleared: {
    uz: "Савват тозаланди.",
    tj: "Сабад тоза карда шуд.",
    ru: "Корзина очищена.",
  },
  orderConfirmed: {
    uz: (oldDebt: number, newDebt: number) =>
      `✅ Буюртма қабул қилинди!\n\nЭски қарзингиз: ${fmtSomoni(oldDebt)}\nЯнги қарз: ${fmtSomoni(newDebt)}`,
    tj: (oldDebt: number, newDebt: number) =>
      `✅ Фармоиш қабул шуд!\n\nҚарзи кӯҳна: ${fmtSomoni(oldDebt)}\nҚарзи нав: ${fmtSomoni(newDebt)}`,
    ru: (oldDebt: number, newDebt: number) =>
      `✅ Заказ принят!\n\nСтарый долг: ${fmtSomoni(oldDebt)}\nНовый долг: ${fmtSomoni(newDebt)}`,
  },
  orderPendingApproval: {
    uz: "⏳ Буюртмангиз лимитдан ошди, администратор тасдиқлашини кутинг.",
    tj: "⏳ Фармоиши шумо аз маҳдудият зиёд шуд, интизори тасдиқи администратор шавед.",
    ru: "⏳ Ваш заказ превышает лимит, ожидайте подтверждения администратора.",
  },
  typeQtyPrompt: {
    uz: "Миқдорни рақам билан ёзиб юборинг (масалан: 50)",
    tj: "Миқдорро бо рақам нависед (масалан: 50)",
    ru: "Напишите количество цифрой (например: 50)",
  },
  invalidQty: {
    uz: "Илтимос, фақат рақам ёзинг (масалан: 50)",
    tj: "Лутфан, фақат рақам нависед (масалан: 50)",
    ru: "Пожалуйста, напишите только число (например: 50)",
  },
  qtySetConfirmed: {
    uz: (name: string, qty: number) => `✅ ${name}: ${qty} дона қилиб белгиланди`,
    tj: (name: string, qty: number) => `✅ ${name}: ${qty} дона таъин шуд`,
    ru: (name: string, qty: number) => `✅ ${name}: установлено ${qty} шт.`,
  },
  paymentReceived: {
    uz: (amount: number, newDebt: number) =>
      `💵 Тўлов қабул қилинди: ${fmtSomoni(amount)}\n\nҚолган қарз: ${fmtSomoni(newDebt)}`,
    tj: (amount: number, newDebt: number) =>
      `💵 Пардохт қабул шуд: ${fmtSomoni(amount)}\n\nҚарзи боқимонда: ${fmtSomoni(newDebt)}`,
    ru: (amount: number, newDebt: number) =>
      `💵 Платёж принят: ${fmtSomoni(amount)}\n\nОстаток долга: ${fmtSomoni(newDebt)}`,
  },
  debtReminder: {
    uz: (amount: number) =>
      `⏰ Эслатма: бугун қарзингизни тўлаш куни келди.\n\nТўлов суммаси: ${fmtSomoni(amount)}\n\nИлтимос, администратор билан боғланиб тўловни амалга оширинг.`,
    tj: (amount: number) =>
      `⏰ Ёдрас: имрӯз рӯзи пардохти қарзи шумост.\n\nМаблағ: ${fmtSomoni(amount)}\n\nЛутфан бо администратор тамос гирифта пардохт кунед.`,
    ru: (amount: number) =>
      `⏰ Напоминание: сегодня день оплаты вашего долга.\n\nСумма: ${fmtSomoni(amount)}\n\nПожалуйста, свяжитесь с администратором для оплаты.`,
  },
  orderDelivered: {
    uz: (orderNum: number, itemsText: string, total: number, method: string, paid: number, remaining: number) =>
      `🚚 <b>Буюртма №${orderNum} етказиб берилди!</b>\n\n${itemsText}\n\nЖами: ${fmtSomoni(
        total
      )}\nТўлов тури: ${method}\nТўланди: ${fmtSomoni(paid)}${
        remaining > 0 ? `\n⚠️ Қолган қарз: ${fmtSomoni(remaining)}` : "\n✅ Тўлиқ тўланди"
      }\n\nРаҳмат!`,
    tj: (orderNum: number, itemsText: string, total: number, method: string, paid: number, remaining: number) =>
      `🚚 <b>Фармоиш №${orderNum} расонида шуд!</b>\n\n${itemsText}\n\nҲамагӣ: ${fmtSomoni(
        total
      )}\nНавъи пардохт: ${method}\nПардохт шуд: ${fmtSomoni(paid)}${
        remaining > 0 ? `\n⚠️ Қарзи боқимонда: ${fmtSomoni(remaining)}` : "\n✅ Пурра пардохт шуд"
      }\n\nРаҳмат!`,
    ru: (orderNum: number, itemsText: string, total: number, method: string, paid: number, remaining: number) =>
      `🚚 <b>Заказ №${orderNum} доставлен!</b>\n\n${itemsText}\n\nИтого: ${fmtSomoni(
        total
      )}\nСпособ оплаты: ${method}\nОплачено: ${fmtSomoni(paid)}${
        remaining > 0 ? `\n⚠️ Остаток долга: ${fmtSomoni(remaining)}` : "\n✅ Оплачено полностью"
      }\n\nСпасибо!`,
  },
  orderEditedDiff: {
    uz: (orderNum: number, diffText: string, newTotal: number, currentDebt: number) =>
      `✏️ <b>Буюртмангиз (№${orderNum}) администратор томонидан таҳрирланди.</b>\n\n${diffText}\n\nЯнги сумма: ${fmtSomoni(
        newTotal
      )}\nЖорий қарз: ${fmtSomoni(currentDebt)}`,
    tj: (orderNum: number, diffText: string, newTotal: number, currentDebt: number) =>
      `✏️ <b>Фармоиши шумо (№${orderNum}) аз ҷониби администратор таҳрир шуд.</b>\n\n${diffText}\n\nМаблағи нав: ${fmtSomoni(
        newTotal
      )}\nҚарзи ҷорӣ: ${fmtSomoni(currentDebt)}`,
    ru: (orderNum: number, diffText: string, newTotal: number, currentDebt: number) =>
      `✏️ <b>Ваш заказ (№${orderNum}) был изменён администратором.</b>\n\n${diffText}\n\nНовая сумма: ${fmtSomoni(
        newTotal
      )}\nТекущий долг: ${fmtSomoni(currentDebt)}`,
  },
};

export const langLabel: Record<Lang, string> = {
  uz: "🇺🇿 O'zbekcha",
  tj: "🇹🇯 Тоҷикӣ",
  ru: "🇷🇺 Русский",
};

// Baza'dagi category qiymati (Lotin, masalan "Shokolad") -> ko'rinadigan nom
export const categoryLabel: Record<string, Record<Lang, string>> = {
  Shokolad: { uz: "🍫 Шоколад", tj: "🍫 Шоколад", ru: "🍫 Шоколад" },
  Saqiz: { uz: "🍬 Сагиз", tj: "🍬 Сагиз", ru: "🍬 Жвачка" },
  Shirinlik: { uz: "🍭 Ширинлик", tj: "🍭 Ширинӣ", ru: "🍭 Сладости" },
  Sok: { uz: "🥤 Соки", tj: "🥤 Шарбат", ru: "🥤 Сок" },
};

export function getCategoryLabel(category: string, lang: Lang): string {
  return categoryLabel[category]?.[lang] ?? category;
}
