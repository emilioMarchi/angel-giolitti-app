


Asunto: Especificaciones consolidadas de Métricas, Rankeo y Script DDL actualizado para Supabase

Hola, te paso las definiciones finales y simplificadas para el módulo de métricas y rankeo del sitio de Ángel Giolitti, junto con el script DDL actualizado para ejecutar directamente en Supabase.

1. Definición de Métricas del Proyecto (Foco Exclusivo en Audio)
Las métricas del sitio se aplicarán únicamente a la capa de audio / tracks, descartando métricas para la capa de proyectos, videos o páginas vistas generales.

A. Métricas por Canción (tracks)
play_count (Reproducciones): Se incrementa en +1 mediante la función RPC increment_track_play una vez que el reproductor registra 10 a 15 segundos continuos de audio.

likes_count (Me Gusta por Track): Se incrementa en +1 mediante la función RPC increment_track_like. El estado visual del corazón se persiste en el localStorage del navegador para evitar votos duplicados por usuario sin requerir registro.

B. Métricas Globales del Artista (Un solo perfil)
Total de Oyentes / Reproducciones Acumuladas: La suma de play_count de todas las canciones registradas en la base de datos.

Total de "Me Gusta": La suma de likes_count de todas las canciones registradas.

Rankings y Tops:

Top Canciones: SELECT * FROM tracks ORDER BY play_count DESC LIMIT 10;

Top Favoritas: SELECT * FROM tracks ORDER BY likes_count DESC LIMIT 10;

2. Cambios y Limpieza en el Esquema SQL
Eliminación de page_views: Se remueve la tabla page_views para no acumular registros innecesarios en PostgreSQL. Si a futuro se requiere medir tráfico general, se integrará una herramienta ligera a nivel cliente (ej. Cloudflare Web Analytics).

Soporte para Desmarcar "Me Gusta" (Decremento): Se agrega la función RPC decrement_track_like para permitir al usuario quitar un like previamente otorgado.

Función de Vista Consolidada del Artista (get_artist_metrics): Función RPC para consultar los totales acumulados del perfil de Ángel Giolitti en una sola llamada.

3. Script DDL Final para Supabase
Copiá y ejecutá el siguiente script en el SQL Editor de Supabase:

SQL
-- ==========================================
-- SCRIPT DDL COMPLETO Y OPTIMIZADO PARA SUPABASE
-- Plataforma Web Autoadministrable angelgiolitti.com.ar
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 1. PERFIL DEL ARTISTA
CREATE TABLE IF NOT EXISTS artist_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  short_bio TEXT,
  full_bio_markdown TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MÓDULO PROYECTOS / BANDAS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT, -- 'banda', 'documental', etc.
  creation_year INTEGER NOT NULL,
  end_year INTEGER, -- Opcional para bandas disueltas
  profile_image_url TEXT,
  cover_image_url TEXT,
  summary TEXT,
  description_markdown TEXT,
  main_video_url TEXT,
  members JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DOCUMENTOS Y PARTITURAS DEL ARTISTA
CREATE TABLE IF NOT EXISTS artist_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  document_type TEXT, -- 'partitura', 'dossier', 'cv'
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. MÓDULO MUSICAL (ÁLBUMES, EPS, SINGLES Y TRACKS)
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('album', 'single', 'ep')) DEFAULT 'album',
  release_year INTEGER NOT NULL,
  cover_url TEXT,
  description TEXT,
  members JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  track_order INTEGER DEFAULT 1,
  play_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MÓDULO GALERÍAS Y FOTOS
CREATE TABLE IF NOT EXISTS media_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_album_id UUID REFERENCES media_albums(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('photo', 'video')) DEFAULT 'photo',
  url TEXT NOT NULL,
  caption TEXT,
  item_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MÓDULO AGENDA / EVENTOS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location_name TEXT,
  address_city TEXT,
  google_maps_url TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  flyer_image_url TEXT,
  ticket_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('upcoming', 'completed')) DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_tracks_play_count ON tracks(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_likes_count ON tracks(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_media_items_album ON media_items(media_album_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_albums_slug ON albums(slug);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_albums_project ON albums(project_id);
CREATE INDEX IF NOT EXISTS idx_artist_documents_project ON artist_documents(project_id);

-- ==========================================
-- FUNCIONES RPC ATÓMICAS PARA MÉTRICAS DE AUDIO
-- ==========================================

-- Incrementar reproducciones de un track
CREATE OR REPLACE FUNCTION increment_track_play(target_track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tracks
  SET play_count = play_count + 1
  WHERE id = target_track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Incrementar Me Gusta
CREATE OR REPLACE FUNCTION increment_track_like(target_track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tracks
  SET likes_count = likes_count + 1
  WHERE id = target_track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrementar Me Gusta (Si el usuario quita el Like)
CREATE OR REPLACE FUNCTION decrement_track_like(target_track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tracks
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = target_track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obtener totales acumulados del Artista para el Dashboard / Perfil
CREATE OR REPLACE FUNCTION get_artist_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_plays', COALESCE(SUM(play_count), 0),
    'total_likes', COALESCE(SUM(likes_count), 0),
    'total_tracks', COUNT(id)
  ) INTO result
  FROM tracks;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- BÚSQUEDA GLOBAL
-- ==========================================

CREATE OR REPLACE FUNCTION global_search(query_text TEXT)
RETURNS JSON AS $body$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'tracks', (
      SELECT COALESCE(json_agg(t), '[]'::json)
      FROM (
        SELECT tr.id, tr.album_id, tr.title, tr.audio_url, tr.duration_seconds, tr.track_order, tr.play_count, tr.likes_count,
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

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE artist_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública artist_profile" ON artist_profile FOR SELECT USING (true);
CREATE POLICY "Lectura pública artist_documents" ON artist_documents FOR SELECT USING (true);
CREATE POLICY "Lectura pública albums" ON albums FOR SELECT USING (true);
CREATE POLICY "Lectura pública tracks" ON tracks FOR SELECT USING (true);
CREATE POLICY "Lectura pública projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Lectura pública media_albums" ON media_albums FOR SELECT USING (true);
CREATE POLICY "Lectura pública media_items" ON media_items FOR SELECT USING (true);
CREATE POLICY "Lectura pública events" ON events FOR SELECT USING (true);

CREATE POLICY "Admin total artist_profile" ON artist_profile FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin total artist_documents" ON artist_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin total albums" ON albums FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin total tracks" ON tracks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin total projects" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin total media_albums" ON media_albums FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin total media_items" ON media_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin total events" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);