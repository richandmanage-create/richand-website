import assert from 'node:assert/strict';
import { Pool } from 'pg';
const url=new URL(process.env.DATABASE_URL);url.searchParams.set('sslmode','verify-full');
const pool=new Pool({connectionString:url.toString(),max:1,connectionTimeoutMillis:10000});
try{
 const booking=(await pool.query("SELECT id,status,consent_version FROM bookings WHERE name=$1 ORDER BY created_at DESC LIMIT 1",['LINE通知驗證・請勿聯繫'])).rows[0];
 assert.ok(booking,'Expected the explicitly marked browser test booking');
 assert.equal(booking.consent_version,'v2-line');
 assert.equal(booking.status,'cancelled','The explicitly marked test booking must be cancelled after verification');
 const {rows}=await pool.query('SELECT audience,state,attempts,last_error_code FROM booking_notifications WHERE booking_id=$1 ORDER BY audience',[booking.id]);
 assert.equal(rows.length,2);
 assert.deepEqual(rows.map(row=>row.audience),['advisor','member']);
 assert.ok(rows.every(row=>row.state==='accepted'));
 assert.ok(rows.every(row=>row.attempts===1));
 console.log(JSON.stringify({bookingReference:booking.id.slice(0,8),bookingStatus:booking.status,notifications:rows,receiptNote:'LINE API acceptance verified; actual receipt requires chat observation or owner confirmation.'}));
}catch(error){console.error('Live notification verification failed:',error.code??error.name);process.exitCode=1;}finally{await pool.end();}
