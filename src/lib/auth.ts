import 'server-only';
import type { NextAuthOptions } from 'next-auth';
import LineProvider from 'next-auth/providers/line';
import { getServerSession } from 'next-auth';
import { db } from './db';
import { authReady } from './config';
export const authOptions:NextAuthOptions={
 secret:process.env.NEXTAUTH_SECRET,
 session:{strategy:'jwt',maxAge:60*60*24},
 pages:{signIn:'/login',error:'/login'},
 providers:[LineProvider({clientId:process.env.LINE_CHANNEL_ID??'',clientSecret:process.env.LINE_CHANNEL_SECRET??process.env.LINE_CLIENT_SECRET??'',authorization:{params:{scope:'openid profile'}},checks:['state','nonce','pkce']})],
 callbacks:{
  async signIn(){return authReady();},
  async jwt({token,account,user}){
   if(account){
    if(account.provider!=='line'||!account.providerAccountId)throw new Error('Invalid identity');
    const result=await db().query<{id:string}>('INSERT INTO members (line_subject,display_name) VALUES ($1,$2) ON CONFLICT (line_subject) DO UPDATE SET display_name=EXCLUDED.display_name, updated_at=now() RETURNING id',[account.providerAccountId,(user.name??'LINE 會員').slice(0,100)]);
    token.memberId=result.rows[0].id;
   }
   return token;
  },
  async session({session,token}){if(session.user && typeof token.memberId==='string')session.user.id=token.memberId;return session;}
 },
 logger:{error(code){console.error('Authentication error:',code);},warn(code){console.warn('Authentication warning:',code);},debug(){}}
};
export async function currentMember(){if(!authReady())return null;const session=await getServerSession(authOptions);return session?.user?.id?session.user:null;}
