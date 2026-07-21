'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Clapperboard, Calendar, ArrowLeft, PlayCircle, ExternalLink, Video } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  creation_year: number;
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
    created_at: '2025-10-15T10:00:00Z'
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
    created_at: '2024-05-20T10:00:00Z'
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
    created_at: '2026-06-10T10:00:00Z'
  }
];

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Extraemos actions de Zustand para pausar la música al reproducir video
  const { isPlaying, togglePlay } = usePlayerStore();

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('creation_year', { ascending: false });

        if (!error && data && data.length > 0) {
          setProjects(data);
        }
      } catch (err) {
        console.error('Error fetching projects, using mocks:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Función para manejar el clic en play (asegura que la música de fondo se pause)
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

        {/* Cabecera del Proyecto */}
        <div className="mb-8 max-w-4xl">
          <span className="text-xs uppercase font-bold tracking-widest text-primary mb-2 block">
            {selectedProject.category}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
            {selectedProject.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <span className="text-white">Ángel Giolitti</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {selectedProject.creation_year}</span>
          </div>
        </div>

        {/* Reproductor de Video Embebido */}
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
            onLoad={handleVideoPlay} // Pausamos el audio de la SPA cuando el iframe carga/se interactúa (limitado por seguridad iframe, pero es un fallback útil)
          ></iframe>
        </div>

        {/* Información Detallada */}
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Acerca de este proyecto</h2>
          <p className="text-lg text-white/90 leading-relaxed mb-6 font-medium">
            {selectedProject.summary}
          </p>
          <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed max-w-none">
            {/* Aquí en un caso real se renderizaría Markdown (ej. con react-markdown), por ahora lo pasamos crudo o simple */}
            <p>{selectedProject.description_markdown}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-tab-view px-6 py-6 pb-24">
      {/* Banner / Header superior */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
          <Clapperboard className="h-9 w-9 text-primary animate-pulse" />
          Proyectos Audiovisuales
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Explora videoclips oficiales, sesiones en vivo, documentales y colaboraciones transmedia de Ángel Giolitti.
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
            {/* Thumbnail Placeholder (Video Icon) */}
            <div className="aspect-video bg-gradient-to-br from-zinc-800 to-black w-full relative flex items-center justify-center overflow-hidden">
              <Video className="h-12 w-12 text-white/20 group-hover:text-primary/50 transition-colors duration-300" />
              
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
