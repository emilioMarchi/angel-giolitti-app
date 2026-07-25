/**
 * migrate_metadata_only.js
 * 
 * Script que SOLO inserta metadata en Supabase sin subir archivos a R2.
 * Asume que todos los archivos (audios, imágenes, PDFs) ya están en R2
 * y construye las URLs de R2 basándose en la convención de nombres
 * usada por el script de migración original.
 * 
 * Uso: node scripts/migrate_metadata_only.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno locales de .env.local
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const PATHS = {
  oldProject: 'D:/Emi/tpc-3.0/desarrollo-web/angel-giolitti/client',
};

// --- INICIALIZAR SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/$/, '');

// --- AUXILIARES ---
function r2Url(key) {
  return `${PUBLIC_URL}/${key}`;
}

function loadOldProjects() {
  const filePath = path.join(PATHS.oldProject, 'src/projects.js');
  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontró el archivo origen en: ${filePath}`);
  }
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const tempFile = path.resolve(__dirname, 'temp_projects_load.js');
  const cjsContent = fileContent.replace(/export const projects\s*=/, 'module.exports =');
  fs.writeFileSync(tempFile, cjsContent, 'utf8');
  delete require.cache[require.resolve(tempFile)];
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

// Estima la duración de un track (no tenemos ffprobe aquí, usamos un fallback razonable)
// Si necesitas duraciones exactas, se pueden actualizar después con un script aparte.
function estimateDuration(trackTitle) {
  return 200; // ~3:20 como fallback genérico
}

// --- PROCESO PRINCIPAL ---
async function runMetadataMigration() {
  console.log('🏁 Iniciando migración de METADATA SOLAMENTE (sin subida de archivos a R2)...\n');

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ ERROR: Falta SUPABASE_SERVICE_ROLE_KEY en .env.local.');
    process.exit(1);
  }

  const oldProjects = loadOldProjects();
  console.log(`📦 Se cargaron ${oldProjects.length} proyectos desde el archivo original.\n`);

  // 1. Insertar perfil del artista si no existe
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
  } else {
    console.log('ℹ️ Perfil del artista ya existía.');
  }

  // 2. Iterar sobre cada proyecto
  for (const proj of oldProjects) {
    const projSlug = slugify(proj.name);
    console.log(`\n--------------------------------------------`);
    console.log(`🚀 Procesando Proyecto: [${proj.name}] (slug: ${projSlug})`);

    // Construir URLs de R2 basadas en la convención del script original
    const profileImageUrl = (proj.img && proj.img.perfil)
      ? r2Url(`images/profile/${projSlug}.webp`)
      : null;
    const coverImageUrl = (proj.img && proj.img.portada)
      ? r2Url(`images/projects/${projSlug}-banner.webp`)
      : null;

    // Insertar Proyecto
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
      console.error(`  ❌ Error al insertar proyecto ${proj.name}:`, projErr.message);
      continue;
    }

    const projectId = dbProj.id;
    console.log(`  ✅ Proyecto insertado con ID: ${projectId}`);

    // 3. Procesar Álbumes
    if (proj.albums && proj.albums.length > 0) {
      for (const album of proj.albums) {
        const albumSlug = slugify(album.name);
        const fullAlbumSlug = `${projSlug}-${albumSlug}`;
        console.log(`    💿 Álbum: [${album.name}] (slug: ${fullAlbumSlug})`);

        const albumCoverUrl = album.img
          ? r2Url(`images/albums/${projSlug}/${albumSlug}.webp`)
          : null;

        const { data: dbAlbum, error: albumErr } = await supabase
          .from('albums')
          .insert({
            project_id: projectId,
            title: album.name,
            slug: fullAlbumSlug,
            type: 'album',
            release_year: album.year || proj.year,
            cover_url: albumCoverUrl,
            description: `Álbum de ${proj.name}`,
            members: album.members || []
          })
          .select('id')
          .single();

        if (albumErr) {
          console.error(`      ❌ Error al insertar álbum ${album.name}:`, albumErr.message);
          continue;
        }

        const albumId = dbAlbum.id;
        console.log(`      ✅ Álbum insertado con ID: ${albumId}`);

        // Procesar Tracks
        if (album.tracks && album.tracks.length > 0) {
          for (let i = 0; i < album.tracks.length; i++) {
            const track = album.tracks[i];
            const trackSlug = slugify(track.title);

            // Construir URL del audio en R2 (convención del script original)
            const audioUrl = r2Url(`tracks/${projSlug}/${albumSlug}/${trackSlug}.mp3`);

            const { error: trackErr } = await supabase
              .from('tracks')
              .insert({
                album_id: albumId,
                title: track.title,
                slug: trackSlug,
                audio_url: audioUrl,
                duration_seconds: estimateDuration(track.title),
                track_order: i + 1
              });

            if (trackErr) {
              console.error(`        ❌ Error al insertar track ${track.title}:`, trackErr.message);
            } else {
              console.log(`        🎵 Track registrado: ${track.title}`);
            }
          }
        }
      }
    }

    // 4. PDFs (Partituras)
    if (proj.media && proj.media.pdfs && proj.media.pdfs.length > 0) {
      console.log(`    📄 Registrando PDFs / Partituras...`);
      for (const pdf of proj.media.pdfs) {
        const pdfFileName = path.basename(pdf.url);
        const pdfUrl = r2Url(`documents/${pdfFileName}`);

        const { error: pdfErr } = await supabase
          .from('artist_documents')
          .insert({
            project_id: projectId,
            title: pdf.title || pdfFileName,
            document_type: 'partitura',
            file_url: pdfUrl
          });

        if (pdfErr) {
          console.error(`      ❌ Error al insertar PDF ${pdf.title}:`, pdfErr.message);
        } else {
          console.log(`      ✅ PDF registrado: ${pdf.title}`);
        }
      }
    }

    // 5. Galerías (Fotos)
    const picturesList = (proj.media && proj.media.pictures) ? proj.media.pictures : [];
    if (picturesList.length > 0) {
      console.log(`    🖼️ Registrando galería de fotos (${picturesList.length} imágenes)...`);

      const { data: mediaAlbum, error: maErr } = await supabase
        .from('media_albums')
        .insert({
          title: `Fotos de ${proj.name}`,
          slug: `${projSlug}-fotos`,
          description: `Galería fotográfica de ${proj.name}`,
          project_id: projectId,
          cover_image_url: r2Url(`images/gallery/${projSlug}/photo-0.webp`)
        })
        .select('id')
        .single();

      if (!maErr && mediaAlbum) {
        for (let i = 0; i < picturesList.length; i++) {
          const pic = picturesList[i];
          if (!pic || !pic.url) continue;

          const imgUrl = r2Url(`images/gallery/${projSlug}/photo-${i}.webp`);

          await supabase.from('media_items').insert({
            media_album_id: mediaAlbum.id,
            type: 'photo',
            url: imgUrl,
            caption: `${proj.name} - Imagen ${i + 1}`,
            item_order: i + 1
          });
        }
        console.log(`      ✅ Galería de fotos registrada.`);
      } else if (maErr) {
        console.error(`      ❌ Error al crear media_album de fotos:`, maErr.message);
      }
    }

    // 6. Stickers
    const stickersList = (proj.media && proj.media.stickers) ? proj.media.stickers : [];
    if (stickersList.length > 0) {
      console.log(`    🖼️ Registrando stickers (${stickersList.length})...`);

      const { data: stickerAlbum, error: saErr } = await supabase
        .from('media_albums')
        .insert({
          title: `Stickers de ${proj.name}`,
          slug: `${projSlug}-stickers`,
          description: `Colección de stickers del proyecto ${proj.name}`,
          project_id: projectId,
          cover_image_url: r2Url(`images/gallery/${projSlug}/stickers/sticker-0.webp`)
        })
        .select('id')
        .single();

      if (!saErr && stickerAlbum) {
        for (let i = 0; i < stickersList.length; i++) {
          const stick = stickersList[i];
          if (!stick || !stick.url) continue;

          const imgUrl = r2Url(`images/gallery/${projSlug}/stickers/sticker-${i}.webp`);

          await supabase.from('media_items').insert({
            media_album_id: stickerAlbum.id,
            type: 'photo',
            url: imgUrl,
            caption: `${proj.name} - Sticker ${i + 1}`,
            item_order: i + 1
          });
        }
        console.log(`      ✅ Colección de stickers registrada.`);
      } else if (saErr) {
        console.error(`      ❌ Error al crear media_album de stickers:`, saErr.message);
      }
    }
  }

  console.log(`\n🎉 ¡MIGRACIÓN DE METADATA COMPLETADA CON ÉXITO!`);
  console.log(`ℹ️ Nota: Las duraciones de los tracks se estimaron en ~200s. Si necesitas valores exactos, ejecuta un script de actualización de duraciones.`);
}

// Ejecutar
runMetadataMigration().catch((err) => {
  console.error('💥 ERROR CRÍTICO EN LA MIGRACIÓN:', err);
});
