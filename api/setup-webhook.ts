// One-time setup: GET /api/setup-webhook?secret=YOUR_CRON_SECRET
// Tells Telegram to send updates to /api/webhook

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const webhookUrl = `https://${req.headers.host}/api/webhook`;
  const token = process.env.TELEGRAM_BOT_TOKEN;

  const r = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  });

  const data = await r.json();
  return res.json({ ok: data.ok, webhookUrl });
}
