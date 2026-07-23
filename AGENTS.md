<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project State & Plan

## Current State (v1.2)

### Implemented Features

#### Music (`/musica`)
- Album listing with project inheritance (members, project title)
- Dynamic album detail pages (`/musica/[slug]`)
- Project title displayed above members in detail views
- Project name shown on album cards (smaller text under title)
- Members inherited from linked project if album has none

#### Projects (`/proyectos`)
- Project listing with members on cards
- Dynamic project detail pages (`/proyectos/[slug]`)
- Full detail view: video, albums with tracks, galleries, documents
- Members displayed in header and detail sections
- FolderOpen icon used consistently (sidebar, header, cards, home)

#### Gallery (`/galeria`)
- Gallery album listing
- Dynamic gallery detail pages (`/galeria/[slug]`)
- Lightbox with photo/video support
- Handangel stickers album populated (11 items)

#### Home (`/`)
- Popular tracks, discography, events, quick access
- FolderOpen icon for Proyectos quick access

#### Database (Supabase)
- `projects`: members populated for all 9 projects
- `albums`: 2/10 albums have own members, rest inherit from project
- `media_albums`: 6 albums including Handangel stickers
- `media_items`: Stickers album now has 11 items
- All R2 URLs processed via `getR2Url()`

### UI Consistency
- Removed "Ángel Giolitti" from album/project headers
- Members display: name + roles in parentheses
- FolderOpen icon for all project references
- Consistent card layouts across sections

---

## Next Steps (Priority Order)

### 1. Search Implementation (`/buscar`)
**Specifications needed from user:**
- Search scope: albums, tracks, projects, gallery albums, media items?
- Search type: full-text, prefix, fuzzy?
- Results display: unified list or grouped by type?
- Debounce timing?
- Keyboard shortcuts (Cmd+K)?
- Recent searches?
- Empty state handling?

### 2. Other Potential Improvements
- Event pages dynamic routes (`/eventos/[slug]`)
- Bio page enhancements
- SEO/meta tags for dynamic routes
- Image optimization/blur placeholders
- Error boundaries
- Loading skeletons for detail pages
- Accessibility improvements

---

## Database Schema Reference

```sql
projects (
  id, title, slug, category, creation_year, end_year,
  profile_image_url, cover_image_url, summary, description_markdown,
  main_video_url, members JSONB, created_at
)

albums (
  id, project_id, title, slug, type, release_year,
  cover_url, description, members JSONB, created_at
)

tracks (
  id, album_id, title, slug, audio_url, duration_seconds,
  track_order, play_count, likes_count, created_at
)

media_albums (
  id, title, slug, description, cover_image_url,
  album_id, project_id, created_at
)

media_items (
  id, media_album_id, type, url, caption, item_order, created_at
)
```

---

## Commands
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint check