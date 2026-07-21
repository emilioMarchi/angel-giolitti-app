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

// Interfaces locales extendidas
interface Album {
  id: string;
  title: string;
  slug: string;
  release_date: string;
  cover_url: string;
  description: string;
  album_type: 'album' | 'ep' | 'single';
  is_published: boolean;
  tracks?: Track[];
}

interface Playlist {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  tracks: Track[];
}

// Datos Mock (Fallback en caso de que la DB esté vacía)
const mockAlbums: Album[] = [
  {
    id: 'alb-1',
    title: 'Horizonte Infinito',
    slug: 'horizonte-infinito',
    release_date: '2026-03-15',
    cover_url: '',
    description: 'Un viaje a través de texturas electrónicas profundas y ritmos hipnóticos.',
    album_type: 'album',
    is_published: true,
    tracks: [
      { id: 't-101', album_id: 'alb-1', title: 'Horizonte Infinito', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration_seconds: 372, track_order: 1, album_title: 'Horizonte Infinito' },
      { id: 't-102', album_id: 'alb-1', title: 'Ecos del Silencio', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration_seconds: 298, track_order: 2, album_title: 'Horizonte Infinito' },
      { id: 't-103', album_id: 'alb-1', title: 'Luz Estelar', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration_seconds: 341, track_order: 3, album_title: 'Horizonte Infinito' },
      { id: 't-104', album_id: 'alb-1', title: 'Mareas Altas', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration_seconds: 412, track_order: 4, album_title: 'Horizonte Infinito' },
      { id: 't-105', album_id: 'alb-1', title: 'Viento Solar', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', duration_seconds: 315, track_order: 5, album_title: 'Horizonte Infinito' }
    ]
  },
  {
    id: 'alb-2',
    title: 'Analog Pulse',
    slug: 'analog-pulse',
    release_date: '2025-08-22',
    cover_url: '',
    description: 'Exploraciones modulares grabadas completamente en vivo en el estudio.',
    album_type: 'ep',
    is_published: true,
    tracks: [
      { id: 't-201', album_id: 'alb-2', title: 'Analog Pulse (Intro)', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', duration_seconds: 124, track_order: 1, album_title: 'Analog Pulse' },
      { id: 't-202', album_id: 'alb-2', title: 'Frecuencia Modulada', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', duration_seconds: 356, track_order: 2, album_title: 'Analog Pulse' },
      { id: 't-203', album_id: 'alb-2', title: 'Voltaje Controlado', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', duration_seconds: 402, track_order: 3, album_title: 'Analog Pulse' }
    ]
  },
  {
    id: 'alb-3',
    title: 'Ciudad Nocturna',
    slug: 'ciudad-nocturna',
    release_date: '2026-06-01',
    cover_url: '',
    description: 'Single debut y banda sonora urbana para la noche contemporánea.',
    album_type: 'single',
    is_published: true,
    tracks: [
      { id: 't-301', album_id: 'alb-3', title: 'Ciudad Nocturna', audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', duration_seconds: 288, track_order: 1, album_title: 'Ciudad Nocturna' }
    ]
  }
];

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

function getYear(dateString: string): string {
  return dateString ? new Date(dateString).getFullYear().toString() : '';
}

export default function MusicaPage() {
  const { playTrack, playQueue, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const [albums, setAlbums] = useState<Album[]>(mockAlbums);
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Intentar traer álbumes reales de Supabase
        const { data: dbAlbums, error: albumsError } = await supabase
          .from('albums')
          .select('*, tracks(*)')
          .eq('is_published', true);

        if (!albumsError && dbAlbums && dbAlbums.length > 0) {
          // Ordenar álbumes por fecha de lanzamiento (descendiente)
          const sorted = [...dbAlbums].sort(
            (a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
          );
          setAlbums(sorted);
        }
      } catch (err) {
        console.error('Error al cargar datos de Supabase, usando mocks:', err);
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
            <span className="text-xs uppercase font-bold tracking-widest text-primary">{selectedAlbum.album_type}</span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mt-2 mb-4 leading-tight">{selectedAlbum.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-bold text-white">Ángel Giolitti</span>
              <span>•</span>
              <span>{getYear(selectedAlbum.release_date)}</span>
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
            .filter(a => a.album_type === 'album' || a.album_type === 'ep')
            .map((album) => (
              <div 
                key={album.id}
                onClick={() => setSelectedAlbum(album)}
                className="album-card group cursor-pointer"
              >
                <div className="album-card-cover relative">
                  {album.cover_url ? (
                    <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <Disc3 className="h-12 w-12 text-muted-foreground/30 transition-colors group-hover:text-primary/70" />
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayCollection(album.tracks || []);
                    }}
                    className="album-card-play" 
                    aria-label={`Reproducir ${album.title}`}
                  >
                    <Play className="h-5 w-5" fill="currentColor" />
                  </button>
                </div>
                <h3 className="album-card-title mt-3">{album.title}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-bold text-primary uppercase">{album.album_type}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{getYear(album.release_date)}</span>
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
            .filter(a => a.album_type === 'single')
            .map((album) => (
              <div 
                key={album.id}
                onClick={() => setSelectedAlbum(album)}
                className="album-card group cursor-pointer"
              >
                <div className="album-card-cover relative">
                  {album.cover_url ? (
                    <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <Disc3 className="h-12 w-12 text-muted-foreground/30 transition-colors group-hover:text-primary/70" />
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayCollection(album.tracks || []);
                    }}
                    className="album-card-play" 
                    aria-label={`Reproducir ${album.title}`}
                  >
                    <Play className="h-5 w-5" fill="currentColor" />
                  </button>
                </div>
                <h3 className="album-card-title mt-3">{album.title}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-bold text-primary uppercase">{album.album_type}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{getYear(album.release_date)}</span>
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
