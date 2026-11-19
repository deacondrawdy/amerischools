// Every /staff form posts here: /staff/api/<action>/. Plain HTML forms (no app framework), each
// answered with a redirect back to the page it came from plus a message (?ok= or ?err=).
import type { APIRoute } from 'astro';
import { photos, type PhotoKey } from '../../../data/photos';
import { campuses } from '../../../data/site';
import { legacyDocuments } from '../../../data/legacy';
import { findPage, slugify } from '../../../lib/pages';
import { clientIp, isStaff, logout, tryLogin } from '../../../lib/staff/session';
import {
  campusTextFields,
  revertDocument,
  revertPhoto,
  saveDocument,
  savePhoto,
  SaveError,
  update,
} from '../../../lib/staff/store';

const str = (form: FormData, key: string, max = 500) => String(form.get(key) ?? '').trim().slice(0, max);

export const POST: APIRoute = async ({ params, request, cookies, redirect, clientAddress }) => {
  const form = await request.formData().catch(() => new FormData());
  const back = (() => {
    const b = str(form, 'back', 300);
    return b.startsWith('/staff/') ? b : '/staff/';
  })();
  const go = (kind: 'ok' | 'err', message: string, to = back) => {
    const [path, hash = ''] = to.split('#');
    return redirect(`${path}?${kind}=${encodeURIComponent(message)}${hash ? `#${hash}` : ''}`, 303);
  };

  if (params.action === 'login') {
    const result = tryLogin(str(form, 'password', 200), clientIp(request, clientAddress), cookies);
    if (result === 'ok') return redirect('/staff/', 303);
    return go(
      'err',
      result === 'locked'
        ? 'Too many tries. Please wait 15 minutes and try again.'
        : result === 'unconfigured'
          ? 'The editor password has not been set up yet. Ask your web developer to set STAFF_PASSWORD.'
          : 'That password is not right. Please try again.',
      '/staff/',
    );
  }
  if (params.action === 'logout') {
    logout(cookies);
    return go('ok', 'You are signed out.', '/staff/');
  }
  if (!isStaff(cookies)) return go('err', 'Please sign in again.', '/staff/');

  try {
    switch (params.action) {
      case 'announcement': {
        await update((s) => {
          s.announcement = {
            enabled: form.get('enabled') === 'on',
            text: str(form, 'text', 300),
            linkLabel: str(form, 'linkLabel', 60),
            linkUrl: str(form, 'linkUrl', 300),
            updatedAt: new Date().toISOString(),
          };
        });
        return go('ok', 'Announcement saved. It is live on the website now.');
      }

      case 'campus': {
        const slug = str(form, 'slug', 60);
        if (!campuses.some((c) => c.slug === slug)) return go('err', 'Unknown campus.');
        await update((s) => {
          s.campuses[slug] = Object.fromEntries(campusTextFields.map((f) => [f, str(form, f, 400)]).filter(([, v]) => v));
        });
        return go('ok', 'Campus details saved. They are live on the website now.');
      }

      case 'site-phone': {
        await update((s) => {
          s.sitePhone = str(form, 'phone', 40) || undefined;
        });
        return go('ok', 'District phone number saved.');
      }

      case 'page-save': {
        const id = str(form, 'id', 200);
        const page = await findPage(id);
        if (!page) return go('err', 'That page no longer exists.');
        const title = str(form, 'title', 150);
        const markdown = String(form.get('markdown') ?? '').slice(0, 200_000);
        if (!title) return go('err', 'Please give the page a title.');
        await update((s) => {
          s.pages[id] = {
            title,
            markdown,
            description: str(form, 'description', 300) || undefined,
            updatedAt: new Date().toISOString(),
            ...(page.custom ? { custom: true } : {}),
          };
        });
        return go('ok', 'Page saved. It is live on the website now.');
      }

      case 'page-revert': {
        const id = str(form, 'id', 200);
        await update((s) => {
          if (!s.pages[id]?.custom) delete s.pages[id];
        });
        return go('ok', 'The page is back to its original text.');
      }

      case 'page-create': {
        const title = str(form, 'title', 150);
        const id = slugify(str(form, 'slug', 150) || title);
        if (!title || !id) return go('err', 'Please give the new page a title.');
        if (await findPage(id)) return go('err', `There is already a page at /${id}/. Please choose another address.`);
        const reserved = ['staff', 'campuses', 'documents', 'files', 'admissions', 'about', 'careers', 'visit', 'accessibility', 'current-families', '_image', '404'];
        if (reserved.includes(id.split('/')[0])) return go('err', `/${id}/ is used by the website already. Please choose another address.`);
        await update((s) => {
          s.pages[id] = { title, markdown: `## ${title}\n\nWrite the page here.`, updatedAt: new Date().toISOString(), custom: true };
        });
        return go('ok', `Page created at /${id}/. Add its text below, then save.`, `/staff/pages/${id}/`);
      }

      case 'page-delete': {
        const id = str(form, 'id', 200);
        await update((s) => {
          if (s.pages[id]?.custom) delete s.pages[id];
        });
        return go('ok', 'Page deleted.', '/staff/#pages');
      }

      case 'photo-upload': {
        const key = str(form, 'key', 60) as PhotoKey;
        const file = form.get('file');
        if (!(key in photos)) return go('err', 'Unknown photo.');
        if (!(file instanceof File) || file.size === 0) return go('err', 'Please choose a photo to upload.');
        await savePhoto(key, file.name, Buffer.from(await file.arrayBuffer()));
        const alt = str(form, 'alt', 250);
        if (alt) await update((s) => void (s.photoAlt[key] = alt));
        return go('ok', 'Photo replaced. It is live on the website now. Please check its description too.');
      }

      case 'photo-alt': {
        const key = str(form, 'key', 60) as PhotoKey;
        if (!(key in photos)) return go('err', 'Unknown photo.');
        const alt = str(form, 'alt', 250);
        await update((s) => {
          if (alt) s.photoAlt[key] = alt;
          else delete s.photoAlt[key];
        });
        return go('ok', 'Photo description saved.');
      }

      case 'photo-revert': {
        const key = str(form, 'key', 60) as PhotoKey;
        if (!(key in photos)) return go('err', 'Unknown photo.');
        await revertPhoto(key);
        return go('ok', 'The original photo is back.');
      }

      case 'document-upload': {
        const path = str(form, 'path', 300);
        const file = form.get('file');
        if (!legacyDocuments.some((d) => d.path === path)) return go('err', 'Unknown document.');
        if (!(file instanceof File) || file.size === 0) return go('err', 'Please choose a PDF to upload.');
        await saveDocument(path, file.name, Buffer.from(await file.arrayBuffer()));
        return go('ok', 'PDF replaced. Every link to it now opens the new file.');
      }

      case 'document-revert': {
        const path = str(form, 'path', 300);
        await revertDocument(path);
        return go('ok', 'The original PDF is back.');
      }
    }
    return go('err', 'Unknown action.');
  } catch (e) {
    if (e instanceof SaveError) return go('err', e.message);
    console.error('[staff]', params.action, e);
    return go('err', 'Something went wrong while saving. Please try again, or contact your web developer.');
  }
};
