const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');

// Cargar variables de entorno locales de .env.local
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// --- AUTODETECCIÓN DE FFMPEG / FFPROBE POR NPM ---
try {
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
  const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  ffmpeg.setFfprobePath(ffprobeInstaller.path);
  console.log('✅ Utilizando binarios locales de ffmpeg y ffprobe de NPM.');
} catch (e) {
  console.log('ℹ️ Intentando utilizar ffmpeg/ffprobe del sistema global...');
}

// --- CONFIGURACIÓN DE RUTAS ---
const PATHS = {
  oldProject: 'D:/Emi/tpc-3.0/desarrollo-web/angel-giolitti/client',
  tempDir: path.resolve(__dirname, 'temp_migrate')
};

// Asegurar que exista el directorio temporal
if (!fs.existsSync(PATHS.tempDir)) {
  fs.mkdirSync(PATHS.tempDir, { recursive: true });
}

// --- INICIALIZAR CLIENTES ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/$/, '');

// --- AUXILIARES ---
function loadOldProjects() {
  const filePath = path.join(PATHS.oldProject, 'src/projects.js');
  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontró el archivo origen en: ${filePath}`);
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const tempFile = path.resolve(__dirname, 'temp_projects_load.js');
  const cjsContent = fileContent.replace(/export const projects\s*=/, 'module.exports =');
  fs.writeFileSync(tempFile, cjsContent, 'utf8');
  const projects = require(tempFile);
  fs.unlinkSync(tempFile);
  return projects;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function uploadToR2(localFilePath, r2Key, contentType) {
  const fileStream = fs.createReadStream(localFilePath);
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: r2Key,
    Body: fileStream,
    ContentType: contentType,
  });

  await r2.send(command);
  return `${PUBLIC_URL}/${r2Key}`;
}

async function optimizeImage(inputRelativePath, outputName, type = 'gallery') {
  const fullInputPath = path.join(PATHS.oldProject, 'public', inputRelativePath);
  if (!fs.existsSync(fullInputPath)) {
    console.warn(`⚠️  Imagen no encontrada: ${fullInputPath}`);
    return null;
  }

  const outputPath = path.join(PATHS.tempDir, `${outputName}.webp`);
  let pipeline = sharp(fullInputPath);

  if (type === 'profile') {
    pipeline = pipeline.resize(400, 400, { fit: 'cover' });
  } else if (type === 'cover') {
    pipeline = pipeline.resize(600, 600, { fit: 'cover' });
  } else if (type === 'banner') {
    pipeline = pipeline.resize(1920, 1080, { fit: 'inside', withoutEnlargement: true });
  } else {
    pipeline = pipeline.resize(1920, 1920, { fit: 'inside', withoutEnlargement: true });
  }

  await pipeline.webp({ quality: 80 }).toFile(outputPath);
  return outputPath;
}

function processAudio(inputRelativePath, outputName) {
  return new Promise((resolve, reject) => {
    const fullInputPath = path.join(PATHS.oldProject, 'public', inputRelativePath);
    if (!fs.existsSync(fullInputPath)) {
      console.warn(`⚠️  Audio no encontrado: ${fullInputPath}`);
      return resolve(null);
    }

    const outputPath = path.join(PATHS.tempDir, `${outputName}.mp3`);
    let durationSeconds = 0;

    ffmpeg(fullInputPath)
      .toFormat('mp3')
      .audioBitrate(192)
      .on('end', () => {
        ffmpeg.ffprobe(outputPath, (err, metadata) => {
          if (err) {
            resolve({ path: outputPath, duration: 180 });
          } else {
            durationSeconds = Math.round(metadata.format.duration || 0);
            resolve({ path: outputPath, duration: durationSeconds });
          }
        });
      })
      .on('error', (err) => {
        reject(err);
      })
      .save(outputPath);
  });
}

// --- EJECUCIÓN DEL PARCHE ---
async function runPatch() {
  console.log('🩹 Iniciando parche de migración...');

  const oldProjects = loadOldProjects();

  // 1. REPARAR TRACK LUDMILA EN AMOKYNETI
  console.log('\n--- 1. Reparando track "Ludmila" en Amokyneti ---');
  
  // Buscar álbum de Amokyneti en la base de datos
  const { data: albumData, error: albumErr } = await supabase
    .from('albums')
    .select('id')
    .eq('slug', 'amokyneti-amokyneti')
    .maybeSingle();

  if (albumErr || !albumData) {
    console.error('❌ No se encontró el álbum "amokyneti-amokyneti" en Supabase. ¿Ya se migró ese proyecto?');
  } else {
    const albumId = albumData.id;
    // Comprobar si ya existe el track
    const { data: trackData } = await supabase
      .from('tracks')
      .select('id')
      .eq('album_id', albumId)
      .eq('slug', 'ludmila')
      .maybeSingle();

    if (trackData) {
      console.log('✅ El track "Ludmila" ya existe en la base de datos. Omitiendo.');
    } else {
      // Buscar la info del track en la fuente
      const amokProj = oldProjects.find(p => slugify(p.name) === 'amokyneti');
      const ludmilaTrack = amokProj?.albums?.[0]?.tracks?.find(t => slugify(t.title) === 'ludmila');

      if (ludmilaTrack) {
        console.log(`🎙️  Procesando audio: ${ludmilaTrack.src}...`);
        try {
          const processed = await processAudio(ludmilaTrack.src, 'amokyneti-amokyneti-ludmila');
          if (processed) {
            const audioUrl = await uploadToR2(processed.path, 'tracks/amokyneti/amokyneti/ludmila.mp3', 'audio/mpeg');
            fs.unlinkSync(processed.path);

            const { error: trackErr } = await supabase
              .from('tracks')
              .insert({
                album_id: albumId,
                title: ludmilaTrack.title,
                slug: 'ludmila',
                audio_url: audioUrl,
                duration_seconds: processed.duration,
                track_order: 3 // Ludmila es el track 3 (index 2)
              });

            if (trackErr) {
              console.error('❌ Error al insertar track Ludmila:', trackErr);
            } else {
              console.log('✅ Track "Ludmila" subido y registrado exitosamente.');
            }
          }
        } catch (e) {
          console.error('❌ Falló el procesamiento de audio para Ludmila:', e);
        }
      } else {
        console.error('❌ No se encontró la definición del track "Ludmila" en projects.js');
      }
    }
  }

  // 2. REPARAR GALERÍA Y STICKERS EN HANDANGEL
  console.log('\n--- 2. Reparando galería y stickers de Handangel ---');

  const { data: projData, error: projErr } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', 'handangel')
    .maybeSingle();

  if (projErr || !projData) {
    console.error('❌ No se encontró el proyecto "handangel" en Supabase.');
  } else {
    const projectId = projData.id;
    const handProj = oldProjects.find(p => slugify(p.name) === 'handangel');

    if (handProj) {
      const picturesList = (handProj.media && handProj.media.pictures) ? handProj.media.pictures : [];
      const stickersList = (handProj.media && handProj.media.stickers) ? handProj.media.stickers : [];

      // Procesar Galería
      if (picturesList.length > 0) {
        // Verificar si ya existe el álbum de fotos
        const { data: existingMa } = await supabase
          .from('media_albums')
          .select('id')
          .eq('slug', 'handangel-fotos')
          .maybeSingle();

        if (existingMa) {
          console.log('ℹ️ Ya existe un álbum de fotos "handangel-fotos". Lo eliminaremos para evitar duplicados y crearlo de nuevo...');
          await supabase.from('media_albums').delete().eq('id', existingMa.id);
        }

        console.log(`🖼️ Procesando galería de fotos (${picturesList.length} imágenes)...`);
        const { data: mediaAlbum, error: maErr } = await supabase
          .from('media_albums')
          .insert({
            title: `Fotos de ${handProj.name}`,
            slug: 'handangel-fotos',
            description: `Galería fotográfica de ${handProj.name}`,
            project_id: projectId
          })
          .select('id')
          .single();

        if (!maErr && mediaAlbum) {
          let firstCover = null;
          for (let i = 0; i < picturesList.length; i++) {
            const pic = picturesList[i];
            if (!pic || !pic.url) {
              console.warn(`      ⚠️  Imagen omitida (índice ${i}) porque es nula o no tiene URL`);
              continue;
            }
            const localPath = await optimizeImage(pic.url, `handangel-photo-${i}`, 'gallery');
            if (localPath) {
              const imgUrl = await uploadToR2(localPath, `images/gallery/handangel/photo-${i}.webp`, 'image/webp');
              fs.unlinkSync(localPath);

              if (i === 0) firstCover = imgUrl;

              await supabase.from('media_items').insert({
                media_album_id: mediaAlbum.id,
                type: 'photo',
                url: imgUrl,
                caption: `${handProj.name} - Imagen ${i + 1}`,
                item_order: i + 1
              });
            }
          }
          if (firstCover) {
            await supabase
              .from('media_albums')
              .update({ cover_image_url: firstCover })
              .eq('id', mediaAlbum.id);
          }
          console.log('✅ Galería de fotos de Handangel reparada.');
        } else {
          console.error('❌ Error al crear media_album de fotos:', maErr);
        }
      }

      // Procesar Stickers
      if (stickersList.length > 0) {
        const { data: existingSa } = await supabase
          .from('media_albums')
          .select('id')
          .eq('slug', 'handangel-stickers')
          .maybeSingle();

        if (existingSa) {
          console.log('ℹ️ Ya existe un álbum de stickers "handangel-stickers". Lo eliminaremos para evitar duplicados y crearlo de nuevo...');
          await supabase.from('media_albums').delete().eq('id', existingSa.id);
        }

        console.log(`🖼️ Procesando stickers (${stickersList.length} stickers)...`);
        const { data: stickerAlbum, error: saErr } = await supabase
          .from('media_albums')
          .insert({
            title: `Stickers de ${handProj.name}`,
            slug: 'handangel-stickers',
            description: `Colección de stickers del proyecto ${handProj.name}`,
            project_id: projectId
          })
          .select('id')
          .single();

        if (!saErr && stickerAlbum) {
          let firstCover = null;
          for (let i = 0; i < stickersList.length; i++) {
            const stick = stickersList[i];
            if (!stick || !stick.url) {
              console.warn(`      ⚠️  Sticker omitido (índice ${i}) porque es nulo o no tiene URL`);
              continue;
            }
            const localPath = await optimizeImage(stick.url, `handangel-sticker-${i}`, 'gallery');
            if (localPath) {
              const imgUrl = await uploadToR2(localPath, `images/gallery/handangel/stickers/sticker-${i}.webp`, 'image/webp');
              fs.unlinkSync(localPath);

              if (i === 0) firstCover = imgUrl;

              await supabase.from('media_items').insert({
                media_album_id: stickerAlbum.id,
                type: 'sticker',
                url: imgUrl,
                caption: `${handProj.name} - Sticker ${i + 1}`,
                item_order: i + 1
              });
            }
          }
          if (firstCover) {
            await supabase
              .from('media_albums')
              .update({ cover_image_url: firstCover })
              .eq('id', stickerAlbum.id);
          }
          console.log('✅ Colección de stickers de Handangel reparada.');
        } else {
          console.error('❌ Error al crear media_album de stickers:', saErr);
        }
      }
    }
  }

  console.log('\n🏁 Parche finalizado.');
}

runPatch().catch(err => {
  console.error('💥 ERROR CRÍTICO EN EL PARCHE:', err);
});
