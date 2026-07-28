'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Users, Home, Search, Music2, FolderOpen, CalendarDays, Images, User } from 'lucide-react';
import { getR2Url } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { usePlayerStore } from '@/store/usePlayerStore';
import { incrementFollow, decrementFollow } from '@/lib/metrics';

const heroImages = [
  getR2Url('images/gallery/handangel/photo-0.webp'),
  getR2Url('images/gallery/handangel/photo-2.webp'),
  getR2Url('images/gallery/handangel/photo-3.webp'),
  getR2Url('images/gallery/handangel/photo-6.webp'),
];

export default function MobileHero() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [artistBio, setArtistBio] = useState('Músico · Compositor · Artista');
  const [followersCount, setFollowersCount] = useState(0);
  const pathname = usePathname();
  const playQueue = usePlayerStore((state) => state.playQueue);
  const popularTracks = usePlayerStore((state) => state.popularTracks);
  const isFollowing = usePlayerStore((state) => state.isFollowing);
  const toggleFollow = usePlayerStore((state) => state.toggleFollow);

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
          setFollowersCount((data as { followers_count: number }).followers_count || 0);
        }
      });
  }, []);

  useEffect(() => {
    setHeroIndex((prev) => (prev >= heroImages.length ? 0 : prev));
  }, [heroImages.length]);

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

      <div className="sticky top-0 z-40 flex items-center px-3 py-2.5 bg-[var(--sidebar)]/95 backdrop-blur-md">
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { href: '/', icon: Home, label: 'Inicio' },
            { href: '/buscar', icon: Search, label: 'Buscar' },
            { href: '/musica', icon: Music2, label: 'Música' },
            { href: '/proyectos', icon: FolderOpen, label: 'Proyectos' },
            { href: '/eventos', icon: CalendarDays, label: 'Eventos' },
            { href: '/galeria', icon: Images, label: 'Galería' },
            { href: '/bio', icon: User, label: 'Bio' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[58px] ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
