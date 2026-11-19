import assert from 'node:assert/strict';
const base='http://127.0.0.1:3000';
for(const path of ['/','/services','/services/asset-planning','/properties','/cases','/journal','/journal/renewal-priorities','/courses','/booking','/login','/privacy','/robots.txt','/sitemap.xml']){const r=await fetch(base+path);assert.equal(r.status,200,path);if(path==='/'){const html=await r.text();assert.ok(html.includes('叡亨財富管理顧問'));assert.ok(html.includes('richandmanage@gmail.com'));assert.equal(r.headers.get('x-content-type-options'),'nosniff');}console.log('PASS',path);}
let r=await fetch(base+'/member',{redirect:'manual'});assert.equal(r.status,307);assert.equal(r.headers.get('location'),'/login');console.log('PASS protected member redirect');
r=await fetch(base+'/admin');assert.equal(r.status,404);console.log('PASS hidden admin route');
r=await fetch(base+'/services/unknown');assert.equal(r.status,404);console.log('PASS unknown detail route');
r=await fetch(base+'/api/auth/providers');assert.equal(r.status,503);console.log('PASS disabled auth is unavailable');
for(const method of ['POST']){r=await fetch(base+'/api/bookings',{method,headers:{origin:'https://evil.example'}});assert.equal(r.status,403);r=await fetch(base+'/api/bookings',{method,headers:{origin:'http://localhost:3000'}});assert.equal(r.status,401);}console.log('PASS booking origin and authentication protection');
r=await fetch(base+'/api/bookings/00000000-0000-0000-0000-000000000000',{method:'PATCH',headers:{origin:'http://localhost:3000'}});assert.equal(r.status,401);console.log('PASS cancellation requires authentication');
r=await fetch(base+'/api/admin/bookings/00000000-0000-0000-0000-000000000000',{method:'PATCH',headers:{origin:'http://localhost:3000'}});assert.equal(r.status,403);console.log('PASS admin update requires authorization');
