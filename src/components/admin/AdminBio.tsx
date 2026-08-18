'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Upload, Loader2, AlertCircle, CheckCircle, FileText, Trash2, ExternalLink } from 'lucide-react';

interface ArtistProfile {
  id: string;
  full_name: string;
  short_bio: string;
  full_bio_markdown: string;
  social_links: {
    instagram?: string;
    youtube?: string;
    spotify?: string;
    whatsapp?: string;
    facebook?: string;
  };
}

interface ArtistDocument {
  id: string;
  title: string;
  document_type: string;
  file_url: string;
}

export default function AdminBio() {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [fullName, setFullName] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [fullBio, setFullBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [spotify, setSpotify] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [facebook, setFacebook] = useState('');

  const [documents, setDocuments] = useState<ArtistDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<'dossier' | 'cv'>('dossier');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
  }, []);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data } = await supabase.from('artist_profile').select('*').maybeSingle();
      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setShortBio(data.short_bio || '');
        setFullBio(data.full_bio_markdown || '');
        const s = data.social_links || {};
        setInstagram(s.instagram || '');
        setYoutube(s.youtube || '');
        setSpotify(s.spotify || '');
        setWhatsapp(s.whatsapp || '');
        setFacebook(s.facebook || '');
      }
    } catch (err: any) {
      setProfileError('No se pudo cargar el perfil.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const { data } = await supabase.from('artist_documents')
        .select('*').in('document_type', ['dossier', 'cv']).order('created_at', { ascending: false });
      setDocuments(data || []);
    } catch { } finally { setLoadingDocs(false); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true); setProfileError(''); setProfileSuccess(false);
    try {
      const data = {
        full_name: fullName,
        short_bio: shortBio,
        full_bio_markdown: fullBio,
        social_links: { instagram, youtube, spotify, whatsapp, facebook },
        updated_at: new Date().toISOString(),
      };
      if (profile?.id) {
        const { error } = await supabase.from('artist_profile').update(data).eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('artist_profile').insert([data]);
        if (error) throw error;
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      await fetchProfile();
    } catch (err: any) {
      setProfileError(err.message || 'Error al guardar el perfil.');
    } finally {
      setSavingProfile(false);
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
    await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
    return publicUrl;
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile || !docTitle) return;
    if (docFile.type !== 'application/pdf') { setDocError('Solo se aceptan archivos PDF.'); return; }
    setUploadingDoc(true); setDocError('');
    try {
      const filename = `${docType}-${Date.now()}.pdf`;
      const url = await uploadToR2(docFile, filename, 'documents');
      const { error } = await supabase.from('artist_documents').insert([{
        title: docTitle,
        document_type: docType,
        file_url: url,
      }]);
      if (error) throw error;
      setDocTitle(''); setDocFile(null);
      await fetchDocuments();
    } catch (err: any) {
      setDocError(err.message || 'Error al subir documento.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('¿Eliminar este documento?')) return;
    try {
      const { error } = await supabase.from('artist_documents').delete().eq('id', id);
      if (error) throw error;
      setDocuments(documents.filter(d => d.id !== id));
    } catch { alert('Error al eliminar.'); }
  };

  return (
    <div className="space-y-12 max-w-3xl">
      {/* ── SECCIÓN 1: PERFIL ── */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">Bio & Dossier</h1>
          <p className="text-white/35 text-sm mt-0.5">Edita tu biografía pública y redes sociales.</p>
        </div>

        {profileError && (
          <div className="px-3 py-2.5 text-xs text-red-400 bg-red-500/8 rounded-lg border border-red-500/15 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="px-3 py-2.5 text-xs text-emerald-400 bg-emerald-500/8 rounded-lg border border-emerald-500/15 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            ¡Perfil guardado correctamente!
          </div>
        )}

        {loadingProfile ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
            <p className="text-white/30 text-xs">Cargando perfil...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50">Nombre Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ángel Giolitti"
                required
                className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50">Biografía Corta (Resumen)</label>
              <textarea
                value={shortBio}
                onChange={e => setShortBio(e.target.value)}
                className="w-full min-h-20 px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors resize-y"
                placeholder="Una o dos frases que describan al artista en forma concisa."
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50">Biografía Completa</label>
              <textarea
                value={fullBio}
                onChange={e => setFullBio(e.target.value)}
                className="w-full min-h-40 px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors resize-y"
                placeholder="Trayectoria completa, hitos y estilo musical del artista..."
              />
            </div>

            <div className="pt-5 border-t border-white/[0.06]">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Redes Sociales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-white/40 uppercase tracking-wide">Instagram</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={e => setInstagram(e.target.value)}
                    placeholder="@usuario o URL completa"
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-white/40 uppercase tracking-wide">YouTube</label>
                  <input
                    type="text"
                    value={youtube}
                    onChange={e => setYoutube(e.target.value)}
                    placeholder="URL del canal de YouTube"
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-white/40 uppercase tracking-wide">Spotify</label>
                  <input
                    type="text"
                    value={spotify}
                    onChange={e => setSpotify(e.target.value)}
                    placeholder="URL del perfil de Spotify"
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-white/40 uppercase tracking-wide">WhatsApp (sólo número)</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    placeholder="5491112345678"
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-medium text-white/40 uppercase tracking-wide">Facebook</label>
                  <input
                    type="text"
                    value={facebook}
                    onChange={e => setFacebook(e.target.value)}
                    placeholder="URL de la página de Facebook"
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-white/[0.06]">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {savingProfile ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...</>
                ) : (
                  <><Save className="w-3.5 h-3.5" /> Guardar Perfil</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── SECCIÓN 2: DOCUMENTOS ── */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white/90">Documentos de Prensa</h2>
          <p className="text-white/35 text-sm mt-0.5">Sube tu Dossier (EPK) y el Currículum Vitae para prensa.</p>
        </div>

        {docError && (
          <div className="px-3 py-2.5 text-xs text-red-400 bg-red-500/8 rounded-lg border border-red-500/15 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {docError}
          </div>
        )}

        {loadingDocs ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 rounded-xl border border-dashed border-white/[0.08]">
            <FileText className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-xs text-white/30">No hay documentos cargados todavía.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="w-10 h-10 bg-white/[0.04] rounded-lg flex items-center justify-center shrink-0 border border-white/[0.08]">
                  <FileText className="w-4 h-4 text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/80 truncate">{doc.title}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{doc.document_type === 'dossier' ? 'Dossier de Prensa (EPK)' : 'Currículum Vitae'}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-white/25 hover:bg-white/[0.06] hover:text-white/50 transition-all cursor-pointer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 rounded-md text-white/25 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleUploadDoc} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
          <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider">Subir Nuevo Documento PDF</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50">Título del Documento</label>
              <input
                type="text"
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                placeholder="Ej: Dossier de Prensa 2026"
                required
                className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50">Tipo de Documento</label>
              <select
                value={docType}
                onChange={(e: any) => setDocType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none focus:border-white/20 transition-colors"
              >
                <option value="dossier">Dossier de Prensa / EPK</option>
                <option value="cv">Currículum Vitae</option>
              </select>
            </div>
          </div>
          
          <div className="relative border border-dashed border-white/[0.08] rounded-lg p-5 hover:bg-white/[0.04] transition-colors flex flex-col items-center justify-center cursor-pointer min-h-24 mt-2">
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setDocFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              required
            />
            <Upload className="w-5 h-5 text-white/20 mb-2" />
            <span className="text-xs font-medium text-white/60 text-center">{docFile ? docFile.name : 'Seleccionar archivo PDF'}</span>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={uploadingDoc}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            >
              {uploadingDoc ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo PDF...</>
              ) : (
                <><Upload className="w-3.5 h-3.5" /> Subir Documento</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
