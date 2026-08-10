'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Play, Pause, Shuffle, Heart, Disc3, CalendarDays, FolderOpen, Images, User, Headphones, CheckCircle2, Users, MessageSquare, Video, Share2, MessageCircle, Image, ListMusic, ChevronUp, ChevronDown } from '@/lib/lucide';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { supabase } from '@/lib/supabase';
import { getR2Url } from '@/lib/utils';
import { InstagramIcon, YoutubeIcon, SpotifyIcon, FacebookIcon, TwitterIcon } from '@/components/BrandIcons';

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
  social_links: Record<string, string>;
}

interface MediaAlbumDB {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  cover_image_url: string | null;
}

interface PlaylistDB {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  is_official: boolean;
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
  const { playTrack, playQueue, currentTrack, isPlaying, togglePlay, toggleShuffle, isShuffle, setPopularTracks: setStorePopularTracks } = usePlayerStore();
  const [popularTracks, setPopularTracks] = useState<Track[]>([]);
  const [discography, setDiscography] = useState<AlbumDB[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventDB[]>([]);
  const [mediaAlbums, setMediaAlbums] = useState<MediaAlbumDB[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistDB[]>([]);
  const [artistBio, setArtistBio] = useState<string>('Músico · Compositor · Artista');
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [showMorePopular, setShowMorePopular] = useState(false);

  const allImages = [
    getR2Url('images/gallery/handangel/photo-0.webp'),
    getR2Url('images/gallery/handangel/photo-2.webp'),
    getR2Url('images/gallery/handangel/photo-3.webp'),
    getR2Url('images/gallery/handangel/photo-6.webp'),
  ];
  const heroImages = isMobile ? allImages : allImages.slice(1);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setHeroIndex((prev) => (prev >= heroImages.length ? 0 : prev));
  }, [heroImages.length]);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        setLoading(true);

        // 1. Tracks populares por play_count (RPC)
        const { data: popularData, error: popularError } = await supabase
          .rpc('get_popular_tracks', { limit_count: 10 });

