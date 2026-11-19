import assert from 'node:assert/strict';
import { Pool } from 'pg';
const url=new URL(process.env.DATABASE_URL);
url.searchParams.set('sslmode','verify-full');
const pool=new Pool({connectionString:url.toString(),max:1,connectionTimeoutMillis:10000});
try{
 const result=await pool.query("SELECT b.status,(SELECT count(*)::int FROM booking_audit a WHERE a.booking_id=b.id AND a.from_status='pending' AND a.to_status='confirmed') AS confirmations FROM bookings b WHERE b.name=$1 AND b.notes LIKE $2",['系統驗證・請勿聯繫','網站上線驗證：%']);
 assert.equal(result.rowCount,1);
 assert.equal(result.rows[0].status,'cancelled');
 assert.equal(result.rows[0].confirmations,1);
 console.log('PASS: one live browser test booking persisted, advisor confirmation audited, member cancellation persisted.');
}catch(error){console.error('Live record verification failed:',error.code??error.name);process.exitCode=1;}finally{await pool.end();}
