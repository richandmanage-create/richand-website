import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve('next/package.json'));
const sharp=nextRequire('sharp');
await sharp('public/images/richand-living-room.png').resize({width:1536,withoutEnlargement:true}).webp({quality:86}).toFile('public/images/richand-living-room.webp');
console.log('Optimized interior image saved.');