        if (!popularError && popularData) {
          const mapped: Track[] = (popularData as any[]).map((t) => ({
            id: t.id,
            album_id: t.album_id,
            title: t.title,
            audio_url: t.audio_url,
            duration_seconds: t.duration_seconds,
            track_order: t.track_order,
            album_title: t.album_title || '',
            cover_url: t.cover_url || undefined,
          }));
          setPopularTracks(mapped);
          setStorePopularTracks(mapped);
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

        // 4. Bio del artista + social links
        const { data: profileData } = await supabase
          .from('artist_profile')
          .select('full_name, short_bio, social_links')
          .maybeSingle();

        if (profileData) {
          setArtistBio((profileData as ArtistProfileDB).short_bio || 'Músico · Compositor · Artista');
          setSocialLinks((profileData as ArtistProfileDB).social_links || {});
        }

        // 5. Álbumes multimedia (galerías) - últimos 4
        const { data: mediaData } = await supabase
          .from('media_albums')
          .select('id, title, slug, description, cover_image_url')
          .order('created_at', { ascending: false })
          .limit(4);

        if (mediaData && mediaData.length > 0) {
          setMediaAlbums(mediaData as MediaAlbumDB[]);
        }

        // 6. Playlists oficiales - primeras 3
        const { data: playlistsData } = await supabase
          .from('playlists')
          .select('id, title, description, cover_url, is_official')
          .eq('is_official', true)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (playlistsData && playlistsData.length > 0) {
          setPlaylists(playlistsData as PlaylistDB[]);
        }

      } catch (err) {
        console.error('Error cargando datos del home:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeData();
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length, isMobile]);

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
      {/* ═══ HERO solo desktop (mobile hero está en layout) ═══ */}
      {!isMobile && (
        <header className="artist-hero">
          <div className="artist-hero-bg">
            {heroImages.map((src, i) => (
              <img
                key={src}
                src={src}
                alt="Banner"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  i === heroIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === heroIndex ? 'bg-white w-6' : 'bg-white/40'
                  }`}
                  aria-label={`Imagen ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="artist-hero-content">
            <div className="artist-avatar overflow-hidden">
              <img
                src={getR2Url('images/gallery/handangel/photo-0.webp')}
                alt="Ángel Giolitti"
                className="w-full h-full object-cover"
              />
            </div>
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
      )}

      {/* ═══ BARRA DE ACCIONES (solo desktop) ═══ */}
      {!isMobile && (
        <div className="artist-actions">
          <button onClick={togglePlay} className="artist-play-btn" aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
            {isPlaying ? (
              <Pause className="h-6 w-6" fill="currentColor" />
            ) : (
              <Play className="h-6 w-6" fill="currentColor" />
            )}
          </button>
          <button onClick={toggleShuffle} className={`artist-shuffle-btn ${isShuffle ? 'text-primary' : ''}`} aria-label="Aleatorio">
            <Shuffle className="h-5 w-5" />
          </button>
          <button className="artist-follow-btn">
            Seguir
          </button>
          <div className="flex items-center gap-1.5 ml-3">
            {socialLinks.spotify && (
              <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-green-500 hover:bg-green-500/10 transition-colors" aria-label="Spotify">
                <SpotifyIcon className="h-[18px] w-[18px]" />
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-sky-500 hover:bg-sky-500/10 transition-colors" aria-label="Twitter">
                <TwitterIcon className="h-[18px] w-[18px]" />
              </a>
            )}
            {socialLinks.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors" aria-label="YouTube">
                <YoutubeIcon className="h-[18px] w-[18px]" />
              </a>
            )}
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-600/10 transition-colors" aria-label="Facebook">
                <FacebookIcon className="h-[18px] w-[18px]" />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-[rgb(var(--instagram))] hover:bg-[rgb(var(--instagram))/10] transition-colors" aria-label="Instagram">
                <InstagramIcon className="h-[18px] w-[18px]" />
              </a>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShareOpen(!shareOpen)}
              className="artist-more-btn"
              aria-label="Compartir"
            >
              <Share2 className="h-5 w-5" />
            </button>
            {shareOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-white/10 rounded-lg shadow-xl py-2 z-50 animate-fade-in">
                <button className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-white/5 w-full text-left" onClick={() => { navigator.share({ title: 'Ángel Giolitti', text: 'Escucha a Ángel Giolitti', url: window.location.href }); setShareOpen(false); }}>
                  <MessageCircle className="h-4 w-4" />
                  Compartir perfil
                </button>
                <button className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-white/5 w-full text-left" onClick={() => { navigator.clipboard.writeText(window.location.href); setShareOpen(false); }}>
                  <MessageSquare className="h-4 w-4" />
                  Copiar enlace
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ POPULARES (lista de tracks tipo Spotify) ═══ */}
      <section className="artist-section">
        <h2 className="artist-section-title">Populares</h2>

        <div className="track-list">
          {popularTracks.length > 0 ? (
            <>
              {(showMorePopular ? popularTracks.slice(0, 10) : popularTracks.slice(0, 5)).map((track, i) => {
                const isCurrent = currentTrack?.id === track.id;
                const displayIndex = i + 1;
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
                        <span className="track-index">{displayIndex}</span>
                      )}
                      <Play className="track-play-icon" fill="currentColor" />
                    </div>

                    <div className="track-row-cover">
                      {track.cover_url ? (
                        <img src={getR2Url(track.cover_url)} alt={track.album_title} className="w-full h-full object-cover rounded" />
                      ) : (
                        <Disc3 className="h-5 w-5 text-muted-foreground/40" />
                      )}
                    </div>

                    <div className="track-row-info">
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
              })}
              {popularTracks.length > 5 && (
                <button
                  onClick={() => setShowMorePopular(!showMorePopular)}
                  className="w-full mt-3 px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  {showMorePopular ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      Mostrar más
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </>
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

      {/* ═══ MULTIMEDIA ═══ */}
      {mediaAlbums.length > 0 && (
        <section className="artist-section">
          <div className="home-section-header">
            <h2 className="artist-section-title">Multimedia</h2>
            <Link href="/galeria" className="home-section-link">Mostrar todo</Link>
          </div>

          <div className="home-cards-row">
            {mediaAlbums.map((album) => (
              <Link key={album.id} href={`/galeria/${album.slug}`} className="album-card">
                <div className="album-card-cover">
                  {album.cover_image_url ? (
                    <img src={getR2Url(album.cover_image_url)} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                      {album.title.toLowerCase().includes('video') || album.title.toLowerCase().includes('vídeo') ? (
                        <Video className="h-10 w-10 text-muted-foreground/40" />
                      ) : (
                        <Image className="h-10 w-10 text-muted-foreground/40" />
                      )}
                    </div>
                  )}
                </div>
                <h3 className="album-card-title">{album.title}</h3>
                <p className="album-card-subtitle">
                  {album.description || 'Galería de fotos'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══ PLAYLISTS OFICIALES ═══ */}
      {playlists.length > 0 && (
        <section className="artist-section">
          <div className="home-section-header">
            <h2 className="artist-section-title">Playlists</h2>
            <Link href="/musica" className="home-section-link">Mostrar todo</Link>
          </div>

          <div className="home-cards-row">
            {playlists.map((pl) => (
              <Link key={pl.id} href={`/musica?playlist=${pl.id}`} className="album-card">
                <div className="album-card-cover">
                  {pl.cover_url ? (
                    <img src={getR2Url(pl.cover_url)} alt={pl.title} className="w-full h-full object-cover" />
                  ) : (
                    <ListMusic className="h-10 w-10 text-muted-foreground/40" />
                  )}
                  <button className="album-card-play" aria-label={`Reproducir ${pl.title}`}>
                    <Play className="h-5 w-5" fill="currentColor" />
                  </button>
                </div>
                <h3 className="album-card-title">{pl.title}</h3>
                <p className="album-card-subtitle">
                  {pl.description || 'Playlist oficial'}
                  {pl.is_official && <span className="ml-2 text-xs text-primary">✓ Oficial</span>}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══ ACCESO RÁPIDO ═══ */}
      <section className="artist-section">
        <h2 className="artist-section-title">Explorar</h2>
        <div className="home-quick-access">
          {[
            { title: 'Proyectos', href: '/proyectos', colorClass: 'bg-accent-blue', icon: FolderOpen },
            { title: 'Galería de Fotos', href: '/galeria', colorClass: 'bg-accent-orange', icon: Images },
            { title: 'Biografía Completa', href: '/bio', colorClass: 'bg-accent-pink', icon: User },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Link key={i} href={item.href} className="quick-access-card">
                <div className={`quick-access-icon ${item.colorClass}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="quick-access-label">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ CONECTAR ═══ */}
      <section className="artist-section">
        <h2 className="artist-section-title">Conectar</h2>
        <div className="flex flex-wrap gap-3">
          {socialLinks.spotify && (
            <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm text-white/80 hover:text-white transition-colors">
              <SpotifyIcon />
              <span>Spotify</span>
            </a>
          )}
          {socialLinks.twitter && (
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm text-white/80 hover:text-white transition-colors">
              <TwitterIcon />
              <span>Twitter</span>
            </a>
          )}
          {socialLinks.youtube && (
            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm text-white/80 hover:text-white transition-colors">
              <YoutubeIcon />
              <span>YouTube</span>
            </a>
          )}
          {socialLinks.facebook && (
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm text-white/80 hover:text-white transition-colors">
              <FacebookIcon />
              <span>Facebook</span>
            </a>
          )}
          {socialLinks.instagram && (
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm text-white/80 hover:text-white transition-colors">
              <InstagramIcon />
              <span>Instagram</span>
            </a>
          )}
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
