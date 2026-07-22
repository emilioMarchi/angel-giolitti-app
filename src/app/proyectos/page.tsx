'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Clapperboard, 
  Calendar, 
  ArrowLeft, 
  PlayCircle, 
  ExternalLink, 
  Video,
  Music,
  ImageIcon,
  FileText,
  Download,
  Play,
  Pause,
  Disc3,
  Camera
} from 'lucide-react';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { getR2Url } from '@/lib/utils';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  creation_year: number;
  end_year?: number | null;
  profile_image_url?: string | null;
  cover_image_url?: string | null;
  summary: string;
  description_markdown: string;
  main_video_url: string;
  created_at: string;
}

// Datos Mock (Fallback en caso de que la DB esté vacía)
const mockProjects: Project[] = [
  {
    id: 'p-1',
    title: 'Sesión en Vivo: Estudios Ámbar',
    slug: 'sesion-en-vivo-estudios-ambar',
    category: 'Live Session',
    creation_year: 2025,
    summary: 'Grabación en directo de "Horizonte Infinito" con sintetizadores analógicos y visuales reactivas.',
    description_markdown: 'Una sesión íntima grabada en los Estudios Ámbar, donde exploramos la improvisación sobre secuencias pregrabadas. Contó con la participación de artistas visuales invitados que manipularon luz en tiempo real.',
    main_video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder URL
    created_at: '2025-10-15T10:00:00Z',
    cover_image_url: null,
    profile_image_url: null
  },
  {
    id: 'p-2',
    title: 'Documental: Sonidos de la Ciudad',
    slug: 'documental-sonidos-ciudad',
    category: 'Documental',
    creation_year: 2024,
    summary: 'Exploración del paisaje sonoro urbano y su integración en la música electrónica contemporánea.',
    description_markdown: 'Cortometraje documental que narra el proceso de recolección de *field recordings* (grabaciones de campo) en la ciudad de Buenos Aires y cómo estos ruidos se transforman en texturas musicales.',
    main_video_url: 'https://player.vimeo.com/video/100902001', // Placeholder URL
    created_at: '2024-05-20T10:00:00Z',
    cover_image_url: null,
    profile_image_url: null
  },
  {
    id: 'p-3',
    title: 'Videoclip: Ciudad Nocturna',
    slug: 'videoclip-ciudad-nocturna',
    category: 'Videoclip',
    creation_year: 2026,
    summary: 'Video oficial del sencillo "Ciudad Nocturna", dirigido por Martín Castro.',
    description_markdown: 'Una pieza audiovisual inmersiva que acompaña el ritmo frenético y oscuro del track "Ciudad Nocturna". Filmado íntegramente de noche con iluminación de neón.',
    main_video_url: 'https://www.youtube.com/embed/jNQXAC9IVRw', // Placeholder URL
    created_at: '2026-06-10T10:00:00Z',
    cover_image_url: null,
    profile_image_url: null
  }
];

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados para detalles relacionados
  const [projectAlbums, setProjectAlbums] = useState<any[]>([]);
  const [projectGalleries, setProjectGalleries] = useState<any[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Estados para Lightbox de imágenes del proyecto
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<any[]>([]);
  
  // Extraemos Zustand para el reproductor de audio global
  const { playTrack, playQueue, currentTrack, isPlaying, togglePlay, setPlaying } = usePlayerStore();

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('creation_year', { ascending: false });

        if (!error && data && data.length > 0) {
          const sanitized = data.map((p: any) => ({
            ...p,
            cover_image_url: getR2Url(p.cover_image_url),
            profile_image_url: getR2Url(p.profile_image_url)
          }));
          setProjects(sanitized);
        }
      } catch (err) {
        console.error('Error fetching projects, using mocks:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);



  // Carga de datos relacionados cuando se selecciona un proyecto
  useEffect(() => {
    if (!selectedProject) {
      setProjectAlbums([]);
      setProjectGalleries([]);
      setProjectDocuments([]);
      setLightboxSlides([]);
      return;
    }

    const projectId = selectedProject.id;

    async function fetchProjectDetails() {
      try {
        setLoadingDetails(true);
        
        // 1. Cargar álbumes vinculados con sus canciones
        const { data: albumsData, error: albErr } = await supabase
          .from('albums')
          .select('*, tracks(*)')
          .eq('project_id', projectId)
          .order('release_year', { ascending: false });
          
        if (!albErr && albumsData) {
          // Ordenar las canciones de cada álbum por track_order
          const sortedAlbums = albumsData.map(album => ({
            ...album,
            cover_url: getR2Url(album.cover_url),
            tracks: album.tracks ? album.tracks.map((t: any) => ({
              ...t,
              audio_url: getR2Url(t.audio_url)
            })).sort((a: any, b: any) => (a.track_order || 1) - (b.track_order || 1)) : []
          }));
          setProjectAlbums(sortedAlbums);
        }

        // 2. Cargar galerías de fotos vinculadas y sus fotos
        const { data: galleriesData, error: galErr } = await supabase
          .from('media_albums')
          .select('*, media_items(*)')
          .eq('project_id', projectId);
          
        if (!galErr && galleriesData) {
          // Sanitizar URLs de los items de galerías
          const sanitizedGalleries = galleriesData.map(gallery => ({
            ...gallery,
            cover_image_url: getR2Url(gallery.cover_image_url),
            media_items: gallery.media_items ? gallery.media_items.map((item: any) => ({
              ...item,
              url: getR2Url(item.url)
            })) : []
          }));
          setProjectGalleries(sanitizedGalleries);
          
          // Aplanar todos los media_items de las galerías para el lightbox general del proyecto
          const allSlides = sanitizedGalleries.reduce((acc: any[], gallery: any) => {
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
        }

        // 3. Cargar documentos/partituras vinculados
        const { data: docsData, error: docErr } = await supabase
          .from('artist_documents')
          .select('*')
          .eq('project_id', projectId);
          
        if (!docErr && docsData) {
          const sanitizedDocs = docsData.map(doc => ({
            ...doc,
            file_url: getR2Url(doc.file_url)
          }));
          setProjectDocuments(sanitizedDocs);
        }

      } catch (err) {
        console.error('Error fetching project details:', err);
      } finally {
        setLoadingDetails(false);
      }
    }

    fetchProjectDetails();
  }, [selectedProject]);

  // Función para manejar el clic en play del video (asegura que la música de fondo se pause)
  const handleVideoPlay = () => {
    if (isPlaying) {
      togglePlay();
    }
  };

  // Convertidor simple de URL normal a URL Embed (si es necesario)
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    return url; // Asume que ya viene en formato embed o es Vimeo
  };

  // Formato duración de audio (segundos -> mm:ss)
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayTrack = (track: any, album: any) => {
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
    
    // Mapeamos el tracklist completo de este álbum para que continúe la cola
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

  if (selectedProject) {
    return (
      <div className="music-detail-view px-6 py-6 animate-fade-in pb-24">
        {/* Botón de volver */}
        <button 
          onClick={() => setSelectedProject(null)}
          className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-white transition-colors font-semibold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a proyectos
        </button>

        {/* Cabecera del Proyecto con imagen */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8 max-w-5xl">
          {/* Imagen del proyecto */}
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden bg-muted shadow-2xl flex-shrink-0 border border-white/10">
            {selectedProject.cover_image_url || selectedProject.profile_image_url ? (
              <img 
                src={selectedProject.profile_image_url || selectedProject.cover_image_url || ''} 
                alt={selectedProject.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-zinc-800">
                <Clapperboard className="h-12 w-12 text-primary/40" />
              </div>
            )}
          </div>

          {/* Info del proyecto */}
          <div className="flex-1">
            <span className="text-xs uppercase font-bold tracking-widest text-primary mb-2 block">
              {selectedProject.category}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 leading-tight">
              {selectedProject.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground font-medium">
              <span className="text-white">Ángel Giolitti</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {selectedProject.creation_year}</span>
              {selectedProject.end_year && (
                <>
                  <span>—</span>
                  <span>{selectedProject.end_year}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reproductor de Video Embebido */}
        {selectedProject.main_video_url && (
          <div className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-white/10 mb-10 relative group">
             {/* Overlay hint to pause audio if playing */}
             <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white/80 flex items-center gap-2">
                  <PlayCircle className="h-3 w-3" /> El video pausará la música automáticamente
                </p>
             </div>
            <iframe
              className="w-full h-full"
              src={getEmbedUrl(selectedProject.main_video_url)}
              title={selectedProject.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleVideoPlay} // Pausamos el audio de la SPA cuando el iframe carga/se interactúa
            ></iframe>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl">
          {/* Información Detallada / Columna Izquierda */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-white">Acerca de este proyecto</h2>
              <p className="text-lg text-white/90 leading-relaxed mb-6 font-medium">
                {selectedProject.summary}
              </p>
              <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed max-w-none text-base">
                <p>{selectedProject.description_markdown}</p>
              </div>
            </div>

            {/* Música / Álbumes vinculados */}
            {projectAlbums.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <Music className="h-6 w-6 text-primary" /> Música del Proyecto
                </h3>
                <div className="space-y-8">
                  {projectAlbums.map(album => (
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
                          <p className="text-xs text-muted-foreground">{album.release_year} · Álbum</p>
                        </div>
                      </div>

                      {/* Lista de tracks */}
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

          {/* Galerías y Documentos / Columna Derecha */}
          <div className="space-y-8">
            {/* Galería vinculada */}
            {projectGalleries.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <ImageIcon className="h-5 w-5 text-primary" /> Galería de Fotos
                </h3>
                
                {projectGalleries.map((gallery: any) => (
                  <div key={gallery.id} className="space-y-3">
                    <h4 className="text-sm font-bold text-white/80">{gallery.title}</h4>
                    {gallery.media_items && gallery.media_items.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {gallery.media_items.slice(0, 6).map((item: any, index: number) => (
                          <div 
                            key={item.id}
                            onClick={() => {
                              // Calcular index real en allSlides
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

            {/* Documentos del proyecto */}
            {projectDocuments.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                  <FileText className="h-5 w-5 text-primary" /> Documentos y Partituras
                </h3>
                <div className="space-y-2">
                  {projectDocuments.map((doc: any) => (
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

        {/* Lightbox para fotos del proyecto */}
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

  return (
    <div className="projects-tab-view px-6 py-6 pb-24">
      {/* Banner / Header superior */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
          <Clapperboard className="h-9 w-9 text-primary animate-pulse" />
          Proyectos
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Explora las bandas, sesiones en vivo, documentales y colaboraciones de Ángel Giolitti.
        </p>
      </div>

      {/* Grid de Proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="group relative overflow-hidden rounded-xl bg-card border border-white/5 hover:bg-card/70 hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col h-full"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-zinc-800 to-black w-full relative flex items-center justify-center overflow-hidden">
              {project.cover_image_url ? (
                <img 
                  src={project.cover_image_url} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <Video className="h-12 w-12 text-white/20 group-hover:text-primary/50 transition-colors duration-300" />
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-primary text-black rounded-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl">
                  <PlayCircle className="h-8 w-8" />
                </div>
              </div>

              {/* Badge de Categoría */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                  {project.category}
                </span>
              </div>
            </div>

            {/* Contenido Card */}
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
                {project.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                {project.summary}
              </p>
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground/80 mt-auto pt-4 border-t border-white/5">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {project.creation_year}</span>
                <span className="flex items-center gap-1 hover:text-white transition-colors">
                  Ver detalle <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
