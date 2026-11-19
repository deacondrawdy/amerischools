// The Markdown pages under src/content/pages, plus pages Marketing created at /staff,
// as one list: what [...slug].astro serves, what /staff edits and what the sitemap lists.
import { getCollection, type CollectionEntry } from 'astro:content';
import { getStore } from './staff/store';

// Pages rebuilt by hand under src/pages take over their migrated Markdown. The Phoenix campus
// closed (its old pages redirect, see astro.config.mjs). Campus curriculum and contact pages are
// hand-built too (src/pages/campuses/[slug]/).
const handBuilt = new Set(['careers', 'about', 'admissions/interest-form']);
const routable = (p: CollectionEntry<'pages'>) =>
  !handBuilt.has(p.id) && p.data.campus !== 'phoenix' && !/\/(curriculum|contact)$/.test(p.id);

export interface EditablePage {
  id: string;
  title: string;
  campus?: string;
  section: string;
  entry?: CollectionEntry<'pages'>;
  edited: boolean;
  custom: boolean;
}

export async function sitePages(): Promise<EditablePage[]> {
  const { pages } = getStore();
  const entries = (await getCollection('pages')).filter(routable);
  const list: EditablePage[] = entries.map((entry) => ({
    id: entry.id,
    title: pages[entry.id]?.title || entry.data.title,
    campus: entry.data.campus,
    section: entry.data.section,
    entry,
    edited: Boolean(pages[entry.id]),
    custom: false,
  }));
  for (const [id, p] of Object.entries(pages)) {
    if (p.custom) list.push({ id, title: p.title, section: 'district', edited: true, custom: true });
  }
  return list.sort((a, b) => a.id.localeCompare(b.id));
}

export async function findPage(id: string): Promise<EditablePage | undefined> {
  return (await sitePages()).find((p) => p.id === id);
}

/** URL-safe page address for a new page ("Summer Camp 2027" → "summer-camp-2027"). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s/-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-/]+|[-/]+$/g, '');
}
