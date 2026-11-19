import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { enqueueBookingNotifications, dispatchNotifications } from '../src/lib/line-notifications.ts';
import { clearExpiredData } from '../src/lib/retention.ts';

// Every fixture rolls back. The injected transport NEVER sends a real LINE message.
const url=new URL(process.env.DATABASE_URL);url.searchParams.set('sslmode','verify-full');
const pool=new Pool({connectionString:url.toString(),max:1,connectionTimeoutMillis:10000});
let client;
try{
 client=await pool.connect();await client.query('BEGIN');
 const member=(await client.query("INSERT INTO members(line_subject,display_name) VALUES ($1,'Notification verification') RETURNING id",['U'+randomUUID().replaceAll('-','')])).rows[0].id;
 const advisor=(await client.query("INSERT INTO members(line_subject,display_name) VALUES ($1,'Advisor verification') RETURNING id",['U'+randomUUID().replaceAll('-','')])).rows[0].id;
 const booking=(await client.query("INSERT INTO bookings(member_id,request_id,name,phone,topic,preferred_date,preferred_period,consent_version) VALUES ($1,$2,'Verification','0000000000','課程詢問',CURRENT_DATE+1,'下午 13:00–17:00','notification-verification') RETURNING id",[member,randomUUID()])).rows[0];
 const data={id:booking.id,date:'2026-11-20',period:'下午 13:00–17:00'};
 assert.equal(await enqueueBookingNotifications(client,data,member,[advisor],'https://richand.com.tw'),2);
 assert.equal(await enqueueBookingNotifications(client,data,member,[advisor],'https://richand.com.tw'),0);
 const sent=[];
 const success=async(_,init)=>{sent.push({key:new Headers(init.headers).get('x-line-retry-key'),payload:JSON.parse(init.body)});return new Response('{}',{status:200});};
 await Promise.all([dispatchNotifications(client,'fake-token',{bookingId:booking.id,fetcher:success}),dispatchNotifications(client,'fake-token',{bookingId:booking.id,fetcher:success})]);
 assert.equal(sent.length,2);assert.equal(new Set(sent.map(x=>x.key)).size,2);
 assert.deepEqual((await client.query('SELECT state FROM booking_notifications WHERE booking_id=$1',[booking.id])).rows.map(x=>x.state),['accepted','accepted']);
 await dispatchNotifications(client,'fake-token',{bookingId:booking.id,fetcher:success});assert.equal(sent.length,2);
 // Simulate a crash after LINE accepted but before the local acknowledgement.
 await client.query("UPDATE booking_notifications SET state='processing',lease_until=now()-interval '1 minute' WHERE booking_id=$1 AND audience='member'",[booking.id]);
 let retriedKey;
 await dispatchNotifications(client,'fake-token',{bookingId:booking.id,fetcher:async(_,init)=>{retriedKey=new Headers(init.headers).get('x-line-retry-key');return new Response('{}',{status:409,headers:{'x-line-accepted-request-id':'prior'}});}});
 assert.ok(sent.some(item=>item.key===retriedKey));
 await client.query("UPDATE booking_notifications SET state='pending',next_attempt_at=now() WHERE booking_id=$1 AND audience='member'",[booking.id]);
 await dispatchNotifications(client,'fake-token',{bookingId:booking.id,fetcher:async()=>new Response('',{status:503})});
 const retry=(await client.query("SELECT state,next_attempt_at>now() AS delayed FROM booking_notifications WHERE booking_id=$1 AND audience='member'",[booking.id])).rows[0];
 assert.equal(retry.state,'pending');assert.equal(retry.delayed,true);
 await client.query("UPDATE booking_notifications SET created_at=now()-interval '24 hours',next_attempt_at=now() WHERE booking_id=$1 AND audience='member'",[booking.id]);
 await dispatchNotifications(client,'fake-token',{bookingId:booking.id,fetcher:async()=>{assert.fail('expired notification sent');}});
 assert.equal((await client.query("SELECT last_error_code FROM booking_notifications WHERE booking_id=$1 AND audience='member'",[booking.id])).rows[0].last_error_code,'retry_window_expired');
 await client.query("UPDATE booking_notifications SET state='pending',created_at=now(),attempts=0,next_attempt_at=now() WHERE booking_id=$1",[booking.id]);
 await client.query("UPDATE bookings SET status='cancelled' WHERE id=$1",[booking.id]);
 await dispatchNotifications(client,'fake-token',{bookingId:booking.id,fetcher:async()=>{assert.fail('cancelled booking sent');}});
 assert.ok((await client.query('SELECT state FROM booking_notifications WHERE booking_id=$1',[booking.id])).rows.every(x=>x.state==='cancelled'));
 await client.query("UPDATE booking_notifications SET created_at=now()-interval '3 years' WHERE booking_id=$1",[booking.id]);
 await clearExpiredData(client);
 assert.equal((await client.query('SELECT id FROM booking_notifications WHERE booking_id=$1',[booking.id])).rowCount,0);
 assert.equal((await client.query('SELECT id FROM bookings WHERE id=$1',[booking.id])).rowCount,1);
 await client.query('ROLLBACK');
 assert.equal((await client.query('SELECT id FROM members WHERE id=$1',[member])).rowCount,0);
 console.log('PASS: transactional dual-recipient outbox, idempotency, concurrent claims, immutable retry keys, crash recovery, backoff, stale/cancelled suppression, 2-year cleanup; zero real messages and all fixtures rolled back.');
}catch(error){await client?.query('ROLLBACK').catch(()=>{});console.error('Notification verification failed:',error.code??error.name,error.message?.replace(/postgres(?:ql)?:\/\/\S+/g,'[redacted]'));process.exitCode=1;}finally{client?.release();await pool.end();}
