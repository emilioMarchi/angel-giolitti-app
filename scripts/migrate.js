const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');

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

// --- INICIALIZAR CLIENTES ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Ojo: requiere Service Role Key para saltar RLS
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
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/$/, ''); // Remover barra final si tiene

// --- FUNCIONES AUXILIARES ---

// Asegura que las carpetas existan
if (!fs.existsSync(PATHS.tempDir)) {
  fs.mkdirSync(PATHS.tempDir, { recursive: true });
}

// Carga dinámica del archivo projects.js CommonJS-friendly
function loadOldProjects() {
  const filePath = path.join(PATHS.oldProject, 'src/projects.js');
  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontró el archivo origen en: ${filePath}`);
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const tempFile = path.resolve(__dirname, 'temp_projects_load.js');
  // Reemplaza export const por module.exports
  const cjsContent = fileContent.replace(/export const projects\s*=/, 'module.exports =');
  fs.writeFileSync(tempFile, cjsContent, 'utf8');
  const projects = require(tempFile);
  fs.unlinkSync(tempFile);
  return projects;
}

// Genera un slug simple
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Sube archivos a Cloudflare R2
async function uploadToR2(localFilePath, r2Key, contentType) {
  const fileStream = fs.createReadStream(localFilePath);
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: r2Key,
    Body: fileStream,
    ContentType: contentType,
  });

  await r2.send(command);
  // Retorna la URL pública accesible
  return `${PUBLIC_URL}/${r2Key}`;
}

// Optimiza imágenes a WebP
async function optimizeImage(inputRelativePath, outputName, type = 'gallery') {
  const fullInputPath = path.join(PATHS.oldProject, 'public', inputRelativePath);
  if (!fs.existsSync(fullInputPath)) {
    console.warn(`⚠️  Imagen no encontrada: ${fullInputPath}`);
    return null;
  }

  const outputPath = path.join(PATHS.tempDir, `${outputName}.webp`);
  let pipeline = sharp(fullInputPath);

  // Redimensionar según el tipo de imagen
  if (type === 'profile') {
    pipeline = pipeline.resize(400, 400, { fit: 'cover' });
  } else if (type === 'cover') {
    pipeline = pipeline.resize(600, 600, { fit: 'cover' });
  } else if (type === 'banner') {
    pipeline = pipeline.resize(1920, 1080, { fit: 'inside', withoutEnlargement: true });
  } else {
    // Galería
    pipeline = pipeline.resize(1920, 1920, { fit: 'inside', withoutEnlargement: true });
  }

  await pipeline.webp({ quality: 80 }).toFile(outputPath);
  return outputPath;
}

// Convierte audios pesados (WAV o MP3) a MP3 optimizado y retorna duración
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
      .on('codecData', (data) => {
        // fluent-ffmpeg a veces expone la duración aquí
      })
      .on('end', () => {
        // Obtener la duración real del archivo convertido
        ffmpeg.ffprobe(outputPath, (err, metadata) => {
          if (err) {
            resolve({ path: outputPath, duration: 180 }); // Fallback 3 min
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

// Copia archivos sin modificar (PDFs)
function getPdfPath(inputRelativePath) {
  const fullInputPath = path.join(PATHS.oldProject, 'public', inputRelativePath);
  if (!fs.existsSync(fullInputPath)) {
    console.warn(`⚠️  PDF no encontrado: ${fullInputPath}`);
    return null;
  }
  return fullInputPath;
}

// --- PROCESO PRINCIPAL ---
async function runMigration() {
  console.log('🏁 Iniciando migración de datos...');
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY === 'tu_service_role_key_aqui' || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ ERROR: Debes configurar tu SUPABASE_SERVICE_ROLE_KEY real en el archivo .env.local.');
    process.exit(1);
  }

  const oldProjects = loadOldProjects();
  console.log(`📦 Se cargaron ${oldProjects.length} proyectos desde el archivo original.`);

  // Insertar perfil por defecto del artista si no existe
  console.log('👤 Asegurando perfil de artista Ángel Giolitti...');
  const { data: profile } = await supabase
    .from('artist_profile')
    .select('id')
    .limit(1)
    .maybeSingle();
  
  if (!profile) {
    await supabase.from('artist_profile').insert({
      full_name: 'Ángel Giolitti',
      short_bio: 'Músico, compositor, handpan player y realizador audiovisual.',
      full_bio_markdown: 'Trayectoria artística de Ángel Giolitti.',
      social_links: {
        youtube: 'https://www.youtube.com/@AngelGiolitti',
        instagram: 'https://www.instagram.com/loopangeloop',
        spotify: ''
      }
    });
    console.log('✅ Perfil del artista insertado.');
  }

  for (const proj of oldProjects) {
    const projSlug = slugify(proj.name);
    console.log(`\n--------------------------------------------`);
    console.log(`🚀 Procesando Proyecto: [${proj.name}]`);

    // 1. Subir imágenes del proyecto
    let profileImageUrl = null;
    let coverImageUrl = null;

    if (proj.img && proj.img.perfil) {
      console.log(`  📸 Optimizando foto de perfil de proyecto...`);
      const localPath = await optimizeImage(proj.img.perfil, `${projSlug}-profile`, 'profile');
      if (localPath) {
        profileImageUrl = await uploadToR2(localPath, `images/profile/${projSlug}.webp`, 'image/webp');
        fs.unlinkSync(localPath);
      }
    }

    if (proj.img && proj.img.portada) {
      console.log(`  📸 Optimizando foto de portada de proyecto...`);
      const localPath = await optimizeImage(proj.img.portada, `${projSlug}-cover`, 'banner');
      if (localPath) {
        coverImageUrl = await uploadToR2(localPath, `images/projects/${projSlug}-banner.webp`, 'image/webp');
        fs.unlinkSync(localPath);
      }
    }

    // 2. Insertar Proyecto en Supabase
    const { data: dbProj, error: projErr } = await supabase
      .from('projects')
      .insert({
        title: proj.name,
        slug: projSlug,
        category: proj.type,
        creation_year: proj.year,
        end_year: proj.endYear || null,
        profile_image_url: profileImageUrl,
        cover_image_url: coverImageUrl,
        summary: proj.bio || `Proyecto de ${proj.name}`,
        description_markdown: proj.bio || '',
        main_video_url: (proj.media && proj.media.videos && proj.media.videos[0]) ? proj.media.videos[0].url : null,
        members: proj.members || [],
        social_links: proj.socialMedia || {}
      })
      .select('id')
      .single();

    if (projErr) {
      console.error(`  ❌ Error al insertar proyecto ${proj.name}:`, projErr);
      continue;
    }

    const projectId = dbProj.id;
    console.log(`  ✅ Proyecto insertado con ID: ${projectId}`);

    // 3. Procesar Álbumes del Proyecto
    if (proj.albums && proj.albums.length > 0) {
      for (const album of proj.albums) {
        const albumSlug = slugify(album.name);
        console.log(`    💿 Procesando Álbum: [${album.name}]`);

        // Subir portada del álbum
        let albumCoverUrl = null;
        if (album.img) {
          console.log(`      📸 Optimizando portada del álbum...`);
          const localPath = await optimizeImage(album.img, `${projSlug}-${albumSlug}-cover`, 'cover');
          if (localPath) {
            albumCoverUrl = await uploadToR2(localPath, `images/albums/${projSlug}/${albumSlug}.webp`, 'image/webp');
            fs.unlinkSync(localPath);
          }
        }

        // Insertar Álbum
        const { data: dbAlbum, error: albumErr } = await supabase
          .from('albums')
          .insert({
            project_id: projectId,
            title: album.name,
            slug: `${projSlug}-${albumSlug}`,
            type: 'album',
            release_year: album.year || proj.year,
            cover_url: albumCoverUrl,
            description: `Álbum de ${proj.name}`,
            members: album.members || []
          })
          .select('id')
          .single();

        if (albumErr) {
          console.error(`      ❌ Error al insertar álbum ${album.name}:`, albumErr);
          continue;
        }

        const albumId = dbAlbum.id;
        console.log(`      ✅ Álbum insertado con ID: ${albumId}`);

        // Procesar Canciones (Tracks) del Álbum
        if (album.tracks && album.tracks.length > 0) {
          for (let i = 0; i < album.tracks.length; i++) {
            const track = album.tracks[i];
            const trackSlug = slugify(track.title);
            console.log(`      🎵 Procesando Track: [${track.title}]`);

            if (track.src) {
              console.log(`        🎙️  Convirtiendo y analizando duración del audio...`);
              try {
                const processed = await processAudio(track.src, `${projSlug}-${albumSlug}-${trackSlug}`);
                if (processed) {
                  const audioUrl = await uploadToR2(processed.path, `tracks/${projSlug}/${albumSlug}/${trackSlug}.mp3`, 'audio/mpeg');
                  fs.unlinkSync(processed.path);

                  // Insertar Track
                  const { error: trackErr } = await supabase
                    .from('tracks')
                    .insert({
                      album_id: albumId,
                      title: track.title,
                      slug: trackSlug,
                      audio_url: audioUrl,
                      duration_seconds: processed.duration,
                      track_order: i + 1
                    });

                  if (trackErr) {
                    console.error(`        ❌ Error al insertar track ${track.title}:`, trackErr);
                  } else {
                    console.log(`        ✅ Track subido e insertado (${processed.duration}s)`);
                  }
                }
              } catch (e) {
                console.error(`        ❌ Fallo al procesar audio para ${track.title}:`, e.message);
              }
            }
          }
        }
      }
    }

    // 4. Procesar PDFs (Partituras)
    if (proj.media && proj.media.pdfs && proj.media.pdfs.length > 0) {
      console.log(`    📄 Procesando PDFs / Partituras...`);
      for (const pdf of proj.media.pdfs) {
        const pdfFileName = path.basename(pdf.url);
        const localPath = getPdfPath(pdf.url);
        
        if (localPath) {
          const pdfUrl = await uploadToR2(localPath, `documents/${pdfFileName}`, 'application/pdf');
          
          // Insertar en artist_documents
          const { error: pdfErr } = await supabase
            .from('artist_documents')
            .insert({
              project_id: projectId,
              title: pdf.title || pdfFileName,
              document_type: 'partitura',
              file_url: pdfUrl
            });

          if (pdfErr) {
            console.error(`      ❌ Error al insertar PDF ${pdf.title}:`, pdfErr);
          } else {
            console.log(`      ✅ PDF subido e insertado: ${pdf.title}`);
          }
        }
      }
    }

    // 5. Procesar Galerías e Imágenes
    const picturesList = (proj.media && proj.media.pictures) ? proj.media.pictures : [];
    const stickersList = (proj.media && proj.media.stickers) ? proj.media.stickers : [];

    if (picturesList.length > 0) {
      console.log(`    🖼️  Procesando galería de fotos (${picturesList.length} imágenes)...`);
      
      // Crear Media Album para fotos
      const { data: mediaAlbum, error: maErr } = await supabase
        .from('media_albums')
        .insert({
          title: `Fotos de ${proj.name}`,
          slug: `${projSlug}-fotos`,
          description: `Galería fotográfica de ${proj.name}`,
          project_id: projectId
        })
        .select('id')
        .single();

      if (!maErr) {
        let firstCover = null;
        for (let i = 0; i < picturesList.length; i++) {
          const pic = picturesList[i];
          if (!pic || !pic.url) {
            console.warn(`      ⚠️  Imagen omitida (índice ${i}) porque es nula o no tiene URL`);
            continue;
          }
          const localPath = await optimizeImage(pic.url, `${projSlug}-photo-${i}`, 'gallery');
          if (localPath) {
            const imgUrl = await uploadToR2(localPath, `images/gallery/${projSlug}/photo-${i}.webp`, 'image/webp');
            fs.unlinkSync(localPath);

            if (i === 0) firstCover = imgUrl;

            // Insertar item
            await supabase.from('media_items').insert({
              media_album_id: mediaAlbum.id,
              type: 'photo',
              url: imgUrl,
              caption: `${proj.name} - Imagen ${i + 1}`,
              item_order: i + 1
            });
          }
        }
        
        // Actualizar cover del álbum con la primera foto
        if (firstCover) {
          await supabase
            .from('media_albums')
            .update({ cover_image_url: firstCover })
            .eq('id', mediaAlbum.id);
        }
        console.log(`      ✅ Galería de fotos procesada e insertada.`);
      } else {
        console.error(`      ❌ Error al crear media_album de fotos:`, maErr);
      }
    }

    if (stickersList.length > 0) {
      console.log(`    🖼️  Procesando stickers (${stickersList.length} stickers)...`);
      
      // Crear Media Album para stickers
      const { data: stickerAlbum, error: saErr } = await supabase
        .from('media_albums')
        .insert({
          title: `Stickers de ${proj.name}`,
          slug: `${projSlug}-stickers`,
          description: `Colección de stickers del proyecto ${proj.name}`,
          project_id: projectId
        })
        .select('id')
        .single();

      if (!saErr) {
        let firstCover = null;
        for (let i = 0; i < stickersList.length; i++) {
          const stick = stickersList[i];
          if (!stick || !stick.url) {
            console.warn(`      ⚠️  Sticker omitido (índice ${i}) porque es nulo o no tiene URL`);
            continue;
          }
          const localPath = await optimizeImage(stick.url, `${projSlug}-sticker-${i}`, 'gallery');
          if (localPath) {
            const imgUrl = await uploadToR2(localPath, `images/gallery/${projSlug}/stickers/sticker-${i}.webp`, 'image/webp');
            fs.unlinkSync(localPath);

            if (i === 0) firstCover = imgUrl;

            // Insertar item
            await supabase.from('media_items').insert({
              media_album_id: stickerAlbum.id,
              type: 'photo',
              url: imgUrl,
              caption: `${proj.name} - Sticker ${i + 1}`,
              item_order: i + 1
            });
          }
        }
        
        // Actualizar cover del álbum con el primer sticker
        if (firstCover) {
          await supabase
            .from('media_albums')
            .update({ cover_image_url: firstCover })
            .eq('id', stickerAlbum.id);
        }
        console.log(`      ✅ Galería de stickers procesada e insertada.`);
      } else {
        console.error(`      ❌ Error al crear media_album de stickers:`, saErr);
      }
    }
  }

  // Eliminar la carpeta temporal
  fs.rmSync(PATHS.tempDir, { recursive: true, force: true });
  console.log(`\n🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO!`);
}

// Ejecutar
runMigration().catch((err) => {
  console.error('💥 ERROR CRÍTICO EN LA MIGRACIÓN:', err);
});
