#!/usr/bin/env node
// One-time (re-runnable) migration of amerischools.org (WordPress) into this repo.
//   node scripts/migrate-legacy.mjs
// Writes: src/content/pages/**, src/data/legacy/{menus,documents,disclosures,pages}.json,
//         public/documents/**, public/_redirects
// Page text lives in the theme's rendered HTML (the REST `content` field is empty),
// so we crawl the rendered pages. The site's firewall rejects some HTTP clients, so we use curl.

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const run = promisify(execFile);
const ORIGIN = 'https://amerischools.org';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_PAGES = path.join(ROOT, 'src/content/pages');
const OUT_DATA = path.join(ROOT, 'src/data/legacy');
const OUT_DOCS = path.join(ROOT, 'public/documents');
const UA = 'AmeriSchools-site-migration/1.0 (+https://github.com/deacondrawdy/amerischools)';
const CAPSTONE = 'https://capstonequestacademy.com/';

// ---------- URL mapping (old path → new path) ----------
const CAMPUS_ROOTS = {
  'phoenix-camelback': 'phoenix',
  tucson: 'tucson',
  'yuma-north': 'yuma-north',
  'yuma-middle-school': 'yuma-middle',
  'yuma-south': 'yuma-middle',
};
const CAMPUS_SUBPAGES = {
  'parent-resources/curriculum': 'curriculum',
  'recreation-and-programs/clubs-and-sports': 'clubs-and-sports',
  'recreation-and-programs/before-and-after-school-programs': 'before-and-after-school',
  'staff-and-admin': 'staff',
  'contact-info': 'contact',
  'tours-and-open-houses': 'tours',
  calendar: 'calendar',
  portals: 'portals',
};
const CAMPUS_CONTAINERS = new Set(['parent-resources', 'recreation-and-programs']);
const DISTRICT = {
  '': { to: '/', legacyOnly: true },
  about: { to: '/about/' },
  'district-information': { to: '/district-information/' },
  careers: { to: '/careers/' },
  contact: { to: '/contact/' },
  'privacy-policy': { to: '/privacy-policy/' },
  'terms-and-conditions': { to: '/terms-and-conditions/' },
  'dress-code': { to: '/dress-code/' },
  'campus-overview': { to: '/campuses/', legacyOnly: true },
  'now-enrolling-2025-2026-charter-school': { to: '/admissions/' },
  'now-enrolling-2025-2026-charter-school/student-interest-application': { to: '/admissions/interest-form/' },
  // Stale / duplicate / landing pages: saved for review, redirected.
  'lunch-menu': { to: '/current-families/', review: 'Old lunch menu page (2024)' },
  'lunch-menu-2': { to: '/current-families/', review: 'Duplicate lunch menu page (2024)' },
  donate: { to: 'https://donateamerischools.org/', review: 'Old donate page (2019)' },
  'donate-2': { to: 'https://donateamerischools.org/', review: 'Donate page (2025) — tax credit site is external' },
  archives: { to: '/district-information/', review: 'Archived district documents' },
  documents: { to: '/district-information/', review: 'Old documents page (2019)' },
  programs: { to: '/campuses/', review: 'Old programs page (2022)' },
  blog: { to: '/', review: 'Blog index — posts not migrated' },
  camelbackinfo: { to: '/campuses/phoenix/', review: 'Phoenix landing page (likely QR/ad link)' },
  tucsoninfo: { to: '/campuses/tucson/', review: 'Tucson landing page (likely QR/ad link)' },
  yumanorthinfo: { to: '/campuses/yuma-north/', review: 'Yuma North landing page (likely QR/ad link)' },
  yumasouthinfo: { to: '/campuses/yuma-middle/', review: 'Yuma South landing page (likely QR/ad link)' },
};
// Known old URLs that aren't WordPress "pages" (custom post types / menu-only links).
const EXTRA_REDIRECTS = {
  '/enroll/': '/admissions/',
  '/pre-k-capstone-quest-academy-tucson-inc/': CAPSTONE,
  '/pre-k-capstone-quest-academy-inc-yuma-north/': CAPSTONE,
};

// Pages with no content on the old site are redirected here instead of published blank.
const EMPTY_FALLBACK = {
  portals: '/current-families/',
  'dress-code': '/current-families/',
  'terms-and-conditions': '/privacy-policy/',
};

const clean = (p) => p.replace(/^\/+|\/+$/g, '');

