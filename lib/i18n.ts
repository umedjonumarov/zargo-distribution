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
};

export const langLabel: Record<Lang, string> = {
  uz: "🇺🇿 O'zbekcha",
  tj: "🇹🇯 Тоҷикӣ",
  ru: "🇷🇺 Русский",
};
