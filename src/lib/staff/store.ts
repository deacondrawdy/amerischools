/**
 * Content that Marketing edits at /staff, stored on a Railway volume (same approach as Capstone
 * Quest: no database, a volume costs cents a month).
 *
 * The container's own disk is rebuilt on every deploy, so production refuses edits unless
 * STAFF_FILES_DIR points at the mounted volume (e.g. /data/staff). Locally it defaults to
 * .data/staff.
 *
 * Layout:
 *   <dir>/content.json                      text edits, page edits, photo + document records
 *   <dir>/photos/<photo key>/<width>.webp   replacement photos, one file per width
 *   <dir>/documents/<id>.pdf                replacement PDFs (id = hash of the public path)
 *
 * Everything is read once into memory and kept there: this server process is the only writer,
 * and every write updates memory first, then the file (written beside it, then renamed).
 * Pages read it synchronously after src/middleware.ts has awaited loadStore().
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { campuses, site } from '../../data/site';
import { photos, type PhotoKey } from '../../data/photos';

export interface StoredFile {
  filename: string;
  size: number;
  updatedAt: string;
  /** PDF page count, when it could be read. */
  pages?: number;
}
export interface StoredPhoto extends StoredFile {
  width: number;
  height: number;
  widths: number[];
}
export interface StoredPage {
  title: string;
  markdown: string;
  description?: string;
  updatedAt: string;
  /** A page Marketing created (not one of the site's own pages). */
  custom?: boolean;
}
export interface Announcement {
  enabled: boolean;
  text: string;
  linkLabel: string;
  linkUrl: string;
  updatedAt?: string;
}
export const campusTextFields = ['headline1', 'headline2', 'intro', 'phone', 'street', 'cityStateZip'] as const;
export type CampusTextField = (typeof campusTextFields)[number];

export interface Store {
  announcement: Announcement;
  sitePhone?: string;
  campuses: Record<string, Partial<Record<CampusTextField, string>>>;
  photoAlt: Partial<Record<PhotoKey, string>>;
  photos: Partial<Record<PhotoKey, StoredPhoto>>;
  documents: Record<string, StoredFile>;
  pages: Record<string, StoredPage>;
}

const emptyStore = (): Store => ({
  announcement: { enabled: false, text: '', linkLabel: '', linkUrl: '' },
  campuses: {},
  photoAlt: {},
  photos: {},
  documents: {},
  pages: {},
});

const configuredDir = process.env.STAFF_FILES_DIR?.trim();
export const baseDir = configuredDir || join(process.cwd(), '.data', 'staff');
const contentFile = join(baseDir, 'content.json');

/** Edits are only safe where they survive a deploy. */
export function storageProblem(): string | null {
  if (configuredDir || !import.meta.env.PROD) return null;
  return 'Saving is turned off because file storage is not set up yet. Your web developer needs to attach a Railway volume and set STAFF_FILES_DIR.';
}

let store: Store = emptyStore();
let loading: Promise<void> | null = null;

/** Load content.json into memory once per process. Safe to await on every request. */
export function loadStore(): Promise<void> {
  loading ??= readFile(contentFile, 'utf8')
    .then((text: string) => {
      store = { ...emptyStore(), ...(JSON.parse(text) as Partial<Store>) };
    })
    .catch(() => undefined)
    .then(applyToSiteData);
  return loading!;
}

export function getStore(): Readonly<Store> {
  return store;
}

// Writes run one at a time so two quick saves can't interleave.
let queue: Promise<unknown> = Promise.resolve();
export class SaveError extends Error {}

