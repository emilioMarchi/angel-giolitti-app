'use client';

import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Disc3, 
  Music2, 
  Clock, 
  Heart, 
  ArrowLeft, 
  ListMusic, 
  ChevronRight,
  Headphones
} from 'lucide-react';
import Link from 'next/link';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { supabase } from '@/lib/supabase';
import { getR2Url } from '@/lib/utils';

// Interfaces locales alineadas con la DB real
interface AlbumDB {
  id: string;
  project_id: string | null;
  title: string;
  slug: string;
  type: 'album' | 'ep' | 'single';
  release_year: number;
  cover_url: string | null;
  description: string | null;
  members: unknown[];
  project: { title: string; members: Array<{ name: string; roll: string[] }> } | null;
  created_at: string;
  tracks?: TrackDB[];
}

interface TrackDB {
  id: string;
  album_id: string;
  title: string;
  slug: string;
  audio_url: string;
  duration_seconds: number;
  track_order: number;
  play_count: number;
  likes_count: number;
  created_at: string;
}

interface Playlist {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  tracks: Track[];
}

// Interfaz local para el render (con datos enriquecidos)
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

const mockPlaylists: Playlist[] = [
  {
    id: 'pl-1',
    title: 'Inspiración Electro-Organic',
    description: 'Selección de tracks de Ángel Giolitti para concentrarse y entrar en trance.',
    cover_url: '',
    tracks: [
      { id: 't-101', album_id: 'alb-1', title: 'Horizonte Infinito', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration_seconds: 372, track_order: 1, album_title: 'Horizonte Infinito' },
      { id: 't-202', album_id: 'alb-2', title: 'Frecuencia Modulada', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', duration_seconds: 356, track_order: 2, album_title: 'Analog Pulse' },
      { id: 't-301', album_id: 'alb-3', title: 'Ciudad Nocturna', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', duration_seconds: 288, track_order: 3, album_title: 'Ciudad Nocturna' }
    ]
  },
  {
    id: 'pl-2',
    title: 'Late Night Sessions',
    description: 'Clásicos y rarezas de música electrónica ambiente para las altas horas de la noche.',
    cover_url: '',
    tracks: [
      { id: 't-102', album_id: 'alb-1', title: 'Ecos del Silencio', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration_seconds: 298, track_order: 1, album_title: 'Horizonte Infinito' },
      { id: 't-105', album_id: 'alb-1', title: 'Viento Solar', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration_seconds: 315, track_order: 2, album_title: 'Horizonte Infinito' }
    ]
  }
];

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Convierte un AlbumDB de Supabase a un AlbumView enriquecido para el render
function mapAlbumToView(dbAlbum: AlbumDB): AlbumView {
  const tracks: Track[] = (dbAlbum.tracks || [])
    .sort((a, b) => a.track_order - b.track_order)
    .map((t) => ({
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

  return {
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
  };
}

export default function MusicaPage() {
  const { playTrack, playQueue, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const [albums, setAlbums] = useState<AlbumView[]>([]);
  const [playlists] = useState<Playlist[]>(mockPlaylists);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumView | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: dbAlbums, error: albumsError } = await supabase
          .from('albums')
          .select('*, tracks(*), project:projects(title, members)')
          .order('release_year', { ascending: false });

        if (!albumsError && dbAlbums && dbAlbums.length > 0) {
          const mapped = (dbAlbums as AlbumDB[]).map(mapAlbumToView);
          setAlbums(mapped);
        }
      } catch (err) {
        console.error('Error al cargar datos de Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handlePlayTrack = (track: Track, queue: Track[]) => {
    playTrack(track, queue);
  };

  const handlePlayCollection = (tracks: Track[]) => {
    if (tracks && tracks.length > 0) {
      playQueue(tracks, 0);
    }
  };

  const getCollectionDuration = (tracks?: Track[]): string => {
    if (!tracks) return '0 min';
    const totalSeconds = tracks.reduce((acc, t) => acc + (t.duration_seconds || 0), 0);
    const mins = Math.round(totalSeconds / 60);
    return `${mins} min`;
  };

  // Si hay un álbum o playlist seleccionado, mostramos la vista de detalle
  if (selectedAlbum) {
    const tracks = selectedAlbum.tracks || [];
    return (
      <div className="music-detail-view px-6 py-6 animate-fade-in">
        {/* Botón de volver */}
        <button 
          onClick={() => setSelectedAlbum(null)}
          className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-white transition-colors font-semibold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a música
        </button>

        {/* Cabecera del Álbum */}
        <div className="flex flex-col md:flex-row gap-6 items-end mb-8">
          <div className="w-48 h-48 md:w-60 md:h-60 rounded-md bg-muted shadow-2xl flex-shrink-0 flex items-center justify-center relative overflow-hidden group">
            {selectedAlbum.cover_url ? (
              <img src={selectedAlbum.cover_url} alt={selectedAlbum.title} className="w-full h-full object-cover" />
            ) : (
              <Disc3 className="h-24 w-24 text-muted-foreground/30" />
            )}
          </div>
          
          <div className="flex-1">
            <span className="text-xs uppercase font-bold tracking-widest text-primary">{selectedAlbum.type}</span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mt-2 mb-4 leading-tight">{selectedAlbum.title}</h1>
            {selectedAlbum.project_title && (
              <p className="text-sm text-primary/90 font-medium mb-2">{selectedAlbum.project_title}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{selectedAlbum.release_year}</span>
              <span>•</span>
              <span>{tracks.length} {tracks.length === 1 ? 'canción' : 'canciones'}</span>
              <span>•</span>
              <span className="text-muted-foreground/80">{getCollectionDuration(tracks)}</span>
            </div>
            {selectedAlbum.members && selectedAlbum.members.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-white/70">Integrantes:</span>
                {selectedAlbum.members.map((m, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="text-white/90">{m.name}</span>
                    {m.roll && m.roll.length > 0 && (
                      <span className="text-muted-foreground/70 text-xs">({m.roll.join(', ')})</span>
                    )}
                    {i < selectedAlbum.members.length - 1 && <span className="text-muted-foreground/50">·</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Barra de controles rápidos */}
        <div className="flex items-center gap-6 mb-8">
          <button 
            onClick={() => handlePlayCollection(tracks)}
            className="w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95"
            aria-label="Reproducir colección"
          >
            <Play className="h-6 w-6 translate-x-[1px]" fill="currentColor" />
          </button>
          <button className="text-muted-foreground hover:text-white transition-colors" aria-label="Favorito">
            <Heart className="h-8 w-8" />
          </button>
        </div>

        {/* Tabla de tracks */}
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
                    onClick={() => isCurrent ? togglePlay() : handlePlayTrack(track, tracks)}
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

  if (selectedPlaylist) {
    const tracks = selectedPlaylist.tracks;
    return (
      <div className="music-detail-view px-6 py-6 animate-fade-in">
        {/* Botón de volver */}
        <button 
          onClick={() => setSelectedPlaylist(null)}
          className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-white transition-colors font-semibold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a música
        </button>

        {/* Cabecera de la Playlist */}
        <div className="flex flex-col md:flex-row gap-6 items-end mb-8">
          <div className="w-48 h-48 md:w-60 md:h-60 rounded-md bg-gradient-to-br from-teal-900 to-black shadow-2xl flex-shrink-0 flex items-center justify-center relative overflow-hidden group">
            {selectedPlaylist.cover_url ? (
              <img src={selectedPlaylist.cover_url} alt={selectedPlaylist.title} className="w-full h-full object-cover" />
            ) : (
              <ListMusic className="h-24 w-24 text-primary/75" />
            )}
          </div>
          
          <div className="flex-1">
            <span className="text-xs uppercase font-bold tracking-widest text-primary">Playlist del Artista</span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mt-2 mb-4 leading-tight">{selectedPlaylist.title}</h1>
            <p className="text-sm text-muted-foreground mb-4">{selectedPlaylist.description}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-bold text-white">Ángel Giolitti</span>
              <span>•</span>
              <span>{tracks.length} {tracks.length === 1 ? 'canción' : 'canciones'}</span>
              <span>•</span>
              <span className="text-muted-foreground/80">{getCollectionDuration(tracks)}</span>
            </div>
          </div>
        </div>

        {/* Barra de controles rápidos */}
        <div className="flex items-center gap-6 mb-8">
          <button 
            onClick={() => handlePlayCollection(tracks)}
            className="w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95"
            aria-label="Reproducir playlist"
          >
            <Play className="h-6 w-6 translate-x-[1px]" fill="currentColor" />
          </button>
        </div>

        {/* Tabla de tracks */}
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
                    onClick={() => isCurrent ? togglePlay() : handlePlayTrack(track, tracks)}
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
                      <p className="text-xs text-muted-foreground truncate">{track.album_title || 'Artista'}</p>
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
                No hay tracks disponibles en esta playlist.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vista principal de la pestaña Música
  return (
    <div className="music-tab-view px-6 py-6 pb-24">
      
      {/* Banner / Header superior */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
          <Headphones className="h-9 w-9 text-primary animate-pulse" />
          Música
        </h1>
        <p className="text-sm text-muted-foreground">
          Explora la discografía oficial, EPs, sencillos y listas de reproducción curadas por Ángel Giolitti.
        </p>
      </div>

      {/* ── SECCIÓN ÁLBUMES Y EPS ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/5 pb-2">Álbumes y EPs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {albums
            .filter(a => a.type === 'album' || a.type === 'ep')
            .map((album) => (
              <div 
                key={album.id}
                className="album-card group cursor-pointer"
              >
                <Link href={`/musica/${album.slug}`} className="album-card-cover relative block">
                  {album.cover_url ? (
                    <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <Disc3 className="h-12 w-12 text-muted-foreground/30 transition-colors group-hover:text-primary/70" />
                  )}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePlayCollection(album.tracks || []);
                    }}
                    className="album-card-play" 
                    aria-label={`Reproducir ${album.title}`}
                  >
                    <Play className="h-5 w-5" fill="currentColor" />
                  </button>
                </Link>
                <h3 className="album-card-title mt-3">{album.title}</h3>
                {album.project_title && (
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">{album.project_title}</p>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-bold text-primary uppercase">{album.type}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{album.release_year}</span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* ── SECCIÓN SENCILLOS (SINGLES) ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/5 pb-2">Sencillos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {albums
            .filter(a => a.type === 'single')
            .map((album) => (
              <div 
                key={album.id}
                className="album-card group cursor-pointer"
              >
                <Link href={`/musica/${album.slug}`} className="album-card-cover relative block">
                  {album.cover_url ? (
                    <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <Disc3 className="h-12 w-12 text-muted-foreground/30 transition-colors group-hover:text-primary/70" />
                  )}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePlayCollection(album.tracks || []);
                    }}
                    className="album-card-play" 
                    aria-label={`Reproducir ${album.title}`}
                  >
                    <Play className="h-5 w-5" fill="currentColor" />
                  </button>
                </Link>
                <h3 className="album-card-title mt-3">{album.title}</h3>
                {album.project_title && (
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">{album.project_title}</p>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-bold text-primary uppercase">{album.type}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{album.release_year}</span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* ── SECCIÓN PLAYLISTS CURADAS ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/5 pb-2">Playlists del Artista</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id}
              onClick={() => setSelectedPlaylist(playlist)}
              className="flex items-center gap-4 p-4 rounded-lg bg-card/40 border border-white/5 hover:bg-card/70 hover:border-primary/20 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-20 h-20 rounded bg-gradient-to-br from-teal-900/50 to-black/80 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                {playlist.cover_url ? (
                  <img src={playlist.cover_url} alt={playlist.title} className="w-full h-full object-cover" />
                ) : (
                  <ListMusic className="h-10 w-10 text-primary/70 transition-colors group-hover:text-primary" />
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayCollection(playlist.tracks);
                  }}
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                  aria-label="Reproducir playlist"
                >
                  <Play className="h-4 w-4 fill-current translate-x-[1px]" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-white group-hover:text-primary transition-colors truncate">{playlist.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-snug">{playlist.description}</p>
                <p className="text-[10px] text-muted-foreground/80 mt-2 font-semibold">
                  {playlist.tracks.length} CANCIONES
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
