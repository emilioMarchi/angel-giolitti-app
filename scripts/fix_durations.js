/**
 * fix_durations.js
 *
 * Corrige las duraciones de los tracks que quedaron con el valor
 * fallback de 200s (~3:20) de la migración metadata_only.
 *
 * Usa ffprobe sobre las URLs de R2 para obtener la duración real.
 *
 * Uso: node scripts/fix_durations.js
 */

const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const ffmpeg = require('fluent-ffmpeg');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

try {
  const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
  ffmpeg.setFfprobePath(ffprobeInstaller.path);
} catch {
  // si falla, usa el del sistema
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
  const { data: tracks, error } = await supabase
    .from('tracks')
    .select('id, title, duration_seconds, audio_url');

  if (error) {
    console.error('Error al obtener tracks:', error.message);
    process.exit(1);
  }

  const toFix = tracks.filter((t) => t.duration_seconds === 200);

  if (toFix.length === 0) {
    console.log('No hay tracks con duration_seconds = 200. Todo correcto.');
    process.exit(0);
  }

  console.log(` tracks con duration_seconds = 200 (fallback).\n`, toFix.length);

  let fixed = 0;
  let failed = 0;

  for (const track of toFix) {
    process.stdout.write(`  ${track.title}... `);
    const realDuration = await probeDuration(track.audio_url);

    if (!realDuration) {
      console.log(' ERROR: no se pudo obtener duración');
      failed++;
      continue;
    }

    const { error: updateError } = await supabase
      .from('tracks')
      .update({ duration_seconds: realDuration })
      .eq('id', track.id);

    if (updateError) {
      console.log(`ERROR al actualizar: ${updateError.message}`);
      failed++;
    } else {
      console.log(`${track.duration_seconds}s → ${realDuration}s (${Math.floor(realDuration / 60)}:${String(realDuration % 60).padStart(2, '0')})`);
      fixed++;
    }
  }

  console.log(`\nHecho. ${fixed} actualizados, ${failed} fallos.`);
})();
