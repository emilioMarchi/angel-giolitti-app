'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getR2Url } from '@/lib/utils';
import { Save, Upload, Loader2, AlertCircle, CheckCircle, FileText, Trash2, ExternalLink, Plus, Image as ImageIcon } from 'lucide-react';
import FileUploadZone from './FileUploadZone';

interface ArtistProfile {
  id: string;
  full_name: string;
  short_bio: string;
  full_bio_markdown: string;
  profile_image_url?: string;
  hero_images_urls?: string[];
  social_links: {
    instagram?: string;
    youtube?: string;
    spotify?: string;
    whatsapp?: string;
    facebook?: string;
    twitter?: string;
    soundcloud?: string;
    bandcamp?: string;
    website?: string;
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
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [secondaryImageUrl, setSecondaryImageUrl] = useState('');
  const [secondaryImageFile, setSecondaryImageFile] = useState<File | null>(null);
  const [heroUrls, setHeroUrls] = useState<string[]>(['']);
  const [heroFiles, setHeroFiles] = useState<(File | null)[]>([]);

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

  const defaultHeroes = [
    getR2Url('images/gallery/handangel/photo-0.webp'),
    getR2Url('images/gallery/handangel/photo-2.webp'),
    getR2Url('images/gallery/handangel/photo-3.webp'),
    getR2Url('images/gallery/handangel/photo-6.webp'),
  ];

  const defaultProfileImage = getR2Url('images/gallery/handangel/photo-0.webp');
  const defaultSecondaryProfileImage = getR2Url('images/gallery/handangel/photo-7.webp');

  const defaultBioShort = 'Productor, compositor y DJ de música electrónica experimental. Fusiona síntesis modular, field recordings y estructuras ambientales.';

  const defaultBioFull = `Ángel Giolitti es un artista sonoro, productor y compositor argentino cuya obra transita los límites entre la música electrónica experimental, el ambient y la improvisación libre.

Nacido en Buenos Aires, su formación musical comenzó con el piano clásico para luego derivar hacia la síntesis modular, el diseño de sonido y la programación creativa. Su práctica combina instrumentación analógica (Eurorack, sintetizadores vintage) con procesamiento digital en tiempo real, field recordings urbanos y naturales, y una sensibilidad compositiva que privilegia la textura, el espacio y la evolución orgánica de los timbres.

A lo largo de su carrera ha editado en sellos como **Modular Field**, **Kvitnu**, **Mono Records** y **Self-released**, y ha participado en festivales internacionales como **Mutek**, **Sónar**, **Unsound** y **CTM**. Sus presentaciones en vivo se caracterizan por ser performances inmersivas donde la música dialoga con visuales generativas y arquitectura lumínica.

Además de su faceta como solista, colabora regularmente con coreógrafos, directores de cine y artistas visuales, componiendo bandas sonoras y diseñando paisajes sonoros para instalaciones site-specific. Es docente de síntesis y producción electrónica en instituciones de Buenos Aires y dicta talleres internacionales sobre modular synthesis y live coding.

Su discografía incluye los álbumes *«Horizonte Infinito»* (2025), *«Ciudad Nocturna»* (2023), *«Estructuras de Luz»* (2021) y numerosos EPs y colaboraciones. Actualmente reside en Buenos Aires, donde dirige su estudio **Estudios Ámbar**, espacio dedicado a la grabación, experimentación y difusión de la música electrónica de vanguardia.`;

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data } = await supabase.from('artist_profile').select('*').maybeSingle();
      if (data) {
        setProfile(data);
        setFullName(data.full_name || 'Ángel Giolitti');
        setShortBio(data.short_bio || defaultBioShort);
        setFullBio(data.full_bio_markdown || defaultBioFull);
        
        const avatar = data.profile_image_url || data.avatar_url;
        setProfileImageUrl(avatar ? getR2Url(avatar) : defaultProfileImage);
        setSecondaryImageUrl(data.secondary_image_url ? getR2Url(data.secondary_image_url) : defaultSecondaryProfileImage);

        const heroList = data.hero_images_urls || data.hero_urls;
        const heroes = Array.isArray(heroList) && heroList.length > 0 
          ? heroList.map((h: string) => getR2Url(h)) 
          : defaultHeroes;
        setHeroUrls(heroes);
        setHeroFiles(new Array(heroes.length).fill(null));

        const s = data.social_links || {};
        setInstagram(s.instagram || 'https://instagram.com/angelgiolitti');
        setYoutube(s.youtube || 'https://youtube.com/@angelgiolitti');
        setSpotify(s.spotify || 'https://open.spotify.com/artist/angelgiolitti');
        setWhatsapp(s.whatsapp || '');
        setFacebook(s.facebook || '');
      } else {
        setFullName('Ángel Giolitti');
        setShortBio(defaultBioShort);
        setFullBio(defaultBioFull);
        setProfileImageUrl(defaultProfileImage);
        setSecondaryImageUrl(defaultSecondaryProfileImage);
        setHeroUrls(defaultHeroes);
        setHeroFiles(new Array(defaultHeroes.length).fill(null));
        setInstagram('https://instagram.com/angelgiolitti');
        setYoutube('https://youtube.com/@angelgiolitti');
        setSpotify('https://open.spotify.com/artist/angelgiolitti');
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

  const compressImage = (file: File, maxW = 900, maxH = 900): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          if (w / h > maxW / maxH) { h = Math.round(h * maxW / w); w = maxW; }
          else { w = Math.round(w * maxH / h); h = maxH; }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          canvas.toBlob(b => b ? resolve(b) : reject(new Error('Fallo al comprimir imagen')), 'image/webp', 0.85);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAddHeroUrl = () => {
    setHeroUrls(prev => [...prev, '']);
    setHeroFiles(prev => [...prev, null]);
  };

  const handleRemoveHeroUrl = (idx: number) => {
    if (heroUrls.length === 1) {
      setHeroUrls(['']);
      setHeroFiles([null]);
    } else {
      setHeroUrls(prev => prev.filter((_, i) => i !== idx));
      setHeroFiles(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true); setProfileError(''); setProfileSuccess(false);
    try {
      let finalProfileUrl = profileImageUrl;
      if (profileImageFile) {
        const blob = await compressImage(profileImageFile, 600, 600);
        finalProfileUrl = await uploadToR2(blob, `artist-profile-${Date.now()}.webp`, 'profile');
      }

      let finalSecondaryUrl = secondaryImageUrl;
      if (secondaryImageFile) {
        const blob = await compressImage(secondaryImageFile, 600, 600);
        finalSecondaryUrl = await uploadToR2(blob, `artist-bio-${Date.now()}.webp`, 'profile');
      }

      const finalHeroUrls: string[] = [];
      for (let i = 0; i < heroUrls.length; i++) {
        const file = heroFiles[i];
        const existingUrl = heroUrls[i];
        if (file) {
          const blob = await compressImage(file, 1920, 1080);
          const uploadedUrl = await uploadToR2(blob, `hero-${Date.now()}-${i}.webp`, 'hero');
          finalHeroUrls.push(uploadedUrl);
        } else if (existingUrl.trim()) {
          finalHeroUrls.push(existingUrl.trim());
        }
      }

      const data = {
        full_name: fullName,
        short_bio: shortBio,
        full_bio_markdown: fullBio,
        profile_image_url: finalProfileUrl,
        secondary_image_url: finalSecondaryUrl,
        hero_images_urls: finalHeroUrls,
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              {/* Foto de Perfil Principal (Home) */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60 block">
                  Foto de Perfil Principal (Home)
                </label>
                <div className="flex flex-col items-stretch gap-3">
                  <div className="w-20 h-20 bg-white/[0.03] rounded-full overflow-hidden flex items-center justify-center border border-white/[0.06] shrink-0 mx-auto">
                    {profileImageFile ? (
                      <img src={URL.createObjectURL(profileImageFile)} alt="Preview Principal" className="w-full h-full object-cover" />
                    ) : profileImageUrl ? (
                      <img src={profileImageUrl} alt="Perfil Principal" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-white/10" />
                    )}
                  </div>
                  <div className="w-full">
                    <FileUploadZone
                      accept="image/*"
                      type="image"
                      selectedFile={profileImageFile}
                      onFileSelect={file => setProfileImageFile(file)}
                      placeholderText="Foto Principal (Home)"
                      helperText="Vista en Home / Avatar principal."
                    />
                  </div>
                </div>
              </div>

              {/* Foto de Perfil Secundaria (Página Bio) */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60 block">
                  Foto de Perfil Secundaria (Página Bio)
                </label>
                <div className="flex flex-col items-stretch gap-3">
                  <div className="w-20 h-20 bg-white/[0.03] rounded-full overflow-hidden flex items-center justify-center border border-white/[0.06] shrink-0 mx-auto">
                    {secondaryImageFile ? (
                      <img src={URL.createObjectURL(secondaryImageFile)} alt="Preview Secundaria" className="w-full h-full object-cover" />
                    ) : secondaryImageUrl ? (
                      <img src={secondaryImageUrl} alt="Perfil Secundario" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-white/10" />
                    )}
                  </div>
                  <div className="w-full">
                    <FileUploadZone
                      accept="image/*"
                      type="image"
                      selectedFile={secondaryImageFile}
                      onFileSelect={file => setSecondaryImageFile(file)}
                      placeholderText="Foto Secundaria (Bio)"
                      helperText="Vista en la solapa /bio."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/50">Imágenes del Banner (Hero Carousel)</label>
                <button
                  type="button"
                  onClick={handleAddHeroUrl}
                  className="text-[11px] text-white/60 hover:text-white flex items-center gap-1 font-medium cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" /> Agregar otra foto al banner
                </button>
              </div>
              <div className="space-y-2">
                {heroUrls.map((url, idx) => {
                  const file = heroFiles[idx];
                  const previewSrc = file ? URL.createObjectURL(file) : url;

                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white/[0.04] border border-white/10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {previewSrc ? (
                          <img src={previewSrc} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-white/20" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={url}
                        onChange={e => {
                          const updated = [...heroUrls];
                          updated[idx] = e.target.value;
                          setHeroUrls(updated);
                        }}
                        placeholder="URL o ruta de imagen (ej: /images/gallery/...)"
                        className="flex-1 px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                      />
                      <label className="px-3 py-2 text-xs bg-white/[0.06] border border-white/[0.1] rounded-lg text-white/70 hover:bg-white/[0.1] cursor-pointer transition-colors shrink-0">
                        Subir
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const updatedFiles = [...heroFiles];
                              updatedFiles[idx] = file;
                              setHeroFiles(updatedFiles);

                              const updatedUrls = [...heroUrls];
                              updatedUrls[idx] = file.name;
                              setHeroUrls(updatedUrls);
                            }
                          }}
                        />
                      </label>
                      {heroUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHeroUrl(idx)}
                          className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Eliminar esta foto del banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
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
