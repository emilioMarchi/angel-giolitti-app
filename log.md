node scripts/migrate_metadata_only.js
◇ injected env (9) from .env.local // tip: ⌘ custom filepath { path: '/custom/path/.env' }
🏁 Iniciando migración de METADATA SOLAMENTE (sin subida de archivos a R2)...

📦 Se cargaron 9 proyectos desde el archivo original.

👤 Asegurando perfil de artista Ángel Giolitti...
ℹ️ Perfil del artista ya existía.

--------------------------------------------
🚀 Procesando Proyecto: [Cebu] (slug: cebu)
  ❌ Error al insertar proyecto Cebu: duplicate key value violates unique constraint "projects_slug_key"

--------------------------------------------
🚀 Procesando Proyecto: [Lo inconcebible] (slug: lo-inconcebible)
  ❌ Error al insertar proyecto Lo inconcebible: duplicate key value violates unique constraint "projects_slug_key"

--------------------------------------------
🚀 Procesando Proyecto: [Tarahumaras] (slug: tarahumaras)
  ❌ Error al insertar proyecto Tarahumaras: duplicate key value violates unique constraint "projects_slug_key"

--------------------------------------------
🚀 Procesando Proyecto: [Amokyneti] (slug: amokyneti)
  ❌ Error al insertar proyecto Amokyneti: duplicate key value violates unique constraint "projects_slug_key"

--------------------------------------------
🚀 Procesando Proyecto: [Bajo Percusión Armónica] (slug: bajo-percusion-armonica)
  ❌ Error al insertar proyecto Bajo Percusión Armónica: duplicate key value violates unique constraint "projects_slug_key"

--------------------------------------------
🚀 Procesando Proyecto: [Los Charlys del Angel] (slug: los-charlys-del-angel)
  ✅ Proyecto insertado con ID: bee83983-6c41-4d39-a25e-18db0c09cd5e
    💿 Álbum: [Los Charlys Live] (slug: los-charlys-del-angel-los-charlys-live)
      ✅ Álbum insertado con ID: 01ef119b-0fa7-4144-9057-3049bf64c60e
        🎵 Track registrado: Arround the round
        🎵 Track registrado: Se mi ya
        🎵 Track registrado: Siempre asi
        🎵 Track registrado: Wuwuei
        🎵 Track registrado: Y e pati
    🖼️ Registrando galería de fotos (10 imágenes)...
      ✅ Galería de fotos registrada.

--------------------------------------------
🚀 Procesando Proyecto: [Fruttyazz] (slug: fruttyazz)
  ✅ Proyecto insertado con ID: 6f8faf9c-9ff9-4121-9c81-939bc15360c4
    💿 Álbum: [Fruttyazz] (slug: fruttyazz-fruttyazz)
      ✅ Álbum insertado con ID: 2a93dc23-1cf0-417f-b1f8-af49c4ca1615
        🎵 Track registrado: A child is born
        🎵 Track registrado: Blue traine
        🎵 Track registrado: Blues for alice
        🎵 Track registrado: Boplicity
        🎵 Track registrado: Corcovado
        🎵 Track registrado: Easy to love
        🎵 Track registrado: Four
        🎵 Track registrado: Fredy
        🎵 Track registrado: Good bye porkpie hat
        🎵 Track registrado: Green dolphin street
        🎵 Track registrado: Meditation
        🎵 Track registrado: Naima
        🎵 Track registrado: Wave

--------------------------------------------
🚀 Procesando Proyecto: [The Alan Person Experiens] (slug: the-alan-person-experiens)
  ✅ Proyecto insertado con ID: 64db4321-736b-4861-91c3-734ea9d59c49
    💿 Álbum: [The Alan Person Experience] (slug: the-alan-person-experiens-the-alan-person-experience)
      ✅ Álbum insertado con ID: 91690ae0-9cd6-4ccd-b873-5484fe16407f
        🎵 Track registrado: Alan sutra
        🎵 Track registrado: Blue in green
    🖼️ Registrando galería de fotos (13 imágenes)...
      ✅ Galería de fotos registrada.

--------------------------------------------
🚀 Procesando Proyecto: [Handangel] (slug: handangel)
  ✅ Proyecto insertado con ID: 2afbaacb-44ec-4c2b-9f34-d2f1e81e7040
    💿 Álbum: [Handangel] (slug: handangel-handangel)
      ✅ Álbum insertado con ID: 588dd7ab-e016-4b10-a697-f0e320fc77b3
        🎵 Track registrado: Patio colibri
        🎵 Track registrado: Susurro los pasos
    📄 Registrando PDFs / Partituras...
      ✅ PDF registrado: Estrella de la Esperanza (Ovnipuerto) - Partitura completa
      ✅ PDF registrado: Eje - Partitura completa
      ✅ PDF registrado: Sirio Bembe - Partitura completa
      ✅ PDF registrado: Tres Estrellas - Partitura completa
      ✅ PDF registrado: Amigo Bengalí - Partitura completa
      ✅ PDF registrado: Apu - Partitura completa
      ✅ PDF registrado: Cola de Ballena - Partitura completa
    🖼️ Registrando galería de fotos (10 imágenes)...
      ✅ Galería de fotos registrada.
    🖼️ Registrando stickers (13)...
      ✅ Colección de stickers registrada.

🎉 ¡MIGRACIÓN DE METADATA COMPLETADA CON ÉXITO!
ℹ️ Nota: Las duraciones de los tracks se estimaron en ~200s. Si necesitas valores exactos, ejecuta un script de actualización de duraciones.