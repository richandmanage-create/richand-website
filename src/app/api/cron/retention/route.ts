import { timingSafeEqual } from 'node:crypto';
import type { PoolClient } from 'pg';
import { db } from '@/lib/db';
import { clearExpiredData } from '@/lib/retention';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const secret=process.env.CRON_SECRET;
 const supplied=Buffer.from(req.headers.get('authorization')??'');
 const expected=Buffer.from(`Bearer ${secret??''}`);
 if(!secret||supplied.length!==expected.length||!timingSafeEqual(supplied,expected))return Response.json({error:'Unauthorized'},{status:401});
 let client:PoolClient|undefined;
 try{
  client=await db().connect();
  await client.query('BEGIN');
  const result=await clearExpiredData(client);
  await client.query('COMMIT');
  console.info('Data retention completed',result);
  return Response.json({ok:true,...result});
 }catch{
  await client?.query('ROLLBACK').catch(()=>{});
  console.error('Data retention failed');
  return Response.json({error:'Service unavailable'},{status:503});
 }finally{client?.release();}
}
