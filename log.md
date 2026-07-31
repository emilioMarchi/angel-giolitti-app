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
