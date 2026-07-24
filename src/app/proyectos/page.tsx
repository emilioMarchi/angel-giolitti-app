'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  FolderOpen, 
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
  members: Array<{ name: string; roll: string[] }>;
  created_at: string;
}

const mockProjects: Project[] = [
  {
    id: 'p-1',
    title: 'Sesión en Vivo: Estudios Ámbar',
    slug: 'sesion-en-vivo-estudios-ambar',
    category: 'Live Session',
    creation_year: 2025,
    summary: 'Grabación en directo de "Horizonte Infinito" con sintetizadores analógicos y visuales reactivas.',
    description_markdown: 'Una sesión íntima grabada en los Estudios Ámbar, donde exploramos la improvisación sobre secuencias pregrabadas. Contó con la participación de artistas visuales invitados que manipularon luz en tiempo real.',
    main_video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    created_at: '2025-10-15T10:00:00Z',
    cover_image_url: null,
    profile_image_url: null,
    members: []
  },
  {
    id: 'p-2',
    title: 'Documental: Sonidos de la Ciudad',
    slug: 'documental-sonidos-ciudad',
    category: 'Documental',
    creation_year: 2024,
    summary: 'Exploración del paisaje sonoro urbano y su integración en la música electrónica contemporánea.',
    description_markdown: 'Cortometraje documental que narra el proceso de recolección de *field recordings* (grabaciones de campo) en la ciudad de Buenos Aires y cómo estos ruidos se transforman en texturas musicales.',
    main_video_url: 'https://player.vimeo.com/video/100902001',
    created_at: '2024-05-20T10:00:00Z',
    cover_image_url: null,
    profile_image_url: null,
    members: []
  },
  {
    id: 'p-3',
    title: 'Videoclip: Ciudad Nocturna',
    slug: 'videoclip-ciudad-nocturna',
    category: 'Videoclip',
    creation_year: 2026,
    summary: 'Video oficial del sencillo "Ciudad Nocturna", dirigido por Martín Castro.',
    description_markdown: 'Una pieza audiovisual inmersiva que acompaña el ritmo frenético y oscuro del track "Ciudad Nocturna". Filmado íntegramente de noche con iluminación de neón.',
    main_video_url: 'https://www.youtube.com/embed/jNQXAC9IVRw',
    created_at: '2026-06-10T10:00:00Z',
    cover_image_url: null,
    profile_image_url: null,
    members: []
  }
];

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [loading, setLoading] = useState(true);

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
          sanitized.sort((a: any, b: any) => {
            const yearA = a.end_year || a.creation_year;
            const yearB = b.end_year || b.creation_year;
            return yearB - yearA;
          });
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

  if (loading) {
    return (
      <div className="projects-tab-view px-6 py-6 pb-24">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
            <FolderOpen className="h-9 w-9 text-primary animate-pulse" />
            Proyectos
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Explora las bandas, sesiones en vivo, documentales y colaboraciones de Ángel Giolitti.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="group relative overflow-hidden rounded-xl bg-card border border-white/5 hover:bg-card/70 hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col h-full animate-pulse">
              <div className="aspect-video bg-gradient-to-br from-zinc-800 to-black w-full" />
              <div className="p-5 flex flex-col flex-grow">
                <div className="h-8 bg-white/5 rounded mb-4" />
                <div className="h-4 bg-white/5 rounded mb-2 w-3/4" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="projects-tab-view px-6 py-6 pb-24">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
          <FolderOpen className="h-9 w-9 text-primary animate-pulse" />
          Proyectos
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Explora las bandas, sesiones en vivo, documentales y colaboraciones de Ángel Giolitti.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/proyectos/${project.slug}`}
            className="group relative overflow-hidden rounded-xl bg-card border border-white/5 hover:bg-card/70 hover:border-primary/30 transition-all duration-300 flex flex-col h-full"
          >
            <div className="aspect-video bg-gradient-to-br from-zinc-800 to-black w-full relative flex items-center justify-center overflow-hidden">
              {project.cover_image_url ? (
                <img 
                  src={project.cover_image_url} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <FolderOpen className="h-12 w-12 text-white/20 group-hover:text-primary/50 transition-colors duration-300" />
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-primary text-black rounded-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl">
                  <PlayCircle className="h-8 w-8" />
                </div>
              </div>

              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                  {project.category}
                </span>
              </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
                {project.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                {project.summary}
              </p>
              {project.members && project.members.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground/80">
                  <span className="font-medium text-white/60">Integrantes:</span>
                  {project.members.map((m: any, i: number) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="text-white/70">{m.name}</span>
                      {m.roll && m.roll.length > 0 && (
                        <span className="text-muted-foreground/60 text-[10px]">({m.roll.join(', ')})</span>
                      )}
                      {i < project.members.length - 1 && <span className="text-muted-foreground/40">·</span>}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground/80 mt-auto pt-4 border-t border-white/5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {project.end_year ? (
                    <>{project.creation_year} — {project.slug === 'handangel' ? 'Actualidad' : project.end_year}</>
                  ) : (
                    project.creation_year
                  )}
                </span>
                <span className="flex items-center gap-1 hover:text-white transition-colors">
                  Ver detalle <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}