/** Map an old site path to { to, campus?, sub?, legacyOnly?, review?, container? }. */
function mapPath(oldPath) {
  const p = clean(oldPath);
  if (p in DISTRICT) return { ...DISTRICT[p] };
  const [root, ...rest] = p.split('/');
  const campus = CAMPUS_ROOTS[root];
  if (!campus) return null;
  const sub = rest.join('/');
  const base = `/campuses/${campus}/`;
  if (!sub) return { to: base, campus, legacyOnly: true };
  if (CAMPUS_CONTAINERS.has(sub)) return { to: base, campus, container: true };
  if (CAMPUS_SUBPAGES[sub]) return { to: `${base}${CAMPUS_SUBPAGES[sub]}/`, campus, sub: CAMPUS_SUBPAGES[sub] };
  return null;
}

// ---------- fetching ----------
async function curl(url, args = []) {
  const { stdout } = await run('curl', ['-sSL', '--fail', '--max-time', '60', '-A', UA, ...args, url], {
    maxBuffer: 64 * 1024 * 1024,
    encoding: args.includes('-o') ? 'utf8' : 'utf8',
  });
  return stdout;
}
async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await fn(items[k], k);
      }
    }),
  );
  return out;
}

// ---------- PDFs ----------
// PDFs are collected during the crawl and given final paths afterwards, so a file
// linked from several campuses lands in /documents/district/ instead of the first campus seen.
const docs = new Map(); // legacy absolute URL → doc record
const takenNames = new Set();
const DOC_TOKEN = (i) => `@@doc${i}@@`;
function categorize(label, file) {
  const s = `${label} ${file}`.toLowerCase();
  if (/menu|breakfast|lunch/.test(s)) return 'menu';
  if (/handbook/.test(s)) return 'handbook';
  if (/calendar/.test(s)) return 'calendar';
  if (/suppl/.test(s)) return 'supplies';
  if (/uniform|dress/.test(s)) return 'dress-code';
  if (/budget|board|meeting|notice|agenda|minutes|afr|financial|audit|asbestos/.test(s)) return 'governance';
  if (/wellness|policy|title|plan/.test(s)) return 'policy';
  if (/application|enroll|registration|interest|form/.test(s)) return 'enrollment';
  return 'other';
}
function isLocalPdf(href) {
  try {
    const u = new URL(href, ORIGIN);
    return /(^|\.)amerischools\.org$/.test(u.hostname) && /\.pdf$/i.test(u.pathname);
  } catch {
    return false;
  }
}
const GENERIC_LABEL = /^(download( pdf)?|click (here|to download)( to start)?|here|pdf|view)$/i;
function registerDoc(href, label, campus) {
  const abs = new URL(href, ORIGIN).href;
  let rec = docs.get(abs);
  if (!rec) {
    rec = { token: DOC_TOKEN(docs.size), legacyUrl: abs, labels: new Set(), campuses: new Set() };
    docs.set(abs, rec);
  }
  if (label && !GENERIC_LABEL.test(label)) rec.labels.add(label);
  rec.campuses.add(campus ?? 'district');
  return rec;
}
/** Give every collected PDF its final path and metadata. */
function assignDocPaths() {
  for (const rec of docs.values()) {
    const camps = [...rec.campuses];
    const folder = camps.length === 1 ? camps[0] : 'district';
    const name = decodeURIComponent(path.posix.basename(new URL(rec.legacyUrl).pathname))
      .replace(/[^A-Za-z0-9._-]+/g, '-')
      .replace(/-+(\.pdf)$/i, '$1')
      .toLowerCase();
    let key = `${folder}/${name}`;
    for (let n = 2; takenNames.has(key); n++) key = `${folder}/${name.replace(/\.pdf$/, `-${n}.pdf`)}`;
    takenNames.add(key);
    const title = [...rec.labels][0] ?? name.replace(/\.pdf$/, '').replace(/[-_]+/g, ' ');
    Object.assign(rec, {
      title,
      path: `/documents/${key}`,
      campus: folder === 'district' ? null : folder,
      category: categorize([...rec.labels].join(' '), name),
    });
  }
}
const resolveDocs = (s) => s.replace(/@@doc(\d+)@@/g, (_, i) => [...docs.values()][Number(i)].path);

// ---------- link rewriting ----------
function rewriteHref(href, label, campus) {
  if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) return href;
  let u;
  try {
    u = new URL(href, ORIGIN);
  } catch {
    return href;
  }
  if (isLocalPdf(u.href)) return registerDoc(u.href, label, campus).token;
  if (!/(^|\.)amerischools\.org$/.test(u.hostname) || u.pathname.startsWith('/wp-content/')) return u.href;
  if (EXTRA_REDIRECTS[u.pathname]) return EXTRA_REDIRECTS[u.pathname];
  const m = mapPath(u.pathname);
  return m ? m.to + u.hash : u.href;
}

