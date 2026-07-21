'use client';

import Link from 'next/link';
import { Play, Shuffle, Heart, MoreHorizontal, Clock, Disc3, CalendarDays, Film, Images, User, Headphones, CheckCircle2, Users } from 'lucide-react';
import { usePlayerStore, Track } from '@/store/usePlayerStore';

/* ── Datos placeholder (TODO: reemplazar con queries a Supabase) ── */
const popularTracks: Track[] = [
  { id: '1', album_id: 'a1', title: 'Horizonte Infinito', audio_url: '', duration_seconds: 245, track_order: 1, album_title: 'Próximo Álbum', cover_url: '' },
  { id: '2', album_id: 'a1', title: 'Ecos del Silencio', audio_url: '', duration_seconds: 198, track_order: 2, album_title: 'Próximo Álbum', cover_url: '' },
  { id: '3', album_id: 'a2', title: 'Ciudad Nocturna', audio_url: '', duration_seconds: 312, track_order: 1, album_title: 'Nuevo Single', cover_url: '' },
  { id: '4', album_id: 'a3', title: 'Despertar', audio_url: '', duration_seconds: 267, track_order: 1, album_title: 'EP Debut', cover_url: '' },
  { id: '5', album_id: 'a1', title: 'Mareas', audio_url: '', duration_seconds: 223, track_order: 3, album_title: 'Próximo Álbum', cover_url: '' },
];

const discography = [
  { title: 'Próximo Álbum', subtitle: 'Álbum · 2026', type: 'album' },
  { title: 'Nuevo Single', subtitle: 'Single · 2026', type: 'single' },
  { title: 'EP Debut', subtitle: 'EP · 2025', type: 'ep' },
  { title: 'Remixes Vol. 1', subtitle: 'Compilado · 2025', type: 'album' },
  { title: 'Live Session', subtitle: 'En Vivo · 2026', type: 'single' },
];

const upcomingEvents = [
  { date: '15 AGO', title: 'Presentación en Vivo', location: 'Buenos Aires, Argentina', venue: 'Centro Cultural Kirchner' },
  { date: '28 SEP', title: 'Festival de Música Independiente', location: 'Córdoba, Argentina', venue: 'Espacio Quality' },
  { date: '10 OCT', title: 'Sesión Acústica Íntima', location: 'Rosario, Argentina', venue: 'El Cairo' },
];

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function HomePage() {
  const { playTrack, playQueue, currentTrack, isPlaying, togglePlay } = usePlayerStore();

  const handlePlayAll = () => {
    playQueue(popularTracks, 0);
  };

  const handlePlayTrack = (track: Track) => {
    playTrack(track, popularTracks);
  };

  return (
    <div className="artist-profile">
      {/* ═══ HERO / CABECERA DEL ARTISTA (tipo Spotify) ═══ */}
      <header className="artist-hero">
        {/* Gradiente de fondo (simula la portada) */}
        <div className="artist-hero-bg" />

        <div className="artist-hero-content">
          {/* Foto de perfil */}
          <div className="artist-avatar">
            <User className="h-16 w-16 text-muted-foreground/60" />
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
                Músico · Compositor · Artista
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
          {popularTracks.map((track, i) => {
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
                    <Disc3 className="h-5 w-5 text-muted-foreground/40" />
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
          })}
        </div>
      </section>

      {/* ═══ DISCOGRAFÍA ═══ */}
      <section className="artist-section">
        <div className="home-section-header">
          <h2 className="artist-section-title">Discografía</h2>
          <Link href="/musica" className="home-section-link">Mostrar todo</Link>
        </div>

        {/* TODO: Reemplazar con datos de Supabase (tabla albums) */}
        <div className="home-cards-row">
          {discography.map((item, i) => (
            <div key={i} className="album-card">
              <div className="album-card-cover">
                <Disc3 className="h-10 w-10 text-muted-foreground/40" />
                <button className="album-card-play" aria-label={`Reproducir ${item.title}`}>
                  <Play className="h-5 w-5" fill="currentColor" />
                </button>
              </div>
              <h3 className="album-card-title">{item.title}</h3>
              <p className="album-card-subtitle">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PRÓXIMAS FECHAS ═══ */}
      <section className="artist-section">
        <div className="home-section-header">
          <h2 className="artist-section-title">En Concierto</h2>
          <Link href="/eventos" className="home-section-link">Mostrar todo</Link>
        </div>

        <div className="events-list">
          {upcomingEvents.map((event, i) => (
            <div key={i} className="event-row">
              <div className="event-date-badge">
                <span className="event-date-day">{event.date.split(' ')[0]}</span>
                <span className="event-date-month">{event.date.split(' ')[1]}</span>
              </div>
              <div className="event-info">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-location">
                  <CalendarDays className="h-3 w-3" />
                  {event.venue} · {event.location}
                </p>
              </div>
              <div className="event-action">
                <span className="event-action-text">Ver detalles</span>
                <span className="event-action-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ ACCESO RÁPIDO ═══ */}
      <section className="artist-section">
        <h2 className="artist-section-title">Explorar</h2>
        <div className="home-quick-access">
          {[
            { title: 'Proyectos Audiovisuales', href: '/proyectos', color: 'var(--accent-blue)', icon: Film },
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
