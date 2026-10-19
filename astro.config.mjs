// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://amerischools.org',
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: {
    // Cast: @tailwindcss/vite's types target a newer Vite than Astro 5 bundles; runtime is compatible.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
