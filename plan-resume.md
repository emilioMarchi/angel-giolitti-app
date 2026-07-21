# 🚀 RESUMEN DE PROYECTO Y ESTADO DE AVANCE (plan-resume.md)

Este documento sirve como punto de partida y contexto inmediato para cualquier agente de IA o desarrollador que retome el proyecto. Contiene el estado actual, especificaciones del stack y los siguientes pasos a seguir.

**Última actualización:** 21 de Julio de 2026, 16:10hs (ART)

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

### ⏳ ETAPA 3: Módulos Públicos (Frontend SPA) — EN PROGRESO
* **Home (`/`):** **[COMPLETADO]** Creado como un "Perfil de Artista" idéntico a Spotify (Hero grande con gradient, avatar, tracks destacados con ecualizador animado, barra de botones integradas).
* **Música (`/musica`):** **[COMPLETADO]** Listado por álbumes/EPs/Singles (orden cronológico) más sección "Playlists del Artista". Permite expandir cada disco en la misma vista (SPA pura) para reproducir directo con Zustand. (Incluye fix `supabase.ts` para despliegue sin fallos SSR en Vercel).
* **Proyectos (`/proyectos`):** **[COMPLETADO]** Grid audiovisual inmersivo conectado a Supabase con embebido dinámico (YouTube/Vimeo) y auto-pausa del audio general de Zustand.
* **Eventos (`/eventos`):** **[COMPLETADO]** Diseño "Live Events" tipo Spotify conectado a Supabase. Fechas "Próximas" y "Pasadas" separadas. Vista detallada con flyer y enlaces a tickets y Google Maps.
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

**Ubicación en el plan:** [PLAN_DESARROLLO.md — Etapa 3, Paso 3.5](file:///D:/Emi/OVNI/proyectos/angel-giolitti/PLAN_DESARROLLO.md)

### Para el siguiente agente:

1. **Verificar que la app compila y levanta correctamente:** Ejecutar `npm run dev` y visitar `http://localhost:3000`. Debe verse la app y sus pestañas (Música, Proyectos, Eventos) funcionando.
2. **Nuevos módulos por abordar (Módulos Estáticos / Finales de UI):**
   * **Paso 3.5: Módulo Galería (`/galeria`):** UI para mostrar fotos y álbumes (idealmente con componente lightbox o modal).
   * **Paso 3.6: Módulo Bio (`/bio`):** Biografía e información de prensa y descargas PDF.
   * **Conectar Home:** Actualizar la Home (`/`) para que lea dinámicamente los últimos lanzamientos de música y fechas próximas reales desde Supabase.
3. (Opcional): Comenzar con la **Etapa 4 (Panel Admin `/admin`)** para dotar a la plataforma de un CMS protegido.

### Archivos de referencia obligatorios:
* Leer [base-proyect.md](file:///D:/Emi/OVNI/proyectos/angel-giolitti/base-proyect.md) para las especificaciones de cada módulo.
* Leer [schema.sql](file:///D:/Emi/OVNI/proyectos/angel-giolitti/schema.sql) para la estructura de tablas (`projects`, `events`, etc.).
* Leer [AGENTS.md](file:///D:/Emi/OVNI/proyectos/angel-giolitti/AGENTS.md) antes de escribir código Next.js.
