'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Users, Home, Search, Music2, FolderOpen, CalendarDays, Images, User, Menu, X } from '@/lib/lucide';
import { getR2Url } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';


const heroImages = [
  getR2Url('images/gallery/handangel/photo-0.webp'),
  getR2Url('images/gallery/handangel/photo-2.webp'),
  getR2Url('images/gallery/handangel/photo-3.webp'),
  getR2Url('images/gallery/handangel/photo-6.webp'),
];

const navItems = [
  { href: '/musica', icon: Music2, label: 'Música' },
  { href: '/proyectos', icon: FolderOpen, label: 'Proyectos' },
  { href: '/eventos', icon: CalendarDays, label: 'Eventos' },
  { href: '/galeria', icon: Images, label: 'Galería' },
  { href: '/bio', icon: User, label: 'Bio' },
];

export default function MobileHero() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [artistBio, setArtistBio] = useState('Músico · Compositor · Artista');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const pathname = usePathname();
  const isFollowing = usePlayerStore((state) => state.isFollowing);
  const toggleFollow = usePlayerStore((state) => state.toggleFollow);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const { results, loading } = useGlobalSearch(searchTerm);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isMobile]);

  useEffect(() => {
    supabase
      .from('artist_profile')
      .select('short_bio, followers_count')
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setArtistBio((data as { short_bio: string }).short_bio || 'Músico · Compositor · Artista');
        }
      });
  }, []);

  useEffect(() => {
    setHeroIndex((prev) => (prev >= heroImages.length ? 0 : prev));
  }, [heroImages.length]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (!isMobile) return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="artist-hero" style={{ minHeight: '340px', paddingBottom: 0 }}>
        <div className="artist-hero-bg">
          {heroImages.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
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
          <div className="w-full flex flex-col items-start gap-1 pb-2 text-left">
            <div className="flex items-center gap-2 w-full">
              <h1 className="text-white font-black tracking-tight inline-flex items-center gap-2 flex-1" style={{ fontFamily: 'var(--font-heading), var(--font-sans), sans-serif', fontSize: '2rem', lineHeight: 1.1 }}>
                Ángel Giolitti
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              </h1>
              <button
                onClick={toggleFollow}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                  isFollowing
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground/70 flex-shrink-0" />
              <span>{artistBio}</span>
            </p>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-50 bg-[var(--sidebar)]/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between px-3 py-2">
          <Link
            href="/"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/')
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            }`}
            onClick={() => { setIsMenuOpen(false); setIsSearchOpen(false); }}
          >
            <Home className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => { setIsSearchOpen(!isSearchOpen); setIsMenuOpen(false); }}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
              aria-label={isSearchOpen ? 'Cerrar búsqueda' : 'Buscar'}
              aria-expanded={isSearchOpen}
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => { setIsMenuOpen(!isMenuOpen); setIsSearchOpen(false); }}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="px-3 pb-3 bg-[var(--sidebar)]/95 backdrop-blur-md border-b border-white/5 animate-fade-in">
            <div className="relative">
              <div className="relative flex items-center bg-muted/20 border border-white/5 rounded-xl overflow-hidden">
                <div className="pl-4 text-muted-foreground">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar canciones, álbumes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => { }}
                  className="w-full bg-transparent border-0 px-3 py-2.5 text-white placeholder-muted-foreground focus:outline-none focus:ring-0 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="pr-4 text-muted-foreground hover:text-white transition-colors"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {loading && (
                  <div className="pr-4">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {searchTerm && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-background border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in max-h-[50vh] overflow-y-auto">
                  <div className="px-4 py-4">
                    {results.tracks.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Music2 className="w-3.5 h-3.5" /> Canciones
                        </h3>
                        <div className="space-y-1">
                          {results.tracks.slice(0, 5).map((track) => (
                            <button
                              key={track.id}
                              onClick={() => {
                                playTrack({
                                  id: track.id,
                                  album_id: track.album_id,
                                  title: track.title,
                                  audio_url: getR2Url(track.audio_url),
                                  duration_seconds: track.duration_seconds,
                                  track_order: track.track_order,
                                  album_title: track.album_title,
                                  cover_url: track.cover_url ? getR2Url(track.cover_url) : undefined,
                                });
                                setIsSearchOpen(false);
                                setSearchTerm('');
                              }}
                              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/20 transition w-full text-left"
                            >
                              <div className="w-8 h-8 rounded bg-neutral-900 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                {track.cover_url ? (
                                  <img src={getR2Url(track.cover_url)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Music2 className="w-3 h-3 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate text-white">{track.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{track.album_title}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {results.albums.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FolderOpen className="w-3.5 h-3.5" /> Álbumes
                        </h3>
                        <div className="space-y-1">
                          {results.albums.slice(0, 3).map((album) => (
                            <Link
                              key={album.id}
                              href={`/musica?album=${album.slug}`}
                              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/20 transition"
                              onClick={() => { setIsSearchOpen(false); setSearchTerm(''); }}
                            >
                              <div className="w-8 h-8 rounded bg-neutral-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                <FolderOpen className="w-3 h-3 text-muted-foreground" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{album.title}</p>
                                <p className="text-xs text-muted-foreground">{album.release_year}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    {results.projects.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Music2 className="w-3.5 h-3.5" /> Proyectos
                        </h3>
                        <div className="space-y-1">
                          {results.projects.slice(0, 3).map((project) => (
                            <Link
                              key={project.id}
                              href={`/proyectos/${project.slug}`}
                              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/20 transition"
                              onClick={() => { setIsSearchOpen(false); setSearchTerm(''); }}
                            >
                              <div className="w-8 h-8 rounded bg-neutral-900 flex items-center justify-center flex-shrink-0">
                                <Music2 className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{project.title}</p>
                                <p className="text-xs text-muted-foreground">{project.category}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    {results.tracks.length === 0 && results.albums.length === 0 && results.projects.length === 0 && !loading && searchTerm.length >= 2 && (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No se encontraron resultados para "{searchTerm}"
                      </p>
                    )}
                    {searchTerm.length < 2 && !loading && (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Escribe al menos 2 caracteres para buscar
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isMenuOpen && (
          <div className="px-3 pb-3">
            <div className="flex flex-wrap items-center justify-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-[58px] ${
                      isActive(item.href)
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}