// Serves /documents/<path>.pdf: the replacement Marketing uploaded at /staff, or else the
// original in files/documents/. Links never change when a PDF is replaced, so menus,
// calendars and packets linked from emails and search results always get the latest file.
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { join, normalize, sep } from 'node:path';
import { documentFile, getStore } from '../../lib/staff/store';

const root = join(process.cwd(), 'files', 'documents');

export const GET: APIRoute = async ({ params }) => {
  const rel = normalize(params.path ?? '');
  if (!rel.toLowerCase().endsWith('.pdf') || rel.startsWith('..') || rel.includes(`..${sep}`)) {
    return new Response('Not found', { status: 404 });
  }
  const publicPath = `/documents/${rel.split(sep).join('/')}`;
  const replaced = getStore().documents[publicPath];
  try {
    const body = await readFile(replaced ? documentFile(publicPath) : join(root, rel));
    return new Response(body, {
      headers: {
        'Content-Type': 'application/pdf',
        // Short cache: a replaced file shows up within minutes everywhere.
        'Cache-Control': 'public, max-age=300',
        ...(replaced ? { 'Last-Modified': new Date(replaced.updatedAt).toUTCString() } : {}),
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
