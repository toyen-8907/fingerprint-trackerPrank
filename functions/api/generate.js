
import { db } from '../../store';

export async function onRequestPost(context) {
  const { request } = context;
  const { targetUrl } = await request.json();
  const shortCode = Math.random().toString(36).substring(2, 8);
  db.urls[shortCode] = targetUrl;
  db.logs[shortCode] = [];
  return new Response(JSON.stringify({ shortUrl: shortCode }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
