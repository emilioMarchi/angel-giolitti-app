'use client';

import { useState } from 'react';
import { Search, Music, Disc, FolderGit2, Play, Volume2 } from 'lucide-react';
import { useGlobalSearch, SearchTrack } from '@/hooks/useGlobalSearch';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getR2Url } from '@/lib/utils';
import Link from 'next/link';

export default function BuscarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { results, loading } = useGlobalSearch(searchTerm);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  const handlePlay = (track: SearchTrack) => {
    const storeTrack = {
      id: track.id,
      album_id: track.album_id,
      title: track.title,
      audio_url: getR2Url(track.audio_url),
      duration_seconds: track.duration_seconds,
      track_order: track.track_order,
      album_title: track.album_title,
      cover_url: track.cover_url ? getR2Url(track.cover_url) : undefined,
    };
    playTrack(storeTrack);
  };

  const showTracks = results.tracks.length > 0;
  const showAlbums = results.albums.length > 0;
  const showProjects = results.projects.length > 0;
  const showSidePanel = showAlbums || showProjects;
  const hasResults = showTracks || showSidePanel;

  return (
    <div className="search-view px-6 py-6 pb-32 animate-fade-in space-y-8">
      
      {/* Título de la sección */}
      <div className="space-y-1">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
          Buscar
        </h1>
        <p className="text-muted-foreground text-sm md:text-base font-medium">
          Explora canciones, álbumes y proyectos de Ángel Giolitti.
        </p>
      </div>

      {/* Input de Búsqueda de alta estética */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-md opacity-40 group-focus-within:opacity-100 transition duration-300" />
        <div className="relative flex items-center bg-muted/20 border border-white/5 rounded-2xl overflow-hidden focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
          <div className="pl-5 text-muted-foreground">
            <Search className="w-5 h-5 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="¿Qué quieres escuchar hoy?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-0 px-4 py-4 text-white placeholder-muted-foreground focus:outline-none focus:ring-0 text-base"
          />
          {loading && (
            <div className="pr-5">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Contenedor de Resultados */}
      {searchTerm.trim().length >= 2 ? (
        loading && !hasResults ? (
          <div className="py-20 text-center text-muted-foreground space-y-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">Buscando...</p>
          </div>
        ) : hasResults ? (
          <div className={`grid grid-cols-1 gap-8 pt-2 ${showTracks && showSidePanel ? 'lg:grid-cols-12' : ''}`}>
            
            {showTracks && (
              <div className={`${showSidePanel ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Music className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold tracking-wide text-white/90">Canciones</h2>
                </div>

                <div className="space-y-1.5">
                  {results.tracks.map((track) => {
                    const isCurrent = currentTrack?.id === track.id;
                    const coverUrl = track.cover_url ? getR2Url(track.cover_url) : null;

                    return (
                      <div
                        key={track.id}
                        className={`flex items-center justify-between p-3 rounded-xl transition duration-200 group ${
                          isCurrent
                            ? 'bg-muted/45 border border-primary/20'
                            : 'bg-muted/10 hover:bg-muted/20 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative w-11 h-11 rounded-lg bg-neutral-900 flex-shrink-0 overflow-hidden flex items-center justify-center group-hover:bg-neutral-800 transition">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={track.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Music className="w-4 h-4 text-muted-foreground" />
                            )}
                            <button
                              onClick={() => handlePlay(track)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200 cursor-pointer"
                            >
                              {isCurrent && isPlaying ? (
                                <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                              ) : (
                                <Play className="w-4 h-4 text-white fill-white" />
                              )}
                            </button>
                          </div>
                          
                          <div className="min-w-0">
                            <h3 className={`font-semibold text-sm truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>
                              {track.title}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              <span>{track.album_title || 'Sencillo'}</span>
                              {track.project_title && (
                                <>
                                  <span> • por </span>
                                  <Link 
                                    href={`/proyectos/${track.project_slug}`}
                                    className="hover:text-primary transition-colors font-medium text-muted-foreground/90"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {track.project_title}
                                  </Link>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 ml-4">
                          {track.duration_seconds && (
                            <span className="text-xs text-muted-foreground">
                              {Math.floor(track.duration_seconds / 60)}:
                              {String(track.duration_seconds % 60).padStart(2, '0')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {showSidePanel && (
              <div className={showTracks ? 'lg:col-span-5 space-y-8' : 'lg:col-span-12 space-y-8'}>

                {showAlbums && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <Disc className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-bold tracking-wide text-white/90">Álbumes</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.albums.map((album) => {
                        const albumCover = album.cover_url ? getR2Url(album.cover_url) : null;
                        return (
                          <div
                            key={album.id}
                            className="flex items-center gap-3 p-3 bg-muted/10 hover:bg-muted/20 border border-white/5 rounded-xl transition duration-200 group relative"
                          >
                            <div className="w-11 h-11 rounded-lg bg-neutral-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {albumCover ? (
                                <img
                                  src={albumCover}
                                  alt={album.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                              ) : (
                                <Disc className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/musica?album=${album.slug}`}
                                className="font-semibold text-xs text-neutral-200 truncate group-hover:text-primary transition-colors block"
                              >
                                {album.title}
                              </Link>
                              <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                <span>{album.release_year} • {album.type.toUpperCase()}</span>
                                {album.project_title && (
                                  <div className="mt-0.5 truncate">
                                    <span>por </span>
                                    <Link
                                      href={`/proyectos/${album.project_slug}`}
                                      className="hover:text-primary transition-colors text-muted-foreground/80 font-medium"
                                    >
                                      {album.project_title}
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {showProjects && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <FolderGit2 className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-bold tracking-wide text-white/90">Proyectos / Bandas</h2>
                    </div>

                    <div className="space-y-2">
                      {results.projects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/proyectos/${project.slug}`}
                          className="flex items-center justify-between p-3.5 bg-muted/10 hover:bg-muted/20 border border-white/5 rounded-xl transition duration-200 group"
                        >
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-neutral-200 truncate group-hover:text-primary transition-colors">
                              {project.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {project.category} • {project.creation_year}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground border border-dashed border-white/5 rounded-2xl">
            <p className="text-base font-semibold">No se encontraron resultados para &quot;{searchTerm}&quot;</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Prueba con otro término o palabra clave.</p>
          </div>
        )
      ) : (
        /* Estado inicial */
        searchTerm.trim().length > 0 ? (
          <div className="py-8 text-muted-foreground/60">
            <p className="text-xs font-medium">Escribe al menos 2 letras para comenzar la búsqueda...</p>
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground/40 space-y-3">
            <Search className="w-10 h-10 mx-auto text-muted-foreground/20" />
            <p className="text-sm font-medium">Comienza a escribir para descubrir música y proyectos.</p>
          </div>
        )
      )}

    </div>
  );
}