export function update(change: (s: Store) => void | Promise<void>): Promise<void> {
  const run = queue.then(async () => {
    const problem = storageProblem();
    if (problem) throw new SaveError(problem);
    const next: Store = structuredClone(store);
    await change(next);
    await mkdir(baseDir, { recursive: true });
    const tmp = `${contentFile}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify(next, null, 2));
    await rename(tmp, contentFile);
    store = next;
    applyToSiteData();
  });
  queue = run.catch(() => undefined);
  return run;
}

// ---- Campus and site text -------------------------------------------------------------------

// The site's own values, kept so a cleared field falls back to them.
const originals = campuses.map((c) => ({
  slug: c.slug,
  headline1: c.headline[0],
  headline2: c.headline[1],
  intro: c.intro,
  phone: c.phone,
  street: c.street,
  cityStateZip: c.cityStateZip,
}));
const originalSitePhone = site.phone;

export function originalCampusText(slug: string) {
  return originals.find((o) => o.slug === slug);
}
export function originalSitePhoneText() {
  return originalSitePhone;
}

/** Write the stored text over the shared campus/site objects every page already imports. */
function applyToSiteData() {
  for (const c of campuses) {
    const o = originalCampusText(c.slug)!;
    const e = store.campuses[c.slug] ?? {};
    const pick = (k: CampusTextField) => e[k]?.trim() || o[k];
    c.headline = [pick('headline1'), pick('headline2')];
    c.intro = pick('intro');
    c.phone = pick('phone');
    c.street = pick('street');
    c.cityStateZip = pick('cityStateZip');
  }
  site.phone = store.sitePhone?.trim() || originalSitePhone;
}

// ---- Photos ---------------------------------------------------------------------------------

export const PHOTO_WIDTHS = [480, 800, 1200, 1600, 2000];
const MAX_UPLOAD = 25 * 1024 * 1024;

export function photoAlt(key: PhotoKey): string {
  return store.photoAlt[key]?.trim() || photos[key].alt;
}

export function photoOverride(key: PhotoKey): StoredPhoto | undefined {
  return store.photos[key];
}

export function photoDir(key: string) {
  return join(baseDir, 'photos', key);
}

export async function savePhoto(key: PhotoKey, filename: string, bytes: Buffer): Promise<void> {
  if (storageProblem()) throw new SaveError(storageProblem()!);
  if (bytes.length > MAX_UPLOAD) throw new SaveError('That photo is over 25 MB. Please choose a smaller one.');
  const sharp = (await import('sharp')).default;
  let meta;
  try {
    meta = await sharp(bytes).metadata();
  } catch {
    throw new SaveError('That file is not a photo we can read. Please upload a JPG, PNG or WebP.');
  }
  if (!meta.format || !['jpeg', 'png', 'webp'].includes(meta.format)) {
    throw new SaveError('Please upload a JPG, PNG or WebP photo. (iPhone HEIC photos need to be exported as JPG first.)');
  }
  // rotate() applies the phone's EXIF orientation first.
  const rotated = await sharp(bytes).rotate().toBuffer({ resolveWithObject: true });
  const { width, height } = rotated.info;
  const widths = PHOTO_WIDTHS.filter((w) => w < width).concat(Math.min(width, 2400));
  const outputs = new Map<string, Buffer>();
  for (const w of widths) {
    outputs.set(`${w}.webp`, await sharp(rotated.data).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer());
  }
  const dir = photoDir(key);
  const staging = `${dir}.uploading-${Date.now()}`;
  const retired = `${dir}.old-${Date.now()}`;
  await mkdir(staging, { recursive: true });
  for (const [name, data] of outputs) await writeFile(join(staging, name), data);
  await rename(dir, retired).catch(() => undefined);
  await rename(staging, dir);
  await rm(retired, { recursive: true, force: true });
  await update((s) => {
    s.photos[key] = {
      filename: filename.slice(0, 200),
      size: bytes.length,
      updatedAt: new Date().toISOString(),
      width: Math.min(width, 2400),
      height: Math.round((height * Math.min(width, 2400)) / width),
      widths,
    };
  });
}

export async function revertPhoto(key: PhotoKey): Promise<void> {
  await update((s) => {
    delete s.photos[key];
  });
  await rm(photoDir(key), { recursive: true, force: true });
}

// ---- Documents (PDFs) -----------------------------------------------------------------------

export function documentFile(publicPath: string) {
  const id = createHash('sha256').update(publicPath).digest('hex').slice(0, 24);
  return join(baseDir, 'documents', `${id}.pdf`);
}

export async function saveDocument(publicPath: string, filename: string, bytes: Buffer): Promise<void> {
  if (storageProblem()) throw new SaveError(storageProblem()!);
  if (bytes.length > MAX_UPLOAD) throw new SaveError('That PDF is over 25 MB. Please save a smaller copy and try again.');
  if (bytes.subarray(0, 5).toString('latin1') !== '%PDF-') throw new SaveError('That file is not a PDF. Please choose a .pdf file.');
  const file = documentFile(publicPath);
  await mkdir(join(baseDir, 'documents'), { recursive: true });
  await writeFile(`${file}.tmp`, bytes);
  await rename(`${file}.tmp`, file);
  await update((s) => {
    s.documents[publicPath] = { filename: filename.slice(0, 200), size: bytes.length, pages: countPdfPages(bytes), updatedAt: new Date().toISOString() };
  });
}

export async function revertDocument(publicPath: string): Promise<void> {
  await update((s) => {
    delete s.documents[publicPath];
  });
  await rm(documentFile(publicPath), { force: true });
}

/** Page count from the PDF's uncompressed page tree; undefined rather than a guess. */
function countPdfPages(bytes: Buffer): number | undefined {
  const text = bytes.toString('latin1');
  let best = 0;
  for (const m of text.matchAll(/\/Type\s*\/Pages\b[^>]*?\/Count\s+(\d+)|\/Count\s+(\d+)[^>]*?\/Type\s*\/Pages\b/g)) {
    best = Math.max(best, Number(m[1] ?? m[2]));
  }
  return best > 0 ? best : undefined;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
