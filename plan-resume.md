# 🚀 RESUMEN DE PROYECTO Y ESTADO DE AVANCE (plan-resume.md)

Este documento sirve como punto de partida y contexto inmediato para cualquier agente de IA o desarrollador que retome el proyecto. Contiene el estado actual, especificaciones del stack y los siguientes pasos a seguir.

**Última actualización:** 22 de Julio de 2026 (ART)

---

## 📌 1. CONTEXTO GENERAL
* **Proyecto:** Plataforma Web Autoadministrable para el artista **Ángel Giolitti** ([angelgiolitti.com.ar](https://angelgiolitti.com.ar)).
* **Estudio/Desarrollador:** OVNI Studio — Emilio Marchi.
* **Objetivo:** SPA multimedia (estilo Spotify) con un Reproductor de Audio Global y Persistente (no se interrumpe al navegar) y un Panel de Administración privado para autoadministración de discos, eventos, proyectos y fotos.
* **Premisa Técnica:** Infraestructura con un costo operativo de **$0 USD/mes** mediante tiers gratuitos.

---

## 🛠️ 2. STACK TECNOLÓGICO (ya instalado y configurado)
| Tecnología | Versión | Ubicación / Uso |
| :--- | :--- | :--- |
| Next.js (App Router) | 16.2.11 | Framework principal, SSR/SSG |
| React | 19.2.4 | UI Components |
| TypeScript | ^5 | Tipado estático |
| Tailwind CSS | v4 | Estilos (`@theme inline` en globals.css, sin tailwind.config.js) |
| shadcn/ui | base-nova | Componentes UI (`src/components/ui/`) |
| Zustand | latest | Estado global del reproductor |
| Supabase JS | latest | Cliente BD + Auth (`src/lib/supabase.ts`) |
| AWS SDK (S3 Client) | latest | Cliente Cloudflare R2 (`src/lib/r2.ts`) |
| Lucide React | latest | Iconografía |
| Inter (Google Font) | - | Fuente de cuerpo (variable `--font-sans`) |
| Outfit (Google Font) | - | Fuente de títulos (variable `--font-heading`) |

---

## 🚦 3. ESTADO DE AVANCE POR ETAPAS

### ✅ ETAPA 1: Infraestructura Base — COMPLETADA
* Proyecto Next.js inicializado con todas las dependencias.
* Supabase conectado y tablas/RLS creadas (validado vía API).
* Cloudflare R2 conectado y accesible (bucket `angel-giolitti-bucket`, validado vía API S3).
* Variables de entorno en `.env.local` (renombrado desde `env.local`).
* *Nota:* `SUPABASE_SERVICE_ROLE_KEY` sigue como placeholder.

### ✅ ETAPA 2: Sistema de Diseño + Reproductor Global — COMPLETADA
* **Tema visual:** Oscuro premium nativo con acentos turquesa (`#14b8a6`) estilo Spotify.
* **Layout SPA:** CSS Grid implementado en `src/app/globals.css` (Sidebar izq, TopBar arriba, main al centro, y Player abajo).
* **Store Zustand:** `src/store/usePlayerStore.ts` — estado completo del reproductor (track, queue, play/pause, volumen, progreso) persistente.
* **GlobalAudioPlayer:** `src/components/GlobalAudioPlayer.tsx` — barra inferior con controles, progreso seekable, volumen e info del track.
* **Navegación:** `Sidebar` y `TopBar` desarrollados y funcionales.

### ✅ ETAPA 3: Módulos Públicos (Frontend SPA) — COMPLETADA
* **Home (`/`):** **[COMPLETADO]** Perfil de artista estilo Spotify con hero banner (foto `photo-3.webp` con gradiente de legibilidad), avatar (`photo-0.webp`), tracks populares con ecualizador animado, discografía con links a `/musica/{slug}`, eventos próximos y acceso rápido.
* **Música (`/musica`):** **[COMPLETADO]** Listado por álbumes/EPs/Singles con links a vista individual `/musica/[slug]`. Cada card linkea a la ruta dinámica del álbum. Play inline sin navegar.
* **Música - Álbum Individual (`/musica/[slug]`):** **[COMPLETADO]** Ruta dinámica que busca álbum por `slug` en Supabase, muestra portada, tracklist, controles de play y metadatos.
* **Proyectos (`/proyectos`):** **[COMPLETADO]** Grid audiovisual con portada del proyecto junto al título, embebido dinámico (YouTube/Vimeo) y auto-pausa del reproductor global.
* **Eventos (`/eventos`):** **[COMPLETADO]** Listado cronológico "Próximas" y "Pasadas", vista detallada con flyer y enlaces a tickets.
* **Galería (`/galeria`):** **[COMPLETADO]** Lightbox corregido — `slides` estabilizado con `useMemo`, eliminado `setLightboxIndex` del `on.view` para evitar reinicio al navegar. Álbumes de fotos/videos con lightbox unificado.
* **Bio (`/bio`):** **[COMPLETADO]** Vista simplificada con avatar centrado (`photo-7.webp`), bio completa, discografía destacada, eventos, redes sociales, dossier PDF y CV.
* **Reproductor Global:** **[COMPLETADO]** Al cargar el sitio, busca el track por defecto (`tracks/handangel/handangel/patio-colibri.mp3`) en Supabase, trae portada del álbum y lo setea automáticamente.
* **Migración Datos (`Paso 3.7`):** **[COMPLETADO]** Scripts `migrate.js` y `migrate_patch.js`. Todos los datos subidos a R2 y registrados en Supabase.
* **Alineación de Datos Reales (`Paso 3.8`):** **[COMPLETADO]** Todas las páginas conectadas a Supabase con fallbacks mock. Helper `getR2Url()` para resolver paths relativos de R2.
* **Buscador Global:** Pendiente para iteración futura tras el Panel Admin.

### ⬜ ETAPA 4: Panel de Administración (`/admin`) — PENDIENTE
### ⬜ ETAPA 5: Métricas, SEO y Optimizaciones — PENDIENTE
### ⬜ ETAPA 6: QA, Despliegue y Entrega — PENDIENTE

---

## 🗂️ 4. MAPA DE ARCHIVOS CLAVE DEL PROYECTO

```
angel-giolitti/
├── .env.local                          # Variables de entorno (Supabase + R2)
├── PLAN_DESARROLLO.md                  # Plan detallado por etapas con casillas de estado
├── plan-resume.md                      # ← ESTE ARCHIVO (resumen para agentes)
├── base-proyect.md                     # Especificación técnica original
├── schema.sql                          # DDL de PostgreSQL ejecutado en Supabase
├── log.md                              # Log de configuraciones y URLs de referencia
├── components.json                     # Config de shadcn/ui
├── scripts/
│   ├── migrate.js                      # Script principal de migración
│   └── migrate_patch.js                # Parche de migración para corregir fallos
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Layout raíz (Navbar + children + Player)
│   │   ├── globals.css                 # Tema oscuro premium + tokens CSS + estilos Spotify
│   │   ├── page.tsx                    # Home — Perfil de artista (hero, tracks, discografía)
│   │   ├── bio/page.tsx                # Biografía con avatar, bio, redes, dossier
│   │   ├── musica/
│   │   │   ├── page.tsx               # Listado de álbumes/EPs/singles/playlists
│   │   │   └── [slug]/page.tsx        # Vista individual de álbum por slug
│   │   ├── proyectos/
│   │   │   ├── page.tsx               # Grid de proyectos audiovisuales
│   │   │   └── [slug]/page.tsx        # (futuro) Detalle de proyecto
│   │   ├── eventos/page.tsx           # Agenda de eventos
│   │   └── galeria/page.tsx           # Galería de fotos/videos
│   ├── components/
│   │   ├── GlobalAudioPlayer.tsx       # Reproductor persistente (init con track por defecto)
│   │   ├── Navbar.tsx                  # Navegación superior
│   │   └── ui/                         # Componentes shadcn/ui
│   ├── lib/
│   │   ├── supabase.ts                 # Cliente Supabase (público)
│   │   ├── r2.ts                       # Cliente S3 para Cloudflare R2 (servidor)
│   │   └── utils.ts                    # cn() + getR2Url() helper
│   └── store/
│       └── usePlayerStore.ts           # Store Zustand del reproductor
└── package.json
```

---

## 🚀 5. PRÓXIMO PASO INMEDIATO (DÓNDE RETOMAR)

**Ubicación en el plan:** [PLAN_DESARROLLO.md — Etapa 4](file:///D:/Emi/OVNI/proyectos/angel-giolitti/PLAN_DESARROLLO.md)

### Para el siguiente agente:

1. **Etapa 3 completa.** Todas las rutas públicas funcionan con datos reales de Supabase + R2.
2. **Siguiente paso: Etapa 4 — Panel de Administración (`/admin`)**
   * Autenticación con Supabase Auth
   * Dashboard con métricas
   * CRUD de álbumes, tracks, proyectos, eventos y galerías
   * Gestión de perfil y documentos

### Archivos de referencia obligatorios:
* Leer [base-proyect.md](file:///D:/Emi/OVNI/proyectos/angel-giolitti/base-proyect.md) para las especificaciones de cada módulo.
* Leer [schema.sql](file:///D:/Emi/OVNI/proyectos/angel-giolitti/schema.sql) para la estructura de tablas.
* Leer [AGENTS.md](file:///D:/Emi/OVNI/proyectos/angel-giolitti/AGENTS.md) antes de escribir código Next.js.
