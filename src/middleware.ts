// Runs before every page:
// 1. Old amerischools.org URLs → 301 to their new pages (rules in public/_redirects, which the
//    migration script maintains; "/2017/*" style splats match everything under a prefix).
// 2. Page URLs without a trailing slash → 301 to the slash version (one canonical address).
// 3. Loads Marketing's /staff edits into memory before the page renders.
import { defineMiddleware } from 'astro:middleware';
import redirectRules from '../public/_redirects?raw';
import { loadStore } from './lib/staff/store';

const exact = new Map<string, string>();
const prefixes: [string, string][] = [];
for (const line of redirectRules.split('\n')) {
  const [from, to] = line.trim().split(/\s+/);
  if (!from || !to || from.startsWith('#')) continue;
  if (from.endsWith('*')) prefixes.push([from.slice(0, -1), to]);
  else exact.set(from, to);
}

function redirectFor(path: string): string | undefined {
  const withSlash = path.endsWith('/') || /\.[a-z0-9]+$/i.test(path) ? path : `${path}/`;
  const hit = exact.get(path) ?? exact.get(withSlash);
  if (hit) return hit;
  for (const [prefix, to] of prefixes) if (path.startsWith(prefix)) return to;
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname, search } = ctx.url;
  let path = pathname;
  try {
    path = decodeURI(pathname);
  } catch {
    // Malformed escape: match the raw path.
  }
  const to = redirectFor(path);
  if (to) return ctx.redirect(to, 301);

  if (!pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(pathname) && !pathname.startsWith('/_') && ctx.request.method === 'GET') {
    return ctx.redirect(`${pathname}/${search}`, 301);
  }

  await loadStore();
  return next();
});
