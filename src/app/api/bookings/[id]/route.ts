import { currentMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { sameOrigin } from '@/lib/booking-policy';
import { z } from 'zod';
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(req.headers.get('origin'),process.env.NEXTAUTH_URL))return Response.json({error:'請由本站重新操作。'},{status:403});
 const member=await currentMember();if(!member)return Response.json({error:'請先登入。'},{status:401});
 const {id}=await params;if(!z.uuid().safeParse(id).success)return Response.json({error:'無效的申請編號。'},{status:400});
 try{const result=await db().query("UPDATE bookings SET status='cancelled',updated_at=now() WHERE id=$1 AND member_id=$2 AND status IN ('pending','confirmed') RETURNING id",[id,member.id]);
 if(!result.rowCount)return Response.json({error:'此申請不存在或已無法取消。'},{status:404});
 return Response.json({ok:true});
 }catch{return Response.json({error:'暫時無法取消，請稍後重試。'},{status:503});}
}
