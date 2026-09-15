'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, FileText, Loader2, AlertCircle, ArrowLeft, ExternalLink, Upload, BookOpen } from 'lucide-react';
import Pagination from './Pagination';

interface ProjectOption {
  id: string;
  title: string;
}

interface PartituraDoc {
  id: string;
  project_id: string | null;
  title: string;
  document_type: string;
  file_url: string;
  created_at: string;
  project?: {
    id: string;
    title: string;
  } | null;
}

export default function AdminPartituras() {
  const [partituras, setPartituras] = useState<PartituraDoc[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selected, setSelected] = useState<PartituraDoc | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  // Form states
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPartituras();
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
      console.error('Error al cargar proyectos:', err);
    }
  };

  const fetchPartituras = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('artist_documents')
        .select('*, project:projects(id, title)')
        .eq('document_type', 'partitura')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartituras(data || []);
    } catch (err: any) {
      setErrorMessage('No se pudieron cargar las partituras.');
    } finally {
      setLoading(false);
    }
  };

  const uploadToR2 = async (file: File, filename: string, folder: string): Promise<string> => {
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

  const generateSlug = (text: string) =>
    text.toString().toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '').replace(/--+/g, '-')
      .replace(/^-+/, '').replace(/-+$/, '');

  const handleNew = () => {
    setSelected(null);
    setTitle('');
    setProjectId('');
    setFileUrl('');
    setPdfFile(null);
    setErrorMessage('');
    setView('form');
  };

  const handleEdit = (p: PartituraDoc) => {
    setSelected(p);
    setTitle(p.title);
    setProjectId(p.project_id || '');
    setFileUrl(p.file_url);
    setPdfFile(null);
    setErrorMessage('');
    setView('form');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected && !pdfFile) {
      setErrorMessage('Debes seleccionar un archivo PDF.');
      return;
    }
    if (pdfFile && pdfFile.type !== 'application/pdf') {
      setErrorMessage('Solo se permiten archivos en formato PDF.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      let finalUrl = fileUrl;
      if (pdfFile) {
        const cleanTitle = title.trim();
        const safeSlug = generateSlug(cleanTitle) || 'partitura';
        const filename = `${safeSlug}-${Date.now()}.pdf`;
        finalUrl = await uploadToR2(pdfFile, filename, 'partituras');
      }

      const docData = {
        title: title.trim(),
        document_type: 'partitura',
        file_url: finalUrl,
        project_id: projectId ? projectId : null,
      };

      if (selected) {
        const { error } = await supabase.from('artist_documents').update(docData).eq('id', selected.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('artist_documents').insert([docData]);
        if (error) throw error;
      }

      await fetchPartituras();
      setView('list');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar la partitura.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta partitura?')) return;
    try {
      const { error } = await supabase.from('artist_documents').delete().eq('id', id);
      if (error) throw error;
      setPartituras(partituras.filter(p => p.id !== id));
    } catch {
      alert('Error al eliminar la partitura.');
    }
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
              <h1 className="text-2xl font-bold tracking-tight text-white/90">Partituras</h1>
              <p className="text-white/35 text-sm mt-0.5">Sube y gestiona archivos de partituras PDF asociadas a un proyecto o generales.</p>
            </div>
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva Partitura
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
              <p className="text-white/30 text-xs">Cargando partituras...</p>
            </div>
          ) : partituras.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-dashed border-white/[0.08]">
              <BookOpen className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No hay partituras cargadas.</p>
              <button onClick={handleNew} className="text-white/50 hover:text-white/70 text-xs font-medium mt-2 cursor-pointer transition-colors">
                Crea la primera →
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      <th className="text-left px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Título de Partitura</th>
                      <th className="text-left px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Proyecto / Banda</th>
                      <th className="text-right px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partituras
                      .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                      .map((item) => (
                      <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 border border-white/10">
                              <FileText className="w-4 h-4 text-white/30" />
                            </div>
                            <p className="font-medium text-white/70 truncate max-w-[280px] group-hover:text-white/90 transition-colors">{item.title}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-white/40">
                          {item.project ? (
                            <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-white/[0.06] text-white/60">
                              {item.project.title}
                            </span>
                          ) : (
                            <span className="text-white/20 text-[11px]">General (Sin proyecto)</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={item.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md text-white/25 hover:bg-white/[0.06] hover:text-white/50 transition-all cursor-pointer"
                              title="Ver / Descargar PDF"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 rounded-md text-white/25 hover:bg-white/[0.06] hover:text-white/50 transition-all cursor-pointer"
                              title="Editar partitura"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-md text-white/25 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
                              title="Eliminar partitura"
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
              <div className="p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(partituras.length / PAGE_SIZE)}
                  totalItems={partituras.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={page => setCurrentPage(page)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'form' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold tracking-tight text-white/90">
                {selected ? 'Editar Partitura' : 'Nueva Partitura'}
              </h2>
              <button onClick={() => setView('list')} className="p-1.5 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Título de la Partitura</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej: Partitura - Handangel (Piano y Batería)"
                  required
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Proyecto / Banda Asociada (Opcional)</label>
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none focus:border-white/20 transition-colors"
                >
                  <option value="">-- General / Sin Proyecto --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 block">Archivo PDF {selected && '(Opcional si no deseas cambiarlo)'}</label>
                <div className="relative border border-dashed border-white/[0.08] rounded-lg p-5 hover:bg-white/[0.04] transition-colors flex flex-col items-center justify-center cursor-pointer min-h-24">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={e => setPdfFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required={!selected}
                  />
                  <Upload className="w-5 h-5 text-white/20 mb-2" />
                  <span className="text-xs font-medium text-white/60 text-center">
                    {pdfFile ? pdfFile.name : selected ? 'Haz clic si deseas reemplazar el PDF actual' : 'Seleccionar archivo PDF de la partitura'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all cursor-pointer disabled:opacity-40"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Guardando...</> : selected ? 'Actualizar Partitura' : 'Guardar Partitura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
