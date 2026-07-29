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
| **Etapa 5: Métricas, Seguridad, SEO** | **EN DESARROLLO (actual)** |
| Etapa 6: QA, Despliegue y Entrega | PENDIENTE |

---

## Plan: plan-mejoras.md (UI/UX — Independiente de Etapa 5)

Solo las 4 fases del plan de mejoras visuales/UX:

### 🟢 Fase 1: Ajustes de UI y Maquetado Rápido (Baja complejidad)

Cambios visuales, accesos directos y componentes simples sin estado complejo ni backend.

- [ ] **Sección "Conectar" en /home:** Links directos a Instagram, YouTube, Spotify
- [ ] **Botón WhatsApp en /eventos:** Botón con mensaje predefinido por evento (lista + detalle)
- [ ] **Acción de Compartir:** Menú 3 puntos (...) con opciones share
- [ ] **Cabecera / Hero en /home:** Reubicar Play button (desktop), Seguir, 3 puntos arriba de "Populares"

---

### 🟡 Fase 2: Layout Responsive, Unificación de Búsqueda y Navegación (Media)

Refactorización UX/UI, unificación de componentes de búsqueda y navegación mobile.

- [ ] **Unificación del Buscador:** Eliminar versión sidebar, centralizar en TopBar con input + dropdown resultados estilo Spotify (sin solapar pantalla completa)
- [ ] **Navegador Mobile:** Anclar barra sobre banner, Home + Búsqueda visibles, hamburguesa para resto

---

### 🟠 Fase 3: Reproductor de Audio y Estado Global (Media-Alta)

Lógica de reproducción, sincronización entre componentes y reproductor global.

- [ ] **Sync play/pause Home:** Botón Play/Pause principal sincronizado con `usePlayerStore`
- [ ] **Shuffle:** Lógica reproducción no lineal, sincronizada con queue

---

### 🔴 Fase 4: Base de Datos, Arquitectura y Algoritmos (Alta)

Backend, estructura de datos y cálculo de contenido dinámico.

- [ ] **Auditoría DB Playlists:** Verificar esquema soporta creación/guardado/persistencia
- [ ] **Algoritmo "Populares":** Query ordenada por `play_count` (últimos 30d / total)
- [ ] **Secciones dinámicas Home:** Integrar Eventos/Próximos, Multimedia, Playlists

---

## Estructura de Archivos Relevante

```
angel-giolitti/
├── schema.sql                          # DDL Supabase (Fase 4)
├── log.md                              # Instrucciones cliente
├── AGENTS.md                           # Este archivo
├── PLAN_DESARROLLO.md                  # Plan general
├── plan-mejoras.md                     # Este plan (fuente de verdad)
├── src/
│   ├── lib/
│   │   ├── supabase.ts                 # Cliente Supabase browser
│   │   ├── r2.ts                       # Cliente Cloudflare R2
│   │   └── utils.ts                    # cn() + getR2Url()
│   ├── store/
│   │   └── usePlayerStore.ts           # MODIFICAR (Fase 3: shuffle, sync)
│   ├── components/
│   │   ├── GlobalAudioPlayer.tsx       # MODIFICAR (Fase 3)
│   │   ├── Sidebar.tsx                 # MODIFICAR (Fase 2: quitar buscador)
│   │   ├── TopBar.tsx                  # MODIFICAR (Fase 2: buscador unificado, Fase 1: share menu)
│   │   └── MobileHero.tsx              # MODIFICAR (Fase 1: hero reorder)
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx                    # MODIFICAR (Fase 1: Conectar, Hero; Fase 4: Populares, secciones dinámicas)
│       ├── eventos/page.tsx            # MODIFICAR (Fase 1: WhatsApp button)
│       ├── globals.css
│       └── ...
```

---

## Convenciones del Proyecto

- **Componentes**: `'use client'` directiva arriba del archivo
- **Estilos**: Tailwind CSS + clases CSS custom en `globals.css` (patrón Spotify dark)
- **Estado global**: Zustand con `persist` middleware para datos en localStorage
- **Supabase**: Cliente en `src/lib/supabase.ts`, queries inline en componentes
- **RPCs**: `supabase.rpc('nombre_funcion', { param: value })`
- **R2 URLs**: Resolver con `getR2Url(path)` de `src/lib/utils.ts`
- **Tipos**: Interfaces definidas localmente en cada archivo
- **Sin comentarios** en el código salvo que se soliciten explícitamente