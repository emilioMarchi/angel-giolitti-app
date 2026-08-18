'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Music,
  Play,
  Heart,
  Eye,
  Loader2,
  TrendingUp,
  Disc3,
  Search,
  ArrowUpDown,
  Flame,
  Globe,
  CalendarDays,
  Video,
  Image as ImageIcon,
  FileText,
  Plus,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

type TabType = 'dashboard' | 'musica' | 'eventos' | 'proyectos' | 'galeria' | 'bio';

interface TrackDetail {
  id: string;
  title: string;
  play_count: number;
  likes_count: number;
  duration_seconds: number;
  album_id: string;
  album_title: string;
  album_type: string;
  cover_url: string;
}

interface AlbumDetail {
  id: string;
  title: string;
  type: string;
  release_year: number;
  cover_url: string;
  total_plays: number;
  total_likes: number;
  track_count: number;
}

interface PageViewDetail {
  path: string;
  views_count: number;
}

interface GlobalStats {
  totalTracks: number;
  totalAlbums: number;
  totalPlays: number;
  totalLikes: number;
  totalViews: number;
  totalEvents: number;
  totalProjects: number;
  totalGalleryAlbums: number;
}

export default function AdminDashboard({ onNavigate }: { onNavigate?: (tab: TabType) => void }) {
  const [stats, setStats] = useState<GlobalStats>({
    totalTracks: 0, totalAlbums: 0, totalPlays: 0, totalLikes: 0,
    totalViews: 0, totalEvents: 0, totalProjects: 0, totalGalleryAlbums: 0,
  });
  const [topTracks, setTopTracks] = useState<TrackDetail[]>([]);
  const [albumStats, setAlbumStats] = useState<AlbumDetail[]>([]);
  const [pageViews, setPageViews] = useState<PageViewDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'resumen' | 'canciones' | 'lanzamientos' | 'trafico'>('resumen');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'plays' | 'likes' | 'engagement'>('plays');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tracksRes, albumsRes, eventsRes, projectsRes, galleryRes] = await Promise.all([
        supabase.from('tracks').select('id, title, play_count, likes_count, duration_seconds, album_id, albums(title, type, cover_url)'),
        supabase.from('albums').select('id, title, type, release_year, cover_url'),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('media_albums').select('id', { count: 'exact', head: true }),
      ]);

      const tracks = tracksRes.data || [];
      const albums = albumsRes.data || [];

      let views: PageViewDetail[] = [];
      let totalViews = 0;
      try {
        const { data: viewsData, error: viewsError } = await supabase
          .from('page_views')
          .select('path, views_count');

        if (!viewsError && viewsData) {
          views = viewsData.map((v: any) => ({
            path: v.path,
            views_count: v.views_count || 0
          }));
          totalViews = views.reduce((s, v) => s + v.views_count, 0);
        }
      } catch (err) {
        console.warn('La tabla page_views no pudo ser consultada.', err);
      }

      const totalPlays = tracks.reduce((s, t) => s + (t.play_count || 0), 0);
      const totalLikes = tracks.reduce((s, t) => s + (t.likes_count || 0), 0);

      setStats({
        totalTracks: tracks.length,
        totalAlbums: albums.length,
        totalPlays,
        totalLikes,
        totalViews,
        totalEvents: eventsRes.count || 0,
        totalProjects: projectsRes.count || 0,
        totalGalleryAlbums: galleryRes.count || 0,
      });

      const enrichedTracks: TrackDetail[] = tracks.map((t: any) => ({
        id: t.id,
        title: t.title,
        play_count: t.play_count || 0,
        likes_count: t.likes_count || 0,
        duration_seconds: t.duration_seconds || 0,
        album_id: t.album_id,
        album_title: t.albums?.title || 'Sin Álbum',
        album_type: t.albums?.type || 'album',
        cover_url: t.albums?.cover_url || '',
      })).sort((a, b) => b.play_count - a.play_count);

      setTopTracks(enrichedTracks);

      const albumMap: Record<string, AlbumDetail> = {};
      albums.forEach((a: any) => {
        albumMap[a.id] = {
          id: a.id, title: a.title, type: a.type,
          release_year: a.release_year, cover_url: a.cover_url || '',
          total_plays: 0, total_likes: 0, track_count: 0
        };
      });

      tracks.forEach((t: any) => {
        if (t.album_id && albumMap[t.album_id]) {
          albumMap[t.album_id].total_plays += t.play_count || 0;
          albumMap[t.album_id].total_likes += t.likes_count || 0;
          albumMap[t.album_id].track_count += 1;
        }
      });

      setAlbumStats(Object.values(albumMap).sort((a, b) => b.total_plays - a.total_plays));
      setPageViews(views.sort((a, b) => b.views_count - a.views_count));

    } catch (err) {
      console.error('Error cargando métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEngagementRate = (likes: number, plays: number) => {
    if (plays === 0) return 0;
    return Math.round((likes / plays) * 1000) / 10;
  };

  const getFriendlyPathName = (path: string) => {
    if (path === '/') return 'Inicio';
    if (path === '/musica') return 'Música';
    if (path === '/eventos') return 'Eventos';
    if (path === '/proyectos') return 'Proyectos';
    if (path === '/galeria') return 'Galería';
    if (path === '/bio') return 'Bio & Dossier';
    if (path.startsWith('/musica/')) {
      const slug = path.replace('/musica/', '');
      return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return path;
  };

  const sortedAndFilteredTracks = [...topTracks]
    .filter(track =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.album_title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === 'plays') { valA = a.play_count; valB = b.play_count; }
      else if (sortBy === 'likes') { valA = a.likes_count; valB = b.likes_count; }
      else if (sortBy === 'engagement') {
        valA = getEngagementRate(a.likes_count, a.play_count);
        valB = getEngagementRate(b.likes_count, b.play_count);
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

  const handleSort = (field: 'plays' | 'likes' | 'engagement') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getPlaysByType = () => {
    let albumPlays = 0;
    let epPlays = 0;
    let singlePlays = 0;

    albumStats.forEach(a => {
      if (a.type === 'album') albumPlays += a.total_plays;
      else if (a.type === 'ep') epPlays += a.total_plays;
      else if (a.type === 'single') singlePlays += a.total_plays;
    });

    const total = albumPlays + epPlays + singlePlays || 1;
    return {
      album: { plays: albumPlays, pct: Math.round((albumPlays / total) * 100) },
      ep: { plays: epPlays, pct: Math.round((epPlays / total) * 100) },
      single: { plays: singlePlays, pct: Math.round((singlePlays / total) * 100) },
    };
  };

  const playDist = getPlaysByType();
  const maxPlaysTrack = topTracks.length > 0 ? topTracks[0].play_count || 1 : 1;
  const maxViewsPage = pageViews.length > 0 ? pageViews[0].views_count || 1 : 1;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
        <p className="text-white/30 text-xs">Cargando métricas...</p>
      </div>
    );
  }

  const quickActions = [
    { label: 'Subir música', description: 'Nuevo álbum, EP o single', icon: Music, tab: 'musica' as TabType, color: 'text-emerald-400' },
    { label: 'Crear evento', description: 'Agendar un show', icon: CalendarDays, tab: 'eventos' as TabType, color: 'text-blue-400' },
    { label: 'Nuevo proyecto', description: 'Videoclip o banda', icon: Video, tab: 'proyectos' as TabType, color: 'text-purple-400' },
    { label: 'Subir fotos', description: 'Galería fotográfica', icon: ImageIcon, tab: 'galeria' as TabType, color: 'text-amber-400' },
    { label: 'Editar bio', description: 'Perfil y redes', icon: FileText, tab: 'bio' as TabType, color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">Resumen</h1>
          <p className="text-white/35 text-sm mt-0.5">Vista general de tu plataforma y acciones rápidas.</p>
        </div>
        <button
          onClick={fetchAll}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-white/40 hover:text-white/60 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar
        </button>
      </div>

      {/* Acciones Rápidas */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider">Acciones rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.tab}
                onClick={() => onNavigate?.(action.tab)}
                className="group flex flex-col gap-2 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer text-left"
              >
                <Icon className={`w-4 h-4 ${action.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                <div>
                  <p className="text-xs font-medium text-white/70 group-hover:text-white/90 transition-colors">{action.label}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Reproducciones" value={stats.totalPlays} icon={Play} highlight />
        <KpiCard label="Canciones" value={stats.totalTracks} icon={Music} />
        <KpiCard label="Me Gusta" value={stats.totalLikes} icon={Heart} />
        <KpiCard label="Visitas" value={stats.totalViews} icon={Eye} />
      </div>

      {/* Contadores secundarios */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MiniStat label="Lanzamientos" value={stats.totalAlbums} />
        <MiniStat label="Eventos" value={stats.totalEvents} />
        <MiniStat label="Proyectos" value={stats.totalProjects} />
        <MiniStat label="Álbumes foto" value={stats.totalGalleryAlbums} />
      </div>

      {/* Tabs de métricas */}
      <div className="flex gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.06] w-fit">
        {(['resumen', 'canciones', 'lanzamientos', 'trafico'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize cursor-pointer ${
              activeTab === tab
                ? 'bg-white/[0.08] text-white/90'
                : 'text-white/35 hover:text-white/55'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* VISTA: RESUMEN */}
      {activeTab === 'resumen' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Distribución */}
          <div className="lg:col-span-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/70">Escuchas por tipo</h3>
              <span className="text-[10px] text-white/25">Proporción de reproducciones</span>
            </div>

            <div className="h-2 w-full rounded-full bg-white/[0.06] flex overflow-hidden">
              <div className="bg-white/60 hover:bg-white/70 transition-colors" style={{ width: `${playDist.album.pct}%` }} title={`Álbumes: ${playDist.album.pct}%`} />
              <div className="bg-teal-500/60 hover:bg-teal-500/80 transition-colors" style={{ width: `${playDist.ep.pct}%` }} title={`EPs: ${playDist.ep.pct}%`} />
              <div className="bg-emerald-400/60 hover:bg-emerald-400/80 transition-colors" style={{ width: `${playDist.single.pct}%` }} title={`Singles: ${playDist.single.pct}%`} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <DistItem color="bg-white/60" label="Álbumes" plays={playDist.album.plays} pct={playDist.album.pct} />
              <DistItem color="bg-teal-500/60" label="EPs" plays={playDist.ep.plays} pct={playDist.ep.pct} />
              <DistItem color="bg-emerald-400/60" label="Singles" plays={playDist.single.plays} pct={playDist.single.pct} />
            </div>
          </div>

          {/* Top Canciones */}
          <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/70">Top 5 canciones</h3>
              <button onClick={() => setActiveTab('canciones')} className="text-[10px] text-white/30 hover:text-white/50 font-medium cursor-pointer">
                Ver todas →
              </button>
            </div>

            {topTracks.length === 0 ? (
              <p className="text-xs text-white/25 py-6 text-center">Sin datos aún.</p>
            ) : (
              <div className="space-y-2.5">
                {topTracks.slice(0, 5).map((track, i) => {
                  const pct = maxPlaysTrack > 0 ? Math.max(3, Math.round((track.play_count / maxPlaysTrack) * 100)) : 3;
                  return (
                    <div key={track.id} className="flex items-center gap-3 group">
                      <span className="text-[10px] font-bold text-white/20 w-4 text-right tabular-nums">{i + 1}</span>
                      {track.cover_url ? (
                        <img src={track.cover_url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-white/[0.04] flex items-center justify-center shrink-0">
                          <Music className="w-3.5 h-3.5 text-white/15" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-white/70 truncate group-hover:text-white/90 transition-colors">{track.title}</span>
                          <span className="text-[10px] text-white/30 shrink-0 tabular-nums font-medium">{track.play_count.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                          <div className="h-full bg-white/20 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Páginas populares */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/70">Tráfico</h3>
              <button onClick={() => setActiveTab('trafico')} className="text-[10px] text-white/30 hover:text-white/50 font-medium cursor-pointer">
                Ver todo →
              </button>
            </div>

            {pageViews.length === 0 ? (
              <p className="text-xs text-white/25 py-6 text-center">Sin datos de tráfico.</p>
            ) : (
              <div className="space-y-3">
                {pageViews.slice(0, 5).map((view) => {
                  const pct = maxViewsPage > 0 ? Math.max(3, Math.round((view.views_count / maxViewsPage) * 100)) : 3;
                  return (
                    <div key={view.path} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-white/50 truncate max-w-[140px]">{getFriendlyPathName(view.path)}</span>
                        <span className="text-white/25 tabular-nums">{view.views_count.toLocaleString('es-AR')}</span>
                      </div>
                      <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500/30 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA: CANCIONES */}
      {activeTab === 'canciones' && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white/70">Catálogo</h3>
                <span className="text-[10px] bg-white/[0.06] text-white/40 px-2 py-0.5 rounded-full font-medium">{topTracks.length}</span>
              </div>
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.06] rounded-lg text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/15"
                />
              </div>
            </div>

            <div className="flex gap-1.5">
              {(['plays', 'likes', 'engagement'] as const).map(field => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-md border transition-all cursor-pointer ${
                    sortBy === field
                      ? 'bg-white/[0.08] border-white/[0.12] text-white/70'
                      : 'bg-transparent border-white/[0.06] text-white/25 hover:text-white/40'
                  }`}
                >
                  {field === 'plays' ? 'Plays' : field === 'likes' ? 'Likes' : 'Fidelidad'}
                  {sortBy === field && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {sortedAndFilteredTracks.length === 0 ? (
              <div className="py-10 text-center text-xs text-white/25">Sin resultados.</div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">#</th>
                    <th className="text-left px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Canción</th>
                    <th className="text-left px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider hidden md:table-cell">Lanzamiento</th>
                    <th className="text-right px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider hidden sm:table-cell">Dur.</th>
                    <th className="text-right px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider cursor-pointer hover:text-white/40" onClick={() => handleSort('plays')}>Plays</th>
                    <th className="text-right px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider cursor-pointer hover:text-white/40" onClick={() => handleSort('likes')}>Likes</th>
                    <th className="text-right px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider cursor-pointer hover:text-white/40 hidden lg:table-cell" onClick={() => handleSort('engagement')}>Fidelidad</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredTracks.map((track, i) => {
                    const engagement = getEngagementRate(track.likes_count, track.play_count);
                    return (
                      <tr key={track.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 py-2.5 text-white/20 tabular-nums">{i + 1}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {track.cover_url ? (
                              <img src={track.cover_url} alt="" className="w-7 h-7 rounded object-cover shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded bg-white/[0.04] shrink-0 flex items-center justify-center">
                                <Music className="w-3 h-3 text-white/15" />
                              </div>
                            )}
                            <span className="font-medium text-white/60 truncate max-w-[180px] group-hover:text-white/80 transition-colors">{track.title}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 hidden md:table-cell">
                          <span className="text-white/30 truncate max-w-[120px] block">{track.album_title}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right text-white/20 tabular-nums hidden sm:table-cell">{formatDuration(track.duration_seconds)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-white/60">{track.play_count.toLocaleString('es-AR')}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-white/30">{track.likes_count.toLocaleString('es-AR')}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums hidden lg:table-cell">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            engagement >= 15 ? 'bg-emerald-500/10 text-emerald-400/80' :
                            engagement >= 5 ? 'bg-white/[0.04] text-white/40' : 'text-white/20'
                          }`}>
                            {engagement}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* VISTA: LANZAMIENTOS */}
      {activeTab === 'lanzamientos' && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white/70">Lanzamientos</h3>
            <span className="text-[10px] bg-white/[0.06] text-white/40 px-2 py-0.5 rounded-full font-medium">{albumStats.length}</span>
          </div>

          <div className="overflow-x-auto">
            {albumStats.length === 0 ? (
              <div className="py-10 text-center text-xs text-white/25">Sin lanzamientos.</div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Lanzamiento</th>
                    <th className="text-left px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Tipo</th>
                    <th className="text-right px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider hidden sm:table-cell">Tracks</th>
                    <th className="text-right px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Plays</th>
                    <th className="text-right px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider hidden sm:table-cell">Likes</th>
                    <th className="text-right px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider hidden md:table-cell">Participación</th>
                  </tr>
                </thead>
                <tbody>
                  {albumStats.map((album) => {
                    const totalPlaysGlobal = stats.totalPlays || 1;
                    const pctPlays = Math.round((album.total_plays / totalPlaysGlobal) * 100);
                    return (
                      <tr key={album.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {album.cover_url ? (
                              <img src={album.cover_url} alt="" className="w-7 h-7 rounded object-cover shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded bg-white/[0.04] shrink-0 flex items-center justify-center">
                                <Disc3 className="w-3 h-3 text-white/15" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-white/60 truncate max-w-[160px] group-hover:text-white/80 transition-colors">{album.title}</p>
                              <p className="text-[10px] text-white/20">{album.release_year}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${
                            album.type === 'album' ? 'bg-white/[0.06] text-white/40' :
                            album.type === 'ep' ? 'bg-teal-500/10 text-teal-400/70' :
                            'bg-emerald-500/10 text-emerald-400/70'
                          }`}>{album.type}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right text-white/30 tabular-nums hidden sm:table-cell">{album.track_count}</td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-white/60">{album.total_plays.toLocaleString('es-AR')}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-white/30 hidden sm:table-cell">{album.total_likes.toLocaleString('es-AR')}</td>
                        <td className="px-4 py-2.5 hidden md:table-cell">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[10px] text-white/25 tabular-nums w-6 text-right">{pctPlays}%</span>
                            <div className="h-1 w-16 bg-white/[0.04] rounded-full overflow-hidden">
                              <div className="h-full bg-white/15 rounded-full" style={{ width: `${pctPlays}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* VISTA: TRÁFICO */}
      {activeTab === 'trafico' && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white/70">Vistas por página</h3>
            <span className="text-[10px] bg-white/[0.06] text-white/40 px-2 py-0.5 rounded-full font-medium">{pageViews.length} rutas</span>
          </div>

          {pageViews.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-xs text-white/30">Sin registros de visitas todavía.</p>
              <p className="text-[10px] text-white/15 max-w-sm mx-auto leading-relaxed">
                Asegúrate de ejecutar el SQL de la tabla `page_views` en Supabase. Las visitas se registran cuando los usuarios navegan el sitio.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Página</th>
                    <th className="text-left px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider hidden sm:table-cell">Ruta</th>
                    <th className="text-right px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Vistas</th>
                    <th className="text-right px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider hidden sm:table-cell">% Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pageViews.map((view) => {
                    const totalViewsCalc = stats.totalViews || 1;
                    const pct = Math.round((view.views_count / totalViewsCalc) * 100);
                    return (
                      <tr key={view.path} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 py-2.5">
                          <span className="font-medium text-white/50 group-hover:text-white/70 transition-colors">{getFriendlyPathName(view.path)}</span>
                        </td>
                        <td className="px-3 py-2.5 text-white/20 font-mono hidden sm:table-cell">{view.path}</td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-white/60">{view.views_count.toLocaleString('es-AR')}</td>
                        <td className="px-4 py-2.5 hidden sm:table-cell">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[10px] text-white/25 tabular-nums w-6 text-right">{pct}%</span>
                            <div className="h-1 w-16 bg-white/[0.04] rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500/30 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  highlight = false
}: {
  icon: any;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      highlight
        ? 'bg-white/[0.04] border-white/[0.1]'
        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.03]'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/25">{label}</span>
        <Icon className={`w-3.5 h-3.5 ${highlight ? 'text-white/40' : 'text-white/15'}`} />
      </div>
      <p className={`text-2xl font-bold tabular-nums tracking-tight ${highlight ? 'text-white/80' : 'text-white/60'}`}>
        {value.toLocaleString('es-AR')}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/[0.04] bg-white/[0.01]">
      <span className="text-[10px] text-white/25 font-medium">{label}</span>
      <span className="text-xs font-semibold text-white/45 tabular-nums">{value}</span>
    </div>
  );
}

function DistItem({ color, label, plays, pct }: { color: string; label: string; plays: number; pct: number }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${color} shrink-0`} />
        <span className="text-[11px] font-medium text-white/45">{label}</span>
      </div>
      <div className="text-right">
        <p className="text-[11px] font-semibold text-white/50 tabular-nums">{plays.toLocaleString('es-AR')}</p>
        <p className="text-[9px] text-white/20">{pct}%</p>
      </div>
    </div>
  );
}
