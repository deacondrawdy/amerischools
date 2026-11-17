// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://amerischools.org',
  trailingSlash: 'always',
  // The dev toolbar only exists on the local dev server (never in builds); hidden so
  // client reviews of localhost look like the real site.
  devToolbar: { enabled: false },
  // The Phoenix campus is no longer offered; send its old pages to the campus overview.
  redirects: Object.fromEntries(
    ['', 'tours/', 'staff/', 'contact/', 'curriculum/', 'calendar/', 'clubs-and-sports/', 'before-and-after-school/'].map(
      (p) => [`/campuses/phoenix/${p}`, '/campuses/'],
    ),
  ),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
