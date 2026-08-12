const TG_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export type InlineButton = { text: string; callback_data: string };

export async function sendMessage(
  chatId: number | string,
  text: string,
  buttons?: InlineButton[][]
) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  };
  if (buttons) {
    body.reply_markup = { inline_keyboard: buttons };
  }
  const res = await fetch(`${TG_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error("sendMessage xato:", await res.text());
  }
  return res.json();
}

export async function sendPhoto(
  chatId: number | string,
  photoUrl: string,
  caption: string,
  buttons?: InlineButton[][]
) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
  };
  if (buttons) {
    body.reply_markup = { inline_keyboard: buttons };
  }
  const res = await fetch(`${TG_API}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error("sendPhoto xato:", await res.text());
  }
  return res.json();
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  await fetch(`${TG_API}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
}
