# ZarGo Bot

Telegram bot: do'kon egasi til tanlaydi (UZ/TJ/RU), shaxsiy salom oladi, asosiy menyu bilan ishlaydi.

## 1. Loyihani GitHub'ga yuklash

```bash
cd zargo-bot
git init
git add .
git commit -m "ZarGo bot: /start, til tanlash, asosiy menyu"
git branch -M main
git remote add origin https://github.com/<sizning-username>/zargo-bot.git
git push -u origin main
```

> `.env.local` fayli `.gitignore`da — u hech qachon GitHub'ga yuklanmaydi. Token faqat Vercel'da bo'ladi.

## 2. Vercel'ga ulash

1. vercel.com → **Add New Project** → GitHub'dan `zargo-bot` repo'ni tanlang
2. **Environment Variables** bo'limiga qo'shing (Project Settings → Environment Variables):
   - `TELEGRAM_BOT_TOKEN` — @BotFather'dan olgan (yangilangan) token
   - `SUPABASE_URL` — Supabase loyihangiz URL'i (Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase `service_role` key (Project Settings → API, **anon key emas**)
3. **Deploy** tugmasini bosing

Deploy tugagach, sizga bir domen beriladi, masalan:
`https://zargo-bot.vercel.app`

Webhook manzilingiz shu bo'ladi:
`https://zargo-bot.vercel.app/api/webhook`

## 3. Telegram'ga webhook'ni bog'lash

Brauzerda (yoki curl orqali) shu manzilni oching — `<TOKEN>` va `<URL>`ni o'zingiznikiga almashtiring:

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=<URL>/api/webhook
```

Masalan:
```
https://api.telegram.org/bot8635095454:XXXXXXXX/setWebhook?url=https://zargo-bot.vercel.app/api/webhook
```

Javobda `"ok":true` chiqsa — bot tayyor.

## 4. Sinov

1. Supabase'da `shops` jadvalidagi test do'konning `id`sini nusxa oling (Table Editor → shops → id ustuni)
2. Telegramda shu linkni oching: `https://t.me/<bot_username>?start=<shop_id>`
3. Bot avtomatik shu do'konga `telegram_chat_id`ni bog'laydi va til tanlashni so'raydi
4. Til tanlagach — shaxsiy salom va asosiy menyu chiqishi kerak

## Fayl tuzilishi

```
zargo-bot/
├── api/
│   └── webhook.ts       — Telegram webhook handler (asosiy mantiq)
├── lib/
│   ├── i18n.ts           — 3 tilli tarjimalar
│   ├── supabase.ts       — Supabase client
│   └── telegram.ts       — Telegram API yordamchi funksiyalar
├── .env.example          — qaysi environment variable kerakligi
└── package.json
```

## Keyingi bosqich

Hozircha "🛒 Буюртма бериш" tugmasi vaqtinchalik xabar qaytaradi
("тез орада ишга тушади"). To'liq katalog + savat + tasdiqlash oqimi
keyingi qadamda `api/webhook.ts`ga qo'shiladi (TZ 5.3-bo'lim).
