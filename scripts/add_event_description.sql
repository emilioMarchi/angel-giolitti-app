-- Agrega campo de descripción a la tabla de eventos.
-- Ejecutar en Supabase → SQL Editor.

ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT;
