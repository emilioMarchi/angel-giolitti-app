import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import type { Metadata } from 'next';
import { getR2Url } from '@/lib/utils';

export const siteUrl = 'https://angelgiolitti.com.ar';
export const defaultOgImage = `${siteUrl}/images/gallery/handangel/photo-7.webp`;
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
          width: 1200,
          height: 630,
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
      .select('title, description, cover_url, type, release_year')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) {
      return { found: false, title: 'Álbum no encontrado', description: '', image: null };
    }

    const typeLabel =
      data.type === 'album' ? 'Álbum' : data.type === 'ep' ? 'EP' : 'Single';

    return {
      found: true,
      title: `${data.title.trim()} (${typeLabel}${data.release_year ? ` ${data.release_year}` : ''})`,
      description:
        data.description ||
        `Escuchá "${data.title}" de Ángel Giolitti completa en la plataforma oficial.`,
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
      .select('title, summary, cover_image_url, profile_image_url')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) {
      return { found: false, title: 'Proyecto no encontrado', description: '', image: null };
    }

    return {
      found: true,
      title: data.title,
      description:
        data.summary ||
        `Conocé "${data.title}", el proyecto de Ángel Giolitti: música, galerías y más.`,
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
      .select('title, slug, description, event_date, location_name, address_city, flyer_image_url, status')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) {
      return { found: false, title: 'Evento no encontrado', description: '', image: null };
    }

    const isPast = data.status === 'completed';
    const dateLabel = formatDate(data.event_date);
    const place = [data.location_name, data.address_city].filter(Boolean).join(', ');

    return {
      found: true,
      title: `${data.title.trim()}${place ? ` — ${place}` : ''}`,
      description:
        data.description ||
        `${isPast ? 'Fue' : 'Viví'} ${data.title} el ${dateLabel}${place ? ` en ${place}` : ''}. ${
          isPast ? 'Reviví el show en la plataforma oficial.' : 'Entradas e info en la plataforma oficial.'
        }`,
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
