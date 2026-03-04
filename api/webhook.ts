// Telegram webhook handler for subscriber management (/start, /stop, /help)
// Deployed as a Vercel serverless function — always on, responds to Telegram updates.
// Set up webhook: GET /api/setup-webhook?secret=CRON_SECRET

import type { VercelRequest, VercelResponse } from "@vercel/node";

const TELEGRAM_API = () =>
  `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

const redis = (cmd: string, ...args: string[]) =>
  fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/${cmd}/${args.join("/")}`,
    { headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` } }
  ).then((r) => r.json() as Promise<{ result: unknown }>);

const SUBSCRIBERS_KEY = "neuro_bot:subscribers";

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

const WELCOME = `<b>Welcome to Neuroscience Daily!</b>

You'll receive a curated digest of the most interesting neuroscience content every morning at 9 AM EST.

<i>Reply /stop anytime to unsubscribe.</i>`;

const HELP = `<b>Neuroscience Daily Bot</b>

/start - Subscribe to daily updates
/stop - Unsubscribe
/help - Show this message`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const msg = req.body?.message;
  if (!msg?.text || !msg.chat) return res.json({ ok: true });

  const chatId: number = msg.chat.id;
  const text = msg.text.trim().toLowerCase();
  const name = msg.from?.first_name || "there";

  switch (text) {
    case "/start": {
      const { result } = await redis("sismember", SUBSCRIBERS_KEY, String(chatId));
      if (result === 1) {
        await sendMessage(chatId, "You're already subscribed! /stop to unsubscribe.");
      } else {
        await redis("sadd", SUBSCRIBERS_KEY, String(chatId));
        await sendMessage(chatId, WELCOME.replace("Welcome", `Welcome, ${name}`));
      }
      break;
    }
    case "/stop":
    case "/unsubscribe": {
      const { result } = await redis("sismember", SUBSCRIBERS_KEY, String(chatId));
      if (result === 1) {
        await redis("srem", SUBSCRIBERS_KEY, String(chatId));
        await sendMessage(chatId, "Unsubscribed. Reply /start to resubscribe.");
      } else {
        await sendMessage(chatId, "You're not subscribed. Reply /start to subscribe.");
      }
      break;
    }
    case "/help":
      await sendMessage(chatId, HELP);
      break;
    default:
      if (text.startsWith("/")) {
        await sendMessage(chatId, "Unknown command. /help for options.");
      }
  }

  return res.json({ ok: true });
}
