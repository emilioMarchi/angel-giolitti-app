-- =================================================================
-- SCRIPT SQL PARA CREAR LA TABLA DE VISTAS Y LA FUNCIÓN RPC
-- angelgiolitti.com.ar - Etapa 5 (Métricas)
-- Ejecutar este script en la consola SQL de tu panel de Supabase
-- =================================================================

-- 1. Crear la tabla de vistas de página
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT UNIQUE NOT NULL,
  views_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar la seguridad a nivel de fila (Row Level Security)
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS (Permitir lectura pública y control total al Admin)
DROP POLICY IF EXISTS "Lectura pública page_views" ON public.page_views;
CREATE POLICY "Lectura pública page_views" ON public.page_views
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin total page_views" ON public.page_views;
CREATE POLICY "Admin total page_views" ON public.page_views
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Crear la función RPC para incrementar las visitas de manera atómica
CREATE OR REPLACE FUNCTION public.increment_page_view(target_path TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.page_views (path, views_count)
  VALUES (target_path, 1)
  ON CONFLICT (path)
  DO UPDATE SET 
    views_count = public.page_views.views_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Dar permisos de ejecución a la función RPC para usuarios anónimos (público)
GRANT EXECUTE ON FUNCTION public.increment_page_view(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_page_view(TEXT) TO authenticated;
