import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Pages migrated from the old WordPress site by scripts/migrate-legacy.mjs.
// `_legacy/` holds old copy kept for reference only (not routed).
const pages = defineCollection({
  loader: glob({
    base: './src/content/pages',
    pattern: ['**/*.md', '!_legacy/**'],
    // The id is the URL path ("campuses/tucson/calendar"). Set explicitly: the default
    // keeps the ".md" extension in dev when the pattern is an array.
    generateId: ({ entry }) => entry.replaceAll('\\', '/').replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    legacyUrl: z.string().url(),
    campus: z.enum(['phoenix', 'tucson', 'yuma-north', 'yuma-middle']).optional(),
    section: z.enum(['campus', 'district']),
    modified: z.string(),
    review: z.string().optional(),
    images: z.array(z.string()).optional(),
  }),
});

export const collections = { pages };
