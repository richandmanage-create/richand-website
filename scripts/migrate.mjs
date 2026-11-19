import { Pool } from 'pg';
import { readFile } from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
const pool=new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
try{await pool.query(await readFile(new URL('../db/001_initial.sql',import.meta.url),'utf8'));console.log('Database migration completed.');}catch{console.error('Migration failed. Check database access and schema permissions; credentials were not logged.');process.exitCode=1;}finally{await pool.end();}
