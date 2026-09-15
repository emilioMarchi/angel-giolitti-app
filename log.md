## Error Type
Build Error

## Error Message
Expected '</', got 'ident'

## Build Output
./src/components/admin/AdminMusica.tsx:851:20
Expected '</', got 'ident'
  849 | </div>
  850 |
> 851 |               <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.06]">
      |                    ^^^^^^^^^
  852 |                 <button
  853 |                   type="button"
  854 |                   onClick={() => setView('list')}

Parsing ecmascript source code failed

Import traces:
  Client Component Browser:
    ./src/components/admin/AdminMusica.tsx [Client Component Browser]
    ./src/app/admin/musica/page.tsx [Client Component Browser]
    ./src/app/admin/musica/page.tsx [Server Component]

  Client Component SSR:
    ./src/components/admin/AdminMusica.tsx [Client Component SSR]
    ./src/app/admin/musica/page.tsx [Client Component SSR]
    ./src/app/admin/musica/page.tsx [Server Component]

Next.js version: 16.2.12 (Turbopack)
