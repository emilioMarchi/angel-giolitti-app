'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Image as ImageIcon,
  ArrowLeft,
  Play,
  Camera,
} from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getR2Url } from '@/lib/utils';

interface MediaAlbum {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  album_id: string | null;
  project_id: string | null;
  created_at: string;
}

interface MediaItem {
  id: string;
  media_album_id: string;
  type: 'photo' | 'video';
  url: string;
  caption: string;
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

const mockAlbums: MediaAlbum[] = [
  {
    id: 'ma-1',
    title: 'Concierto en Niceto',
    description: 'Fotos del live set presentando "Horizonte Infinito" en Niceto Club.',
    cover_image_url: '',
    album_id: null,
    project_id: null,
    created_at: '2026-06-20T10:00:00Z',
  },
  {
    id: 'ma-2',
    title: 'Sesión de Estudio',
    description: 'Behind the scenes de las grabaciones en Estudios Ámbar.',
    cover_image_url: '',
    album_id: null,
    project_id: null,
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'ma-3',
    title: 'Backstage Mutek',
    description: 'Instantáneas del backstage y la preparación para el show en Mutek.',
    cover_image_url: '',
    album_id: null,
    project_id: null,
    created_at: '2026-01-15T10:00:00Z',
  },
];

const mockItems: Record<string, MediaItem[]> = {
  'ma-1': [
    { id: 'mi-1', media_album_id: 'ma-1', type: 'photo', url: 'https://picsum.photos/seed/niceto1/800/600', caption: 'Llegada al venue', item_order: 1, created_at: '' },
    { id: 'mi-2', media_album_id: 'ma-1', type: 'photo', url: 'https://picsum.photos/seed/niceto2/800/1000', caption: 'Montaje de equipos', item_order: 2, created_at: '' },
    { id: 'mi-3', media_album_id: 'ma-1', type: 'photo', url: 'https://picsum.photos/seed/niceto3/1200/800', caption: 'Prueba de sonido', item_order: 3, created_at: '' },
    { id: 'mi-4', media_album_id: 'ma-1', type: 'photo', url: 'https://picsum.photos/seed/niceto4/600/800', caption: 'Audiencia', item_order: 4, created_at: '' },
    { id: 'mi-5', media_album_id: 'ma-1', type: 'photo', url: 'https://picsum.photos/seed/niceto5/800/800', caption: 'Momento del show', item_order: 5, created_at: '' },
    { id: 'mi-6', media_album_id: 'ma-1', type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', caption: 'Resumen del concierto', item_order: 6, created_at: '' },
  ],
  'ma-2': [
    { id: 'mi-7', media_album_id: 'ma-2', type: 'photo', url: 'https://picsum.photos/seed/estudio1/800/600', caption: 'Consola de mezclas', item_order: 1, created_at: '' },
    { id: 'mi-8', media_album_id: 'ma-2', type: 'photo', url: 'https://picsum.photos/seed/estudio2/1000/800', caption: 'Grabación de sintes', item_order: 2, created_at: '' },
    { id: 'mi-9', media_album_id: 'ma-2', type: 'photo', url: 'https://picsum.photos/seed/estudio3/600/800', caption: 'Equipo modular', item_order: 3, created_at: '' },
    { id: 'mi-10', media_album_id: 'ma-2', type: 'video', url: 'https://player.vimeo.com/video/100902001', caption: 'Clip del proceso creativo', item_order: 4, created_at: '' },
  ],
  'ma-3': [
    { id: 'mi-11', media_album_id: 'ma-3', type: 'photo', url: 'https://picsum.photos/seed/mutek1/800/1000', caption: 'Camarin', item_order: 1, created_at: '' },
    { id: 'mi-12', media_album_id: 'ma-3', type: 'photo', url: 'https://picsum.photos/seed/mutek2/1200/800', caption: 'Escenario', item_order: 2, created_at: '' },
    { id: 'mi-13', media_album_id: 'ma-3', type: 'photo', url: 'https://picsum.photos/seed/mutek3/800/600', caption: 'Saludo final', item_order: 3, created_at: '' },
  ],
};

function getEmbedUrl(url: string): string {
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  return url;
}

function PhotoGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-lg bg-white/5" />
      ))}
    </div>
  );
}

