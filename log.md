## Error Type
Console Error

## Error Message
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
    <HTTPAccessFallbackErrorBoundary pathname="/" notFound={{...}} forbidden={undefined} unauthorized={undefined} ...>
      <RedirectBoundary>
        <RedirectErrorBoundary router={{...}}>
          <InnerLayoutRouter url="/" tree={[...]} params={{}} cacheNode={{rsc:{...}, ...}} segmentPath={[...]} ...>
            <SegmentViewNode type="page" pagePath="page.tsx">
              <SegmentTrieNode>
              <ClientPageRoot Component={function HomePage} serverProvidedParams={{...}}>
                <HomePage params={Promise} searchParams={Promise}>
                  <div className="artist-pro...">
                    <header>
                    <div>
                    <section>
                    <section>
                    <section className="artist-sec...">
                      <h2>
                      <div className="home-quick...">
                        <LinkComponent href="/proyectos" className="quick-acce...">
                          <a className="quick-acce..." ref={function} onClick={function onClick} ...>
                            <div
                              className="quick-access-icon"
                              style={{
+                               background: "var(--accent-blue)"
-                               background-image: ""
-                               background-position-x: ""
-                               background-position-y: ""
-                               background-size: ""
-                               background-repeat: ""
-                               background-attachment: ""
-                               background-origin: ""
-                               background-clip: ""
-                               background-color: ""
-                               --darkreader-inline-bg: "var(--darkreader-bg--accent-blue)"
                              }}
-                             data-darkreader-inline-bg=""
                            >
                            ...
                        <LinkComponent href="/galeria" className="quick-acce...">
                          <a className="quick-acce..." ref={function} onClick={function onClick} ...>
                            <div
                              className="quick-access-icon"
                              style={{
+                               background: "var(--accent-orange)"
-                               background-image: ""
-                               background-position-x: ""
-                               background-position-y: ""
-                               background-size: ""
-                               background-repeat: ""
-                               background-attachment: ""
-                               background-origin: ""
-                               background-clip: ""
-                               background-color: ""
-                               --darkreader-inline-bg: "var(--darkreader-bg--accent-orange)"
                              }}
-                             data-darkreader-inline-bg=""
                            >
                            ...
                        <LinkComponent href="/bio" className="quick-acce...">
                          <a className="quick-acce..." ref={function} onClick={function onClick} ...>
                            <div
                              className="quick-access-icon"
                              style={{
+                               background: "var(--accent-pink)"
-                               background-image: ""
-                               background-position-x: ""
-                               background-position-y: ""
-                               background-size: ""
-                               background-repeat: ""
-                               background-attachment: ""
-                               background-origin: ""
-                               background-clip: ""
-                               background-color: ""
-                               --darkreader-inline-bg: "var(--darkreader-bg--accent-pink)"
                              }}
-                             data-darkreader-inline-bg=""
                            >
                            ...
                    ...
            ...
          ...



    at div (<anonymous>:null:null)
    at <unknown> (src/app/page.tsx:522:17)
    at Array.map (<anonymous>:null:null)
    at HomePage (src/app/page.tsx:518:13)

## Code Frame
  520 |             return (
  521 |               <Link key={i} href={item.href} className="quick-access-card">
> 522 |                 <div className="quick-access-icon" style={{ background: item.color }}>
      |                 ^
  523 |                   <Icon className="h-5 w-5 text-white" />
  524 |                 </div>
  525 |                 <span className="quick-access-label">{item.title}</span>

Next.js version: 16.2.12 (Turbopack)

---

## SQL para Supabase — Actualizar global_search (imágenes de proyectos)

Ejecutar en **SQL Editor de Supabase**:

```sql
-- Actualizar función global_search para incluir imágenes de proyectos
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
        SELECT id, title, category, creation_year, main_video_url, slug, profile_image_url, cover_image_url
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
