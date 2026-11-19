import { Pool } from 'pg';
import { readFile, readdir } from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
const databaseUrl=new URL(process.env.DATABASE_URL);if(databaseUrl.hostname.endsWith('.neon.tech'))databaseUrl.searchParams.set('sslmode','verify-full');
const pool=new Pool({connectionString:databaseUrl.toString(),connectionTimeoutMillis:10000});
try{const directory=new URL('../db/',import.meta.url);for(const file of (await readdir(directory)).filter(name=>/^\d+.*\.sql$/.test(name)).sort()){await pool.query(await readFile(new URL(file,directory),'utf8'));console.log('Applied migration:',file);}console.log('Database migration completed.');}catch{console.error('Migration failed. Check database access and schema permissions; credentials were not logged.');process.exitCode=1;}finally{await pool.end();}
