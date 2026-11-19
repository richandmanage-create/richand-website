import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { authReady } from '@/lib/config';
import type { NextRequest } from 'next/server';
const handler=NextAuth(authOptions);
async function guarded(req:NextRequest,context:{params:Promise<{nextauth:string[]}>}){
 if(!authReady())return Response.json({error:'會員服務尚未開放。'},{status:503});
 return handler(req,context);
}
export { guarded as GET,guarded as POST };
