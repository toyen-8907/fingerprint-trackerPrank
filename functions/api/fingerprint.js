
import { db } from '../../store';

export async function onRequestPost(context) {
  const { request } = context;
  const url = new URL(request.url);
  const shortCode = url.searchParams.get('id');

  if (!shortCode || !db.logs[shortCode]) {
    return new Response('Invalid code', { status: 400 });
  }

  const body = await request.json();
  const ip = request.headers.get('CF-Connecting-IP');
  const ua = request.headers.get('User-Agent');

  db.logs[shortCode].push({
    type: 'fingerprint',
    timestamp: new Date().toISOString(),
    ip,
    ua,
    visitorId: body.visitorId,
    components: body.components,
  });

  return new Response('OK');
}
