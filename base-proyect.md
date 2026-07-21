 DOCUMENTO DE ARQUITECTURA Y ESPECIFICACIÓN TÉCNICA

. STACK TECNOLÓGICO RECOMENDADO

Para garantizar la máxima velocidad de respuesta de la SPA, mantenibilidad a largo plazo y compatibilidad total con la arquitectura de costo $0[cite: 1], se define el siguiente stack de desarrollo:

* **Frontend / SPA Framework:** `Next.js` (App Router / React) o `React` + `Vite`.
  * *Ventajas:* Excelente enrutamiento del lado del cliente, soporte de componentes de servidor, manejo eficiente del estado global y SEO optimizado para la biografía/eventos.
* **Estilos & UI:** `Tailwind CSS` + `shadcn/ui` (o `Framer Motion` para microinteracciones fluidas en el reproductor).
* **Estado Global (Audio Player State):** `Zustand` o `React Context`.
  * Permite manipular la cola de reproducción (*queue*), volumen, progreso y controles del reproductor persistente sin renderizar de más toda la aplicación.
* **Backend, Base de Datos & Auth:** `@supabase/supabase-js` (PostgreSQL + Auth).
  * Consultas relacionales directas mediante la SDK y autenticación segura para el panel administrativo (`/admin`) con *Row Level Security* (RLS).
* **Storage SDK (Multimedia):** `@aws-sdk/client-s3` (compatible de forma nativa con Cloudflare R2).
  * Permite subir y gestionar archivos MP3, imágenes y documentos directamente desde el panel privado al bucket de R2.
* **Compresión Client-Side (Subida de fotos):** `browser-image-compression` o API Canvas nativa.
  * Optimiza y convierte imágenes a formato `WebP` antes de que se suban a la nube.
* **Hosting & Deploy:** `Vercel` o `Cloudflare Pages` (Continuous Deployment automático conectado a repositorio Git).


 Proyecto: Plataforma Web Autoadministrable angelgiolitti.com.arCliente: Ángel GiolittiEstudio / Desarrollador: OVNI Studio — Emilio Marchi  Fecha: Julio de 2026  Enfoque: Single Page Application (SPA) multimedia estilo Spotify con Reproductor Persistente de Audio e Infraestructura de Costo $0/mes.  1. RESUMEN DEL PROYECTO Y OBJETIVOSEl objetivo principal es desarrollar la plataforma web oficial para el artista Ángel Giolitti. La arquitectura estará enfocada en una experiencia fluida estilo Spotify, donde el contenido público convive con un Reproductor de Audio Global e Ininterrumpido que permite navegar todo el sitio sin cortar la música de fondo.  Además, el sitio incluirá un Panel de Administración Privado para la gestión autónoma de contenidos (música, videos, agenda y fotos) y un sistema de métricas de uso (reproducciones y visitas), montado bajo una infraestructura de costo $0 ARS mensual permanente.  2. ARQUITECTURA DE INFRAESTRUCTURA (ESTRUCTURA COSTO $0)Para garantizar cero costos fijos mensuales sin sacrificar rendimiento ni límites de transferencia multimedia, la carga de trabajo se distribuye estratégicamente:Plaintext┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND / CLIENTE (SPA)                          │
│                   Next.js / React alojado en Vercel / Netlify               │
└──────┬──────────────────────────────┬──────────────────────────────┬────────┘
       │                              │                              │
       ▼                              ▼                              ▼
