# AGENTS.md — Contexto del Proyecto angelgiolitti.com.ar

## Resumen del Proyecto

Sitio web SPA multimedia estilo Spotify para el artista **Ángel Giolitti**. Reproductor de audio persistente, navegación client-side sin interrupción de audio, costo $0/mes.

**Stack:** Next.js 16 (App Router) | React 19 | TypeScript | Tailwind CSS v4 | shadcn/ui | Zustand | Supabase (PostgreSQL) | Cloudflare R2

---

## Estado del Desarrollo

| Etapa | Estado |
|---|---|
| Etapa 1: Infraestructura & Base de Datos | COMPLETADA |
| Etapa 2: UI/UX & Reproductor Global | COMPLETADA |
| Etapa 3: Módulos Públicos (SPA) | COMPLETADA |
| Etapa 4: Panel de Administración | PENDIENTE |
| **Etapa 5: Métricas, Seguridad, SEO** | **EN DESARROLLO (esta tarea)** |
| Etapa 6: QA, Despliegue y Entrega | PENDIENTE |

---

## Instrucciones de log.md — Resumen

Las instrucciones definen el módulo de métricas y rankeo con **foco exclusivo en audio/tracks**:

### 1. Métricas por Track
- **`play_count`**: Se incrementa en +1 mediante la RPC `increment_track_play` una vez que el reproductor registra **10 a 15 segundos continuos** de audio.
- **`likes_count`**: Se incrementa en +1 mediante la RPC `increment_track_like`. El estado visual del corazón se persiste en **localStorage** para evitar votos duplicados por usuario sin requerir registro.

### 2. Métricas Globales del Artista (único perfil)
- **Total de Reproducciones Acumuladas**: suma de `play_count` de todos los tracks.
- **Total de "Me Gusta"**: suma de `likes_count` de todos los tracks.
- **Top Canciones**: `SELECT * FROM tracks ORDER BY play_count DESC LIMIT 10`
- **Top Favoritas**: `SELECT * FROM tracks ORDER BY likes_count DESC LIMIT 10`

### 3. Cambios en el Schema SQL
- **Eliminar tabla `page_views`**: No se acumulan registros innecesarios en PostgreSQL.
- **Agregar RPC `decrement_track_like`**: Para desmarcar "Me Gusta".
- **Agregar RPC `get_artist_metrics`**: Retorna totales acumulados (plays, likes, tracks) en una sola llamada.
- **Agregar índices**: `idx_tracks_play_count` y `idx_tracks_likes_count`.

---

## Análisis: Estado Actual vs. Requerido

### Base de Datos (`schema.sql`)

| Elemento | Estado actual | Acción |
|---|---|---|
| Tabla `tracks` con `play_count`, `likes_count` | Existe | OK — Sin cambios |
| RPC `increment_track_play` | Existe | OK — Sin cambios |
| RPC `increment_track_like` | Existe | OK — Sin cambios |
| RPC `decrement_track_like` | **NO existe** | **CREAR** — Agregar al `schema.sql` y ejecutar en Supabase |
| RPC `get_artist_metrics` | **NO existe** | **CREAR** — Agregar al `schema.sql` y ejecutar en Supabase |
| Índice `idx_tracks_play_count` | **NO existe** | **CREAR** |
| Índice `idx_tracks_likes_count` | **NO existe** | **CREAR** |
| Tabla `page_views` + policies | Existe | **ELIMINAR** de `schema.sql` y ejecutar `DROP TABLE` en Supabase |
| `global_search` con métricas | Existe pero sin `play_count`/`likes_count` en SELECT de tracks | **ACTUALIZAR** |

### Frontend

| Elemento | Estado actual | Acción |
|---|---|---|
| `GlobalAudioPlayer` — tracking de plays | Sin funcionalidad | **IMPLEMENTAR**: llamar `increment_track_play` tras 10-15s de playback continuo, con flag anti-duplicado por sesión |
| `GlobalAudioPlayer` — botón Heart (like) | Icono placeholder, sin handler | **IMPLEMENTAR**: verificar localStorage → llamar `increment_track_like` o `decrement_track_like` → toggle visual |
| `usePlayerStore` — estado de likes | No existe | **CREAR**: Set de liked track IDs persistido en localStorage via Zustand `persist` |
| Home (`page.tsx`) — mostrar métricas | Sin métricas | **CREAR** sección de Top Tracks (por plays) y Top Favoritas (por likes), totales acumulados |
| Utilidad para llamar RPCs de métricas | No existe | **CREAR** función helper en `src/lib/supabase.ts` o archivo dedicado |

---

## Plan de Tareas (Desarrollo)

