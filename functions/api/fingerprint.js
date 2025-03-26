// functions/api/fingerprint.js
import { db } from '../../store';
import UAParser from 'ua-parser-js';

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const url = new URL(request.url);
    const shortCode = url.searchParams.get('id');

    console.log(`【指紋紀錄】收到 POST 請求，短碼為 "${shortCode}"`);

    if (!shortCode || !db.logs[shortCode]) {
      console.error(`【指紋紀錄】無效短碼或找不到對應 log 區段：${shortCode}`);
      return new Response('Invalid code', { status: 400 });
    }

    const body = await request.json();
    const ip = request.headers.get('CF-Connecting-IP');
    const uaString = request.headers.get('User-Agent') || '';

    // UA 分析
    const parser = new UAParser(uaString);
    const browser = parser.getBrowser();
    const device = parser.getDevice();
    const os = parser.getOS();

    console.log(`【指紋紀錄】IP=${ip}, 瀏覽器=${browser.name} ${browser.version}, 作業系統=${os.name} ${os.version}`);

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

    // 寫入資料庫
    db.logs[shortCode].push({
      type: 'fingerprint',
      timestamp: new Date().toISOString(),
      ip,
      browserName: browser.name || '未知',
      browserVersion: browser.version || '未知',
      osName: os.name || '未知',
      osVersion: os.version || '未知',
      deviceModel: device.model || '未知',
      deviceVendor: device.vendor || '未知',
      geo
    });

    console.log(`【指紋紀錄】成功寫入指紋紀錄，shortCode=${shortCode}`);
    return new Response('OK');
  } catch (error) {
    console.error('【指紋紀錄】發生例外錯誤：', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