┌──────────────┐              ┌──────────────┐              ┌─────────────────┐
│   SUPABASE   │              │CLOUDFLARE R2 │              │ YOUTUBE / VIMEO │
├──────────────┤              ├──────────────┤              ├─────────────────┤
│ • PostgreSQL │              │ • MP3s Discos│              │ • Videos de     │
│ • Auth Admin │              │ • Portadas HD│              │   Proyectos     │
│ • RLS Sec.   │              │ • Docs / CVs │              │ • Embed API     │
│(5GB / Free)  │              │(10GB / $0Egr)│              │(Ilimitado / $0) │
└──────────────┘              └──────────────┘              └─────────────────┘
Frontend: Next.js / React (SPA) desplegado en Vercel o Netlify (Free Tier).Base de Datos & Autenticación: Supabase (PostgreSQL relacional + Supabase Auth con Row Level Security - RLS).Storage Multimedia Pesado (Audio MP3, Fotos HD, Docs): Cloudflare R2 (10 GB de disco gratuito, $0 en costos de transferencia/egreso).Optimizaciones de Fotos: Cloudinary o ImageKit (para transformaciones dinámicas y lazy loading).Videos Audiovisuales: YouTube / Vimeo embebido vía API (Costo $0, transferencia ilimitada, pause automático del audio global).3. MAPA DE PAGINACIÓN Y VISTAS SPA (FRONTEND)La interfaz se divide en elementos persistentes y el área de contenido dinámico cargado por rutas:A. Componentes Persistentes GlobalesNavbar / Sidebar: Navegación general, logo y acceso al Buscador Rápido.  Reproductor de Audio Global (Bottom Bar):Barra inferior con controles de reproducción (Play/Pause, Anterior/Siguiente, Progreso, Volumen).  Estado global de la cola de reproducción (Queue State).Sistema de sincronización para pausar el audio automáticamente cuando se reproduce un video en la sección /proyectos.B. Rutas y Vistas Públicas/ (Home Principal):Hero banner y biografía resumida.Módulo de lanzamientos destacados y accesos directos.  Widget con las fechas más próximas de la agenda.  /musica (Catálogo Musical):/musica/albumes/:id: Vista detallada del álbum/single (portada, listado de canciones con botón Play, contador de reproducciones/likes y galería fotográfica asociada al disco)./musica/playlists/:id: Selecciones y listas de reproducción personalizadas./proyectos (Proyectos Audiovisuales y Transmedia):/proyectos/:id: Ficha multimedia con video embebido (YouTube/Vimeo), galería de fotos interna de la producción e información explicativa.  /eventos (Agenda):/eventos/:id: Detalle del evento, fecha, mapa/ubicación en Google Maps y enlace para compra de entradas o contacto./galeria (Galería Multimedia Global):/galeria/albumes/:id: Álbumes fotográficos generales o de giras/presentaciones con visualizador tipo Lightbox a pantalla completa.  /bio (Perfil & Dossier):Trayectoria completa, dossier de prensa y archivos PDF/CV cargados dinámicamente.C. Rutas Privadas (/admin)/admin/login: Acceso privado mediante Supabase Auth./admin/dashboard: Panel de control autoadministrable para la carga/edición de discos, singles, audios, proyectos, fotos y fechas.  /admin/stats: Panel de métricas visuales con conteo de visitas y ranking de canciones más escuchadas y más queridas (likes).  4. ESQUEMA DE BASE DE DATOS RELACIONAL (SUPABASE - POSTGRESQL)El siguiente esquema en SQL define las tablas, tipos de datos, relaciones y restricciones para la plataforma:SQL-- 1. PERFIL Y DOCUMENTOS DEL ARTISTA
CREATE TABLE artist_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  short_bio TEXT,
  full_bio_markdown TEXT,
  social_links JSONB, -- { instagram, spotify, youtube, email }
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE artist_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, -- Ej: "Dossier de Prensa 2026", "CV Docente"
  document_type TEXT,
  file_url TEXT NOT NULL, -- Enlace al archivo PDF en Cloudflare R2
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MÓDULO MUSICAL (ÁLBUMES, EPS, SINGLES Y TRACKS)
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('album', 'single', 'ep')) DEFAULT 'album',
  release_year INTEGER NOT NULL,
  cover_url TEXT, -- Imagen en Cloudflare R2
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL, -- MP3 en Cloudflare R2
  duration_seconds INTEGER,
  track_order INTEGER DEFAULT 1,
  play_count INTEGER DEFAULT 0,  -- Contador acumulado de escuchas
  likes_count INTEGER DEFAULT 0, -- Contador acumulado de Me Gusta
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MÓDULO PROYECTOS AUDIOVISUALES
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT, -- Ej: "Audiovisual", "Instalación", "Videoclip"
  creation_year INTEGER NOT NULL,
  summary TEXT,
  description_markdown TEXT,
  main_video_url TEXT NOT NULL, -- Enlace o ID de YouTube/Vimeo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MÓDULO GALERÍAS Y FOTOS (RELACIONAL FLEXIBLE)
