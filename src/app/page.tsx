'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Play, Shuffle, Heart, MoreHorizontal, Clock, Disc3, CalendarDays, Clapperboard, Images, User, Headphones, CheckCircle2, Users } from 'lucide-react';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { supabase } from '@/lib/supabase';
import { getR2Url } from '@/lib/utils';

/* ── Interfaces para las queries ── */
interface AlbumDB {
  id: string;
  title: string;
  slug: string;
  type: 'album' | 'ep' | 'single';
  release_year: number;
  cover_url: string | null;
}

interface TrackDB {
  id: string;
  album_id: string;
  title: string;
  audio_url: string;
  duration_seconds: number;
  track_order: number;
  play_count: number;
  albums: { title: string; cover_url: string | null } | null;
}

interface EventDB {
  id: string;
  title: string;
  slug: string;
  location_name: string;
  address_city: string;
  event_date: string;
  status: string;
}

interface ArtistProfileDB {
  full_name: string;
  short_bio: string;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatEventDate(isoString: string): { day: string; month: string } {
  const d = new Date(isoString);
  return {
    day: d.toLocaleDateString('es-ES', { day: '2-digit' }),
    month: d.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
  };
}

export default function HomePage() {
  const { playTrack, playQueue, currentTrack, isPlaying, togglePlay } = usePlayerStore();
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [discography, setDiscography] = useState<AlbumDB[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventDB[]>([]);
  const [artistBio, setArtistBio] = useState<string>('Músico · Compositor · Artista');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        setLoading(true);

        // 1. Tracks populares (top 5 por play_count, con datos del álbum)
        const { data: tracksData } = await supabase
          .from('tracks')
          .select('id, album_id, title, audio_url, duration_seconds, track_order, play_count, albums(title, cover_url)')
          .order('play_count', { ascending: false })
          .limit(5);

        if (tracksData && tracksData.length > 0) {
          const mapped: Track[] = (tracksData as unknown as TrackDB[]).map((t) => ({
            id: t.id,
            album_id: t.album_id,
            title: t.title,
            audio_url: t.audio_url,
            duration_seconds: t.duration_seconds,
            track_order: t.track_order,
            album_title: t.albums?.title || '',
            cover_url: t.albums?.cover_url || undefined,
          }));
          setPopularTracks(mapped);
        }

        // 2. Últimos 5 álbumes
        const { data: albumsData } = await supabase
          .from('albums')
          .select('id, title, slug, type, release_year, cover_url')
          .order('release_year', { ascending: false })
          .limit(5);

        if (albumsData && albumsData.length > 0) {
          setDiscography(albumsData as AlbumDB[]);
        }

        // 3. Próximos 3 eventos
        const { data: eventsData } = await supabase
          .from('events')
          .select('id, title, slug, location_name, address_city, event_date, status')
          .eq('status', 'upcoming')
          .order('event_date', { ascending: true })
          .limit(3);

        if (eventsData && eventsData.length > 0) {
          setUpcomingEvents(eventsData as EventDB[]);
        }

        // 4. Bio del artista
        const { data: profileData } = await supabase
          .from('artist_profile')
          .select('full_name, short_bio')
          .maybeSingle();

        if (profileData) {
          setArtistBio((profileData as ArtistProfileDB).short_bio || 'Músico · Compositor · Artista');
        }

      } catch (err) {
        console.error('Error cargando datos del home:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeData();
  }, []);

  const handlePlayAll = () => {
    if (popularTracks.length > 0) {
      playQueue(popularTracks, 0);
    }
  };

  const handlePlayTrack = (track: Track) => {
    playTrack(track, popularTracks);
  };

  return (
    <div className="artist-profile">
      {/* ═══ HERO / CABECERA DEL ARTISTA (tipo Spotify) ═══ */}
      <header className="artist-hero">
        {/* Banner / Cover */}
        <div className="artist-hero-bg">
          <img
            src={getR2Url('images/gallery/handangel/photo-3.webp')}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        <div className="artist-hero-content">
          {/* Foto de perfil */}
          <div className="artist-avatar overflow-hidden">
            <img
              src={getR2Url('images/gallery/handangel/photo-0.webp')}
              alt="Ángel Giolitti"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info del artista */}
          <div className="artist-hero-info">
            <div className="artist-verified">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>Artista verificado</span>
            </div>
            <h1 className="artist-name">Ángel Giolitti</h1>
            <p className="artist-meta">
              <span className="artist-listeners">
                <Users className="h-4 w-4" />
                {artistBio}
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* ═══ BARRA DE ACCIONES ═══ */}
      <div className="artist-actions">
        <button onClick={handlePlayAll} className="artist-play-btn" aria-label="Reproducir todo">
          <Play className="h-6 w-6" fill="currentColor" />
        </button>
        <button className="artist-shuffle-btn" aria-label="Aleatorio">
          <Shuffle className="h-5 w-5" />
        </button>
        <button className="artist-follow-btn">
          Seguir
        </button>
        <button className="artist-more-btn" aria-label="Más opciones">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* ═══ POPULARES (lista de tracks tipo Spotify) ═══ */}
      <section className="artist-section">
        <h2 className="artist-section-title">Populares</h2>

        <div className="track-list">
          {popularTracks.length > 0 ? (
            popularTracks.map((track, i) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`track-row ${isCurrent ? 'track-row--active' : ''}`}
                  onClick={() => isCurrent ? togglePlay() : handlePlayTrack(track)}
                >
                  <div className="track-row-number">
                    {isCurrent && isPlaying ? (
                      <div className="track-eq">
                        <span /><span /><span /><span />
                      </div>
                    ) : (
                      <span className="track-index">{i + 1}</span>
                    )}
                    <Play className="track-play-icon" fill="currentColor" />
                  </div>

                  <div className="track-row-info">
                    <div className="track-row-cover">
                      {track.cover_url ? (
                        <img src={getR2Url(track.cover_url)} alt={track.album_title} className="w-full h-full object-cover rounded" />
                      ) : (
                        <Disc3 className="h-5 w-5 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="track-row-text">
                      <span className={`track-row-title ${isCurrent ? 'text-primary' : ''}`}>
                        {track.title}
                      </span>
                      <span className="track-row-album">{track.album_title}</span>
                    </div>
                  </div>

                  <div className="track-row-actions">
                    <button className="track-like-btn" aria-label="Me gusta">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>

                  <span className="track-row-duration">
                    {formatDuration(track.duration_seconds)}
                  </span>
                </div>
              );
            })
          ) : !loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Headphones className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm">Los tracks se mostrarán aquí.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ═══ DISCOGRAFÍA ═══ */}
      <section className="artist-section">
        <div className="home-section-header">
          <h2 className="artist-section-title">Discografía</h2>
          <Link href="/musica" className="home-section-link">Mostrar todo</Link>
        </div>

        <div className="home-cards-row">
          {discography.map((album) => (
            <Link key={album.id} href={`/musica/${album.slug}`} className="album-card">
              <div className="album-card-cover">
                {album.cover_url ? (
                  <img src={getR2Url(album.cover_url)} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <Disc3 className="h-10 w-10 text-muted-foreground/40" />
                )}
                <button className="album-card-play" aria-label={`Reproducir ${album.title}`}>
                  <Play className="h-5 w-5" fill="currentColor" />
                </button>
              </div>
              <h3 className="album-card-title">{album.title}</h3>
              <p className="album-card-subtitle">
                {album.type === 'album' ? 'Álbum' : album.type === 'ep' ? 'EP' : 'Single'} · {album.release_year}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ PRÓXIMAS FECHAS ═══ */}
      {upcomingEvents.length > 0 && (
        <section className="artist-section">
          <div className="home-section-header">
            <h2 className="artist-section-title">En Concierto</h2>
            <Link href="/eventos" className="home-section-link">Mostrar todo</Link>
          </div>

          <div className="events-list">
            {upcomingEvents.map((event) => {
              const { day, month } = formatEventDate(event.event_date);
              return (
                <Link key={event.id} href="/eventos" className="event-row">
                  <div className="event-date-badge">
                    <span className="event-date-day">{day}</span>
                    <span className="event-date-month">{month}</span>
                  </div>
                  <div className="event-info">
                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-location">
                      <CalendarDays className="h-3 w-3" />
                      {event.location_name} · {event.address_city}
                    </p>
                  </div>
                  <div className="event-action">
                    <span className="event-action-text">Ver detalles</span>
                    <span className="event-action-arrow">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══ ACCESO RÁPIDO ═══ */}
      <section className="artist-section">
        <h2 className="artist-section-title">Explorar</h2>
        <div className="home-quick-access">
          {[
            { title: 'Proyectos', href: '/proyectos', color: 'var(--accent-blue)', icon: Clapperboard },
            { title: 'Galería de Fotos', href: '/galeria', color: 'var(--accent-orange)', icon: Images },
            { title: 'Biografía Completa', href: '/bio', color: 'var(--accent-pink)', icon: User },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Link key={i} href={item.href} className="quick-access-card">
                <div className="quick-access-icon" style={{ background: item.color }}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="quick-access-label">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="home-footer">
        <p>
          © 2026 Ángel Giolitti — Desarrollado por{' '}
          <span className="text-foreground/70 font-medium">OVNI Studio</span>
        </p>
      </footer>
    </div>
  );
}
