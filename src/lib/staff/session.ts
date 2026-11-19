/**
 * The /staff sign-in: one shared password for the Marketing team (same design as Capstone Quest).
 *
 * STAFF_PASSWORD is set in Railway's variables. A correct password earns a signed, HTTP-only
 * cookie good for 12 hours. The signing key is derived from the password, so changing
 * STAFF_PASSWORD signs everyone out.
 *
 * Deliberately not per-person accounts: one team, and the only thing behind the door is
 * editing public website content.
 */
import type { AstroCookies } from 'astro';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE = 'as_staff';
const TTL_SECONDS = 12 * 60 * 60;

function password(): string | null {
  return process.env.STAFF_PASSWORD?.trim() || null;
}

export function staffConfigured(): boolean {
  return password() !== null;
}

function sign(expires: string, secret: string): string {
  const key = createHash('sha256').update(`as-staff-session:${secret}`).digest();
  return createHmac('sha256', key).update(expires).digest('base64url');
}

function same(a: string, b: string): boolean {
  return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());
}

/** True when the request carries a valid, unexpired staff cookie. */
export function isStaff(cookies: AstroCookies): boolean {
  const secret = password();
  const value = cookies.get(COOKIE)?.value;
  if (!secret || !value) return false;
  const [expires, sig] = value.split('.');
  if (!expires || !sig || Number(expires) * 1000 < Date.now()) return false;
  return same(sig, sign(expires, secret));
}

// Five wrong guesses from one address lock it out for 15 minutes. In memory: one server
// process, and a restart clearing it is acceptable.
const failures = new Map<string, { count: number; until: number }>();

export function tryLogin(
  attempt: string,
  ip: string,
  cookies: AstroCookies,
): 'ok' | 'wrong' | 'locked' | 'unconfigured' {
  const secret = password();
  if (!secret) return 'unconfigured';
  const record = failures.get(ip);
  if (record && record.count >= 5 && record.until > Date.now()) return 'locked';

  // Trimmed like STAFF_PASSWORD itself: a phone keyboard's trailing space shouldn't fail it.
  if (!same(attempt.trim(), secret)) {
    const fresh = !record || record.until < Date.now();
    failures.set(ip, { count: fresh ? 1 : record.count + 1, until: Date.now() + 15 * 60 * 1000 });
    return 'wrong';
  }

  failures.delete(ip);
  const expires = String(Math.floor(Date.now() / 1000) + TTL_SECONDS);
  cookies.set(COOKIE, `${expires}.${sign(expires, secret)}`, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'strict',
    path: '/',
    maxAge: TTL_SECONDS,
  });
  return 'ok';
}

export function logout(cookies: AstroCookies): void {
  cookies.delete(COOKIE, { path: '/' });
}

/** Client address behind Railway's proxy. */
export function clientIp(request: Request, fallback: string): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || fallback;
}