function getMediaThumbnail(item: MediaItem): string {
  if (item.type !== 'video') return item.url;
  try {
    const url = item.url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
      }
    }
  } catch (e) {
    console.error('Error parsing video URL for thumbnail:', e);
  }
  return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
}

export default function GaleriaPage() {
  const { isPlaying, setPlaying } = usePlayerStore();
  const [albums, setAlbums] = useState<MediaAlbum[]>(mockAlbums);
  const [selectedAlbum, setSelectedAlbum] = useState<MediaAlbum | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function fetchAlbums() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('media_albums')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const sanitized = data.map((a: any) => ({
            ...a,
            cover_image_url: getR2Url(a.cover_image_url)
          }));
          setAlbums(sanitized);
        }
      } catch (err) {
        console.error('Error fetching media albums, using mocks:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlbums();
  }, []);

  const openAlbum = async (album: MediaAlbum) => {
    setSelectedAlbum(album);
    setItems([]);

    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('media_album_id', album.id)
        .order('item_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const sanitized = data.map((item: any) => ({
          ...item,
          url: getR2Url(item.url)
        }));
        setItems(sanitized);
        return;
      }
    } catch (err) {
      console.error('Error fetching media items:', err);
    }

    const fallback = mockItems[album.id];
    if (fallback) setItems(fallback);
  };

  const slides: GallerySlide[] = useMemo(() => items.map((item) => {
    if (item.type === 'video') {
      return {
        src: item.url,
        alt: item.caption || 'Video',
        _type: 'youtube' as const,
        embedUrl: getEmbedUrl(item.url),
      };
    }
    return { src: item.url, alt: item.caption || 'Foto' };
  }), [items]);

  if (selectedAlbum) {
    return (
      <div className="music-detail-view px-6 py-6 animate-fade-in pb-24">
        <button
          onClick={() => {
            setSelectedAlbum(null);
            setItems([]);
          }}
          className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-white transition-colors font-semibold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a galería
        </button>

        {/* Cabecera del álbum */}
        <div className="flex flex-col md:flex-row gap-6 items-end mb-8">
          <div className="w-48 h-48 md:w-60 md:h-60 rounded-md bg-muted shadow-2xl flex-shrink-0 flex items-center justify-center relative overflow-hidden group">
            {selectedAlbum.cover_image_url ? (
              <img
                src={selectedAlbum.cover_image_url}
                alt={selectedAlbum.title}
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
              {selectedAlbum.title}
            </h1>
            {selectedAlbum.description && (
              <p className="text-sm text-muted-foreground max-w-xl mt-2">
                {selectedAlbum.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
              <span className="font-bold text-white">Ángel Giolitti</span>
              <span>•</span>
              <span>
                {items.length} {items.length === 1 ? 'archivo' : 'archivos'}
              </span>
            </div>
          </div>
        </div>

        {/* Grid de fotos/videos */}
        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((item, index) => (
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

        {/* Lightbox unificado (fotos + videos) */}
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

  return (
    <div className="gallery-tab-view px-6 py-6 pb-24">
      {/* Banner */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
          <ImageIcon className="h-9 w-9 text-primary animate-pulse" />
          Galería
        </h1>
        <p className="text-sm text-muted-foreground">
          Álbumes de fotos de conciertos, sesiones de estudio, backstage y más.
        </p>
      </div>

      {/* Grid de álbumes */}
      {loading ? (
        <PhotoGridSkeleton />
      ) : albums.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {albums.map((album) => (
            <div
              key={album.id}
              onClick={() => openAlbum(album)}
              className="album-card group cursor-pointer"
            >
              <div className="album-card-cover relative">
                {album.cover_image_url ? (
                  <img
                    src={album.cover_image_url}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="h-12 w-12 text-muted-foreground/30 transition-colors group-hover:text-primary/70" />
                )}
              </div>
              <h3 className="album-card-title mt-3">{album.title}</h3>
              {album.description && (
                <p className="album-card-subtitle mt-1">{album.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-lg border border-dashed border-white/10 text-center text-muted-foreground">
          <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium">Aún no hay álbumes de fotos</p>
          <p className="text-sm mt-1">
            Las galerías de imágenes aparecerán aquí cuando estén disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
