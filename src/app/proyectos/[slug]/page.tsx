'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getR2Url } from '@/lib/utils';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import {
  Play,
  Pause,
  Disc3,
  Music,
  ImageIcon,
  FileText,
  ArrowLeft,
  Calendar,
  Clapperboard,
  Video,
  ExternalLink,
  Download,
  PlayCircle,
} from 'lucide-react';

const SpotifyIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/>
  </svg>
);

import { usePlayerStore, Track } from '@/store/usePlayerStore';

interface ProjectDB {
  id: string;
  title: string;
  slug: string;
  category: string;
  creation_year: number;
  end_year: number | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  summary: string;
  description_markdown: string;
  main_video_url: string;
  members: Array<{ name: string; roll: string[] }>;
  social_links: Record<string, string>;
  created_at: string;
}

interface ProjectAlbum {
  id: string;
  title: string;
  slug: string;
  type: string;
  release_year: number;
  cover_url: string | null;
  tracks: any[];
}

interface GalleryItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  caption: string | null;
}

interface ProjectGallery {
  id: string;
  title: string;
  cover_image_url: string | null;
  media_items: GalleryItem[];
}

interface ProjectDocument {
  id: string;
  title: string;
  file_url: string;
}

interface ProjectView {
  id: string;
  title: string;
  slug: string;
  category: string;
  creation_year: number;
  end_year: number | null;
  profile_image_url: string | null;
  cover_image_url: string | null;
  summary: string;
  description_markdown: string;
  main_video_url: string;
  members: Array<{ name: string; roll: string[] }>;
  social_links: Record<string, string>;
  albums: ProjectAlbum[];
  galleries: ProjectGallery[];
  documents: ProjectDocument[];
}

