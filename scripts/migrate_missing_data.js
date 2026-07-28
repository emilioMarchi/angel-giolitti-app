/**
 * migrate_missing_data.js
 *
 * Migra los items faltantes detectados en la comparación:
 * 1. Tarahumaras: tracks "Gilisant sur les nueges" y "Tu savia que es"
 * 2. BPA: album "BPA en vivo - Picasso bar" con su track
 *
 * Uso: node scripts/migrate_missing_data.js
 */

const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const ffmpeg = require('fluent-ffmpeg');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

try {
  const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
  ffmpeg.setFfprobePath(ffprobeInstaller.path);
} catch {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/$/, '');

function r2Url(key) {
  return `${PUBLIC_URL}/${key}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function probeDuration(url) {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(url, (err, metadata) => {
      if (err || !metadata?.format?.duration) {
        resolve(null);
      } else {
        resolve(Math.round(metadata.format.duration));
      }
    });
  });
}

(async () => {
  // ============================================================
  // 1. TARAHUMARAS - tracks faltantes
  // ============================================================
  console.log('=== 1. TARAHUMARAS - Tracks faltantes ===\n');

  const { data: tarahumProject } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', 'tarahumaras')
    .single();

  const { data: tarahumAlbum } = await supabase
    .from('albums')
    .select('id')
    .eq('slug', 'tarahumaras-tarahumaras')
    .single();

  if (!tarahumAlbum) {
    console.error('❌ No se encontró el album Tarahumaras en Supabase');
    process.exit(1);
  }

  const missingTarahumarasTracks = [
    { title: 'Gilisant sur les nueges', track_order: 4 },
    { title: 'Tu savia que es', track_order: 5 },
  ];

  for (const track of missingTarahumarasTracks) {
    const trackSlug = slugify(track.title);
    const audioUrl = r2Url(`tracks/tarahumaras/tarahumaras/${trackSlug}.mp3`);

    process.stdout.write(`  ${track.title}... `);
    const duration = await probeDuration(audioUrl);

    if (!duration) {
      console.log('❌ No se pudo obtener duración');
      continue;
    }

    const { error } = await supabase.from('tracks').insert({
      album_id: tarahumAlbum.id,
      title: track.title,
      slug: trackSlug,
      audio_url: audioUrl,
      duration_seconds: duration,
      track_order: track.track_order,
    });

    if (error) {
      console.log(`❌ Error: ${error.message}`);
    } else {
      const mins = Math.floor(duration / 60);
      const secs = String(duration % 60).padStart(2, '0');
      console.log(`✅ (${mins}:${secs})`);
    }
  }

  // ============================================================
  // 2. BPA - Album "BPA en vivo - Picasso bar" faltante
  // ============================================================
  console.log('\n=== 2. BAJO PERCUSIÓN ARMÓNICA - Album faltante ===\n');

  const { data: bpaProject } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', 'bajo-percusion-armonica')
    .single();

  if (!bpaProject) {
    console.error('❌ No se encontró el proyecto Bajo Percusión Armónica');
    process.exit(1);
  }

  const picassoAlbumSlug = 'bpa-en-vivo-picasso-bar';
  const picassoTrackTitle = 'BPA en vivo - Picasso bar';
  const picassoTrackSlug = slugify(picassoTrackTitle);
  const picassoAudioUrl = r2Url(`tracks/bajo-percusion-armonica/${picassoAlbumSlug}/${picassoTrackSlug}.mp3`);

  // Obtener duración primero
  process.stdout.write(`  Obteniendo duración de "${picassoTrackTitle}"... `);
  const picassoDuration = await probeDuration(picassoAudioUrl);

  if (!picassoDuration) {
    console.log('❌ No se pudo obtener duración');
    process.exit(1);
  }
  const mins = Math.floor(picassoDuration / 60);
  const secs = String(picassoDuration % 60).padStart(2, '0');
  console.log(`✅ (${mins}:${secs})`);

  // Insertar album
  process.stdout.write(`  Insertando album "BPA en vivo - Picasso bar"... `);
  const { data: picassoAlbum, error: albumErr } = await supabase
    .from('albums')
    .insert({
      project_id: bpaProject.id,
      title: 'BPA en vivo - Picasso bar',
      slug: `bajo-percusion-armonica-${picassoAlbumSlug}`,
      type: 'album',
      release_year: 2006,
      cover_url: r2Url('images/albums/bajo-percusion-armonica/bpa-en-vivo-picasso-bar.webp'),
      description: 'Álbum de Bajo Percusión Armónica',
      members: [
        { name: 'Angel Giolitti', roll: ['Bajo', 'Voz'] },
        { name: 'Jorge Mockert', roll: ['Percusión'] },
        { name: 'Ruy Gatti', roll: ['Voz', 'Armónica'] },
      ],
    })
    .select('id')
    .single();

  if (albumErr) {
    console.log(`❌ Error: ${albumErr.message}`);
    process.exit(1);
  }
  console.log(`✅ ID: ${picassoAlbum.id}`);

  // Insertar track
  process.stdout.write(`  Insertando track "${picassoTrackTitle}"... `);
  const { error: trackErr } = await supabase.from('tracks').insert({
    album_id: picassoAlbum.id,
    title: picassoTrackTitle,
    slug: picassoTrackSlug,
    audio_url: picassoAudioUrl,
    duration_seconds: picassoDuration,
    track_order: 1,
  });

  if (trackErr) {
    console.log(`❌ Error: ${trackErr.message}`);
  } else {
    console.log('✅');
  }

  console.log('\n=== Migración completada ===');
})();
