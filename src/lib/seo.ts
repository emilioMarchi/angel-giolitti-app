import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import type { Metadata } from 'next';
import { getR2Url } from '@/lib/utils';

const normalizeUrl = (raw: string | undefined): string | null => {
  if (!raw) return null;
  return raw.startsWith('http') ? raw : `https://${raw}`;
};

const deployedUrl =
  normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
  normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  normalizeUrl(process.env.VERCEL_URL);

export const siteUrl = deployedUrl || 'https://angelgiolitti.com.ar';
export const defaultOgImage = getR2Url('images/gallery/handangel/photo-2.webp');
export const siteName = 'Ángel Giolitti | Plataforma Oficial';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder';

const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: 'website' | 'article' | 'music.album';
}

export function getPageMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
}: PageMetaInput): Metadata {
  const url = `${siteUrl}${path}`;
  const imageUrl = image && image.startsWith('http') ? image : image ? getR2Url(image) : defaultOgImage;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: 'es_AR',
      type,
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export interface EntityMeta {
  found: boolean;
  title: string;
  description: string;
  image: string | null;
}

export const getAlbumMeta = cache(async (slug: string): Promise<EntityMeta> => {
  try {
    const { data } = await supabaseServer
      .from('albums')
      .select('title, description, cover_url, type, release_year, members, project:projects(title), tracks(count)')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) {
      return { found: false, title: 'Álbum no encontrado', description: '', image: null };
    }

    const typeLabel =
      data.type === 'album' ? 'Álbum' : data.type === 'ep' ? 'EP' : data.type === 'single' ? 'Single' : 'Álbum';

    const trackCount = Array.isArray(data.tracks) && data.tracks[0]?.count != null ? data.tracks[0].count : 0;
    const members = (data.members as Array<{ name: string }> | null) || [];
    const project = (Array.isArray(data.project) ? data.project[0] : data.project) as { title: string } | null;

    const details = [
      typeLabel,
      data.release_year ? String(data.release_year) : null,
      trackCount > 0 ? `${trackCount} ${trackCount === 1 ? 'canción' : 'canciones'}` : null,
      project?.title ? `Proyecto ${project.title}` : null,
      members.length > 0
        ? `Integrantes: ${members.slice(0, 3).map((m) => m.name).join(', ')}${members.length > 3 ? ' y más' : ''}`
        : null,
    ].filter(Boolean) as string[];

    const base =
      data.description?.trim() ||
      `Escuchá "${data.title.trim()}" de Ángel Giolitti completo en la plataforma oficial.`;

    return {
      found: true,
      title: `${data.title.trim()} (${typeLabel}${data.release_year ? ` ${data.release_year}` : ''})`,
      description: `${base} — ${details.join(' · ')}.`,
      image: data.cover_url ? getR2Url(data.cover_url) : null,
    };
  } catch {
    return { found: false, title: 'Álbum no encontrado', description: '', image: null };
  }
});

export const getProjectMeta = cache(async (slug: string): Promise<EntityMeta> => {
  try {
    const { data } = await supabaseServer
      .from('projects')
      .select('title, summary, category, creation_year, end_year, members, cover_image_url, profile_image_url')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) {
      return { found: false, title: 'Proyecto no encontrado', description: '', image: null };
    }

    const members = (data.members as Array<{ name: string }> | null) || [];

    const details = [
      data.category ? data.category.charAt(0).toUpperCase() + data.category.slice(1) : null,
      data.creation_year
        ? `${data.creation_year}${data.end_year ? `–${data.end_year}` : ' – actualidad'}`
        : null,
      members.length > 0
        ? `Integrantes: ${members.slice(0, 3).map((m) => m.name).join(', ')}${members.length > 3 ? ' y más' : ''}`
        : null,
    ].filter(Boolean) as string[];

    const base =
      data.summary?.trim() ||
      `Conocé "${data.title.trim()}", el proyecto de Ángel Giolitti: música, galerías y más.`;

    return {
      found: true,
      title: data.title.trim(),
      description: details.length > 0 ? `${base} — ${details.join(' · ')}.` : base,
      image: data.profile_image_url
        ? getR2Url(data.profile_image_url)
        : data.cover_image_url
          ? getR2Url(data.cover_image_url)
          : null,
    };
  } catch {
    return { found: false, title: 'Proyecto no encontrado', description: '', image: null };
  }
});

const formatDate = (isoString: string): string =>
  new Date(isoString).toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const getEventMeta = cache(async (slug: string): Promise<EntityMeta> => {
  try {
    const { data } = await supabaseServer
      .from('events')
      .select('title, slug, description, event_date, location_name, address_city, flyer_image_url, ticket_price, status')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) {
      return { found: false, title: 'Evento no encontrado', description: '', image: null };
    }

    const isPast = data.status === 'completed';
    const dateLabel = formatDate(data.event_date);
    const shortDateLabel = new Date(data.event_date)
      .toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
      .replace(/\./g, '');
    const timeLabel = new Date(data.event_date).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const place = [data.location_name, data.address_city].filter(Boolean).join(', ');
    const price =
      data.ticket_price != null
        ? `Entradas: $ ${data.ticket_price.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`
        : null;

    const details = [
      `${dateLabel}, ${timeLabel} hs`,
      place || null,
      price,
      isPast ? 'Evento finalizado' : null,
    ]
      .filter(Boolean)
      .join(' · ');

    return {
      found: true,
      title: `${data.title.trim()}${shortDateLabel ? ` — ${shortDateLabel}, ${timeLabel} hs` : ''}`,
      description: data.description?.trim()
        ? `${data.description.trim()} — ${details}.`
        : `${isPast ? 'Reviví' : 'Viví'} "${data.title.trim()}" de Ángel Giolitti en vivo. ${details}.`,
      image: data.flyer_image_url ? getR2Url(data.flyer_image_url) : null,
    };
  } catch {
    return { found: false, title: 'Evento no encontrado', description: '', image: null };
  }
});

export const getMediaAlbumMeta = cache(async (slug: string): Promise<EntityMeta> => {
  try {
    const { data } = await supabaseServer
      .from('media_albums')
      .select('title, description, cover_image_url')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) {
      return { found: false, title: 'Galería no encontrada', description: '', image: null };
    }

    return {
      found: true,
      title: data.title,
      description:
        data.description ||
        `Mirá las fotos y videos de "${data.title}" en la galería de Ángel Giolitti.`,
      image: data.cover_image_url ? getR2Url(data.cover_image_url) : null,
    };
  } catch {
    return { found: false, title: 'Galería no encontrada', description: '', image: null };
  }
});
