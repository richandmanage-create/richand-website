import 'server-only';
import { currentMember } from './auth';
export async function currentAdmin(){const member=await currentMember();if(!member)return null;const allowed=(process.env.ADMIN_MEMBER_IDS??'').split(',').map(s=>s.trim()).filter(Boolean);return allowed.includes(member.id)?member:null;}
