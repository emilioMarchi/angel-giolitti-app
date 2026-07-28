-- ==========================================
-- SCRIPT DDL COMPLETO Y OPTIMIZADO PARA SUPABASE
-- Plataforma Web Autoadministrable angelgiolitti.com.ar
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PERFIL DEL ARTISTA
CREATE TABLE IF NOT EXISTS artist_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  short_bio TEXT,
  full_bio_markdown TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  followers_count INTEGER DEFAULT 0,
  listeners_count INTEGER DEFAULT 0,
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
  profile_image_url TEXT, -- Imagen de perfil del proyecto/banda
  cover_image_url TEXT, -- Imagen de portada/banner del proyecto
  summary TEXT,
  description_markdown TEXT,
  main_video_url TEXT, -- Opcional para bandas/proyectos musicales
  members JSONB DEFAULT '[]'::jsonb, -- Miembros de la banda/proyecto
  social_links JSONB DEFAULT '{}'::jsonb, -- Redes sociales exclusivas del proyecto
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DOCUMENTOS Y PARTITURAS DEL ARTISTA
CREATE TABLE IF NOT EXISTS artist_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- Vinculado a una banda si aplica
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
  members JSONB DEFAULT '[]'::jsonb, -- Formación de la banda en este álbum específico
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

-- FUNCIONES RPC ATÓMICAS (PLAYS & LIKES)
CREATE OR REPLACE FUNCTION increment_track_play(target_track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tracks
  SET play_count = play_count + 1
  WHERE id = target_track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_track_like(target_track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tracks
  SET likes_count = likes_count + 1
  WHERE id = target_track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_track_like(target_track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tracks
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = target_track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_artist_follow()
RETURNS VOID AS $$
BEGIN
  UPDATE artist_profile
  SET followers_count = followers_count + 1
  WHERE id = (SELECT id FROM artist_profile LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_artist_follow()
RETURNS VOID AS $$
BEGIN
  UPDATE artist_profile
  SET followers_count = GREATEST(0, followers_count - 1)
  WHERE id = (SELECT id FROM artist_profile LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_artist_listener()
RETURNS VOID AS $$
BEGIN
  UPDATE artist_profile
  SET listeners_count = listeners_count + 1
  WHERE id = (SELECT id FROM artist_profile LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_artist_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_plays', COALESCE((SELECT SUM(play_count) FROM tracks), 0),
    'total_likes', COALESCE((SELECT SUM(likes_count) FROM tracks), 0),
    'total_tracks', (SELECT COUNT(id) FROM tracks),
    'total_followers', COALESCE((SELECT followers_count FROM artist_profile LIMIT 1), 0),
    'total_listeners', COALESCE((SELECT listeners_count FROM artist_profile LIMIT 1), 0)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. EXTENSIÓN Y FUNCIÓN DE BÚSQUEDA GLOBAL
CREATE EXTENSION IF NOT EXISTS unaccent;

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

-- POLÍTICAS ROW LEVEL SECURITY (RLS)
ALTER TABLE artist_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública artist_profile" ON artist_profile;
CREATE POLICY "Lectura pública artist_profile" ON artist_profile FOR SELECT USING (true);
DROP POLICY IF EXISTS "Lectura pública artist_documents" ON artist_documents;
CREATE POLICY "Lectura pública artist_documents" ON artist_documents FOR SELECT USING (true);
DROP POLICY IF EXISTS "Lectura pública albums" ON albums;
CREATE POLICY "Lectura pública albums" ON albums FOR SELECT USING (true);
DROP POLICY IF EXISTS "Lectura pública tracks" ON tracks;
CREATE POLICY "Lectura pública tracks" ON tracks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Lectura pública projects" ON projects;
CREATE POLICY "Lectura pública projects" ON projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Lectura pública media_albums" ON media_albums;
CREATE POLICY "Lectura pública media_albums" ON media_albums FOR SELECT USING (true);
DROP POLICY IF EXISTS "Lectura pública media_items" ON media_items;
CREATE POLICY "Lectura pública media_items" ON media_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Lectura pública events" ON events;
CREATE POLICY "Lectura pública events" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin total artist_profile" ON artist_profile;
CREATE POLICY "Admin total artist_profile" ON artist_profile FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin total artist_documents" ON artist_documents;
CREATE POLICY "Admin total artist_documents" ON artist_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin total albums" ON albums;
CREATE POLICY "Admin total albums" ON albums FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin total tracks" ON tracks;
CREATE POLICY "Admin total tracks" ON tracks FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin total projects" ON projects;
CREATE POLICY "Admin total projects" ON projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin total media_albums" ON media_albums;
CREATE POLICY "Admin total media_albums" ON media_albums FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin total media_items" ON media_items;
CREATE POLICY "Admin total media_items" ON media_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin total events" ON events;
CREATE POLICY "Admin total events" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);


