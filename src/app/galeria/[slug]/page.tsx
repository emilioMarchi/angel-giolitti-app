'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getR2Url } from '@/lib/utils';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import {
  Image as ImageIcon,
  ArrowLeft,
  Play,
  Camera,
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

interface MediaAlbumDB {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  album_id: string | null;
  project_id: string | null;
  created_at: string;
}

interface MediaItemDB {
  id: string;
  media_album_id: string;
  type: 'photo' | 'video';
  url: string;
  caption: string | null;
  item_order: number;
  created_at: string;
}

interface VideoSlide {
  src: string;
  alt?: string;
  _type: 'youtube';
  embedUrl: string;
}

type GallerySlide = { src: string; alt?: string } | VideoSlide;

interface MediaAlbumView {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  items: MediaItemView[];
}

interface MediaItemView {
  id: string;
  type: 'photo' | 'video';
  url: string;
  caption: string | null;
  item_order: number;
}

function getEmbedUrl(url: string): string {
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  return url;
}

function getMediaThumbnail(item: MediaItemView): string {
  if (item.type !== 'video') return item.url;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = item.url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
    }
  } catch (e) {
    console.error('Error parsing video URL for thumbnail:', e);
  }
  return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
}

export default function GalleryAlbumPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isPlaying, setPlaying } = usePlayerStore();
  const [album, setAlbum] = useState<MediaAlbumView | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function fetchAlbum() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('media_albums')
          .select('*')
          .eq('slug', slug)
          .single();

        if (!error && data) {
          const dbAlbum = data as MediaAlbumDB;

          const { data: itemsData } = await supabase
            .from('media_items')
            .select('*')
            .eq('media_album_id', dbAlbum.id)
            .order('item_order', { ascending: true });

          const items: MediaItemView[] = (itemsData || []).map((item: any) => ({
            ...item,
            url: getR2Url(item.url),
          }));

          setAlbum({
            id: dbAlbum.id,
            title: dbAlbum.title,
            slug: dbAlbum.slug,
            description: dbAlbum.description,
            cover_image_url: getR2Url(dbAlbum.cover_image_url),
            items,
          });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error fetching gallery album:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchAlbum();
  }, [slug]);

  const slides: GallerySlide[] = album?.items.map((item) => {
    if (item.type === 'video') {
      return {
        src: item.url,
        alt: item.caption || 'Video',
        _type: 'youtube' as const,
        embedUrl: getEmbedUrl(item.url),
      };
    }
    return { src: item.url, alt: item.caption || 'Foto' };
  }) || [];

  if (loading) {
    return (
      <div className="music-detail-view px-6 py-6 animate-pulse pb-24">
        <div className="h-6 w-32 bg-white/5 rounded mb-8" />
        <div className="flex gap-6 items-end mb-8">
          <div className="w-48 h-48 md:w-60 md:h-60 rounded-md bg-white/5" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-20 bg-white/5 rounded" />
            <div className="h-10 w-64 bg-white/5 rounded" />
            <div className="h-4 w-48 bg-white/5 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !album) {
    return (
      <div className="music-detail-view px-6 py-6 pb-24">
        <Link
          href="/galeria"
          className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-white transition-colors font-semibold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a galería
        </Link>
        <div className="text-center py-20 text-muted-foreground">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium">Álbum no encontrado</p>
          <p className="text-sm mt-1">El álbum que buscás no existe o fue removido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="music-detail-view px-6 py-6 animate-fade-in pb-24">
      <Link
        href="/galeria"
        className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-white transition-colors font-semibold text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a galería
      </Link>

      <div className="flex flex-col md:flex-row gap-6 items-end mb-8">
        <div className="w-48 h-48 md:w-60 md:h-60 rounded-md bg-muted shadow-2xl flex-shrink-0 flex items-center justify-center relative overflow-hidden group">
          {album.cover_image_url ? (
            <img
              src={album.cover_image_url}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="h-24 w-24 text-muted-foreground/30" />
          )}
        </div>

        <div className="flex-1">
          <span className="text-xs uppercase font-bold tracking-widest text-primary">
            Álbum de Fotos
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mt-2 mb-2 leading-tight">
            {album.title}
          </h1>
          {album.description && (
            <p className="text-sm text-muted-foreground max-w-xl mt-2">
              {album.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
            <span>
              {album.items.length} {album.items.length === 1 ? 'archivo' : 'archivos'}
            </span>
          </div>
        </div>
      </div>

      {album.items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {album.items.map((item, index) => (
            <div
              key={item.id}
              onClick={() => {
                setLightboxIndex(index);
                setLightboxOpen(true);
              }}
              className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
            >
              <img
                src={getMediaThumbnail(item)}
                alt={item.caption || 'Media'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.classList.add('bg-gradient-to-br', 'from-zinc-800', 'to-black');
                  }
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary/90 text-black flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                    <Play className="h-6 w-6 translate-x-[1px]" fill="currentColor" />
                  </div>
                </div>
              )}

              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white font-medium truncate">
                    {item.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium">Este álbum está vacío</p>
          <p className="text-sm mt-1">Las fotos se mostrarán aquí cuando estén disponibles.</p>
        </div>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' } }}
        render={{
          slide: ({ slide }) => {
            const s = slide as GallerySlide;
            if ('_type' in s && s._type === 'youtube') {
              return (
                <div className="flex h-full w-full items-center justify-center p-4 md:p-8">
                  <iframe
                    className="aspect-video w-full max-w-5xl rounded-lg shadow-2xl"
                    src={s.embedUrl}
                    title={s.alt || 'Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            }
            return undefined;
          },
        }}
        on={{
          view: ({ index: newIndex }) => {
            const slide = slides[newIndex];
            if (slide && '_type' in slide && slide._type === 'youtube') {
              if (isPlaying) setPlaying(false);
            }
          },
        }}
      />
    </div>
  );
}