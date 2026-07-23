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
    <div className="music-detail-view px-6 py-6 animate-fade-in pb-24">
      <Link
        href="/proyectos"
        className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-white transition-colors font-semibold text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a proyectos
      </Link>

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8 max-w-5xl">
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
                <span>{project.end_year}</span>
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
        </div>
      </div>

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