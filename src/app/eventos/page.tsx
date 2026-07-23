'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Ticket, Clock, ExternalLink, ArrowLeft, Image as ImageIcon } from 'lucide-react';

interface EventData {
  id: string;
  title: string;
  slug: string;
  location_name: string;
  address_city: string;
  google_maps_url: string;
  event_date: string; // ISO String timestamp
  flyer_image_url: string;
  ticket_url: string;
  is_featured: boolean;
  status: 'upcoming' | 'completed';
}

// Datos Mock (Fallback en caso de que la DB esté vacía)
const mockEvents: EventData[] = [
  {
    id: 'e-1',
    title: 'Ángel Giolitti Live Set - Presentación "Horizonte Infinito"',
    slug: 'angel-giolitti-live-set-horizonte-infinito',
    location_name: 'Niceto Club',
    address_city: 'Buenos Aires, Argentina',
    google_maps_url: 'https://maps.google.com/?q=Niceto+Club',
    event_date: '2026-11-15T23:30:00Z',
    flyer_image_url: '',
    ticket_url: 'https://passline.com',
    is_featured: true,
    status: 'upcoming'
  },
  {
    id: 'e-2',
    title: 'Festival Mutek (Edición Sur)',
    slug: 'festival-mutek-sur',
    location_name: 'Centro Cultural San Martín',
    address_city: 'Buenos Aires, Argentina',
    google_maps_url: 'https://maps.google.com/?q=Centro+Cultural+San+Martin',
    event_date: '2026-12-05T19:00:00Z',
    flyer_image_url: '',
    ticket_url: 'https://ticketek.com.ar',
    is_featured: false,
    status: 'upcoming'
  },
  {
    id: 'e-3',
    title: 'Secret Session - Modular Nights',
    slug: 'secret-session-modular-nights',
    location_name: 'Deseo',
    address_city: 'Buenos Aires, Argentina',
    google_maps_url: 'https://maps.google.com/?q=Deseo+BA',
    event_date: '2026-03-10T23:59:00Z',
    flyer_image_url: '',
    ticket_url: '',
    is_featured: false,
    status: 'completed'
  }
];

export default function EventosPage() {
  const [events, setEvents] = useState<EventData[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true }); // Orden ascendente para próximos

        if (!error && data && data.length > 0) {
          setEvents(data as EventData[]);
        }
      } catch (err) {
        console.error('Error fetching events, using mocks:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

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

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'completed').sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()); // Pasados en orden descendente

  if (selectedEvent) {
    const isPast = selectedEvent.status === 'completed';
    return (
      <div className="music-detail-view px-6 py-6 animate-fade-in pb-24 overflow-hidden">
        <button 
          onClick={() => setSelectedEvent(null)}
          className="flex items-center gap-2 mb-8 text-muted-foreground hover:text-white transition-colors font-semibold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a todos los eventos
        </button>

        <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
          {/* Flyer gigante (estilo portada de álbum) */}
          <div className="w-full md:w-80 aspect-[4/5] rounded-md bg-muted shadow-2xl flex-shrink-0 flex items-center justify-center relative overflow-hidden group border border-white/5">
            {selectedEvent.flyer_image_url ? (
              <img src={selectedEvent.flyer_image_url} alt={`Flyer de ${selectedEvent.title}`} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground/30">
                <ImageIcon className="h-16 w-16 mb-2" />
                <span className="text-xs uppercase font-bold tracking-widest">Sin Flyer Oficial</span>
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

            {/* Acciones */}
            <div className="flex items-center gap-4 mt-10">
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
            </div>
          </div>
        </div>
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
        <h2 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-2">Próximos Shows</h2>
        
        {upcomingEvents.length > 0 ? (
          <div className="flex flex-col gap-2">
            {upcomingEvents.map(event => (
              <div 
                key={event.id}
                onClick={() => setSelectedEvent(event)}
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
                onClick={() => setSelectedEvent(event)}
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
