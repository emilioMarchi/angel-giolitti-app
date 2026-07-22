# Migración de Datos — Sitio Anterior → App Nueva

**Origen:** `D:\Emi\tpc-3.0\desarrollo-web\angel-giolitti\client`
**Destino:** Plataforma Supabase + Cloudflare R2

---

## 1. Metadata (projects.js)

**Archivo fuente:** `src/projects.js` — array de 9 objetos `project`.

### Mapeo a tablas de Supabase

| Dato origen | Tabla destino | Notas |
|---|---|---|
| `project.albums[].tracks[]` | `albums` + `tracks` | Cada `project.albums[]` → 1 album; cada `tracks[]` → 1 track. Falta `slug`, `duration_seconds`, `audio_url` (se sube a R2). |
| `project` (sin álbum musical) | `projects` | Proyectos audiovisuales (ej. "Lo inconcebible"). Campos: `title=name`, `slug`, `category=type`, `creation_year=year`, `summary=bio`, `main_video_url=media.videos[0].url`. |
| `project.media.pictures[]` | `media_albums` + `media_items` | Cada proyecto genera un álbum de fotos (type='photo'). |
| `project.media.stickers[]` | `media_albums` + `media_items` | Stickers como otro álbum o items del mismo álbum. |
| `project.media.pdfs[]` | `artist_documents` | PDFs de partituras. `title`, `file_url`, `document_type='partitura'`. |
| `project.socialMedia` | `artist_profile.social_links` | JSONB con redes del artista. |
| Perfil artista (hardcodeado) | `artist_profile` | `full_name='Ángel Giolitti'`, `short_bio`, `full_bio_markdown`. |

### Estructura de carpeta en R2

```
tracks/
  cebu/
  tarahumaras/
  amokyneti/
  bpa/
  los-charlys-del-angel/
  fruttyjazz/
  alan-person/
  handangel/
images/
  gallery/
    cebu/
    tarahumaras/
    amokyneti/
    bpa/
    los-charlys-del-angel/
    fruttyjazz/
    alan-person/
    handangel/
    lo-inconcebible/
  albums/
    cebu/
    tarahumaras/
    amokyneti/
    bpa/
    los-charlys-del-angel/
    fruttyjazz/
    alan-person/
    handangel/
  projects/
    lo-inconcebible/
  profile/
  documents/
```

---

## 2. Archivos estáticos

### 2.1 Audios (.wav)
- **Origen:** `public/projects/{proyecto}/albums/{album}/*.wav`
- **Destino R2:** `tracks/{proyecto}/{album-slug}/{archivo}`
- **Formato actual:** WAV (pesado). **Recomendación:** convertir a MP3/OGG antes de subir.
- **Total estimado:** ~50 tracks.

### 2.2 Imágenes
- **Origen:** `public/projects/{proyecto}/media/` — fotos, perfiles, portadas
- **Origen adicional:** `public/img/tapas/` — tapas de álbumes (amokyneti, tarahumaras)
- **Destino R2:** `images/gallery/{proyecto}/`, `images/albums/{proyecto}/`
- **Recomendación:** convertir a WebP antes de subir.

### 2.3 PDFs (partituras)
- **Origen:** Solo en proyecto `handangel` → `public/projects/handangel/pdfs/` (7 PDFs)
- **Destino R2:** `images/documents/{archivo}`
- **Tabla:** `artist_documents`

### 2.4 Stickers (Handangel)
- **Origen:** `public/projects/handangel/stickers/` (13 archivos)
- **Destino R2:** `images/gallery/handangel/stickers/`

---

## 3. Resumen de proyectos

| # | Proyecto | Tipo | Año | Álbumes | Tracks | Fotos | Videos (YouTube) | PDFs | Stickers |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Cebu | banda | 1997 | 1 | 1 | 0 | 1 | 0 | 0 |
| 1 | Lo inconcebible | documental | 1996 | 0 | 0 | 0 | 1 | 0 | 0 |
| 2 | Tarahumaras | banda | 1999 | 1 | 5 | 2 | 0 | 0 | 0 |
| 3 | Amokyneti | banda | 2003 | 1 | 8 | 2 | 0 | 0 | 0 |
| 4 | BPA | banda | 2005 | 2 | 2 | 0 | 0 | 0 | 0 |
| 5 | Los Charlys del Angel | banda | 2010 | 1 | 5 | 10 | 0 | 0 | 0 |
| 6 | Fruttyazz | banda | 2017 | 1 | 13 | 0 | 0 | 0 | 0 |
| 7 | The Alan Person Experience | banda | 2018 | 1 | 2 | 13 | 0 | 0 | 0 |
| 8 | Handangel | banda | 2017 | 1 | 2 | 8 | 0 | 7 | 13 |

**Totales:** 9 proyectos, 9 álbumes, ~38 tracks, ~35 fotos, 2 videos, 7 PDFs, 13 stickers.

---

## 4. Lo que NO existía en el sitio anterior

- **Eventos/agenda** — no hay datos. Crear desde cero en admin panel.
- **Galería independiente** — las fotos están embebidas en cada proyecto. No hay álbum general.
- **Perfil de artista estructurado** — el nombre y título estaban hardcodeados en el header.
- **Dossier/CV** — no existían. Hay que generarlos nuevos.

---

## 5. Script de migración (pendiente)

Se necesita un script Node/TS que:

1. Lea `src/projects.js` (o convertirlo a JSON primero).
2. Por cada proyecto:
   a. Cree el registro en `albums`, `projects` o ambos según corresponda.
   b. Suba archivos de audio a R2 (`tracks/`).
   c. Suba imágenes de galería a R2 (`images/gallery/`).
   d. Suba PDFs a R2 (`images/documents/`).
   e. Inserte tracks, media_items, artist_documents en Supabase.
3. Inserte perfil del artista en `artist_profile`.
4. Valide que todas las URLs en BD apunten correctamente a R2.
