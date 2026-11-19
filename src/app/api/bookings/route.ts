import { currentMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { bookingSchema,sameOrigin } from '@/lib/booking-policy';
import type { PoolClient } from 'pg';
import { after } from 'next/server';
import { advisorMemberIds, dispatchNotifications, enqueueBookingNotifications, notificationsEnabled } from '@/lib/line-notifications';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(req:Request){
 if(!sameOrigin(req.headers.get('origin'),process.env.NEXTAUTH_URL))return Response.json({error:'請由本站重新送出表單。'},{status:403});
 const member=await currentMember();if(!member)return Response.json({error:'請先登入會員。'},{status:401});
 const body=await req.text();if(body.length>12000)return Response.json({error:'內容過長。'},{status:413});
 let input;try{input=JSON.parse(body);}catch{return Response.json({error:'表單格式錯誤。'},{status:400});}
 const parsed=bookingSchema().safeParse(input);if(!parsed.success)return Response.json({error:parsed.error.issues[0]?.message??'請檢查表單。'},{status:400});
 const b=parsed.data;let client:PoolClient|undefined;
 try{
  client=await db().connect();
  await client.query('BEGIN');
  // Serialize per member to prevent concurrent requests from bypassing the daily cap.
  await client.query('SELECT id FROM members WHERE id=$1 FOR UPDATE',[member.id]);
  const duplicate=await client.query('SELECT id FROM bookings WHERE member_id=$1 AND request_id=$2',[member.id,b.requestId]);
  if(duplicate.rowCount){await client.query('COMMIT');return Response.json({id:duplicate.rows[0].id},{status:200});}
  const count=await client.query('SELECT count(*)::int AS count FROM bookings WHERE member_id=$1 AND created_at > now()-interval \'24 hours\'',[member.id]);
  if(count.rows[0].count>=3){await client.query('ROLLBACK');return Response.json({error:'24 小時內最多送出 3 次申請，請稍後再試。'},{status:429});}
  const result=await client.query('INSERT INTO bookings (member_id,request_id,name,phone,topic,preferred_date,preferred_period,notes,consent_version) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',[member.id,b.requestId,b.name,b.phone,b.topic,b.date,b.period,b.notes,notificationsEnabled()?'v2-line':'v1']);
  const id=result.rows[0].id;
  if(notificationsEnabled())await enqueueBookingNotifications(client,{id,date:b.date,period:b.period},member.id,advisorMemberIds(),process.env.NEXTAUTH_URL!);
  await client.query('COMMIT');
  if(notificationsEnabled())after(async()=>{try{await dispatchNotifications(db(),process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN??'',{bookingId:id});}catch{console.error('LINE notification deferred to retry queue');}});
  return Response.json({id},{status:201});
 }catch{await client?.query('ROLLBACK').catch(()=>{});return Response.json({error:'暫時無法儲存，請稍後重試；可先至會員中心確認紀錄。'},{status:503});}finally{client?.release();}
}
