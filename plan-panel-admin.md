# Plan de Implementación: Mejoras en Panel de Administración

Este documento detalla la planificación paso a paso para implementar las mejoras de seguridad, control de acceso y refinamientos de experiencia de usuario (UX) en el panel de administración de angelgiolitti.com.ar.

---

## 🛠️ Fase 1: Robustecimiento y Seguridad (Prioridad Alta)

El objetivo es cerrar las brechas de acceso a datos y código del panel administrativo.

### Paso 1.1: Restricción de Políticas RLS en Supabase
* **Acción:** Modificar las políticas en la base de datos para restringir el acceso de escritura únicamente al correo del administrador del sitio web.
* **Archivos a modificar:** [`schema.sql`](file:///D:/Emi/OVNI/proyectos/angel-giolitti/schema.sql) (y ejecutar las queries en la consola SQL de Supabase).
* **Tarea:**
  Reemplazar las políticas `Admin total` con la verificación del correo electrónico:
  ```sql
  -- Ejemplo para la tabla albums
  DROP POLICY IF EXISTS "Admin total albums" ON albums;
  CREATE POLICY "Admin total albums" ON albums FOR ALL TO authenticated 
    USING (auth.jwt() ->> 'email' = 'angelgiolitti@gmail.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'angelgiolitti@gmail.com');
  ```
  *(Aplicar lo mismo para las tablas `tracks`, `projects`, `media_albums`, `media_items`, `events`, `playlists` y `page_views`)*.

### Paso 1.2: Middleware de Seguridad en Next.js
* **Acción:** Implementar un middleware de Next.js que intercepte cualquier petición a la ruta `/admin` y verifique la sesión en el servidor. Si no existe sesión válida, redirigir a `/` o al login.
* **Archivos a crear/modificar:** `src/middleware.ts` en la raíz del proyecto.
* **Código de referencia:**
  ```typescript
  import { createServerClient } from '@supabase/ssr';
  import { NextResponse, type NextRequest } from 'next/server';

  export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Proteger la ruta /admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user || user.email !== 'angelgiolitti@gmail.com') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return response;
  }

  export const config = {
    matcher: ['/admin/:path*'],
  };
  ```

---

## 🎨 Fase 2: Rediseño UX y Simplificación (Prioridad Media)

Hacer el panel más ágil de usar desde cualquier dispositivo.

### Paso 2.1: Modales y Drawers para Formularios
* **Acción:** Reemplazar los cambios de estado de pantalla completa por modales o paneles deslizables de Shadcn.
* **Componentes a modificar:** 
  * [`AdminMusica.tsx`](file:///D:/Emi/OVNI/proyectos/angel-giolitti/src/components/admin/AdminMusica.tsx)
  * [`AdminEventos.tsx`](file:///D:/Emi/OVNI/proyectos/angel-giolitti/src/components/admin/AdminEventos.tsx)
  * [`AdminProyectos.tsx`](file:///D:/Emi/OVNI/proyectos/angel-giolitti/src/components/admin/AdminProyectos.tsx)

### Paso 2.2: Zona de Arrastre Drag & Drop
* **Acción:** Crear un componente reutilizable de subida de archivos que acepte arrastrar y soltar, muestre barra de progreso de carga y previsualice la imagen o canción antes de guardar.
* **Componente a crear:** `src/components/admin/FileUploadZone.tsx`

---

## 🧹 Fase 3: Consistencia de Datos en R2 (Prioridad Baja)

### Paso 3.1: Ciclo de vida y limpieza de objetos huérfanos en Cloudflare R2
* **Acción:** Asegurar que cuando el administrador elimine un recurso (canción, flyer o foto de galería), también se llame al backend para borrar el objeto correspondiente en R2.
* **Archivos a modificar:** En los métodos de borrado de los componentes `AdminMusica`, `AdminEventos`, `AdminGaleria`, añadir la llamada correspondiente al cliente R2 o a un endpoint `/api/delete-media`.
