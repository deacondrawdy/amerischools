// Production image endpoint: Astro's own Node endpoint, with each resized image cached on
// disk. Without it every visitor's photo request would be resized again by sharp.
// The cache lives in the OS temp folder: it is rebuilt after a deploy, which is fine.
import type { APIRoute } from 'astro';
import { GET as resize } from 'astro/assets/endpoint/node';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = join(tmpdir(), 'amerischools-image-cache');
const ready = mkdir(dir, { recursive: true }).catch(() => undefined);

export const GET: APIRoute = async (ctx) => {
  const key = createHash('sha256').update(ctx.url.search).digest('hex');
  const file = join(dir, key);
  await ready;
  try {
    const [body, type] = await Promise.all([readFile(file), readFile(`${file}.type`, 'utf8')]);
    return new Response(body, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch {
    // Not cached yet.
  }
  const res = await resize(ctx);
  if (res.status !== 200) return res;
  const body = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get('Content-Type') ?? 'image/webp';
  await Promise.all([writeFile(file, body), writeFile(`${file}.type`, type)]).catch(() => undefined);
  return new Response(body, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable' } });
};
