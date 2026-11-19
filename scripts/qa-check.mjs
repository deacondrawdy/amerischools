// Launch QA for the test report: run against staging or production.
//   node scripts/qa-check.mjs https://amerischools-production.up.railway.app
// Checks: every sitemap page answers 200; every old amerischools.org URL (scripts/legacy-urls.txt)
// either still exists or 301s in one hop to a page that answers 200; unknown pages answer 404;
// robots.txt and the sitemap point at the right place.
import { readFile } from 'node:fs/promises';

const base = (process.argv[2] ?? 'http://127.0.0.1:4321').replace(/\/$/, '');
const fails = [];
const get = (path) => fetch(new URL(path, base), { redirect: 'manual' });

const sitemap = await (await get('/sitemap-0.xml')).text();
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
for (const p of pages) {
  const r = await get(p);
  if (r.status !== 200) fails.push(`sitemap page ${p} → ${r.status}`);
}

const legacy = (await readFile(new URL('./legacy-urls.txt', import.meta.url), 'utf8'))
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));
let redirected = 0;
for (const p of legacy) {
  const r = await get(p);
  if (r.status === 200) continue;
  if (r.status !== 301) {
    fails.push(`old URL ${p} → ${r.status}`);
    continue;
  }
  redirected++;
  const to = new URL(r.headers.get('location'), base);
  if (to.origin !== new URL(base).origin) continue; // external (donation site, Capstone)
  const r2 = await get(to.pathname + to.search);
  if (r2.status !== 200) fails.push(`old URL ${p} → ${to.pathname} → ${r2.status}`);
}

const missing = await get('/this-page-does-not-exist/');
if (missing.status !== 404) fails.push(`unknown page → ${missing.status} (expected 404)`);
const robots = await (await get('/robots.txt')).text();
if (!robots.includes('sitemap-index.xml')) fails.push('robots.txt does not list the sitemap');

console.log(`Base: ${base}`);
console.log(`Sitemap pages: ${pages.length} checked`);
console.log(`Old URLs: ${legacy.length} checked (${redirected} redirect, ${legacy.length - redirected} still exist)`);
console.log(fails.length ? `\nFAILED (${fails.length}):\n${fails.join('\n')}` : '\nAll checks passed.');
process.exit(fails.length ? 1 : 0);
