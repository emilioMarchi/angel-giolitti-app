'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Pause,
  Disc3,
  Music2,
  Clock,
  Heart,
  ArrowLeft,
} from 'lucide-react';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { supabase } from '@/lib/supabase';
import { getR2Url } from '@/lib/utils';

interface AlbumDB {
  id: string;
  title: string;
  slug: string;
  type: 'album' | 'ep' | 'single';
  release_year: number;
  cover_url: string | null;
  description: string | null;
  members: Array<{ name: string; roll: string[] }>;
  project: { title: string; members: Array<{ name: string; roll: string[] }> } | null;
  tracks?: any[];
}

interface AlbumView {
  id: string;
  title: string;
  slug: string;
  type: 'album' | 'ep' | 'single';
  release_year: number;
  cover_url: string | null;
  description: string | null;
  project_title: string | null;
  members: Array<{ name: string; roll: string[] }>;
  tracks: Track[];
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getCollectionDuration(tracks: Track[]): string {
  const totalSeconds = tracks.reduce((acc, t) => acc + (t.duration_seconds || 0), 0);
  const mins = Math.round(totalSeconds / 60);
  return `${mins} min`;
}

export default function AlbumDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { playTrack, playQueue, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const [album, setAlbum] = useState<AlbumView | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchAlbum() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('albums')
          .select('*, tracks(*), project:projects(title, members)')
          .eq('slug', slug)
          .single();

        if (!error && data) {
          const dbAlbum = data as AlbumDB;
          const tracks: Track[] = (dbAlbum.tracks || [])
            .sort((a: any, b: any) => a.track_order - b.track_order)
            .map((t: any) => ({
              id: t.id,
              album_id: t.album_id,
              title: t.title,
              audio_url: getR2Url(t.audio_url),
              duration_seconds: t.duration_seconds,
              track_order: t.track_order,
              album_title: dbAlbum.title,
              cover_url: getR2Url(dbAlbum.cover_url) || undefined,
            }));

          // Heredar miembros del proyecto si el álbum no tiene los suyos
          const albumMembers = (dbAlbum.members as Array<{ name: string; roll: string[] }>) || [];
          const projectMembers = (dbAlbum.project?.members as Array<{ name: string; roll: string[] }>) || [];
          const members = albumMembers.length > 0 ? albumMembers : projectMembers;

          setAlbum({
            id: dbAlbum.id,
            title: dbAlbum.title,
            slug: dbAlbum.slug,
            type: dbAlbum.type,
            release_year: dbAlbum.release_year,
            cover_url: getR2Url(dbAlbum.cover_url),
            description: dbAlbum.description,
            project_title: dbAlbum.project?.title || null,
            members,
            tracks,
          });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error fetching album:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchAlbum();
  }, [slug]);

  const handlePlayTrack = (track: Track) => {
    if (album) {
      playTrack(track, album.tracks);
    }
  };

  const handlePlayAll = () => {
    if (album && album.tracks.length > 0) {
      playQueue(album.tracks, 0);
    }
  };

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
      </div>
    );
  }

  if (notFound || !album) {
    return (
      <div className="music-detail-view px-6 py-6 pb-24">
        <Link
          href="/musica"
          className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-white transition-colors font-semibold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a música
        </Link>
        <div className="text-center py-20 text-muted-foreground">
          <Disc3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium">Álbum no encontrado</p>
          <p className="text-sm mt-1">El álbum que buscás no existe o fue removido.</p>
        </div>
      </div>
    );
  }

  const tracks = album.tracks;

  return (
    <div className="music-detail-view px-6 py-6 animate-fade-in pb-24">
      <Link
        href="/musica"
        className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-white transition-colors font-semibold text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a música
      </Link>

      <div className="flex flex-col md:flex-row gap-6 items-end mb-8">
        <div className="w-48 h-48 md:w-60 md:h-60 rounded-md bg-muted shadow-2xl flex-shrink-0 flex items-center justify-center relative overflow-hidden group">
          {album.cover_url ? (
            <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <Disc3 className="h-24 w-24 text-muted-foreground/30" />
          )}
        </div>

        <div className="flex-1">
          <span className="text-xs uppercase font-bold tracking-widest text-primary">{album.type}</span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mt-2 mb-4 leading-tight">{album.title}</h1>
          {album.project_title && (
            <p className="text-sm text-primary/90 font-medium mb-2">{album.project_title}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{album.release_year}</span>
            <span>•</span>
            <span>{tracks.length} {tracks.length === 1 ? 'canción' : 'canciones'}</span>
            <span>•</span>
            <span className="text-muted-foreground/80">{getCollectionDuration(tracks)}</span>
          </div>
          {album.members && album.members.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-white/80">Integrantes:</span>
              {album.members.map((m, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="font-medium text-white">{m.name}</span>
                  {m.roll && m.roll.length > 0 && (
                    <span className="text-muted-foreground/60">— {m.roll.join(', ')}</span>
                  )}
                  {i < album.members.length - 1 && <span className="text-muted-foreground/40">·</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <button
          onClick={handlePlayAll}
          className="w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95"
          aria-label="Reproducir álbum"
        >
          <Play className="h-6 w-6 translate-x-[1px]" fill="currentColor" />
        </button>
        <button className="text-muted-foreground hover:text-white transition-colors" aria-label="Favorito">
          <Heart className="h-8 w-8" />
        </button>
      </div>

      <div className="track-list-table">
        <div className="grid grid-cols-[50px_1fr_80px] border-b border-white/10 pb-2 mb-4 text-xs font-bold tracking-widest text-muted-foreground px-4 uppercase">
          <div>#</div>
          <div>Título</div>
          <div className="text-right"><Clock className="h-4 w-4 inline-block" /></div>
        </div>

        <div className="flex flex-col">
          {tracks.length > 0 ? (
            tracks.map((track, i) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => isCurrent ? togglePlay() : handlePlayTrack(track)}
                  className={`track-row grid grid-cols-[50px_1fr_80px] items-center px-4 py-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer ${isCurrent ? 'bg-white/5' : ''}`}
                >
                  <div className="flex items-center">
                    {isCurrent && isPlaying ? (
                      <div className="track-eq">
                        <span /><span /><span /><span />
                      </div>
                    ) : (
                      <span className="track-index text-muted-foreground text-sm font-medium">{i + 1}</span>
                    )}
                    <Play className="track-play-icon h-4 w-4 text-white" fill="currentColor" />
                  </div>

                  <div className="min-w-0">
                    <p className={`font-semibold truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">Ángel Giolitti</p>
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    {formatDuration(track.duration_seconds)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Music2 className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
              No hay tracks disponibles en este álbum.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
