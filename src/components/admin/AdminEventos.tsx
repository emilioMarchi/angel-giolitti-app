'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Calendar, Loader2, AlertCircle, ArrowLeft, Star, MapPin, Clock } from 'lucide-react';
import FileUploadZone from './FileUploadZone';

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  location_name: string;
  address_city: string;
  google_maps_url: string;
  event_date: string;
  flyer_image_url: string;
  ticket_url: string;
  ticket_price: number | null;
  is_featured: boolean;
  status: 'upcoming' | 'completed';
}

export default function AdminEventos() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [ticketUrl, setTicketUrl] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'upcoming' | 'completed'>('upcoming');
  const [flyerUrl, setFlyerUrl] = useState('');
  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setErrorMessage('No se pudieron cargar los eventos de la agenda.');
    } finally {
      setLoading(false);
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
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 1200;
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
      throw new Error('Fallo al subir flyer a Cloudflare R2');
    }

    return publicUrl;
  };

  const formatDatetimeForInput = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const formatDateShort = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateFull = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setTitle('');
    setDescription('');
    setLocationName('');
    setAddressCity('');
    setGoogleMapsUrl('');
    setEventDate('');
    setTicketUrl('');
    setTicketPrice('');
    setIsFeatured(false);
    setStatus('upcoming');
    setFlyerUrl('');
    setFlyerFile(null);
    setErrorMessage('');
    setView('form');
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setLocationName(event.location_name || '');
    setAddressCity(event.address_city || '');
    setGoogleMapsUrl(event.google_maps_url || '');
    setEventDate(formatDatetimeForInput(event.event_date));
    setTicketUrl(event.ticket_url || '');
    setTicketPrice(event.ticket_price != null ? String(event.ticket_price) : '');
    setIsFeatured(event.is_featured || false);
    setStatus(event.status || 'upcoming');
    setFlyerUrl(event.flyer_image_url || '');
    setFlyerFile(null);
    setErrorMessage('');
    setView('form');
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;

    setSaving(true);
    setErrorMessage('');

    try {
      let finalFlyerUrl = flyerUrl;

      if (flyerFile) {
        const compressedBlob = await compressImage(flyerFile);
        const nameWebp = `${generateSlug(title)}-flyer.webp`;
        finalFlyerUrl = await uploadToR2(compressedBlob, nameWebp, 'flyers');
      }

      const isoDate = new Date(eventDate).toISOString();
      const slugValue = `${generateSlug(title)}-${new Date(eventDate).getFullYear()}-${new Date(eventDate).getMonth() + 1}`;

      const eventData = {
        title,
        slug: slugValue,
        description,
        location_name: locationName,
        address_city: addressCity,
        google_maps_url: googleMapsUrl,
        event_date: isoDate,
        flyer_image_url: finalFlyerUrl,
        ticket_url: ticketUrl,
        ticket_price: ticketPrice !== '' ? parseFloat(ticketPrice) : null,
        is_featured: isFeatured,
        status,
      };

      if (selectedEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', selectedEvent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
      }

      await fetchEvents();
      setView('list');
    } catch (err: any) {
      console.error('Error saving event:', err);
      setErrorMessage(err.message || 'Error al guardar el evento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('¿Estás seguro de eliminar este evento de la agenda?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      setEvents(events.filter(e => e.id !== eventId));
    } catch (err: any) {
      console.error('Error deleting event:', err);
      alert('Error al intentar eliminar el evento.');
    }
  };

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'completed');

  const renderEventTable = (eventList: Event[], dimmed = false) => (
    <div className={`rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden ${dimmed ? 'opacity-60' : ''}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="text-left px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Evento</th>
              <th className="text-left px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider hidden sm:table-cell">Fecha</th>
              <th className="text-left px-3 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider hidden md:table-cell">Lugar</th>
              <th className="text-right px-4 py-2.5 font-medium text-white/20 text-[10px] uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {eventList.map((event) => (
              <tr key={event.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {event.flyer_image_url ? (
                      <img src={event.flyer_image_url} alt="" className="w-8 h-10 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-10 rounded bg-white/[0.04] flex items-center justify-center shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-white/15" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-white/70 truncate max-w-[180px] group-hover:text-white/90 transition-colors">{event.title}</p>
                        {event.is_featured && (
                          <Star className="w-3 h-3 text-amber-400/70 fill-amber-400/70 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-white/20 sm:hidden mt-0.5">{formatDateShort(event.event_date)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-white/30 hidden sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-white/15" />
                    {formatDateShort(event.event_date)}
                  </div>
                </td>
                <td className="px-3 py-3 hidden md:table-cell">
                  <div className="flex items-center gap-1.5 text-white/25">
                    <MapPin className="w-3 h-3 text-white/15 shrink-0" />
                    <span className="truncate max-w-[150px]">{event.location_name || '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-1.5 rounded-md text-white/25 hover:bg-white/[0.06] hover:text-white/50 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
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
  );

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
              <h1 className="text-2xl font-bold tracking-tight text-white/90">Eventos</h1>
              <p className="text-white/35 text-sm mt-0.5">Administra tu agenda de presentaciones y conciertos.</p>
            </div>
            <button
              onClick={handleNewEvent}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-white/90 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Evento
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
              <p className="text-white/30 text-xs">Cargando agenda...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-dashed border-white/[0.08]">
              <Calendar className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No hay eventos en la agenda.</p>
              <button onClick={handleNewEvent} className="text-white/50 hover:text-white/70 text-xs font-medium mt-2 cursor-pointer transition-colors">
                Carga tu primer show →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingEvents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider">Próximos</h2>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400/70 px-2 py-0.5 rounded-full font-medium">{upcomingEvents.length}</span>
                  </div>
                  {renderEventTable(upcomingEvents)}
                </div>
              )}

              {pastEvents.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-semibold text-white/20 uppercase tracking-wider">Historial</h2>
                  {renderEventTable(pastEvents, true)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'form' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/[0.08] rounded-xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold tracking-tight text-white/90">
                {selectedEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </h2>
              <button onClick={() => setView('list')} className="p-1.5 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Nombre del Show / Evento</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Ángel Giolitti Live en Niceto"
                  required
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Descripción del Evento — Opcional</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Set de 2 horas con el synth modular, invitados sorpresa y apertura local. Podés escribir varias líneas."
                  rows={4}
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Estado</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 focus:outline-none focus:border-white/20 transition-colors"
                  >
                    <option value="upcoming">Próximo</option>
                    <option value="completed">Finalizado / Pasado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Lugar / Recinto</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Ej: Niceto Club"
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Ciudad / Provincia</label>
                  <input
                    type="text"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    placeholder="Ej: Buenos Aires, CABA"
                    className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Enlace de Google Maps (Ubicación)</label>
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Enlace de Compra de Tickets</label>
                <input
                  type="url"
                  value={ticketUrl}
                  onChange={(e) => setTicketUrl(e.target.value)}
                  placeholder="https://passline.com/show-de-angel"
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Precio de Entrada (ARS) — Opcional</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ticketPrice === null ? '' : ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  placeholder="Ej: 15000"
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
                <p className="text-[10px] text-white/20">
                  Dejalo vacío si es entrada gratuita o el precio se anuncia en puerta.
                </p>
              </div>

              <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-3.5 h-3.5 rounded cursor-pointer accent-amber-400"
                />
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400/70" />
                  <span className="text-xs font-medium text-white/60">Destacar este evento</span>
                </div>
              </label>

              <div className="space-y-2">
                <label className="text-xs font-medium text-white/50 block">Flyer del Show</label>
                <div className="flex flex-col md:flex-row items-stretch gap-4">
                  <div className="w-28 h-36 bg-white/[0.03] rounded-lg overflow-hidden flex items-center justify-center border border-white/[0.06] shrink-0">
                    {flyerFile ? (
                      <img src={URL.createObjectURL(flyerFile)} alt="Preview Flyer" className="w-full h-full object-cover" />
                    ) : flyerUrl ? (
                      <img src={flyerUrl} alt="Flyer Actual" className="w-full h-full object-cover" />
                    ) : (
                      <Calendar className="w-8 h-8 text-white/10" />
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <FileUploadZone
                      accept="image/*"
                      type="image"
                      selectedFile={flyerFile}
                      onFileSelect={(file) => setFlyerFile(file)}
                      placeholderText="Haz clic para seleccionar o arrastra el flyer"
                      helperText="Formato ideal: Vertical (Ej: 800x1200). Se comprimirá automáticamente a WebP."
                    />
                  </div>
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
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Evento'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
