'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Ticket, Clock, ExternalLink, ArrowLeft, Image as ImageIcon, MessageCircle, X } from '@/lib/lucide';
import { WhatsAppIcon } from '@/components/BrandIcons';

interface EventData {
  id: string;
  title: string;
  slug: string;
  description: string;
  location_name: string;
  address_city: string;
  google_maps_url: string;
  event_date: string; // ISO String timestamp
  flyer_image_url: string;
  ticket_url: string;
  ticket_price: number | null;
  is_featured: boolean;
  status: 'upcoming' | 'completed';
}

interface Props {
  initialSlug?: string;
}

export default function EventosClient({ initialSlug }: Props) {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [flyerPreview, setFlyerPreview] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true }); // Orden ascendente para próximos

        if (!error && data) {
          setEvents(data as EventData[]);
          if (initialSlug) {
            const found = (data as EventData[]).find((e) => e.slug === initialSlug);
            if (found) setSelectedEvent(found as EventData);
          }
        }
      } catch (err) {
        console.error('Error fetching events, using mocks:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [initialSlug]);

  // Utilidades de fechas
  const getMonthShort = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
  };
  const getDay = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('es-ES', { day: '2-digit' });
  };
  const getFullDateString = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  const getTimeString = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  const formatPrice = (price: number | null) => {
    if (price == null) return null;
    return price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: price % 1 === 0 ? 0 : 2 });
  };

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'completed').sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()); // Pasados en orden descendente

  if (selectedEvent) {
    const isPast = selectedEvent.status === 'completed';
    return (
      <div className="music-detail-view px-6 py-6 animate-fade-in pb-24 overflow-hidden">
        <button 
          onClick={() => router.push('/eventos')}
          className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-white transition-colors font-semibold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a todos los eventos
        </button>

        <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
          {/* Flyer gigante (estilo portada de álbum) */}
          <div className="w-full md:w-80 flex-shrink-0 relative">
            {selectedEvent.flyer_image_url ? (
              <img
                src={selectedEvent.flyer_image_url}
                alt={`Flyer de ${selectedEvent.title}`}
                onClick={() => setFlyerPreview(true)}
                className="w-full h-auto rounded-md bg-muted shadow-2xl border border-white/5 cursor-zoom-in"
              />
            ) : (
              <div className="aspect-[4/5] rounded-md bg-muted shadow-2xl flex items-center justify-center relative overflow-hidden border border-white/5">
                <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                  <ImageIcon className="h-16 w-16 mb-2" />
                  <span className="text-xs uppercase font-bold tracking-widest">Sin Flyer Oficial</span>
                </div>
              </div>
            )}
            
            {/* Si es destacado, mostrar un pequeño badge sobre la foto */}
            {selectedEvent.is_featured && (
              <div className="absolute top-4 left-4 bg-primary text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-lg">
                Show Destacado
              </div>
            )}
          </div>
          
          {/* Info del evento */}
          <div className="flex-1 pt-2 min-w-0">
            <span className="text-xs uppercase font-bold tracking-widest text-primary mb-2 block">
              {isPast ? 'Fecha Finalizada' : 'Próxima Presentación'}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-6 leading-tight text-white break-words pr-4">
              {selectedEvent.title}
            </h1>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">{getFullDateString(selectedEvent.event_date)}</span>
              </div>
              
              <div className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">{getTimeString(selectedEvent.event_date)} hs</span>
              </div>

              <a 
                href={selectedEvent.google_maps_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors group cursor-pointer"
              >
                <MapPin className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="font-semibold text-lg group-hover:underline">{selectedEvent.location_name}</span>
                  <span className="text-sm">{selectedEvent.address_city}</span>
                </div>
              </a>
            </div>

            {/* Descripción del evento */}
            {selectedEvent.description && (
              <div className="max-w-2xl">
                <h2 className="text-sm uppercase font-bold tracking-widest text-primary mb-3">
                  Sobre el Show
                </h2>
                <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-line">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center gap-4 mt-10 flex-wrap">
              {formatPrice(selectedEvent.ticket_price) && (
                <span className="px-6 py-3 rounded-full bg-white/5 border border-primary/30 text-primary font-bold text-sm">
                  Entrada: {formatPrice(selectedEvent.ticket_price)}
                </span>
              )}
              {!isPast && selectedEvent.ticket_url ? (
                <a 
                  href={selectedEvent.ticket_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-full bg-primary text-black font-bold text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
                >
                  <Ticket className="h-4 w-4" />
                  Conseguir Entradas
                </a>
              ) : !isPast ? (
                <span className="px-6 py-3 rounded-full border border-white/20 text-muted-foreground font-semibold text-sm">
                  Entradas pronto / En puerta
                </span>
              ) : (
                <span className="px-6 py-3 rounded-full bg-white/5 text-muted-foreground font-bold text-sm">
                  Evento Finalizado
                </span>
              )}
              
              {/* Botón WhatsApp en detalle */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`¡Hola! Me interesa el evento: ${selectedEvent.title} el ${getFullDateString(selectedEvent.event_date)} en ${selectedEvent.location_name}, ${selectedEvent.address_city}. ¿Me das más info?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white font-bold text-sm hover:bg-green-500 transition-colors"
                aria-label={`Compartir evento ${selectedEvent.title} por WhatsApp`}
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Lightbox del flyer */}
        {flyerPreview && selectedEvent.flyer_image_url && (
          <div
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setFlyerPreview(false)}
          >
            <button
              onClick={() => setFlyerPreview(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Cerrar vista del flyer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedEvent.flyer_image_url}
              alt={`Flyer de ${selectedEvent.title}`}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
            />
          </div>
        )}
      </div>
    );
  }

  // Listado general estilo Spotify
  return (
    <div className="events-tab-view px-6 py-6 pb-24 overflow-hidden">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
          <MapPin className="h-9 w-9 text-primary animate-bounce-slow" />
          Eventos en Vivo
        </h1>
        <p className="text-sm text-muted-foreground">
          Descubre las próximas fechas y shows en vivo de Ángel Giolitti.
        </p>
      </div>

      {/* Lista de Próximos Eventos */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-2">Próximos eventos</h2>
        
        {upcomingEvents.length > 0 ? (
          <div className="flex flex-col gap-2">
            {upcomingEvents.map(event => (
              <div 
                key={event.id}
                onClick={() => router.push(`/eventos/${event.slug}`)}
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
              >
                {/* Cuadro de Fecha (Calendario) */}
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded bg-black/50 border border-white/10 flex-shrink-0 group-hover:border-primary/50 transition-colors">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-widest">{getMonthShort(event.event_date)}</span>
                  <span className="text-xl font-black text-white">{getDay(event.event_date)}</span>
                </div>

                {/* Info principal de la fila */}
                <div className="flex-1 min-w-0 flex flex-col pr-2">
                  <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span className="font-semibold text-white/80">{event.location_name}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="truncate">{event.address_city}</span>
                  </div>
                </div>

                {/* Acciones derechas en la fila */}
                <div className="flex items-center gap-4 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:hidden">
                    <Clock className="h-3.5 w-3.5" /> {getTimeString(event.event_date)} hs
                  </div>

                  {formatPrice(event.ticket_price) && (
                    <span className="px-4 py-2 rounded-full border border-primary/30 text-primary text-xs font-bold whitespace-nowrap">
                      {formatPrice(event.ticket_price)}
                    </span>
                  )}

                  {event.ticket_url ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(event.ticket_url, '_blank');
                      }}
                      className="px-5 py-2 rounded-full border border-white/30 text-white text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      <Ticket className="h-3.5 w-3.5" /> Tickets
                    </button>
                  ) : (
                    <span className="px-5 py-2 rounded-full border border-transparent text-muted-foreground text-xs font-bold uppercase tracking-widest">
                      Más info
                    </span>
                  )}

                  {/* Botón WhatsApp */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`¡Hola! Me interesa el evento: ${event.title} el ${getFullDateString(event.event_date)} en ${event.location_name}, ${event.address_city}. ¿Me das más info?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-600 text-white text-xs font-bold hover:bg-green-500 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Compartir evento ${event.title} por WhatsApp`}
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-lg border border-dashed border-white/10 text-center text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p>Por el momento no hay próximas fechas anunciadas.</p>
          </div>
        )}
      </section>

      {/* Lista de Eventos Pasados (Opcional, en Spotify a veces están más ocultos o abajo) */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-2 text-muted-foreground/70">Historial de Presentaciones</h2>
        
        {pastEvents.length > 0 ? (
          <div className="flex flex-col gap-2 opacity-70">
            {pastEvents.map(event => (
              <div 
                key={event.id}
                onClick={() => router.push(`/eventos/${event.slug}`)}
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center w-14 h-14 rounded bg-transparent border border-white/5 flex-shrink-0">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">{getMonthShort(event.event_date)}</span>
                  <span className="text-lg font-black text-muted-foreground">{getDay(event.event_date)}</span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                  <h3 className="text-base font-bold text-muted-foreground truncate group-hover:text-white transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{event.location_name}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="truncate">{event.address_city}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{new Date(event.event_date).getFullYear()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
