// Serves replacement photos uploaded at /staff: /files/photos/<photo key>/<width>.webp.
// URLs carry ?v=<upload time>, so they can be cached for a year.
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { photos } from '../../../../data/photos';
import { photoDir } from '../../../../lib/staff/store';

export const GET: APIRoute = async ({ params }) => {
  const { key = '', file = '' } = params;
  if (!(key in photos) || !/^\d{2,4}\.webp$/.test(file)) return new Response('Not found', { status: 404 });
  try {
    const body = await readFile(join(photoDir(key), file));
    return new Response(body, { headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
