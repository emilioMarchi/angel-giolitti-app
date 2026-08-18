Access to fetch at 'https://angel-giolitti-bucket.560700acbd56842d4025e6330ec862b2.r2.cloudflarestorage.com/flyers/1787070037244-meditacion-sonora-flyer.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=54b236d56a4b39af735d27de03011ce1%2F20260818%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260818T162037Z&X-Amz-Expires=3600&X-Amz-Signature=7b6874afdeafafd576c2df3a05de5866258769c019f6dfb21221114458542e7a&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject' from origin 'https://angel-giolitti-app.vercel.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
0csayyju497l7.js:6  PUT https://angel-giolitti-bucket.560700acbd56842d4025e6330ec862b2.r2.cloudflarestorage.com/flyers/1787070037244-meditacion-sonora-flyer.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=54b236d56a4b39af735d27de03011ce1%2F20260818%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20260818T162037Z&X-Amz-Expires=3600&X-Amz-Signature=7b6874afdeafafd576c2df3a05de5866258769c019f6dfb21221114458542e7a&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject net::ERR_FAILED
J @ 0csayyju497l7.js:6
await in J
Z @ 0csayyju497l7.js:6
await in Z
sJ @ 25o46h8mdjlrg.js:1
(anonymous) @ 25o46h8mdjlrg.js:1
tD @ 25o46h8mdjlrg.js:1
s4 @ 25o46h8mdjlrg.js:1
fz @ 25o46h8mdjlrg.js:1
fT @ 25o46h8mdjlrg.js:1
0csayyju497l7.js:6 Error saving event: TypeError: Failed to fetch
    at J (0csayyju497l7.js:6:21626)
    at async Z (0csayyju497l7.js:6:22481)

====================================================================
PENDIENTE - EJECUTAR EN SUPABASE (SQL Editor) ANTES DE USAR EN PROD:
Descripción de eventos (campo nuevo en panel admin + vista evento):

ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT;

(También está en scripts/add_event_description.sql)
====================================================================