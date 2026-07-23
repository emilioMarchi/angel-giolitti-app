'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Image as ImageIcon,
  Camera,
} from 'lucide-react';
import { getR2Url } from '@/lib/utils';

interface MediaAlbum {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  album_id: string | null;
  project_id: string | null;
  created_at: string;
}

const mockAlbums: MediaAlbum[] = [
  {
    id: 'ma-1',
    title: 'Concierto en Niceto',
    slug: 'concierto-niceto',
    description: 'Fotos del live set presentando "Horizonte Infinito" en Niceto Club.',
    cover_image_url: '',
    album_id: null,
    project_id: null,
    created_at: '2026-06-20T10:00:00Z',
  },
  {
    id: 'ma-2',
    title: 'Sesión de Estudio',
    slug: 'sesion-estudio',
    description: 'Behind the scenes de las grabaciones en Estudios Ámbar.',
    cover_image_url: '',
    album_id: null,
    project_id: null,
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'ma-3',
    title: 'Backstage Mutek',
    slug: 'backstage-mutek',
    description: 'Instantáneas del backstage y la preparación para el show en Mutek.',
    cover_image_url: '',
    album_id: null,
    project_id: null,
    created_at: '2026-01-15T10:00:00Z',
  },
];

function PhotoGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-lg bg-white/5" />
      ))}
    </div>
  );
}

export default function GaleriaPage() {
  const [albums, setAlbums] = useState<MediaAlbum[]>(mockAlbums);
  const [loading, setLoading] = useState(true);

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
            <Link
              key={album.id}
              href={`/galeria/${album.slug}`}
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
            </Link>
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