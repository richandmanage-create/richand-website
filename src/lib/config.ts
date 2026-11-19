export function servicesEnabled(){return process.env.MEMBER_SERVICES_ENABLED==='true';}
export function authReady(){return servicesEnabled() && Boolean(process.env.LINE_CHANNEL_ID && (process.env.LINE_CHANNEL_SECRET || process.env.LINE_CLIENT_SECRET) && process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL && process.env.DATABASE_URL);}
