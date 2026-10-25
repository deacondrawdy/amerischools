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
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
