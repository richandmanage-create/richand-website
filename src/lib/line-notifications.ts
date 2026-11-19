import type { Pool } from 'pg';

type Database = Pick<Pool, 'query'>;
export type NotificationBooking = { id: string; date: string; period: string };
type Job = { id: string; recipient: string; message: string; attempts: number };
export type PushResult = { state: 'accepted' | 'retry' | 'failed'; code: string | null };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function notificationsEnabled() {
 return process.env.LINE_NOTIFICATIONS_ENABLED === 'true';
}

export function advisorMemberIds(value = process.env.ADMIN_MEMBER_IDS ?? '') {
 return [...new Set(value.split(',').map(id => id.trim()).filter(id => uuid.test(id)))];
}

export function lineFriendUrl() {
 const id = process.env.LINE_OFFICIAL_ACCOUNT_ID ?? '';
 return notificationsEnabled() && /^@[a-z0-9._-]+$/i.test(id)
  ? `https://line.me/R/ti/p/${encodeURIComponent(id)}` : undefined;
}

export function notificationMessage(booking: NotificationBooking, audience: 'member' | 'advisor', site: string) {
 const origin = new URL(site).origin;
 return [
  'RICHAND 叡亨財富管理顧問',
  audience === 'member' ? '已收到您的預約申請。' : '有一筆新的預約申請，請至顧問工作台處理。',
  `申請編號：${booking.id.slice(0, 8)}`,
  `希望聯繫：${booking.date} ${booking.period}（台灣時間）`,
  '目前為待顧問確認，實際時間另行聯繫。',
  `${origin}/${audience === 'member' ? 'member' : 'admin'}`,
  '服務電話：02-6609-0104',
 ].join('\n');
}

// Called inside the SAME transaction as the booking. Only new bookings enqueue;
// retrying a browser request cannot create a second notification.
export async function enqueueBookingNotifications(client: Database, booking: NotificationBooking, memberId: string, advisors: string[], site: string) {
 const result = await client.query(`
  INSERT INTO booking_notifications (booking_id,recipient_member_id,audience,recipient,message)
  SELECT $1::uuid,id,'member',line_subject,$3 FROM members WHERE id=$2
  UNION ALL
  SELECT $1::uuid,id,'advisor',line_subject,$4 FROM members WHERE id=ANY($5::uuid[])
  ON CONFLICT (booking_id,recipient_member_id,audience) DO NOTHING`,
  [booking.id, memberId, notificationMessage(booking, 'member', site), notificationMessage(booking, 'advisor', site), advisors]);
 return result.rowCount ?? 0;
}

export async function pushLineMessage(job: Pick<Job, 'id' | 'recipient' | 'message'>, token: string, fetcher: typeof fetch = fetch): Promise<PushResult> {
 if (!token) return { state: 'failed', code: 'missing_token' };
 if (!/^U[0-9a-f]{32}$/i.test(job.recipient)) return { state: 'failed', code: 'invalid_recipient' };
 try {
  const response = await fetcher('https://api.line.me/v2/bot/message/push', {
   method: 'POST',
   headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Line-Retry-Key': job.id },
   body: JSON.stringify({ to: job.recipient, messages: [{ type: 'text', text: job.message }] }),
   signal: AbortSignal.timeout(8000),
  });
  // Accepted is NOT a delivery/read receipt. LINE can accept requests for blocked accounts.
  if (response.ok || (response.status === 409 && response.headers.has('x-line-accepted-request-id'))) {
   return { state: 'accepted', code: null };
  }
  return { state: response.status >= 500 ? 'retry' : 'failed', code: `line_http_${response.status}` };
 } catch {
  return { state: 'retry', code: 'network_or_timeout' };
 }
}

export function retryDelayMinutes(attempt: number) {
 return Math.min(60, 5 * 2 ** Math.max(0, attempt - 1));
}

export async function dispatchNotifications(database: Database, token: string, options: { bookingId?: string; fetcher?: typeof fetch } = {}) {
 if (!token) throw new Error('LINE notification token missing');
 const bookingId = options.bookingId ?? null;
 // Do not send stale/cancelled requests or retry beyond LINE's 24-hour dedup window.
 await database.query(`UPDATE booking_notifications n SET state='cancelled',lease_until=NULL,updated_at=now()
  FROM bookings b WHERE b.id=n.booking_id AND b.status IN ('cancelled','completed')
  AND n.state IN ('pending','processing') AND ($1::uuid IS NULL OR n.booking_id=$1)`, [bookingId]);
 await database.query(`UPDATE booking_notifications SET state='failed',last_error_code='retry_window_expired',lease_until=NULL,updated_at=now()
  WHERE state IN ('pending','processing') AND (created_at < now()-interval '23 hours' OR attempts >= 6)
  AND (lease_until IS NULL OR lease_until < now()) AND ($1::uuid IS NULL OR booking_id=$1)`, [bookingId]);
 // Atomic leases + SKIP LOCKED let the immediate sender and cron overlap safely.
 const { rows } = await database.query<Job>(`WITH ready AS (
  SELECT id FROM booking_notifications WHERE
  ((state='pending' AND next_attempt_at<=now()) OR (state='processing' AND lease_until<now()))
  AND attempts<6 AND created_at>now()-interval '23 hours'
  AND ($1::uuid IS NULL OR booking_id=$1)
  ORDER BY created_at LIMIT 10 FOR UPDATE SKIP LOCKED
 ) UPDATE booking_notifications n SET state='processing',attempts=n.attempts+1,
  first_attempt_at=coalesce(n.first_attempt_at,now()),lease_until=now()+interval '2 minutes',updated_at=now()
  FROM ready WHERE n.id=ready.id RETURNING n.id,n.recipient,n.message,n.attempts`, [bookingId]);
 const counts = { accepted: 0, retry: 0, failed: 0 };
 // At most two network calls at a time and ten per invocation.
 for (let i = 0; i < rows.length; i += 2) {
  await Promise.all(rows.slice(i, i + 2).map(async job => {
   const result = await pushLineMessage(job, token, options.fetcher);
   const state = result.state === 'retry' ? (job.attempts >= 6 ? 'failed' : 'pending') : result.state;
   await database.query(`UPDATE booking_notifications SET state=$2,last_error_code=$3,lease_until=NULL,
    next_attempt_at=now()+($4 * interval '1 minute'),accepted_at=CASE WHEN $2='accepted' THEN now() ELSE accepted_at END,updated_at=now()
    WHERE id=$1 AND state='processing' AND attempts=$5`,
    [job.id, state, result.code, retryDelayMinutes(job.attempts), job.attempts]);
   counts[state === 'pending' ? 'retry' : state]++;
  }));
 }
 return counts;
}
