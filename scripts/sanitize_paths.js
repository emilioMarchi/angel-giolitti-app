const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno locales de .env.local
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Prefijos conocidos que queremos remover
const PREFIXES = [
  'https://560700acbd56842d4025e6330ec862b2.r2.cloudflarestorage.com/',
  'https://560700acbd56842d4025e6330ec862b2.r2.cloudflarestorage.com',
  // Agregar cualquier otro prefijo temporal si fuera necesario
];

function makeRelative(url) {
  if (!url) return url;
  let cleanUrl = url;
  
  for (const prefix of PREFIXES) {
    if (cleanUrl.startsWith(prefix)) {
      cleanUrl = cleanUrl.replace(prefix, '');
    }
  }
  
  // Remover barra inicial si quedó
  if (cleanUrl.startsWith('/')) {
    cleanUrl = cleanUrl.substring(1);
  }
  
  return cleanUrl;
}

async function runSanitization() {
  console.log('🔄 Iniciando sanitización de URLs a paths relativos...');

  // 1. Proyectos
  console.log('\n📁 Procesando proyectos...');
  const { data: projects, error: projErr } = await supabase.from('projects').select('id, cover_image_url, profile_image_url');
  if (projErr) console.error('Error al leer proyectos:', projErr);
  else {
    for (const proj of projects) {
      const relCover = makeRelative(proj.cover_image_url);
      const relProfile = makeRelative(proj.profile_image_url);
      if (relCover !== proj.cover_image_url || relProfile !== proj.profile_image_url) {
        await supabase.from('projects').update({
          cover_image_url: relCover,
          profile_image_url: relProfile
        }).eq('id', proj.id);
        console.log(`✅ Proyecto ${proj.id} actualizado.`);
      }
    }
  }

  // 2. Álbumes
  console.log('\n💿 Procesando álbumes...');
  const { data: albums, error: albErr } = await supabase.from('albums').select('id, cover_url');
  if (albErr) console.error('Error al leer álbumes:', albErr);
  else {
    for (const alb of albums) {
      const relCover = makeRelative(alb.cover_url);
      if (relCover !== alb.cover_url) {
        await supabase.from('albums').update({ cover_url: relCover }).eq('id', alb.id);
        console.log(`✅ Álbum ${alb.id} actualizado.`);
      }
    }
  }

  // 3. Tracks
  console.log('\n🎵 Procesando canciones (tracks)...');
  const { data: tracks, error: trkErr } = await supabase.from('tracks').select('id, audio_url');
  if (trkErr) console.error('Error al leer tracks:', trkErr);
  else {
    for (const trk of tracks) {
      const relAudio = makeRelative(trk.audio_url);
      if (relAudio !== trk.audio_url) {
        await supabase.from('tracks').update({ audio_url: relAudio }).eq('id', trk.id);
        console.log(`✅ Track ${trk.id} actualizado.`);
      }
    }
  }

  // 4. Media Albums
  console.log('\n🖼️  Procesando álbumes multimedia...');
  const { data: mediaAlbums, error: maErr } = await supabase.from('media_albums').select('id, cover_image_url');
  if (maErr) console.error('Error al leer media_albums:', maErr);
  else {
    for (const ma of mediaAlbums) {
      const relCover = makeRelative(ma.cover_image_url);
      if (relCover !== ma.cover_image_url) {
        await supabase.from('media_albums').update({ cover_image_url: relCover }).eq('id', ma.id);
        console.log(`✅ Álbum de fotos ${ma.id} actualizado.`);
      }
    }
  }

  // 5. Media Items
  console.log('\n📸 Procesando ítems multimedia...');
  const { data: mediaItems, error: miErr } = await supabase.from('media_items').select('id, url');
  if (miErr) console.error('Error al leer media_items:', miErr);
  else {
    for (const mi of mediaItems) {
      const relUrl = makeRelative(mi.url);
      if (relUrl !== mi.url) {
        await supabase.from('media_items').update({ url: relUrl }).eq('id', mi.id);
        console.log(`✅ Item multimedia ${mi.id} actualizado.`);
      }
    }
  }

  // 6. Documentos de Artista
  console.log('\n📄 Procesando documentos de artista...');
  const { data: artistDocs, error: docErr } = await supabase.from('artist_documents').select('id, file_url');
  if (docErr) console.error('Error al leer artist_documents:', docErr);
  else {
    for (const doc of artistDocs) {
      const relUrl = makeRelative(doc.file_url);
      if (relUrl !== doc.file_url) {
        await supabase.from('artist_documents').update({ file_url: relUrl }).eq('id', doc.id);
        console.log(`✅ Documento ${doc.id} actualizado.`);
      }
    }
  }

  console.log('\n🏁 Sanitización completada con éxito.');
}

runSanitization().catch(err => {
  console.error('Error durante la sanitización:', err);
});
