import { timingSafeEqual } from 'node:crypto';
import { db } from '@/lib/db';
import { dispatchNotifications, notificationsEnabled } from '@/lib/line-notifications';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
 const secret = process.env.CRON_SECRET;
 const supplied = Buffer.from(req.headers.get('authorization') ?? '');
 const expected = Buffer.from(`Bearer ${secret ?? ''}`);
 if (!secret || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
 }
 if (!notificationsEnabled()) return Response.json({ enabled: false });
 try {
  const result = await dispatchNotifications(db(), process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN ?? '');
  console.info('LINE notification queue processed', result);
  return Response.json({ ok: true, ...result });
 } catch {
  console.error('LINE notification queue unavailable');
  return Response.json({ error: 'Service unavailable' }, { status: 503 });
 }
}