function getEmbedUrl(url: string) {
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  return url;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { playTrack, playQueue, currentTrack, isPlaying, togglePlay, setPlaying } = usePlayerStore();
  const [project, setProject] = useState<ProjectView | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('slug', slug)
          .single();

        if (!error && data) {
          const dbProject = data as ProjectDB;

          // Fetch albums
          const { data: albumsData } = await supabase
            .from('albums')
            .select('*, tracks(*)')
            .eq('project_id', dbProject.id)
            .order('release_year', { ascending: false });

          const albums = (albumsData || []).map((album: any) => ({
            ...album,
            cover_url: getR2Url(album.cover_url),
            tracks: (album.tracks || [])
              .map((t: any) => ({
                ...t,
                audio_url: getR2Url(t.audio_url),
              }))
              .sort((a: any, b: any) => (a.track_order || 1) - (b.track_order || 1)),
          }));

          // Fetch galleries
          const { data: galleriesData } = await supabase
            .from('media_albums')
            .select('*, media_items(*)')
            .eq('project_id', dbProject.id);

          const galleries = (galleriesData || []).map((gallery: any) => ({
            ...gallery,
            cover_image_url: getR2Url(gallery.cover_image_url),
            media_items: (gallery.media_items || []).map((item: any) => ({
              ...item,
              url: getR2Url(item.url),
            })),
          }));

          // Build lightbox slides
          const allSlides = galleries.reduce((acc: any[], gallery: any) => {
            if (gallery.media_items) {
              const slides = gallery.media_items.map((item: any) => {
                if (item.type === 'video') {
                  return {
                    src: item.url,
                    alt: item.caption || 'Video',
                    _type: 'youtube' as const,
                    embedUrl: getEmbedUrl(item.url),
                  };
                }
                return { src: item.url, alt: item.caption || 'Foto' };
              });
              return [...acc, ...slides];
            }
            return acc;
          }, []);
          setLightboxSlides(allSlides);

          // Fetch documents
          const { data: docsData } = await supabase
            .from('artist_documents')
            .select('*')
            .eq('project_id', dbProject.id);

          const documents = (docsData || []).map((doc: any) => ({
            ...doc,
            file_url: getR2Url(doc.file_url),
          }));

          setProject({
            id: dbProject.id,
            title: dbProject.title,
            slug: dbProject.slug,
            category: dbProject.category,
            creation_year: dbProject.creation_year,
            end_year: dbProject.end_year,
            profile_image_url: getR2Url(dbProject.profile_image_url),
            cover_image_url: getR2Url(dbProject.cover_image_url),
            summary: dbProject.summary,
            description_markdown: dbProject.description_markdown,
            main_video_url: dbProject.main_video_url,
            members: dbProject.members || [],
            social_links: dbProject.social_links || {},
            albums,
            galleries,
            documents,
          });
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchProject();
  }, [slug]);

  const handlePlayTrack = (track: any, album: ProjectAlbum) => {
    const storeTrack: Track = {
      id: track.id,
      album_id: track.album_id,
      title: track.title,
      audio_url: track.audio_url,
      duration_seconds: track.duration_seconds,
      track_order: track.track_order,
      album_title: album.title,
      cover_url: album.cover_url || undefined,
    };

    const queue = album.tracks.map((t: any) => ({
      id: t.id,
      album_id: t.album_id,
      title: t.title,
      audio_url: t.audio_url,
      duration_seconds: t.duration_seconds,
      track_order: t.track_order,
      album_title: album.title,
      cover_url: album.cover_url || undefined,
    }));

    playTrack(storeTrack, queue);
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  if (notFound || !project) {
    return (
      <div className="music-detail-view px-6 py-6 pb-24">
        <Link
          href="/proyectos"
          className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-white transition-colors font-semibold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a proyectos
        </Link>
        <div className="text-center py-20 text-muted-foreground">
          <Clapperboard className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-lg font-medium">Proyecto no encontrado</p>
          <p className="text-sm mt-1">El proyecto que buscás no existe o fue removido.</p>
        </div>
      </div>
    );
  }

  const handleVideoPlay = () => {
    if (isPlaying) {
      togglePlay();
    }
  };

  return (
    <div className="music-detail-view animate-fade-in pb-24">
      {project.cover_image_url ? (
        <div className="relative w-full h-32 md:h-48 overflow-hidden mb-6">
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <Link
            href="/proyectos"
            className="absolute top-4 left-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors font-semibold text-sm bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>
      ) : (
        <div className="px-6 pt-6">
          <Link
            href="/proyectos"
            className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-white transition-colors font-semibold text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a proyectos
          </Link>
        </div>
      )}

      <div className="px-6 flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20 relative z-10 mb-8 max-w-5xl">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden bg-muted shadow-2xl flex-shrink-0 border border-white/10">
          {project.cover_image_url || project.profile_image_url ? (
            <img
              src={project.profile_image_url || project.cover_image_url || ''}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-zinc-800">
              <Clapperboard className="h-12 w-12 text-primary/40" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <span className="text-xs uppercase font-bold tracking-widest text-primary mb-2 block">
            {project.category}
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 leading-tight">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {project.creation_year}</span>
            {project.end_year && (
              <>
                <span>—</span>
                <span>{project.slug === 'handangel' ? 'Actualidad' : project.end_year}</span>
              </>
            )}
          </div>
          {project.members && project.members.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-white/70">Integrantes:</span>
              {project.members.map((m, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="text-white/90">{m.name}</span>
                  {m.roll && m.roll.length > 0 && (
                    <span className="text-muted-foreground/70 text-xs">({m.roll.join(', ')})</span>
                  )}
                  {i < project.members.length - 1 && <span className="text-muted-foreground/50">·</span>}
                </span>
              ))}
            </div>
          )}

          {project.social_links && Object.entries(project.social_links).some(([, url]) => url) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {project.social_links.spotify && (
                <a
                  href={project.social_links.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[#1DB954] transition-colors flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10"
                  aria-label="Spotify"
                >
                  <SpotifyIcon />
                </a>
              )}
              {project.social_links.twitter && (
                <a
                  href={project.social_links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[#1DA1F2] transition-colors flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10"
                  aria-label="Twitter"
                >
                  <TwitterIcon />
                </a>
              )}
              {project.social_links.youtube && (
                <a
                  href={project.social_links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[#FF0000] transition-colors flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10"
                  aria-label="YouTube"
                >
                  <YoutubeIcon />
                </a>
              )}
              {project.social_links.facebook && (
                <a
                  href={project.social_links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[#1877F2] transition-colors flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
              )}
              {project.social_links.instagram && (
                <a
                  href={project.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-[#E4405F] transition-colors flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-6">
      {project.main_video_url && (
        <div className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-white/10 mb-10 relative group">
          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white/80 flex items-center gap-2">
              <PlayCircle className="h-3 w-3" /> El video pausará la música automáticamente
            </p>
          </div>
          <iframe
            className="w-full h-full"
            src={getEmbedUrl(project.main_video_url)}
            title={project.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleVideoPlay}
          ></iframe>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl">
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-white">Acerca de este proyecto</h2>
            <p className="text-lg text-white/90 leading-relaxed mb-6 font-medium">
              {project.summary}
            </p>
            <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed max-w-none text-base">
              <p>{project.description_markdown}</p>
            </div>
          </div>

          {project.albums.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <Music className="h-6 w-6 text-primary" /> Música del Proyecto
              </h3>
              <div className="space-y-8">
                {project.albums.map((album) => (
                  <div key={album.id} className="bg-card/50 rounded-xl p-5 border border-white/5 space-y-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                        {album.cover_url ? (
                          <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                        ) : (
                          <Disc3 className="w-full h-full text-muted-foreground/30 p-2 animate-spin-slow" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{album.title}</h4>
                        <p className="text-xs text-muted-foreground">{album.release_year} · {album.type}</p>
                      </div>
                    </div>

                    <div className="divide-y divide-white/5">
                      {album.tracks && album.tracks.length > 0 ? (
                        album.tracks.map((track: any, index: number) => {
                          const isCurrent = currentTrack?.id === track.id;
                          return (
                            <div
                              key={track.id}
                              onClick={() => isCurrent ? togglePlay() : handlePlayTrack(track, album)}
                              className={`flex items-center justify-between py-2.5 px-3 rounded hover:bg-white/5 transition-colors cursor-pointer group/row ${isCurrent ? 'bg-white/5' : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-4 text-right">
                                  {isCurrent && isPlaying ? (
                                    <span className="flex items-end gap-[2px] h-3 w-3 pb-[1px] justify-center">
                                      <span className="bg-primary h-2 w-[2px] animate-bounce-slow" />
                                      <span className="bg-primary h-3 w-[2px] animate-bounce-slow [animation-delay:0.15s]" />
                                      <span className="bg-primary h-1.5 w-[2px] animate-bounce-slow [animation-delay:0.3s]" />
                                    </span>
                                  ) : (
                                    index + 1
                                  )}
                                </span>
                                <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-primary' : 'text-white/90'}`}>
                                  {track.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">{formatDuration(track.duration_seconds)}</span>
                                <button className="text-muted-foreground group-hover/row:text-white transition-colors">
                                  {isCurrent && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground py-2 pl-3">No hay canciones registradas en este álbum.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {project.galleries.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <ImageIcon className="h-5 w-5 text-primary" /> Galería de Fotos
              </h3>

              {project.galleries.map((gallery: any) => (
                <div key={gallery.id} className="space-y-3">
                  <h4 className="text-sm font-bold text-white/80">{gallery.title}</h4>
                  {gallery.media_items && gallery.media_items.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {gallery.media_items.slice(0, 6).map((item: any, index: number) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            const sliceIndex = lightboxSlides.findIndex(s => s.src === item.url);
                            setLightboxIndex(sliceIndex >= 0 ? sliceIndex : 0);
                            setLightboxOpen(true);
                          }}
                          className="aspect-square rounded-md overflow-hidden bg-muted cursor-pointer relative group/img border border-white/5"
                        >
                          <img
                            src={item.type === 'video' ? `https://img.youtube.com/vi/${item.url.includes('embed/') ? item.url.split('/').pop() : item.url.split('v=').pop()}/hqdefault.jpg` : item.url}
                            alt={item.caption || 'Galería'}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                          />
                          {item.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="h-5 w-5 text-white" fill="currentColor" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Esta galería no contiene imágenes.</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {project.documents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <FileText className="h-5 w-5 text-primary" /> Documentos y Partituras
              </h3>
              <div className="space-y-2">
                {project.documents.map((doc: any) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-white/5 hover:border-primary/30 transition-all group/doc"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground group-hover/doc:text-primary transition-colors" />
                      <span className="text-sm font-semibold text-white/90 truncate max-w-[180px]">
                        {doc.title}
                      </span>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground group-hover/doc:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
        styles={{ container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' } }}
        render={{
          slide: ({ slide }) => {
            const s = slide as any;
            if ('_type' in s && s._type === 'youtube') {
              return (
                <div className="flex h-full w-full items-center justify-center p-4 md:p-8">
                  <iframe
                    className="aspect-video w-full max-w-5xl rounded-lg shadow-2xl"
                    src={s.embedUrl}
                    title={s.alt || 'Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            }
            return undefined;
          },
        }}
        on={{
          view: ({ index }) => {
            const slide = lightboxSlides[index];
            if (slide && '_type' in slide && slide._type === 'youtube') {
              if (isPlaying) setPlaying(false);
            }
          },
        }}
      />
    </div>
  );
}