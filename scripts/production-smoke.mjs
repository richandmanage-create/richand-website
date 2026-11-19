import assert from 'node:assert/strict';
const base='https://richand.com.tw';
for(const path of ['/','/services','/services/asset-planning','/properties','/cases','/journal','/journal/renewal-priorities','/courses','/booking','/login','/privacy','/robots.txt','/sitemap.xml']){
 const r=await fetch(base+path);assert.equal(r.status,200,path);
 if(path==='/privacy')assert.ok((await r.text()).includes('保存 2 年'));
 console.log('PASS',path);
}
let r=await fetch('https://www.richand.com.tw/',{redirect:'manual'});assert.equal(r.status,308);assert.equal(r.headers.get('location'),base+'/');
r=await fetch(base+'/member',{redirect:'manual'});assert.equal(r.status,307);assert.equal(r.headers.get('location'),'/login');
r=await fetch(base+'/api/auth/providers');assert.equal(r.status,200);assert.equal((await r.json()).line.callbackUrl,base+'/api/auth/callback/line');
r=await fetch(base+'/api/bookings',{method:'POST',headers:{origin:'https://example.invalid'}});assert.equal(r.status,403);
r=await fetch(base+'/api/bookings',{method:'POST',headers:{origin:base}});assert.equal(r.status,401);
r=await fetch(base+'/api/bookings/00000000-0000-0000-0000-000000000000',{method:'PATCH',headers:{origin:base}});assert.equal(r.status,401);
r=await fetch(base+'/api/admin/bookings/00000000-0000-0000-0000-000000000000',{method:'PATCH',headers:{origin:base}});assert.equal(r.status,403);
r=await fetch(base+'/api/cron/retention');assert.equal(r.status,401);
r=await fetch(base+'/api/cron/notifications');assert.equal(r.status,401);
console.log('PASS HTTPS, www redirect, LINE provider callback, member redirect, origin/auth/admin/cron protections');
// Exercise NextAuth's real CSRF + OAuth initiation without creating an account.
const csrfResponse=await fetch(base+'/api/auth/csrf');
const {csrfToken}=await csrfResponse.json();
const cookie=csrfResponse.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
r=await fetch(base+'/api/auth/signin/line',{method:'POST',redirect:'manual',headers:{'content-type':'application/x-www-form-urlencoded',origin:base,cookie},body:new URLSearchParams({csrfToken,callbackUrl:base+'/member',json:'true'})});
const authUrl=new URL((await r.json()).url);
assert.equal(authUrl.hostname,'access.line.me');
assert.equal(authUrl.searchParams.get('redirect_uri'),base+'/api/auth/callback/line');
assert.equal(authUrl.searchParams.get('code_challenge_method'),'S256');
for(const field of ['state','nonce','code_challenge'])assert.ok(authUrl.searchParams.get(field));
assert.equal(authUrl.searchParams.get('scope'),'openid profile');
if(process.env.EXPECT_LINE_NOTIFICATIONS==='true'){
 assert.equal(authUrl.searchParams.get('bot_prompt'),'normal');
 const bookingHtml=await(await fetch(base+'/booking')).text();assert.ok(bookingHtml.includes('加入官方 LINE'));assert.ok(bookingHtml.includes('184mvvcr'));
 console.log('PASS LINE add-friend option and booking notification guidance');
}
console.log('PASS OAuth initiation: state, nonce, PKCE S256, correct production callback, minimal scope');
