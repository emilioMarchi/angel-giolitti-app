// Script de diagnóstico — consulta la DB real para ver qué datos tenemos
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debug() {
  console.log('=== DIAGNÓSTICO DE DB ===\n');

  // 1. artist_profile
  const { data: profile, error: e1 } = await supabase.from('artist_profile').select('*');
  console.log('--- artist_profile ---');
  console.log('Count:', profile?.length || 0);
  if (profile?.length) console.log('Columnas:', Object.keys(profile[0]));
  if (profile?.length) console.log('Sample:', JSON.stringify(profile[0], null, 2));
  if (e1) console.log('Error:', e1.message);

  // 2. projects
  const { data: projects, error: e2 } = await supabase.from('projects').select('*');
  console.log('\n--- projects ---');
  console.log('Count:', projects?.length || 0);
  if (projects?.length) console.log('Columnas:', Object.keys(projects[0]));
  if (projects?.length) console.log('Sample (first):', JSON.stringify(projects[0], null, 2));
  if (projects?.length) console.log('All titles:', projects.map(p => `${p.title} (${p.category}, ${p.creation_year})`));
  if (e2) console.log('Error:', e2.message);

  // 3. albums
  const { data: albums, error: e3 } = await supabase.from('albums').select('*');
  console.log('\n--- albums ---');
  console.log('Count:', albums?.length || 0);
  if (albums?.length) console.log('Columnas:', Object.keys(albums[0]));
  if (albums?.length) console.log('All:', albums.map(a => `${a.title} (type=${a.type}, year=${a.release_year}, cover=${a.cover_url ? 'YES' : 'NO'})`));
  if (e3) console.log('Error:', e3.message);

  // 4. tracks (sample)
  const { data: tracks, error: e4 } = await supabase.from('tracks').select('*').limit(5);
  console.log('\n--- tracks (first 5) ---');
  const { count: trackCount } = await supabase.from('tracks').select('*', { count: 'exact', head: true });
  console.log('Total count:', trackCount);
  if (tracks?.length) console.log('Columnas:', Object.keys(tracks[0]));
  if (tracks?.length) console.log('Sample:', JSON.stringify(tracks[0], null, 2));
  if (e4) console.log('Error:', e4.message);

  // 5. media_albums
  const { data: mediaAlbums, error: e5 } = await supabase.from('media_albums').select('*');
  console.log('\n--- media_albums ---');
  console.log('Count:', mediaAlbums?.length || 0);
  if (mediaAlbums?.length) console.log('Columnas:', Object.keys(mediaAlbums[0]));
  if (mediaAlbums?.length) console.log('All:', mediaAlbums.map(m => `${m.title} (cover=${m.cover_image_url ? 'YES' : 'NO'}, slug=${m.slug})`));
  if (e5) console.log('Error:', e5.message);

  // 6. media_items (sample)
  const { data: mediaItems, error: e6 } = await supabase.from('media_items').select('*').limit(3);
  const { count: miCount } = await supabase.from('media_items').select('*', { count: 'exact', head: true });
  console.log('\n--- media_items ---');
  console.log('Total count:', miCount);
  if (mediaItems?.length) console.log('Columnas:', Object.keys(mediaItems[0]));
  if (mediaItems?.length) console.log('Sample:', JSON.stringify(mediaItems[0], null, 2));
  if (e6) console.log('Error:', e6.message);

  // 7. events
  const { data: events, error: e7 } = await supabase.from('events').select('*');
  console.log('\n--- events ---');
  console.log('Count:', events?.length || 0);
  if (events?.length) console.log('Columnas:', Object.keys(events[0]));
  if (e7) console.log('Error:', e7.message);

  // 8. artist_documents
  const { data: docs, error: e8 } = await supabase.from('artist_documents').select('*');
  console.log('\n--- artist_documents ---');
  console.log('Count:', docs?.length || 0);
  if (docs?.length) console.log('Sample:', JSON.stringify(docs[0], null, 2));
  if (e8) console.log('Error:', e8.message);

  console.log('\n=== FIN DIAGNÓSTICO ===');
}

debug().catch(console.error);
