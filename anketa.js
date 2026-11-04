// Серверная функция (Vercel / Netlify-совместимый стиль). Токен читается из переменных окружения.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const { TELEGRAM_BOT_TOKEN: T, TELEGRAM_CHAT_ID: C } = process.env;
  if (!T || !C) return res.status(500).json({ ok: false });
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (b.website) return res.status(200).json({ ok: true }); // honeypot от ботов
  const clean = s => String(s || '').replace(/[\u0000-\u001f]/g, ' ').slice(0, 300);
  const text = '📝 Новая анкета с yonnilee.ru\n\n' +
    (Array.isArray(b.answers) ? b.answers : []).slice(0, 10)
      .map(a => clean(a.q) + ':\n' + clean(a.a)).join('\n\n');
  const r = await fetch(`https://api.telegram.org/bot${T}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: C, text })
  });
  return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
}
