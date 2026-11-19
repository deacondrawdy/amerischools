// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

const building = process.argv.includes('build');

// https://astro.build/config
export default defineConfig({
  site: 'https://amerischools.org',
  // Page URLs always end in "/": src/middleware.ts 301s the slashless form (after checking the
  // old-site redirects, so an old URL typed without its slash still takes one hop). 'ignore'
  // here so file-like routes (/documents/x.pdf, /sitemap-0.xml) aren't forced to a slash.
  trailingSlash: 'ignore',
  // Pages render on the server (Node, on Railway) so edits made at /staff show immediately.
  // Old-site redirects, trailing slashes and "page not found" are handled in src/middleware.ts.
  // The sitemap is generated at request time by src/pages/sitemap-0.xml.ts.
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // Hosts the server trusts in the Host / X-Forwarded-* headers. Without this Astro treats every
  // request as coming from "localhost", and the /staff forms fail its same-site (CSRF) check.
  security: {
    checkOrigin: true,
    allowedDomains: [
      { hostname: 'amerischools.org' },
      { hostname: 'www.amerischools.org' },
      { hostname: '**.up.railway.app' },
      { hostname: 'localhost' },
      { hostname: '127.0.0.1' },
    ],
  },
  image: {
    // In production, resized photos are cached on disk so each size is only made once.
    ...(building ? { endpoint: { route: '/_image', entrypoint: './src/lib/image-endpoint.ts' } } : {}),
  },
  // The dev toolbar only exists on the local dev server (never in builds); hidden so
  // client reviews of localhost look like the real site.
  devToolbar: { enabled: false },
  // The Phoenix campus is no longer offered; send its old pages to the campus overview.
  redirects: Object.fromEntries(
    ['', 'tours/', 'staff/', 'contact/', 'curriculum/', 'calendar/', 'clubs-and-sports/', 'before-and-after-school/'].map(
      (p) => [`/campuses/phoenix/${p}`, { status: 301, destination: '/campuses/' }],
    ),
  ),
  vite: {
    plugins: [tailwindcss()],
  },
});