CREATE TABLE media_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,   -- Opcional: vincula a un disco/single
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- Opcional: vincula a un proyecto
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_album_id UUID REFERENCES media_albums(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('photo', 'video')) DEFAULT 'photo',
  url TEXT NOT NULL, -- Enlace en Cloudflare R2 o CDN
  caption TEXT,
  item_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MÓDULO AGENDA / EVENTOS
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location_name TEXT,
  address_city TEXT,
  google_maps_url TEXT, -- Enlace a ubicación en Google Maps
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  flyer_image_url TEXT,
  ticket_url TEXT, -- Enlace a venta de entradas / link de pago
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('upcoming', 'completed')) DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MÓDULO MÉTRICAS Y ESTADÍSTICAS
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
5. REGLAS DE NEGOCIO E INTERACCIÓN KEY (UI/UX)Singles: Se dan de alta en la tabla albums con type = 'single'. En el frontend se renderizan con el indicador "Single" y al abrirlos cargan directamente su pista única.Audio Persistente vs. Video: El reproductor global de audio de la SPA se pausa automáticamente a través de un evento global cuando el usuario le da reproducir a un video de YouTube/Vimeo en un proyecto o galería.Métrica de Escuchas y Likes:La escucha se computa incrementando play_count en tracks al reproducirse más de 10 segundos.Los likes se persisten localmente en el navegador (localStorage) para prevenir likes duplicados del mismo usuario sin requerir login público.


6. ESPECIFICACIONES TÉCNICAS Y RECOMENDACIONES MULTIMEDIA
Para garantizar una experiencia fluida estilo Spotify (reproducción instantánea y scroll sin congelamientos), la carga de archivos al panel de control (/admin) respetará los siguientes parámetros de optimización:

1. Archivos de Audio (Pistas MP3)
Formato permitido: Únicamente .mp3.

Bitrate recomendado: 192 kbps o 256 kbps (equilibrio óptimo entre calidad acústica imperceptiblemente distinta a 320 kbps y bajo consumo de datos móviles).

Peso máximo por pista: 12 MB.

Limpieza de Metadata: Eliminar portadas e imágenes incrustadas dentro del propio archivo .mp3 (ID3 tags) para reducir de 1 a 3 MB de peso innecesario por canción.

Control en el Panel Admin: Validaciones en el cliente para bloquear archivos de audio no comprimidos (ej: .wav o .flac) y sugerencia de formato ideal.

2. Fotografías e Imágenes (Portadas y Galería)
Formato recomendado: WebP (o JPEG optimizado).

Dimensiones sugeridas:

Portadas de Discos / Singles: Máximo 800 x 800 px (peso estimado: ~80 - 150 KB).

Fotos de Galería / Eventos: Máximo 1920 x 1080 px (peso estimado: ~200 - 400 KB).

Compresión Automática: Implementación de compresión client-side en el formulario de subida del panel privado para transformar y reducir fotos pesadas automáticamente antes de subirlas a Cloudflare R2.

Estrategia Frontend: Uso de Lazy Loading (loading="lazy") para descargar imágenes únicamente a medida que entran en la pantalla.

3. Contenido Audiovisual (Videos)
Alojamiento: YouTube o Vimeo (embebidos).

Costo e Impacto de Servidor: 0 bytes en Cloudflare R2 / Supabase (transferencia e integración ilimitada y gratuita).

Comportamiento en UI: Evento de pausa automática en el Reproductor Persistente al activar la reproducción de cualquier video.