import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { clearExpiredData } from '../src/lib/retention.ts';

const url = new URL(process.env.DATABASE_URL);
url.searchParams.set('sslmode', 'verify-full');
const pool = new Pool({ connectionString: url.toString(), max: 1, connectionTimeoutMillis: 10000 });
let client;
try {
  client = await pool.connect();
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('members','bookings','booking_audit') ORDER BY table_name");
  assert.equal(tables.rowCount, 3);
  await client.query('BEGIN');
  const subject = `verification-${randomUUID()}`;
  const member = await client.query('INSERT INTO members (line_subject,display_name) VALUES ($1,$2) RETURNING id', [subject, 'Integration verification']);
  const memberId = member.rows[0].id;
  const requestId = randomUUID();
  const booking = await client.query("INSERT INTO bookings (member_id,request_id,name,phone,topic,preferred_date,preferred_period,consent_version) VALUES ($1,$2,'Verification','0000000000','課程詢問',CURRENT_DATE+1,'上午 09:00–12:00','verification') RETURNING id,status", [memberId, requestId]);
  assert.equal(booking.rows[0].status, 'pending');
  const foreignAccess = await client.query("UPDATE bookings SET status='cancelled' WHERE id=$1 AND member_id=$2 RETURNING id", [booking.rows[0].id, randomUUID()]);
  assert.equal(foreignAccess.rowCount, 0);
  await client.query('SAVEPOINT duplicate_test');
  await assert.rejects(client.query("INSERT INTO bookings (member_id,request_id,name,phone,topic,preferred_date,preferred_period,consent_version) VALUES ($1,$2,'Verification','0000000000','課程詢問',CURRENT_DATE+1,'上午 09:00–12:00','verification')", [memberId, requestId]), { code: '23505' });
  await client.query('ROLLBACK TO SAVEPOINT duplicate_test');
  await client.query("INSERT INTO booking_audit (booking_id,actor_id,from_status,to_status) VALUES ($1,$2,'pending','confirmed')", [booking.rows[0].id, memberId]);
  // Real retention SQL against transaction-scoped fixtures, including an inactive
  // member whose recent booking must preserve the account.
  await client.query("UPDATE members SET updated_at=now()-interval '3 years' WHERE id=$1", [memberId]);
  const expiredMember = await client.query("INSERT INTO members (line_subject,display_name,updated_at) VALUES ($1,'Expired verification',now()-interval '3 years') RETURNING id", [`verification-expired-${randomUUID()}`]);
  await clearExpiredData(client);
  assert.equal((await client.query('SELECT id FROM members WHERE id=$1', [memberId])).rowCount, 1);
  assert.equal((await client.query('SELECT id FROM members WHERE id=$1', [expiredMember.rows[0].id])).rowCount, 0);
  await client.query("UPDATE bookings SET updated_at=now()-interval '3 years' WHERE id=$1", [booking.rows[0].id]);
  await clearExpiredData(client);
  assert.equal((await client.query('SELECT id FROM members WHERE id=$1', [memberId])).rowCount, 0);
  assert.equal((await client.query('SELECT id FROM booking_audit WHERE booking_id=$1', [booking.rows[0].id])).rowCount, 0);
  await client.query('ROLLBACK');
  assert.equal((await client.query('SELECT id FROM members WHERE line_subject=$1', [subject])).rowCount, 0);
  console.log('PASS: TLS connection, 3 tables, member/booking/audit writes, ownership filter, duplicate protection, two-year cleanup with active-booking protection, rollback without persisted test data.');
} catch (error) {
  if (client) await client.query('ROLLBACK').catch(() => {});
  console.error('Database verification failed:', error.code ?? error.name);
  process.exitCode = 1;
} finally {
  client?.release();
  await pool.end();
}
