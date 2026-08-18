'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Music, Loader2, AlertCircle, ArrowLeft, Disc3 } from 'lucide-react';
import FileUploadZone from './FileUploadZone';

interface Album {
  id: string;
  title: string;
  slug: string;
  type: 'album' | 'single' | 'ep';
  release_year: number;
  cover_url: string;
  description: string;
  project_id: string | null;
}

interface Project {
  id: string;
  title: string;
}

interface Track {
  id: string;
  album_id: string;
  title: string;
  slug: string;
  audio_url: string;
  duration_seconds: number;
  track_order: number;
  play_count: number;
  likes_count: number;
}

export default function AdminMusica() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'album-form' | 'tracks-editor'>('list');

  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumType, setAlbumType] = useState<'album' | 'single' | 'ep'>('album');
  const [albumYear, setAlbumYear] = useState<number>(new Date().getFullYear());
  const [albumDesc, setAlbumDesc] = useState('');
  const [albumCoverUrl, setAlbumCoverUrl] = useState('');
  const [albumProjectId, setAlbumProjectId] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [savingAlbum, setSavingAlbum] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackOrder, setNewTrackOrder] = useState(1);
  const [newTrackAudioFile, setNewTrackAudioFile] = useState<File | null>(null);
  const [savingTrack, setSavingTrack] = useState(false);

  useEffect(() => {
    fetchAlbums();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .order('title', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('release_year', { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (err: any) {
      console.error('Error fetching albums:', err);
      setErrorMessage('No se pudieron cargar los lanzamientos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTracks = async (albumId: string) => {
    setLoadingTracks(true);
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('album_id', albumId)
        .order('track_order', { ascending: true });

      if (error) throw error;
      setTracks(data || []);
      setNewTrackOrder((data?.length || 0) + 1);
    } catch (err: any) {
      console.error('Error fetching tracks:', err);
    } finally {
      setLoadingTracks(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Compresión fallida en Canvas'));
            },
            'image/webp',
            0.85
          );
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const audio = new Audio();
      audio.src = objectUrl;
      audio.addEventListener('loadedmetadata', () => {
        resolve(Math.round(audio.duration));
        URL.revokeObjectURL(objectUrl);
      });
      audio.addEventListener('error', () => {
        resolve(0);
        URL.revokeObjectURL(objectUrl);
      });
    });
  };

  const uploadToR2 = async (file: File | Blob, originalName: string, folder: string): Promise<string> => {
    const filename = originalName;
    const contentType = file.type;

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch('/api/r2/presign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ filename, contentType, folder }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Fallo en la firma de URL');
    }

    const { uploadUrl, publicUrl } = await response.json();

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error('Fallo al subir archivo a Cloudflare R2');
    }

    return publicUrl;
  };

  const handleNewAlbum = () => {
    setSelectedAlbum(null);
    setAlbumTitle('');
    setAlbumType('album');
    setAlbumYear(new Date().getFullYear());
    setAlbumDesc('');
    setAlbumCoverUrl('');
    setAlbumProjectId('');
    setCoverFile(null);
    setErrorMessage('');
    setView('album-form');
  };

  const handleEditAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setAlbumTitle(album.title);
    setAlbumType(album.type);
    setAlbumYear(album.release_year);
    setAlbumDesc(album.description || '');
    setAlbumCoverUrl(album.cover_url || '');
    setAlbumProjectId(album.project_id || '');
    setCoverFile(null);
    setErrorMessage('');
    setView('album-form');
  };

  const handleManageTracks = (album: Album) => {
    setSelectedAlbum(album);
    fetchTracks(album.id);
    setView('tracks-editor');
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim()) return;

    setSavingAlbum(true);
    setErrorMessage('');

    try {
      let finalCoverUrl = albumCoverUrl;

      if (coverFile) {
        const compressedBlob = await compressImage(coverFile);
        const nameWebp = `${generateSlug(albumTitle)}.webp`;
        finalCoverUrl = await uploadToR2(compressedBlob, nameWebp, 'covers');
      }

      const albumData = {
        title: albumTitle,
        slug: generateSlug(albumTitle),
        type: albumType,
        release_year: albumYear,
        description: albumDesc,
        cover_url: finalCoverUrl,
        project_id: albumProjectId || null,
      };

      if (selectedAlbum) {
        const { error } = await supabase
          .from('albums')
          .update(albumData)
          .eq('id', selectedAlbum.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('albums')
          .insert([albumData]);

        if (error) throw error;
      }

      await fetchAlbums();
      setView('list');
    } catch (err: any) {
      console.error('Error saving album:', err);
      setErrorMessage(err.message || 'Error al guardar el lanzamiento.');
    } finally {
      setSavingAlbum(false);
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm('¿Estás seguro de eliminar este lanzamiento? Esto borrará también todas sus canciones.')) return;

    try {
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId);

      if (error) throw error;
      setAlbums(albums.filter(a => a.id !== albumId));
    } catch (err: any) {
      console.error('Error deleting album:', err);
      alert('Error al intentar eliminar.');
    }
  };

  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum || !newTrackTitle.trim() || !newTrackAudioFile) return;

    setSavingTrack(true);
    try {
      const duration = await getAudioDuration(newTrackAudioFile);

      const extension = newTrackAudioFile.name.split('.').pop() || 'mp3';
      const cleanTrackName = `${generateSlug(newTrackTitle)}.${extension}`;
      const audioUrl = await uploadToR2(newTrackAudioFile, cleanTrackName, 'tracks');

      const trackData = {
        album_id: selectedAlbum.id,
        title: newTrackTitle,
        slug: generateSlug(newTrackTitle),
        audio_url: audioUrl,
        duration_seconds: duration,
        track_order: newTrackOrder,
      };

      const { error } = await supabase
        .from('tracks')
        .insert([trackData]);

      if (error) throw error;

      setNewTrackTitle('');
      setNewTrackAudioFile(null);
      
      await fetchTracks(selectedAlbum.id);
    } catch (err: any) {
      console.error('Error saving track:', err);
      alert('Error al subir la pista de audio.');
    } finally {
      setSavingTrack(false);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta pista?')) return;

    try {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId);

      if (error) throw error;
      setTracks(tracks.filter(t => t.id !== trackId));
    } catch (err: any) {
      console.error('Error deleting track:', err);
      alert('Error al eliminar pista.');
    }
  };

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      album: 'bg-white/[0.06] text-white/40',
      ep: 'bg-teal-500/10 text-teal-400/70',
      single: 'bg-emerald-500/10 text-emerald-400/70',
    };
    return styles[type] || styles.album;
  };

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
              <h1 className="text-2xl font-bold tracking-tight text-white/90">Música</h1>
              <p className="text-white/35 text-sm mt-0.5">Administra tus álbumes, EPs y singles.</p>
            </div>
            <button
              onClick={handleNewAlbum}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Lanzamiento
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
              <p className="text-white/30 text-xs">Cargando lanzamientos...</p>
            </div>
          ) : albums.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-dashed border-white/[0.08]">
              <Music className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No tienes lanzamientos cargados todavía.</p>
              <button onClick={handleNewAlbum} className="text-white/50 hover:text-white/70 text-xs font-medium mt-2 cursor-pointer transition-colors">
                Carga tu primer lanzamiento →
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      <th className="text-left px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Lanzamiento</th>
                      <th className="text-left px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Tipo</th>
                      <th className="text-left px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider hidden sm:table-cell">Año</th>
                      <th className="text-right px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {albums.map((album) => (
                      <tr key={album.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {album.cover_url ? (
                              <img src={album.cover_url} alt="" className="w-9 h-9 rounded object-cover shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded bg-white/[0.04] flex items-center justify-center shrink-0">
                                <Disc3 className="w-4 h-4 text-white/15" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-white/70 truncate max-w-[200px] group-hover:text-white/90 transition-colors">{album.title}</p>
                              {album.description && (
                                <p className="text-[10px] text-white/20 truncate max-w-[200px] mt-0.5">{album.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${getTypeBadge(album.type)}`}>{album.type}</span>
                        </td>
                        <td className="px-3 py-3 text-white/30 hidden sm:table-cell">{album.release_year}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleManageTracks(album)}
                              className="px-2.5 py-1 text-[10px] font-medium rounded-md bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/70 transition-all cursor-pointer"
                            >
                              Canciones
                            </button>
                            <button
                              onClick={() => handleEditAlbum(album)}
                              className="p-1.5 rounded-md text-white/25 hover:bg-white/[0.06] hover:text-white/50 transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAlbum(album.id)}
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

      {view === 'album-form' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold tracking-tight text-white/90">
                {selectedAlbum ? 'Editar Lanzamiento' : 'Nuevo Lanzamiento'}
              </h2>
              <button onClick={() => setView('list')} className="p-1.5 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAlbum} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Título del Lanzamiento</label>
                <input
                  type="text"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  placeholder="Ej: Populares, Mi Destino, etc."
                  required
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Tipo</label>
                  <select
                    value={albumType}
                    onChange={(e: any) => setAlbumType(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none focus:border-white/20 transition-colors"
                  >
                    <option value="album">Álbum Completo</option>
                    <option value="ep">EP</option>
                    <option value="single">Single / Sencillo</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Año de Lanzamiento</label>
                  <input
                    type="number"
                    value={albumYear}
                    onChange={(e) => setAlbumYear(parseInt(e.target.value) || new Date().getFullYear())}
                    required
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Proyecto Relacionado (Opcional)</label>
                <select
                  value={albumProjectId}
                  onChange={(e: any) => setAlbumProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none focus:border-white/20 transition-colors"
                >
                  <option value="">Ninguno</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                <p className="text-[10px] text-white/20">
                  Vincula este lanzamiento a un proyecto audiovisual/banda.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Descripción (Opcional)</label>
                <textarea
                  value={albumDesc}
                  onChange={(e) => setAlbumDesc(e.target.value)}
                  placeholder="Información o reseña sobre este disco..."
                  className="w-full min-h-20 px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors resize-y"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/50 block">Imagen de Portada</label>
                <div className="flex flex-col md:flex-row items-stretch gap-4">
                  <div className="w-28 h-28 bg-white/[0.03] rounded-lg overflow-hidden flex items-center justify-center border border-white/[0.06] shrink-0">
                    {coverFile ? (
                      <img src={URL.createObjectURL(coverFile)} alt="Preview" className="w-full h-full object-cover" />
                    ) : albumCoverUrl ? (
                      <img src={albumCoverUrl} alt="Actual" className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-8 h-8 text-white/10" />
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <FileUploadZone
                      accept="image/*"
                      type="image"
                      selectedFile={coverFile}
                      onFileSelect={(file) => setCoverFile(file)}
                      placeholderText="Haz clic para seleccionar o arrastra la portada del disco"
                      helperText="Formatos recomendados: JPG, PNG. La portada se comprimirá automáticamente en formato WebP liviano."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  disabled={savingAlbum}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all cursor-pointer disabled:opacity-40"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingAlbum}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {savingAlbum ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Lanzamiento'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {view === 'tracks-editor' && selectedAlbum && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="p-1.5 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white/90">Canciones</h1>
              <p className="text-white/35 text-sm mt-0.5">
                Lanzamiento: <span className="text-white/60 font-medium">{selectedAlbum.title}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider">Lista de Reproducción</h3>
                <span className="text-[10px] bg-white/[0.06] text-white/40 px-2 py-0.5 rounded-full font-medium">{tracks.length}</span>
              </div>

              {loadingTracks ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                </div>
              ) : tracks.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-white/[0.08]">
                  <Music className="w-8 h-8 text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-white/25">Sin pistas de audio. Carga una canción desde el panel derecho.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden divide-y divide-white/[0.04]">
                  {tracks.map((track) => (
                    <div key={track.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[10px] font-bold text-white/20 w-4 text-right tabular-nums">
                          {track.track_order}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white/60 truncate group-hover:text-white/80 transition-colors">{track.title}</p>
                          <span className="text-[10px] text-white/20">
                            {formatDuration(track.duration_seconds)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTrack(track.id)}
                        className="p-1.5 rounded-md text-white/15 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider">Cargar Nueva Canción</h3>
              <form onSubmit={handleSaveTrack} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Título de la Pista</label>
                  <input
                    type="text"
                    value={newTrackTitle}
                    onChange={(e) => setNewTrackTitle(e.target.value)}
                    placeholder="Ej: Solo en la Noche"
                    required
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Número de Orden</label>
                  <input
                    type="number"
                    value={newTrackOrder}
                    onChange={(e) => setNewTrackOrder(parseInt(e.target.value) || 1)}
                    min={1}
                    required
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50 block">Archivo de Audio (MP3)</label>
                  <FileUploadZone
                    accept="audio/mp3,audio/mpeg"
                    type="audio"
                    selectedFile={newTrackAudioFile}
                    onFileSelect={(file) => setNewTrackAudioFile(file)}
                    placeholderText="Haz clic para seleccionar o arrastra el archivo MP3"
                    helperText="Solo se admiten archivos MP3. La duración se detectará automáticamente."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  disabled={savingTrack}
                >
                  {savingTrack ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Subiendo archivo a R2...
                    </>
                  ) : (
                    <>
                      <Music className="w-3.5 h-3.5" />
                      Añadir a Disco
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
