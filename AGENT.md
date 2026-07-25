Construir un buscador global en una SPA multimedia de alto rendimiento (tipo Spotify) requiere que la experiencia sea inmediata, fluida y unificada.

A nivel conceptual y técnico, acá tenés la guía paso a paso y el script SQL corregido para tu base de datos en Supabase.

---

### 🛠️ 1. Script SQL Corregido para Supabase (SQL Editor)

Si el editor de Supabase te arrojó un error de sintaxis en `RETURNS JSON AS $$`, se debe a cómo interpreta el parser los símbolos de dólar vacíos (`$$`). Usando un identificador de bloque como `$body$` se soluciona este problema:

```sql
-- 1. Habilitar la extensión para ignorar tildes
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Crear la función RPC de búsqueda global unificada
CREATE OR REPLACE FUNCTION global_search(query_text TEXT)
RETURNS JSON AS $body$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'tracks', (
      SELECT COALESCE(json_agg(t), '[]'::json)
      FROM (
        SELECT tr.id, tr.album_id, tr.title, tr.audio_url, tr.duration_seconds, tr.track_order, 
               al.title as album_title, al.cover_url,
               pr.title as project_title, pr.slug as project_slug
        FROM tracks tr
        LEFT JOIN albums al ON tr.album_id = al.id
        LEFT JOIN projects pr ON al.project_id = pr.id
        WHERE unaccent(tr.title) ILIKE unaccent('%' || query_text || '%')
        LIMIT 5
      ) t
    ),
    'albums', (
      SELECT COALESCE(json_agg(a), '[]'::json)
      FROM (
        SELECT al.id, al.title, al.type, al.release_year, al.cover_url, al.slug,
               pr.title as project_title, pr.slug as project_slug
        FROM albums al
        LEFT JOIN projects pr ON al.project_id = pr.id
        WHERE unaccent(al.title) ILIKE unaccent('%' || query_text || '%')
        LIMIT 5
      ) a
    ),
    'projects', (
      SELECT COALESCE(json_agg(p), '[]'::json)
      FROM (
        SELECT id, title, category, creation_year, main_video_url, slug
        FROM projects
        WHERE unaccent(title) ILIKE unaccent('%' || query_text || '%')
        LIMIT 5
      ) p
    )
  ) INTO result;

  RETURN result;
END;
$body$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 💻 2. Consumo en el Frontend (Next.js / React)

El hook personalizado se encuentra implementado en `src/hooks/useGlobalSearch.ts` y la página visual en `src/app/buscador/page.tsx`.

* **Debounce**: El hook espera 300ms antes de disparar la consulta a Supabase.
* **Control de Race Conditions**: Si el usuario escribe rápido, se cancela la petición anterior evitando desfases en los resultados.
* **Integración con Audio**: Al presionar play en una canción de los resultados, se carga en el reproductor de Zustand de inmediato.
