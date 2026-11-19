import 'server-only';
import { Pool } from 'pg';
const globalDb=globalThis as unknown as {richandPool?:Pool};
export function db(){
 if(!process.env.DATABASE_URL)throw new Error('Database unavailable');
 if(!globalDb.richandPool){
  const url=new URL(process.env.DATABASE_URL);
  if(url.hostname.endsWith('.neon.tech'))url.searchParams.set('sslmode','verify-full');
  globalDb.richandPool=new Pool({connectionString:url.toString(),max:3,idleTimeoutMillis:20000,connectionTimeoutMillis:8000});
 }
 return globalDb.richandPool;
}
