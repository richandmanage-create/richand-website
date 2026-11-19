import { currentAdmin } from '@/lib/admin';
import { sameOrigin } from '@/lib/booking-policy';
import { canTransition } from '@/lib/status-policy';
import { db } from '@/lib/db';
import { z } from 'zod';
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(req.headers.get('origin'),process.env.NEXTAUTH_URL))return Response.json({error:'來源不符。'},{status:403});
 const admin=await currentAdmin();if(!admin)return Response.json({error:'無權限。'},{status:403});
 const {id}=await params;if(!z.uuid().safeParse(id).success)return Response.json({error:'編號格式不符。'},{status:400});
 let input;try{input=await req.json();}catch{return Response.json({error:'格式不符。'},{status:400});}
 const parsed=z.object({from:z.enum(['pending','confirmed']),to:z.enum(['confirmed','completed','cancelled'])}).safeParse(input);
 if(!parsed.success||!canTransition(parsed.data.from,parsed.data.to))return Response.json({error:'不允許的狀態變更。'},{status:400});
 const {from,to}=parsed.data;const client=await db().connect();
 try{await client.query('BEGIN');const result=await client.query('UPDATE bookings SET status=$1,updated_at=now() WHERE id=$2 AND status=$3 RETURNING id',[to,id,from]);
 if(!result.rowCount){await client.query('ROLLBACK');return Response.json({error:'狀態已更新，請重新整理。'},{status:409});}
 await client.query('INSERT INTO booking_audit (booking_id,actor_id,from_status,to_status) VALUES ($1,$2,$3,$4)',[id,admin.id,from,to]);
 await client.query('COMMIT');return Response.json({ok:true});
 }catch{await client.query('ROLLBACK');return Response.json({error:'暫時無法更新。'},{status:503});}finally{client.release();}
}
