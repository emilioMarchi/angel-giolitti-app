'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Image as ImageIcon,
  ArrowLeft,
  Play,
  Camera,
  Calendar,
  MapPin,
  Clock,
  Ticket,
  ExternalLink,
  Music,
  FileText,
  Heart,
  Globe,
  User,
  Download,
  MessageSquare,
  Send,
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

interface ArtistProfile {
  id: string;
  name: string;
  bio_short: string;
  bio_full: string;
  avatar_url: string;
  cover_url: string;
  monthly_listeners: number;
  location: string;
  website: string;
  instagram: string;
  twitter: string;
  youtube: string;
  spotify: string;
  soundcloud: string;
  bandcamp: string;
  dossier_pdf_url: string;
  cv_pdf_url: string;
  created_at: string;
  updated_at: string;
}

const mockProfile: ArtistProfile = {
  id: 'artist-1',
  name: 'Ángel Giolitti',
  bio_short: 'Productor, compositor y DJ de música electrónica experimental. Fusiona síntesis modular, field recordings y estructuras ambientales.',
  bio_full: `Ángel Giolitti es un artista sonoro, productor y compositor argentino cuya obra transita los límites entre la música electrónica experimental, el ambient y la improvisación libre.

Nacido en Buenos Aires, su formación musical comenzó con el piano clásico para luego derivar hacia la síntesis modular, el diseño de sonido y la programación creativa. Su práctica combina instrumentación analógica (Eurorack, sintetizadores vintage) con procesamiento digital en tiempo real, field recordings urbanos y naturales, y una sensibilidad compositiva que privilegia la textura, el espacio y la evolución orgánica de los timbres.

A lo largo de su carrera ha editado en sellos como **Modular Field**, **Kvitnu**, **Mono Records** y **Self-released**, y ha participado en festivales internacionales como **Mutek**, **Sónar**, **Unsound** y **CTM**. Sus presentaciones en vivo se caracterizan por ser performances inmersivas donde la música dialoga con visuales generativas y arquitectura lumínica.

Además de su faceta como solista, colabora regularmente con coreógrafos, directores de cine y artistas visuales, componiendo bandas sonoras y diseñando paisajes sonoros para instalaciones site-specific. Es docente de síntesis y producción electrónica en instituciones de Buenos Aires y dicta talleres internacionales sobre modular synthesis y live coding.

Su discografía incluye los álbumes *«Horizonte Infinito»* (2025), *«Ciudad Nocturna»* (2023), *«Estructuras de Luz»* (2021) y numerosos EPs y colaboraciones. Actualmente reside en Buenos Aires, donde dirige su estudio **Estudios Ámbar**, espacio dedicado a la grabación, experimentación y difusión de la música electrónica de vanguardia.`,
  avatar_url: '',
  cover_url: '',
  monthly_listeners: 12400,
  location: 'Buenos Aires, Argentina',
  website: 'https://angelgiolitti.com.ar',
  instagram: 'https://instagram.com/angelgiolitti',
  twitter: 'https://twitter.com/angelgiolitti',
  youtube: 'https://youtube.com/@angelgiolitti',
  spotify: 'https://open.spotify.com/artist/angelgiolitti',
  soundcloud: 'https://soundcloud.com/angelgiolitti',
  bandcamp: 'https://angelgiolitti.bandcamp.com',
  dossier_pdf_url: '',
  cv_pdf_url: '',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export default function BioPage() {
  const { isPlaying, setPlaying } = usePlayerStore();
  const [profile, setProfile] = useState<ArtistProfile>(mockProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('artist_profile')
          .select('*')
          .maybeSingle();

        if (!error && data) {
          setProfile(data as ArtistProfile);
        }
      } catch (err) {
        console.error('Error fetching profile, using mocks:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="bio-tab-view px-6 py-6 pb-24 animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-1/3 bg-white/5 rounded mb-8" />
          <div className="h-64 bg-white/5 rounded-lg mb-8" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-3/4 bg-white/5 rounded" />
            <div className="h-4 w-1/2 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const socialLinks = [
    { label: 'Instagram', href: profile.instagram, Icon: MessageSquare },
    { label: 'YouTube', href: profile.youtube, Icon: Send },
    { label: 'Spotify', href: profile.spotify, Icon: Music },
    { label: 'SoundCloud', href: profile.soundcloud, Icon: Globe },
  ].filter(s => s.href);

  return (
    <div className="bio-tab-view px-6 py-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Hero / Cabecera */}
        <section className="relative mb-12">
          {/* Cover Image */}
          <div className="relative w-full aspect-[16/5] md:aspect-[16/5] rounded-xl overflow-hidden">
            {profile.cover_url ? (
              <img
                src={profile.cover_url}
                alt={`${profile.name} - Cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 via-zinc-900 to-black flex items-center justify-center">
                <Music className="h-24 w-24 text-primary/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>

          {/* Info del artista - responsive layout */}
          <div className="relative z-10 px-6 md:px-0">
            {/* Mobile: stacked layout - below cover */}
            <div className="md:hidden flex flex-col items-center text-center gap-4 py-8 -mt-12 relative z-10">
              <div className="w-28 h-28 rounded-xl overflow-hidden border-4 border-background shadow-2xl bg-zinc-800 flex-shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-14 w-14 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="px-4">
                <h1 className="text-3xl font-black tracking-tight text-white">{profile.name}</h1>
                <div className="flex items-center justify-center gap-4 mt-2 text-muted-foreground text-sm flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" /> {profile.monthly_listeners.toLocaleString()} oyentes
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {profile.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop: overlay layout */}
            <div className="hidden md:block absolute bottom-0 left-6 -translate-y-1/2 flex items-end gap-4">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-background shadow-2xl bg-zinc-800 flex-shrink-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-14 w-14 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="pb-4 text-white">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">{profile.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" /> {profile.monthly_listeners.toLocaleString()} oyentes mensuales
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {profile.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bio Corta + Acciones */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 p-6 bg-card rounded-xl border border-white/5">
          <div className="flex-1">
            <p className="text-white/90 text-lg leading-relaxed">{profile.bio_short}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {profile.dossier_pdf_url && (
              <a
                href={profile.dossier_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors font-medium text-sm"
              >
                <FileText className="h-4 w-4" />
                Dossier de Prensa
              </a>
            )}
            {profile.cv_pdf_url && (
              <a
                href={profile.cv_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors font-medium text-sm"
              >
                <Download className="h-4 w-4" />
                Descargar CV
              </a>
            )}
          </div>
        </div>

        {/* Biografía Completa */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Biografía
          </h2>
          <div className="prose prose-invert prose-p:text-white/80 prose-p:leading-relaxed max-w-none text-base">
            {profile.bio_full.split('\n\n').map((paragraph, i) => (
              <p key={i} className="mb-6">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* Discografía Destacada */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Music className="h-6 w-6 text-primary" />
              Discografía Destacada
            </h2>
            <a href="/musica" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              Ver todo <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Horizonte Infinito', year: '2025', type: 'Álbum', cover: '' },
              { title: 'Ciudad Nocturna', year: '2023', type: 'Álbum', cover: '' },
              { title: 'Estructuras de Luz', year: '2021', type: 'Álbum', cover: '' },
              { title: 'Sesiones Ámbar Vol. 1', year: '2024', type: 'EP', cover: '' },
              { title: 'Field Recordings BA', year: '2022', type: 'EP', cover: '' },
              { title: 'Modular Dreams', year: '2020', type: 'Single', cover: '' },
            ].map((release, i) => (
              <Link
                key={i}
                href="/musica"
                className="group flex gap-4 p-4 bg-card rounded-xl border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all"
              >
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-zinc-800 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                  {release.cover ? (
                    <img src={release.cover} alt={release.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="h-8 w-8 text-primary/30" />
                  )}
                  <span className="absolute bottom-1 right-1 text-[10px] font-black uppercase text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                    {release.type}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white group-hover:text-primary transition-colors truncate">{release.title}</h3>
                  <p className="text-sm text-muted-foreground">{release.year} · {release.type}</p>
                </div>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors opacity-0 group-hover:opacity-100" aria-label="Reproducir">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </Link>
            ))}
          </div>
        </section>

        {/* Próximos Eventos */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Próximas Presentaciones
            </h2>
            <a href="/eventos" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              Ver agenda <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="space-y-3">
            {[
              { date: '15 Nov 2026', venue: 'Niceto Club', city: 'Buenos Aires', ticket: 'https://passline.com' },
              { date: '05 Dic 2026', venue: 'Centro Cultural San Martín', city: 'Buenos Aires', ticket: 'https://ticketek.com.ar' },
            ].map((event, i) => (
              <a
                key={i}
                href={event.ticket}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 bg-card rounded-xl border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all"
              >
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-zinc-800 flex flex-col items-center justify-center text-center flex-shrink-0">
                  <span className="text-2xl font-black text-white">{event.date.split(' ')[0]}</span>
                  <span className="text-[10px] uppercase font-bold text-primary">{event.date.split(' ')[1]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white group-hover:text-primary transition-colors">{event.venue}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {event.city}
                  </p>
                </div>
                <span className="px-4 py-2 rounded-full border border-primary/30 text-primary text-sm font-bold hover:bg-primary/10 transition-colors">
                  Entradas
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Redes Sociales */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Conectar
          </h2>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((social, i) => {
              const Icon = social.Icon;
              return (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-colors text-sm font-medium text-white"
                >
                  <Icon className="h-4 w-4" />
                  {social.label}
                </a>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-white/10 text-center text-muted-foreground text-sm">
          <p>Ángel Giolitti — Plataforma Oficial</p>
          <p className="mt-1">© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
}