// ---------- HTML → Markdown ----------
const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' });
td.use(gfm);
td.remove(['script', 'style', 'noscript', 'svg', 'iframe', 'form', 'button']);
td.addRule('figure-media', {
  filter: (n) => n.nodeName === 'VIDEO' || n.nodeName === 'SOURCE',
  replacement: () => '',
});

function extractContent($, campus) {
  const main = $('main.main').first();
  main.find('section.campus-hero, section.campus-single-nav-mobile, section.image-slider, a.skip, #skip-nav').remove();
  main.find('figure.background').remove();
  const images = [];
  main.find('img').each((_, img) => {
    const src = $(img).attr('data-src') || $(img).attr('src');
    if (src && !src.startsWith('data:')) images.push(new URL(src, ORIGIN).href);
    $(img).remove(); // decorative/background imagery in this theme; real photos are handled separately
  });
  main.find('a[href]').each((_, a) => {
    const label = $(a).text().replace(/\s+/g, ' ').trim();
    $(a).attr('href', rewriteHref($(a).attr('href'), label, campus));
  });
  // Pull out the teacher-salary disclosure (A.R.S. §15-189.05) so campus pages can keep it.
  let disclosure = null;
  main.children('section').each((_, s) => {
    if (/15-189\.05/.test($(s).text())) {
      disclosure = td.turndown($.html(s)).trim();
      $(s).remove();
    }
  });
  let md = td.turndown(main.html() ?? '');
  md = md
    .replace(/^(#{1,5}) /gm, '#$1 ') // the page layout owns the H1; demote one level
    .replace(/^#{1,6}\s*$/gm, '') // empty headings
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .replace(/^#{1,6} [^\n]*\n+/, '') // the theme's banner heading repeats the page title
    // …or a plain "Phoenix Camelback / Clubs and Sports" label block does.
    .replace(/^(?:[A-Za-z&’'  –-]{2,40}\n?){1,2}(?:\n+|$)/, '');

  return { md, images: [...new Set(images)], disclosure };
}

// ---------- menus ----------
function readMenu($, root) {
  const walk = (ul) =>
    $(ul)
      .children('li')
      .map((_, li) => {
        const a = $(li).children('a').first();
        const label = a.text().replace(/\s+/g, ' ').trim();
        const href = a.attr('href') ?? '';
        const kids = $(li).children('ul').first();
        const node = { label, href };
        if (kids.length) node.children = walk(kids);
        return node;
      })
      .get();
  const ul = $(root).is('ul') ? $(root) : $(root).find('ul').first();
  return walk(ul);
}
function mapMenu(items, campus) {
  return items
    .filter((i) => i.label && !/^enroll today$/i.test(i.label))
    .map((i) => {
      const href = i.href && i.href !== '#' && !/^https?:\/\/#/.test(i.href) ? rewriteHref(i.href, i.label, campus) : null;
      // "AmeriSchools Yuma Middle Staff & Admin" → "Staff & Admin"
      const label = i.label.replace(/^AmeriSchools(\s+Yuma Middle)?\s+/i, '').replace(/\s+and\s+/i, ' & ');
      return { label, href, ...(i.children ? { children: mapMenu(i.children, campus) } : {}) };
    });
}
/** Mega-menus are column groups (About / Parent Resources / …) of links. */
function readMegaMenu($, el) {
  const groups = [];
  $(el)
    .find('a')
    .each((_, a) => {
      const depth = $(a).parents('ul').length;
      const label = $(a).text().replace(/\s+/g, ' ').trim();
      const href = $(a).attr('href') ?? '';
      if (depth <= 1) groups.push({ label, href, children: [] });
      else groups.at(-1)?.children.push({ label, href });
    });
  return groups;
}

// ---------- main ----------
async function main() {
  console.log('Fetching page list…');
  const list = JSON.parse(await curl(`${ORIGIN}/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,parent,link,title,modified`));
  console.log(`  ${list.length} pages`);

  await rm(OUT_PAGES, { recursive: true, force: true });
  await mkdir(OUT_PAGES, { recursive: true });
  await mkdir(OUT_DATA, { recursive: true });

  const report = { pages: 0, written: 0, legacyOnly: [], review: [], empty: [], unmapped: [], failed: [] };
  const redirects = new Map();
  const disclosures = {};
  const pageIndex = [];
  const pending = []; // page files, written once PDF paths are known
  let homeHtml = null;
  const campusHomeHtml = {};

  await pool(list, 4, async (p) => {
    const oldPath = new URL(p.link).pathname;
    const map = mapPath(oldPath);
    let html;
    try {
      html = await curl(p.link);
    } catch (e) {
      report.failed.push(`${oldPath} (${e.message.split('\n')[0]})`);
      return;
    }
    report.pages++;
    if (oldPath === '/') homeHtml = html;
    if (!map) {
      report.unmapped.push(oldPath);
      return;
    }
    if (map.to !== oldPath) redirects.set(oldPath, map.to);
    if (map.container) return;
    if (map.campus && map.legacyOnly && !campusHomeHtml[map.campus]) campusHomeHtml[map.campus] = html;

    const $ = cheerio.load(html);
    const title = cheerio
      .load(p.title.rendered)
      .text()
      .replace(/^AmeriSchools\s+(Academy\s+)?(in\s+)?/i, '')
      .trim();
    const { md, images, disclosure } = extractContent($, map.campus);
    if (disclosure && map.campus) disclosures[map.campus] ??= disclosure;
    if (!md && !map.legacyOnly && !map.review) {
      const to = EMPTY_FALLBACK[map.sub ?? clean(oldPath)] ?? (map.campus ? `/campuses/${map.campus}/` : '/');
      redirects.set(oldPath, to);
      report.empty.push(`${oldPath} → ${to}`);
      return;
    }

    // Hand-built routes keep their design; their old copy is saved under _legacy/ for reference.
    const routed = !map.legacyOnly && !map.review && !/^https?:/.test(map.to);
    const id = routed ? clean(map.to) : `_legacy/${clean(oldPath) || 'home'}`;
    const file = path.join(OUT_PAGES, `${id}.md`);
    const fm = {
      title,
      legacyUrl: p.link,
      ...(map.campus ? { campus: map.campus } : {}),
      section: map.campus ? 'campus' : 'district',
      modified: p.modified.slice(0, 10),
      ...(map.review ? { review: map.review } : {}),
      ...(images.length ? { images } : {}),
    };
    const yaml = Object.entries(fm)
      .map(([k, v]) => (Array.isArray(v) ? `${k}:\n${v.map((x) => `  - ${JSON.stringify(x)}`).join('\n')}` : `${k}: ${JSON.stringify(v)}`))
      .join('\n');
    pending.push({ file, content: `---\n${yaml}\n---\n\n${md}\n` });
    report.written++;
    if (!routed) (map.review ? report.review : report.legacyOnly).push(`${oldPath} → ${map.to}${map.review ? `  (${map.review})` : ''}`);
    pageIndex.push({ legacy: oldPath, to: map.to, file: path.relative(ROOT, file).replaceAll('\\', '/'), routed });
  });

  // Menus: primary from the header; campus menus from the four mega-menus, with blanks filled from each campus's own hero menu.
  const $h = cheerio.load(homeHtml);
  const primary = mapMenu(readMenu($h, $h('header .bottom-nav-wrap').first()));
  const megaOrder = ['phoenix', 'tucson', 'yuma-north', 'yuma-middle'];
  const campusMenus = {};
  $h('div.mega-menu').each((i, el) => {
    const campus = megaOrder[i];
    if (!campus) return;
    const groups = readMegaMenu($h, el);
    const $c = campusHomeHtml[campus] ? cheerio.load(campusHomeHtml[campus]) : null;
    const hero = $c ? readMenu($c, $c('section.campus-hero .content-container').first()) : [];
    const heroFlat = hero.flatMap((x) => [x, ...(x.children ?? [])]);
    for (const g of groups)
      for (const item of g.children)
        if (!item.href || item.href === '#') {
          const alt = heroFlat.find((h) => h.label.toLowerCase() === item.label.toLowerCase() && h.href);
          if (alt) item.href = alt.href;
        }
    const extra = heroFlat.filter((h) => /school performance/i.test(h.label));
    campusMenus[campus] = [...mapMenu(groups, campus), ...mapMenu(extra, campus)];
  });

  // Campus-level mismatch check: each campus menu should only point at its own campus pages.
  const mismatches = [];
  for (const [campus, groups] of Object.entries(campusMenus))
    for (const g of groups)
      for (const item of g.children ?? [])
        if (item.href?.startsWith('/campuses/') && !item.href.startsWith(`/campuses/${campus}/`))
          mismatches.push(`${campus}: "${item.label}" → ${item.href}`);

  // Final PDF paths are known now; write the page files with real links.
  assignDocPaths();
  for (const { file, content } of pending) {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, resolveDocs(content));
  }

  // Download PDFs.
  console.log(`Downloading ${docs.size} PDFs…`);
  await rm(OUT_DOCS, { recursive: true, force: true });
  await mkdir(OUT_DOCS, { recursive: true });
  let bytes = 0;
  await pool([...docs.values()], 4, async (d) => {
    const dest = path.join(ROOT, 'public', d.path);
    await mkdir(path.dirname(dest), { recursive: true });
    try {
      await stat(dest);
    } catch {
      try {
        await curl(d.legacyUrl, ['-o', dest]);
      } catch (e) {
        d.error = e.message.split('\n')[0];
        return;
      }
    }
    const buf = await readFile(dest);
    d.bytes = buf.length;
    d.sha256 = createHash('sha256').update(buf).digest('hex');
    bytes += buf.length;
    redirects.set(new URL(d.legacyUrl).pathname, d.path);
  });

  for (const [from, to] of Object.entries(EXTRA_REDIRECTS)) redirects.set(from, to);
  for (const k of Object.keys(DISTRICT)) {
    const from = `/${k}${k ? '/' : ''}`;
    const to = DISTRICT[k].to;
    if (from !== to && k) redirects.set(from, to);
  }

  const sorted = (o) => Object.fromEntries(Object.entries(o).sort());
  await writeFile(
    path.join(OUT_DATA, 'menus.json'),
    resolveDocs(JSON.stringify({ primary, campuses: campusMenus }, null, 2)) + '\n',
  );
  const docList = [...docs.values()]
    .map(({ title, path: p, legacyUrl, campus, category, bytes: b, sha256, error }) => ({ title, path: p, legacyUrl, campus, category, bytes: b, sha256, ...(error ? { error } : {}) }))
    .sort((a, b) => a.path.localeCompare(b.path));
  await writeFile(path.join(OUT_DATA, 'documents.json'), JSON.stringify(docList, null, 2) + '\n');
  await writeFile(path.join(OUT_DATA, 'disclosures.json'), resolveDocs(JSON.stringify(sorted(disclosures), null, 2)) + '\n');
  await writeFile(
    path.join(OUT_DATA, 'pages.json'),
    JSON.stringify(pageIndex.sort((a, b) => a.legacy.localeCompare(b.legacy)), null, 2) + '\n',
  );
  const redirectLines = [...redirects.entries()]
    .filter(([from, to]) => from !== to)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([from, to]) => `${from} ${to} 301`);
  await writeFile(
    path.join(ROOT, 'public/_redirects'),
    `# Generated by scripts/migrate-legacy.mjs — old amerischools.org URLs → new site\n${redirectLines.join('\n')}\n`,
  );

  // Report
  const failedDocs = [...docs.values()].filter((d) => d.error);
  console.log('\n===== Migration report =====');
  console.log(`Pages crawled: ${report.pages}/${list.length}   Markdown files written: ${report.written}`);
  console.log(`PDFs: ${docs.size - failedDocs.length} downloaded (${(bytes / 1e6).toFixed(1)} MB), ${failedDocs.length} failed`);
  failedDocs.forEach((d) => console.log(`  ! ${d.legacyUrl}  ${d.error}`));
  console.log(`Redirects written: ${redirectLines.length}`);
  console.log(`Teacher-salary disclosures found: ${Object.keys(disclosures).join(', ') || 'none'}`);
  console.log(`Campus menu mismatches: ${mismatches.length ? '' : 'none'}`);
  mismatches.forEach((m) => console.log(`  ! ${m}`));
  console.log(`Saved for reference only (hand-built pages): ${report.legacyOnly.length}`);
  report.legacyOnly.forEach((x) => console.log(`  - ${x}`));
  console.log(`Empty on the old site (redirected, not published): ${report.empty.length}`);
  report.empty.forEach((x) => console.log(`  - ${x}`));
  console.log(`Flagged for client review: ${report.review.length}`);
  report.review.forEach((x) => console.log(`  ? ${x}`));
  if (report.unmapped.length) console.log(`Unmapped: ${report.unmapped.join(', ')}`);
  if (report.failed.length) console.log(`FAILED: ${report.failed.join(', ')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
