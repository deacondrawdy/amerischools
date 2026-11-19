// The sitemap, built when requested so pages Marketing adds at /staff are listed right away.
// Hand-built routes are listed here; Markdown and staff-created pages come from sitePages().
import type { APIRoute } from 'astro';
import { campuses } from '../data/site';
import { contact } from '../data/contact';
import { curriculum } from '../data/curriculum';
import { sitePages } from '../lib/pages';

const fixed = ['/', '/about/', '/accessibility/', '/admissions/interest-form/', '/campuses/', '/careers/', '/current-families/', '/visit/'];

export const GET: APIRoute = async ({ site }) => {
  const paths = new Set(fixed);
  for (const c of campuses) {
    paths.add(`/campuses/${c.slug}/`);
    if (contact[c.slug]) paths.add(`/campuses/${c.slug}/contact/`);
    if (curriculum[c.slug]) paths.add(`/campuses/${c.slug}/curriculum/`);
  }
  for (const p of await sitePages()) paths.add(`/${p.id}/`);
  const urls = [...paths].sort().map((p) => `<url><loc>${new URL(p, site)}</loc></url>`);
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } },
  );
};
