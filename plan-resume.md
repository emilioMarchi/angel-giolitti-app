# 🚀 RESUMEN DE PROYECTO Y ESTADO DE AVANCE (plan-resume.md)

Este documento sirve como punto de partida y contexto inmediato para cualquier agente de IA o desarrollador que retome el proyecto. Contiene el estado actual, especificaciones del stack y los siguientes pasos a seguir.

**Última actualización:** 21 de Julio de 2026, 13:15hs (ART)

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
* **Tema visual:** Oscuro premium nativo con acentos dorados definido en `src/app/globals.css`.
* **Store Zustand:** `src/store/usePlayerStore.ts` — estado completo del reproductor (track, queue, play/pause, volumen, progreso, etc.) con persistencia de volumen en localStorage.
* **GlobalAudioPlayer:** `src/components/GlobalAudioPlayer.tsx` — barra inferior fija con glassmorphism, controles, barra de progreso seekable, volumen, info del track. Se oculta si no hay track cargado.
* **Navbar:** `src/components/Navbar.tsx` — barra superior fija con glassmorphism, links de navegación (Inicio, Música, Proyectos, Eventos, Galería, Bio), detección de ruta activa, menú hamburguesa móvil.
* **Layout raíz:** `src/app/layout.tsx` integra `<Navbar />` + `{children}` + `<GlobalAudioPlayer />`.

### ⏳ ETAPA 3: Módulos Públicos (Frontend SPA) — EN PROGRESO
* **Home (`/`):** Estructura base creada en `src/app/page.tsx` con hero section (orbes luminosos, CTAs), sección de lanzamientos destacados (3 cards placeholder) y próximas fechas (3 eventos placeholder). **Falta conectar a Supabase.**
* **Música (`/musica`):** Pendiente.
* **Proyectos (`/proyectos`):** Pendiente.
* **Eventos (`/eventos`):** Pendiente.
* **Galería (`/galeria`):** Pendiente.
* **Bio (`/bio`):** Pendiente.

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
├── log.md                              # Log de configuraciones (CORS, etc.)
├── components.json                     # Config de shadcn/ui
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Layout raíz (Navbar + children + Player)
│   │   ├── globals.css                 # Tema oscuro premium + tokens CSS
│   │   └── page.tsx                    # Home page con placeholders
│   ├── components/
│   │   ├── GlobalAudioPlayer.tsx       # Reproductor persistente inferior
│   │   ├── Navbar.tsx                  # Barra de navegación superior
│   │   └── ui/
│   │       └── button.tsx              # Componente Button de shadcn/ui
│   ├── lib/
│   │   ├── supabase.ts                 # Cliente Supabase (público)
│   │   ├── r2.ts                       # Cliente S3 para Cloudflare R2 (servidor)
│   │   └── utils.ts                    # Utilidad cn() para clases CSS
│   └── store/
│       └── usePlayerStore.ts           # Store Zustand del reproductor
└── package.json                        # Dependencias del proyecto
```

---

## 🚀 5. PRÓXIMO PASO INMEDIATO (DÓNDE RETOMAR)

**Ubicación en el plan:** [PLAN_DESARROLLO.md — Etapa 3, Paso 3.2](file:///D:/Emi/OVNI/proyectos/angel-giolitti/PLAN_DESARROLLO.md)

### Para el siguiente agente:

1. **Verificar que la app compila:** Ejecutar `npm run dev` y visitar `http://localhost:3000`. Debería verse la home con tema oscuro, navbar y el hero section. El reproductor de audio no se mostrará hasta que se cargue un track.

2. **Continuar con la Etapa 3 — Módulos Públicos:**
   * **Paso 3.2: Módulo Música (`/musica`):** Crear `src/app/musica/page.tsx` con catálogo de álbumes desde Supabase, y `src/app/musica/albumes/[id]/page.tsx` con detalle del álbum y lista de tracks con botones de reproducción que interactúen con el `usePlayerStore`.
   * **Paso 3.3: Módulo Proyectos (`/proyectos`):** Grid de proyectos audiovisuales con embed de YouTube/Vimeo y auto-pausa del audio global.
   * **Paso 3.4: Módulo Eventos (`/eventos`):** Listado cronológico con mapa de Google Maps.
   * **Paso 3.5: Módulo Galería (`/galeria`):** Álbumes fotográficos con lightbox.
   * **Paso 3.6: Módulo Bio (`/bio`):** Biografía + dossier PDF descargable.

3. **Conectar Home a Supabase:** Reemplazar los placeholders en `src/app/page.tsx` con queries reales a las tablas `albums` y `events`.

### Archivos de referencia obligatorios:
* Leer [base-proyect.md](file:///D:/Emi/OVNI/proyectos/angel-giolitti/base-proyect.md) para las especificaciones de cada módulo.
* Leer [schema.sql](file:///D:/Emi/OVNI/proyectos/angel-giolitti/schema.sql) para la estructura de tablas.
* Leer [AGENTS.md](file:///D:/Emi/OVNI/proyectos/angel-giolitti/AGENTS.md) antes de escribir código Next.js (puede haber breaking changes).
