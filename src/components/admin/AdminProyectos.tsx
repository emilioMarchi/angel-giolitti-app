'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Video, Loader2, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import FileUploadZone from './FileUploadZone';

interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  creation_year: number;
  end_year: number | null;
  cover_image_url: string;
  summary: string;
  main_video_url: string;
}

const CATEGORIES = [
  { value: 'banda', label: 'Banda' },
  { value: 'videoclip', label: 'Videoclip' },
  { value: 'live-session', label: 'Live Session' },
  { value: 'documental', label: 'Documental' },
  { value: 'proyecto', label: 'Proyecto' },
];

export default function AdminProyectos() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [albums, setAlbums] = useState<{ id: string; title: string }[]>([]);
  const [galleryAlbums, setGalleryAlbums] = useState<{ id: string; title: string }[]>([]);
  const [linkedAlbumIds, setLinkedAlbumIds] = useState<string[]>([]);
  const [linkedGalleryIds, setLinkedGalleryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selected, setSelected] = useState<Project | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('videoclip');
  const [creationYear, setCreationYear] = useState<number>(new Date().getFullYear());
  const [endYear, setEndYear] = useState('');
  const [summary, setSummary] = useState('');
  const [mainVideoUrl, setMainVideoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchAlbums();
    fetchGalleryAlbums();
  }, []);

  const fetchGalleryAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('media_albums')
        .select('id, title')
        .order('title', { ascending: true });
      if (error) throw error;
      setGalleryAlbums(data || []);
    } catch (err: any) {
      console.error('Error fetching gallery albums:', err);
    }
  };

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('id, title')
        .order('release_year', { ascending: false });
      if (error) throw error;
      setAlbums(data || []);
    } catch (err: any) {
      console.error('Error fetching albums:', err);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('creation_year', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      setErrorMessage('No se pudieron cargar los proyectos.');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) =>
    text.toString().toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '').replace(/--+/g, '-')
      .replace(/^-+/, '').replace(/-+$/, '');

  const compressImage = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_W = 900, MAX_H = 500;
          let w = img.width, h = img.height;
          if (w / h > MAX_W / MAX_H) { h = Math.round(h * MAX_W / w); w = MAX_W; }
          else { w = Math.round(w * MAX_H / h); h = MAX_H; }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          canvas.toBlob(b => b ? resolve(b) : reject(new Error('Fallo')), 'image/webp', 0.85);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const uploadToR2 = async (file: File | Blob, filename: string, folder: string): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const res = await fetch('/api/r2/presign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ filename, contentType: file.type, folder }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    const { uploadUrl, publicUrl } = await res.json();
    const up = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    if (!up.ok) throw new Error('Fallo al subir a R2');
    return publicUrl;
  };

  const handleNew = () => {
    setSelected(null); setTitle(''); setCategory('videoclip');
    setCreationYear(new Date().getFullYear()); setEndYear('');
    setSummary(''); setMainVideoUrl(''); setCoverUrl(''); setCoverFile(null);
    setLinkedAlbumIds([]); setLinkedGalleryIds([]);
    setErrorMessage(''); setView('form');
  };

  const handleEdit = async (p: Project) => {
    setSelected(p); setTitle(p.title); setCategory(p.category || 'videoclip');
    setCreationYear(p.creation_year); setEndYear(p.end_year?.toString() || '');
    setSummary(p.summary || ''); setMainVideoUrl(p.main_video_url || '');
    setCoverUrl(p.cover_image_url || ''); setCoverFile(null);
    const [albumsRes, galleryRes] = await Promise.all([
      supabase.from('albums').select('id').eq('project_id', p.id),
      supabase.from('media_albums').select('id').eq('project_id', p.id),
    ]);
    setLinkedAlbumIds((albumsRes.data || []).map((a: any) => a.id));
    setLinkedGalleryIds((galleryRes.data || []).map((g: any) => g.id));
    setErrorMessage(''); setView('form');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErrorMessage('');
    try {
      let finalCoverUrl = coverUrl;
      if (coverFile) {
        const blob = await compressImage(coverFile);
        finalCoverUrl = await uploadToR2(blob, `${generateSlug(title)}-cover.webp`, 'project-covers');
      }
      const data = {
        title, slug: generateSlug(title), category, creation_year: creationYear,
        end_year: endYear ? parseInt(endYear) : null,
        summary, main_video_url: mainVideoUrl, cover_image_url: finalCoverUrl,
      };
      let projectId = selected?.id || '';
      if (selected) {
        const { error } = await supabase.from('projects').update(data).eq('id', selected.id);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase.from('projects').insert([data]).select();
        if (error) throw error;
        projectId = inserted[0].id;
      }

      if (projectId) {
        const { data: current } = await supabase.from('albums').select('id').eq('project_id', projectId);
        const toUnlink = (current || []).filter((a: any) => !linkedAlbumIds.includes(a.id)).map((a: any) => a.id);
        if (toUnlink.length) {
          await supabase.from('albums').update({ project_id: null }).in('id', toUnlink);
        }
        if (linkedAlbumIds.length) {
          await supabase.from('albums').update({ project_id: projectId }).in('id', linkedAlbumIds);
        }
      }

      if (projectId) {
        const { data: currentGallery } = await supabase.from('media_albums').select('id').eq('project_id', projectId);
        const toUnlinkGallery = (currentGallery || []).filter((g: any) => !linkedGalleryIds.includes(g.id)).map((g: any) => g.id);
        if (toUnlinkGallery.length) {
          await supabase.from('media_albums').update({ project_id: null }).in('id', toUnlinkGallery);
        }
        if (linkedGalleryIds.length) {
          await supabase.from('media_albums').update({ project_id: projectId }).in('id', linkedGalleryIds);
        }
      }

      await fetchProjects(); setView('list');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este proyecto?')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(projects.filter(p => p.id !== id));
    } catch { alert('Error al eliminar.'); }
  };

  const getCategoryLabel = (value: string) => CATEGORIES.find(c => c.value === value)?.label || value;

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="px-3 py-2.5 text-xs text-red-400 bg-red-500/8 rounded-lg border border-red-500/15 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {errorMessage}
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white/90">Proyectos</h1>
              <p className="text-white/35 text-sm mt-0.5">Gestiona videoclips, bandas y producciones audiovisuales.</p>
            </div>
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Proyecto
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
              <p className="text-white/30 text-xs">Cargando proyectos...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-dashed border-white/[0.08]">
              <Video className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No hay proyectos cargados.</p>
              <button onClick={handleNew} className="text-white/50 hover:text-white/70 text-xs font-medium mt-2 cursor-pointer transition-colors">
                Crea el primero →
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      <th className="text-left px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Proyecto</th>
                      <th className="text-left px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider hidden sm:table-cell">Categoría</th>
                      <th className="text-left px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider hidden md:table-cell">Período</th>
                      <th className="text-right px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {project.cover_image_url ? (
                              <img src={project.cover_image_url} alt="" className="w-10 h-6 rounded object-cover shrink-0" />
                            ) : (
                              <div className="w-10 h-6 rounded bg-white/[0.04] flex items-center justify-center shrink-0">
                                <Video className="w-3.5 h-3.5 text-white/15" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-white/70 truncate max-w-[200px] group-hover:text-white/90 transition-colors">{project.title}</p>
                              {project.summary && (
                                <p className="text-[10px] text-white/20 truncate max-w-[200px] mt-0.5">{project.summary}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 hidden sm:table-cell">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-white/[0.06] text-white/40 capitalize">{getCategoryLabel(project.category)}</span>
                        </td>
                        <td className="px-3 py-3 text-white/30 hidden md:table-cell">
                          {project.creation_year}{project.end_year ? ` – ${project.end_year}` : ''}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {project.main_video_url && (
                              <a
                                href={project.main_video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-md text-white/25 hover:bg-white/[0.06] hover:text-white/50 transition-all cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => handleEdit(project)}
                              className="p-1.5 rounded-md text-white/25 hover:bg-white/[0.06] hover:text-white/50 transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(project.id)}
                              className="p-1.5 rounded-md text-white/25 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'form' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold tracking-tight text-white/90">
                {selected ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h2>
              <button onClick={() => setView('list')} className="p-1.5 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Título</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Handangel, Live at Teatro Colón" required
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Categoría</label>
                  <select value={category} onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none focus:border-white/20 transition-colors">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Año de Inicio</label>
                  <input type="number" value={creationYear} onChange={e => setCreationYear(parseInt(e.target.value))} required
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none focus:border-white/20 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Año de Cierre (Opcional)</label>
                  <input type="number" value={endYear} onChange={e => setEndYear(e.target.value)} placeholder="Vacío si activo"
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Resumen</label>
                <textarea value={summary} onChange={e => setSummary(e.target.value)}
                  placeholder="Breve descripción del proyecto..."
                  className="w-full min-h-20 px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors resize-y" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">URL de Video Principal (YouTube / Vimeo)</label>
                <input type="url" value={mainVideoUrl} onChange={e => setMainVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/50 block">Lanzamientos Vinculados (Opcional)</label>
                {albums.length === 0 ? (
                  <p className="text-[10px] text-white/20">Aún no hay lanzamientos cargados.</p>
                ) : (
                  <div className="max-h-36 overflow-y-auto border border-white/[0.06] rounded-lg p-3 space-y-1.5 bg-white/[0.02]">
                    {albums.map(album => (
                      <label key={album.id} className="flex items-center gap-2.5 cursor-pointer text-xs group">
                        <input
                          type="checkbox"
                          checked={linkedAlbumIds.includes(album.id)}
                          onChange={(e) => {
                            setLinkedAlbumIds(prev =>
                              e.target.checked
                                ? [...prev, album.id]
                                : prev.filter(id => id !== album.id)
                            );
                          }}
                          className="w-3.5 h-3.5 rounded cursor-pointer accent-white"
                        />
                        <span className="text-white/50 group-hover:text-white/70 transition-colors">{album.title}</span>
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-white/20">Selecciona los discos/singles que pertenecen a este proyecto.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/50 block">Galerías de Fotos Vinculadas (Opcional)</label>
                {galleryAlbums.length === 0 ? (
                  <p className="text-[10px] text-white/20">Aún no hay álbumes de fotos cargados.</p>
                ) : (
                  <div className="max-h-36 overflow-y-auto border border-white/[0.06] rounded-lg p-3 space-y-1.5 bg-white/[0.02]">
                    {galleryAlbums.map(g => (
                      <label key={g.id} className="flex items-center gap-2.5 cursor-pointer text-xs group">
                        <input
                          type="checkbox"
                          checked={linkedGalleryIds.includes(g.id)}
                          onChange={(e) => {
                            setLinkedGalleryIds(prev =>
                              e.target.checked
                                ? [...prev, g.id]
                                : prev.filter(id => id !== g.id)
                            );
                          }}
                          className="w-3.5 h-3.5 rounded cursor-pointer accent-white"
                        />
                        <span className="text-white/50 group-hover:text-white/70 transition-colors">{g.title}</span>
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-white/20">Asocia los álbumes fotográficos de este proyecto.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/50 block">Imagen de Portada</label>
                <div className="flex flex-col md:flex-row items-stretch gap-4">
                  <div className="w-36 h-20 bg-white/[0.03] rounded-lg overflow-hidden flex items-center justify-center border border-white/[0.06] shrink-0">
                    {coverFile ? (
                      <img src={URL.createObjectURL(coverFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : coverUrl ? (
                      <img src={coverUrl} alt="Portada actual" className="w-full h-full object-cover" />
                    ) : (
                      <Video className="w-7 h-7 text-white/10" />
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <FileUploadZone
                      accept="image/*"
                      type="image"
                      selectedFile={coverFile}
                      onFileSelect={file => setCoverFile(file)}
                      placeholderText="Haz clic para seleccionar o arrastra la portada"
                      helperText="Formato recomendado: 16:9 de buena resolución. Se optimizará automáticamente."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.06]">
                <button type="button" onClick={() => setView('list')} disabled={saving}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all cursor-pointer disabled:opacity-40">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
                  {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Guardando...</> : 'Guardar Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
