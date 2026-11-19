import { readdir,readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const paths=['package.json','pnpm-lock.yaml','tsconfig.json','next.config.ts','next-env.d.ts','vercel.json'];
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())await walk(p);else paths.push(p);}}
await walk('src');
const files=[];
for(const file of paths)files.push({file,data:await readFile(file,'utf8'),encoding:'utf-8'});
const file='public/images/richand-living-room.webp';
const bytes=await readFile(file);
console.log(JSON.stringify({files,binary:{file,data:bytes.toString('base64'),sha:createHash('sha1').update(bytes).digest('hex'),size:bytes.length}}));
