forward-logs-shared.ts:95 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
forward-logs-shared.ts:95 [HMR] connected
forward-logs-shared.ts:95 [Fast Refresh] rebuilding
forward-logs-shared.ts:95 [Fast Refresh] done in 223ms
forward-logs-shared.ts:95 [Fast Refresh] rebuilding
AdminMusica.tsx:180  POST http://localhost:3000/api/r2/presign 401 (Unauthorized)
(anonymous) @ AdminMusica.tsx:180
(anonymous) @ AdminMusica.tsx:326
await in (anonymous)
executeDispatch @ react-dom-client.development.js:20610
runWithFiberInDEV @ react-dom-client.development.js:986
processDispatchQueue @ react-dom-client.development.js:20660
(anonymous) @ react-dom-client.development.js:21234
batchedUpdates$1 @ react-dom-client.development.js:3377
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20814
dispatchEvent @ react-dom-client.development.js:25817
dispatchDiscreteEvent @ react-dom-client.development.js:25785
AdminMusica.tsx:351 Error saving track: Error: No autorizado
    at uploadToR2 (AdminMusica.tsx:188:13
    at async handleSaveTrack (AdminMusica.tsx:326:24)
error @ intercept-console-error.ts:48
(anonymous) @ AdminMusica.tsx:351
await in (anonymous)
executeDispatch @ react-dom-client.development.js:20610
runWithFiberInDEV @ react-dom-client.development.js:986
processDispatchQueue @ react-dom-client.development.js:20660
(anonymous) @ react-dom-client.development.js:21234
batchedUpdates$1 @ react-dom-client.development.js:3377
dispatchEventForPluginEventSystem @ react-dom-client.development.js:20814
dispatchEvent @ react-dom-client.development.js:25817
dispatchDiscreteEvent @ react-dom-client.development.js:25785
forward-logs-shared.ts:95 [Fast Refresh] done in 14018ms
forward-logs-shared.ts:95 [Fast Refresh] rebuilding

====================
PENDIENTE - AGREGAR COLUMNA EN LA DB (Supabase SQL Editor):
ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_price NUMERIC(10,2);

PENDIENTE - ELIMINAR VINCULO GALERIA-ALBUM (proyecto es nucleo):
ALTER TABLE media_albums DROP COLUMN IF EXISTS album_id;

====================
R2 + SEGURIDAD PANEL ADMIN (revisión 18/08/2026) - ACCIONES PARA PRODUCCIÓN:

1. RLS Supabase (schema.sql): YA APLICADO. Políticas "Admin total" delimitadas por email 'admin@angelgiolitti.com'.
2. Middleware /admin: YA IMPLEMENTADO vía src/proxy.ts + src/utils/supabase/middleware.ts (redirige a / si no coincide ADMIN_EMAIL).
   NOTA: Next 16 usa proxy.ts, NO middleware.ts.
3. DISCREPANCIA EMAIL ADMIN: schema.sql y middleware usan admin@angelgiolitti.com, pero plan-panel-admin.md usa angelgiolitti@gmail.com.
   → UNIFICAR en schema.sql + middleware + ADMIN_EMAIL de .env.local (elegir 1 solo email).
4. Fase 3.1 plan-panel-admin (DELETE objetos huérfanos en R2): NO IMPLEMENTADO. Falta DeleteObjectCommand / endpoint /api/r2/delete.
5. CORS bucket R2 (Dashboard → bucket → Settings → CORS):
   → GET público + PUT SOLO desde https://angelgiolitti.com.ar (y localhost:3000 en dev).
   → AllowedHeaders: Content-Type, Authorization. ExposedHeaders: ETag. Quitar '*' o dominios de más.
6. Custom domain R2 (RECOMENDADO): atar media.angelgiolitti.com.ar para no depender de pub-….r2.dev y deshabilitar acceso público salvaje.
7. API Token R2 mínimo: R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY deben ser token con scope SOLO a angel-giolitti-bucket (Object Read + Write), no global.
8. Endurecer src/app/api/r2/presign/route.ts: hoy solo valida sesión autenticada → CUALQUIER usuario logueado puede subir.
   → Rechazar si user.email !== ADMIN_EMAIL. Validar contentType/extensiones permitidas + límite de tamaño + whitelist de folder.
9. Fase 3.1 código: crear POST /api/r2/delete (misma verificación admin) y llamarlo en borrados de AdminMusica/AdminEventos/AdminGaleria.
====================