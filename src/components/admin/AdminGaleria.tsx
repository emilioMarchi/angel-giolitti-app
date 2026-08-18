'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Loader2, Upload, AlertCircle, ArrowLeft, FolderOpen, Image as ImageIcon } from 'lucide-react';
import FileUploadZone from './FileUploadZone';

interface MediaAlbum {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  project_id: string | null;
}

interface ProjectMeta { id: string; title: string; }

interface MediaItem {
  id: string;
  media_album_id: string;
  type: 'photo' | 'video';
  url: string;
  caption: string;
  item_order: number;
}

export default function AdminGaleria() {
  const [albums, setAlbums] = useState<MediaAlbum[]>([]);
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'album-form' | 'photos-editor'>('list');
  const [selectedAlbum, setSelectedAlbum] = useState<MediaAlbum | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDesc, setAlbumDesc] = useState('');
  const [albumCoverFile, setAlbumCoverFile] = useState<File | null>(null);
  const [albumCoverUrl, setAlbumCoverUrl] = useState('');
  const [linkedProjectId, setLinkedProjectId] = useState('');

  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => { fetchAlbums(); fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('id, title').order('title', { ascending: true });
      if (!error) setProjects(data || []);
    } catch { }
  };

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('media_albums').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setAlbums(data || []);
    } catch (err: any) {
      setErrorMessage('No se pudieron cargar los álbumes de galería.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async (albumId: string) => {
    setLoadingPhotos(true);
    try {
      const { data, error } = await supabase.from('media_items').select('*')
        .eq('media_album_id', albumId).order('item_order', { ascending: true });
      if (error) throw error;
      setPhotos(data || []);
    } catch { } finally { setLoadingPhotos(false); }
  };

  const generateSlug = (text: string) =>
    text.toString().toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '').replace(/--+/g, '-')
      .replace(/^-+/, '').replace(/-+$/, '');

  const compressImage = (file: File, maxW: number, maxH: number, quality = 0.85): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
          if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          canvas.toBlob(b => b ? resolve(b) : reject(new Error('Fallo')), 'image/webp', quality);
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
    await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    return publicUrl;
  };

  const handleNewAlbum = () => {
    setSelectedAlbum(null); setAlbumTitle(''); setAlbumDesc('');
    setAlbumCoverFile(null); setAlbumCoverUrl('');
    setLinkedProjectId('');
    setErrorMessage(''); setView('album-form');
  };

  const handleEditAlbum = (album: MediaAlbum) => {
    setSelectedAlbum(album);
    setAlbumTitle(album.title); setAlbumDesc(album.description || '');
    setAlbumCoverUrl(album.cover_image_url || ''); setAlbumCoverFile(null);
    setLinkedProjectId(album.project_id || '');
    setErrorMessage(''); setView('album-form');
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErrorMessage('');
    try {
      let finalCoverUrl = albumCoverUrl;
      if (albumCoverFile) {
        const blob = await compressImage(albumCoverFile, 800, 800);
        finalCoverUrl = await uploadToR2(blob, `${generateSlug(albumTitle)}-cover.webp`, 'gallery-covers');
      }
      const data = {
        title: albumTitle,
        slug: generateSlug(albumTitle),
        description: albumDesc,
        cover_image_url: finalCoverUrl,
        project_id: linkedProjectId || null,
      };
      if (selectedAlbum) {
        const { error } = await supabase.from('media_albums').update(data).eq('id', selectedAlbum.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('media_albums').insert([data]);
        if (error) throw error;
      }
      await fetchAlbums(); setView('list');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar.');
    } finally { setSaving(false); }
  };

  const handleOpenPhotos = (album: MediaAlbum) => {
    setSelectedAlbum(album);
    setSelectedFiles([]);
    fetchPhotos(album.id);
    setView('photos-editor');
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('¿Eliminar este álbum y todas sus fotos?')) return;
    try {
      const { error } = await supabase.from('media_albums').delete().eq('id', id);
      if (error) throw error;
      setAlbums(albums.filter(a => a.id !== id));
    } catch { alert('Error al eliminar.'); }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
      const { error } = await supabase.from('media_items').delete().eq('id', id);
      if (error) throw error;
      setPhotos(photos.filter(p => p.id !== id));
    } catch { alert('Error al eliminar la foto.'); }
  };

  const handleUploadPhotos = async () => {
    if (!selectedAlbum || selectedFiles.length === 0) return;
    setUploadingPhotos(true); setUploadProgress(0);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const blob = await compressImage(file, 1200, 900, 0.82);
        const fname = `${Date.now()}-${generateSlug(file.name.split('.')[0])}.webp`;
        const url = await uploadToR2(blob, fname, 'gallery');
        await supabase.from('media_items').insert([{
          media_album_id: selectedAlbum.id,
          type: 'photo',
          url,
          item_order: photos.length + i + 1,
        }]);
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }
      setSelectedFiles([]);
      await fetchPhotos(selectedAlbum.id);
    } catch (err: any) {
      alert('Error al subir fotos: ' + err.message);
    } finally { setUploadingPhotos(false); setUploadProgress(0); }
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
              <h1 className="text-2xl font-bold tracking-tight text-white/90">Galería</h1>
              <p className="text-white/35 text-sm mt-0.5">Administra tus álbumes fotográficos.</p>
            </div>
            <button
              onClick={handleNewAlbum}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Álbum
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
              <p className="text-white/30 text-xs">Cargando galería...</p>
            </div>
          ) : albums.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-dashed border-white/[0.08]">
              <ImageIcon className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No hay álbumes fotográficos.</p>
              <button onClick={handleNewAlbum} className="text-white/50 hover:text-white/70 text-xs font-medium mt-2 cursor-pointer transition-colors">
                Crea el primero →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {albums.map(album => (
                <div key={album.id} className="group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors overflow-hidden flex flex-col">
                  <div className="aspect-[4/3] relative bg-white/[0.02] overflow-hidden flex items-center justify-center border-b border-white/[0.04]">
                    {album.cover_image_url ? (
                      <img src={album.cover_image_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-white/10" />
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-medium text-sm text-white/80 line-clamp-1">{album.title}</h3>
                      {album.description && <p className="text-xs text-white/40 mt-1 line-clamp-2">{album.description}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 pt-2">
                      <button
                        onClick={() => handleOpenPhotos(album)}
                        className="flex-1 py-1.5 px-2 flex items-center justify-center gap-1.5 text-[10px] font-medium rounded-md bg-white/[0.06] text-white/50 hover:bg-white/[0.1] hover:text-white/70 transition-all cursor-pointer"
                      >
                        <FolderOpen className="w-3 h-3" />
                        Ver Fotos
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'album-form' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-6 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold tracking-tight text-white/90">{selectedAlbum ? 'Editar Álbum' : 'Nuevo Álbum'}</h2>
              <button onClick={() => setView('list')} className="p-1.5 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveAlbum} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Título del Álbum</label>
                <input
                  type="text"
                  value={albumTitle}
                  onChange={e => setAlbumTitle(e.target.value)}
                  placeholder="Ej: Fotos de Gira 2024"
                  required
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Descripción</label>
                <textarea
                  value={albumDesc}
                  onChange={e => setAlbumDesc(e.target.value)}
                  className="w-full min-h-20 px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors resize-y"
                  placeholder="Descripción del álbum..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Proyecto Vinculado (Opcional)</label>
                <select
                  value={linkedProjectId}
                  onChange={e => setLinkedProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none focus:border-white/20 transition-colors"
                >
                  <option value="">Ninguno</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/50 block">Foto de Portada</label>
                <div className="flex items-stretch gap-4">
                  <div className="w-24 h-24 bg-white/[0.03] rounded-lg overflow-hidden flex items-center justify-center border border-white/[0.06] shrink-0">
                    {albumCoverFile ? <img src={URL.createObjectURL(albumCoverFile)} alt="Preview" className="w-full h-full object-cover" />
                      : albumCoverUrl ? <img src={albumCoverUrl} alt="Cover" className="w-full h-full object-cover" />
                      : <ImageIcon className="w-6 h-6 text-white/10" />}
                  </div>
                  <div className="flex-1">
                    <FileUploadZone
                      accept="image/*"
                      type="image"
                      selectedFile={albumCoverFile}
                      onFileSelect={file => setAlbumCoverFile(file)}
                      placeholderText="Haz clic o arrastra la portada"
                      helperText="Se comprimirá automáticamente a WebP."
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
                  {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Guardando...</> : selectedAlbum ? 'Guardar Álbum' : 'Crear Álbum'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {view === 'photos-editor' && selectedAlbum && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="p-1.5 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white/90">Fotos del Álbum</h1>
              <p className="text-white/40 text-sm mt-0.5">{selectedAlbum.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider">Fotos Cargadas</h3>
                <span className="text-[10px] bg-white/[0.06] text-white/40 px-2 py-0.5 rounded-full font-medium">{photos.length}</span>
              </div>
              
              {loadingPhotos ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 text-white/30 animate-spin" /></div>
              ) : photos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/[0.08] p-10 text-center text-white/30 text-xs">
                  Este álbum no tiene fotos. Súbelas desde el panel de la derecha.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map(photo => (
                    <div key={photo.id} className="relative group aspect-square bg-white/[0.02] rounded-lg overflow-hidden border border-white/[0.04]">
                      <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="bg-red-500/90 hover:bg-red-500 text-white rounded-full p-2 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider">Subir Fotos</h3>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
                <div className="relative border border-dashed border-white/[0.08] rounded-lg p-6 hover:bg-white/[0.04] transition-colors flex flex-col items-center justify-center cursor-pointer min-h-32">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => setSelectedFiles(Array.from(e.target.files || []))}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-white/20 mb-2" />
                  <span className="text-xs font-medium text-white/60 text-center">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} fotos seleccionadas` : 'Seleccionar fotos (múltiple)'}
                  </span>
                  <span className="text-[10px] text-white/30 text-center mt-1">Se comprimirán automáticamente a WebP</span>
                </div>

                {uploadingPhotos && (
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-white transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-[10px] text-white/40 text-center font-medium">{uploadProgress}% completado</p>
                  </div>
                )}

                <button
                  className="w-full py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  disabled={selectedFiles.length === 0 || uploadingPhotos}
                  onClick={handleUploadPhotos}
                >
                  {uploadingPhotos
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Subiendo...</>
                    : <><Upload className="w-3.5 h-3.5" />Subir {selectedFiles.length > 0 ? `${selectedFiles.length} foto${selectedFiles.length > 1 ? 's' : ''}` : 'fotos'}</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
