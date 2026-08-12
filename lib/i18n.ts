// Uch tilli tarjima lug'ati: uz (kirill), tj (tojik), ru (rus)
// Yangi xabar qo'shish kerak bo'lsa - shu faylga kalit qo'shiladi, kod ichida tarjima yozilmaydi

export type Lang = "uz" | "tj" | "ru";

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
      `💰 Жорий қарзингиз: ${debt.toLocaleString("ru-RU")} сўм\nЛимит: ${limit.toLocaleString("ru-RU")} сўм\nЛимитгача қолди: ${(limit - debt).toLocaleString("ru-RU")} сўм`,
    tj: (debt: number, limit: number) =>
      `💰 Қарзи ҷории шумо: ${debt.toLocaleString("ru-RU")} сомонӣ\nМаҳдудият: ${limit.toLocaleString("ru-RU")} сомонӣ\nТо маҳдудият монд: ${(limit - debt).toLocaleString("ru-RU")} сомонӣ`,
    ru: (debt: number, limit: number) =>
      `💰 Ваш текущий долг: ${debt.toLocaleString("ru-RU")} сум\nЛимит: ${limit.toLocaleString("ru-RU")} сум\nОсталось до лимита: ${(limit - debt).toLocaleString("ru-RU")} сум`,
  },
  contactAdmin: {
    uz: "Администратор: @zargo_admin ёки +992 900 00 00 00",
    tj: "Администратор: @zargo_admin ё +992 900 00 00 00",
    ru: "Администратор: @zargo_admin или +992 900 00 00 00",
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
    uz: (total: number) => `Жами: ${total.toLocaleString("ru-RU")} сўм`,
    tj: (total: number) => `Ҳамагӣ: ${total.toLocaleString("ru-RU")} сомонӣ`,
    ru: (total: number) => `Итого: ${total.toLocaleString("ru-RU")} сум`,
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
      `✅ Буюртма қабул қилинди!\n\nЭски қарзингиз: ${oldDebt.toLocaleString("ru-RU")} сўм\nЯнги қарз: ${newDebt.toLocaleString("ru-RU")} сўм`,
    tj: (oldDebt: number, newDebt: number) =>
      `✅ Фармоиш қабул шуд!\n\nҚарзи кӯҳна: ${oldDebt.toLocaleString("ru-RU")} сомонӣ\nҚарзи нав: ${newDebt.toLocaleString("ru-RU")} сомонӣ`,
    ru: (oldDebt: number, newDebt: number) =>
      `✅ Заказ принят!\n\nСтарый долг: ${oldDebt.toLocaleString("ru-RU")} сум\nНовый долг: ${newDebt.toLocaleString("ru-RU")} сум`,
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