### Tarea 1: Actualizar Schema SQL
- [ ] Agregar RPC `decrement_track_like(target_track_id UUID)` al `schema.sql`
- [ ] Agregar RPC `get_artist_metrics()` al `schema.sql`
- [ ] Agregar índices `idx_tracks_play_count` y `idx_tracks_likes_count`
- [ ] Eliminar tabla `page_views`, sus policies RLS y el `INSERT` público
- [ ] Actualizar `global_search` para incluir `play_count` y `likes_count` en el SELECT de tracks
- [ ] Ejecutar script actualizado en Supabase (o crear script de migración)

### Tarea 2: Funciones Helper de Supabase
- [ ] Crear `src/lib/metrics.ts` con funciones:
  - `incrementPlay(trackId)` → llama `increment_track_play`
  - `incrementLike(trackId)` → llama `increment_track_like`
  - `decrementLike(trackId)` → llama `decrement_track_like`
  - `getArtistMetrics()` → llama `get_artist_metrics`

### Tarea 3: Store de Likes (localStorage)
- [ ] Agregar al `usePlayerStore` (o crear store separado `useLikesStore`):
  - Estado: `likedTrackIds: string[]` (IDs de tracks con like activo)
  - Persistencia: Zustand `persist` middleware → localStorage key `angel-giolitti-likes`
  - Acciones: `toggleLike(trackId)` que:
    1. Verifica si el track ya está en `likedTrackIds`
    2. Si está → llama `decrementLike` y lo quita del Set
    3. Si no está → llama `incrementLike` y lo agrega al Set

### Tarea 4: Tracking de Plays en GlobalAudioPlayer
- [ ] En `GlobalAudioPlayer.tsx`, agregar `useEffect` que monitoree `progress`:
  - Cuando `progress >= 10` (segundos) y el track actual tiene `id` válido:
    1. Verificar si ya se registró un play para este track en esta sesión (ref o Set en memoria)
    2. Si no se registró → llamar `incrementPlay(currentTrack.id)` y marcar como registrado
    3. Resetear flag cuando cambie el track (`currentTrack.id` cambia)
  - **No registrar play si el audio fue muted durante los primeros 10 segundos** (opcional, según spec)

### Tarea 5: Botón Heart Funcional
- [ ] En `GlobalAudioPlayer.tsx`, implementar handler del botón Heart:
  - Leer `likedTrackIds` del store
  - Mostrar `Heart` relleno (fill) si el track actual está liked, outline si no
  - On click → `toggleLike(currentTrack.id)`
- [ ] Estilo visual: color turquesa/rojo cuando está activo

### Tarea 6: Mostrar Métricas en el Home
- [ ] En `src/app/page.tsx`, agregar sección con:
  - Totales acumulados (reproducciones, likes, total de tracks)
  - Top 10 canciones por `play_count`
  - Top 10 favoritas por `likes_count`
  - Diseño consistente con el estilo Spotify existente (cards oscuras, acentos turquesa)

---

## Estructura de Archivos Relevante

```
angel-giolitti/
├── schema.sql                          # DDL Supabase (ACTUALIZAR)
├── log.md                              # Instrucciones del cliente
├── AGENTS.md                           # Este archivo
├── PLAN_DESARROLLO.md                  # Plan general del proyecto
├── src/
│   ├── lib/
│   │   ├── supabase.ts                 # Cliente Supabase browser
│   │   ├── r2.ts                       # Cliente Cloudflare R2
│   │   └── utils.ts                    # cn() + getR2Url()
│   ├── store/
│   │   └── usePlayerStore.ts           # Store Zustand del reproductor (MODIFICAR)
│   ├── components/
│   │   ├── GlobalAudioPlayer.tsx       # Reproductor persistente (MODIFICAR)
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── MobileHero.tsx
│   └── app/
│       ├── layout.tsx                  # Layout raíz
│       ├── page.tsx                    # Home (MODIFICAR)
│       ├── globals.css                 # Design tokens
│       └── ...
```

---

## Convenciones del Proyecto

- **Componentes**: `'use client'` directiva arriba del archivo
- **Estilos**: Tailwind CSS + clases CSS custom en `globals.css` (patrón Spotify dark)
- **Estado global**: Zustand con `persist` middleware para datos en localStorage
- **Supabase**: Cliente en `src/lib/supabase.ts`, queries inline en componentes (sin capa de servicios separada)
- **RPCs**: Se llaman con `supabase.rpc('nombre_funcion', { param: value })`
- **R2 URLs**: Resolver con `getR2Url(path)` de `src/lib/utils.ts`
- **Tipos**: Interfaces definidas localmente en cada archivo (sin carpeta shared/types)
- **Sin comentarios** en el código salvo que se soliciten explícitamente
