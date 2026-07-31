'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Search, Music, Disc, FolderGit2 } from '@/lib/lucide';
import { useGlobalSearch, SearchTrack } from '@/hooks/useGlobalSearch';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getR2Url } from '@/lib/utils';

export default function TopBar() {
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { results, loading } = useGlobalSearch(searchTerm);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const playTrack = usePlayerStore((state) => state.playTrack);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  const handlePlay = (track: SearchTrack) => {
    playTrack({
      id: track.id,
      album_id: track.album_id,
      title: track.title,
      audio_url: getR2Url(track.audio_url),
      duration_seconds: track.duration_seconds,
      track_order: track.track_order,
      album_title: track.album_title,
      cover_url: track.cover_url ? getR2Url(track.cover_url) : undefined,
    });
    setSearchTerm('');
    setIsSearchFocused(false);
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (isSearchFocused && dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchFocused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };
    if (isSearchFocused) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSearchFocused]);

  const showTracks = results.tracks.length > 0;
  const showAlbums = results.albums.length > 0;
  const showProjects = results.projects.length > 0;
  const hasResults = showTracks || showAlbums || showProjects;
  const shouldShowDropdown = isSearchFocused && (searchTerm.trim().length >= 2 || (hasResults && searchTerm.trim().length > 0));

  if (isMobile) return null;

  return (
    <>
      <header className="topbar">
        <div className="topbar-search">
          <div className="relative" ref={dropdownRef}>
            <div className="relative flex items-center bg-muted/20 border border-white/5 rounded-xl overflow-hidden focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <div className="pl-4 text-muted-foreground">
                <Search className="w-4 h-4" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="¿Qué quieres escuchar hoy?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full max-w-[320px] bg-transparent border-0 px-3 py-2.5 text-white placeholder-muted-foreground focus:outline-none focus:ring-0 text-sm"
              />
              {loading && (
                <div className="pr-4">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {searchTerm && !loading && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="pr-4 text-muted-foreground hover:text-white transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {shouldShowDropdown && (
              <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-background border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="px-4 py-4 max-h-[50vh] overflow-y-auto">
                  {searchTerm.trim().length >= 2 && (
                    <>
                      {showTracks && (
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Music className="w-3.5 h-3.5" /> Canciones
                          </h3>
                          <div className="space-y-1">
                            {results.tracks.slice(0, 5).map((track) => {
                              const isCurrent = currentTrack?.id === track.id;
                              const coverUrl = track.cover_url ? getR2Url(track.cover_url) : null;
                              return (
                                <div
                                  key={track.id}
                                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 transition cursor-pointer"
                                  onClick={() => handlePlay(track)}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded bg-neutral-900 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                      {coverUrl ? (
                                        <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <Music className="w-3 h-3 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className={`text-sm font-medium truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>
                                        {track.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">{track.album_title}</p>
                                    </div>
                                  </div>
                                  {isCurrent && isPlaying && (
                                    <svg className="w-3.5 h-3.5 text-primary animate-pulse flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {showAlbums && (
                        <div className="mt-4">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Disc className="w-3.5 h-3.5" /> Álbumes
                          </h3>
                          <div className="space-y-1">
                            {results.albums.slice(0, 3).map((album) => (
                              <a
                                key={album.id}
                                href={`/musica/${album.slug}`}
                                onClick={() => setIsSearchFocused(false)}
                                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/20 transition"
                              >
                                <div className="w-8 h-8 rounded bg-neutral-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                  {album.cover_url ? (
                                    <img src={getR2Url(album.cover_url)} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Disc className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{album.title}</p>
                                  <p className="text-xs text-muted-foreground">{album.release_year}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {showProjects && (
                        <div className="mt-4">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <FolderGit2 className="w-3.5 h-3.5" /> Proyectos
                          </h3>
                          <div className="space-y-1">
                            {results.projects.slice(0, 3).map((project) => (
                              <a
                                key={project.id}
                                href={`/proyectos/${project.slug}`}
                                onClick={() => setIsSearchFocused(false)}
                                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/20 transition"
                              >
                                <div className="w-8 h-8 rounded bg-neutral-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                  {(project.cover_image_url || project.profile_image_url) ? (
                                    <img src={getR2Url(project.cover_image_url || project.profile_image_url!)} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <FolderGit2 className="w-3.5 h-3.5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{project.title}</p>
                                  <p className="text-xs text-muted-foreground">{project.category}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {!hasResults && !loading && searchTerm.trim().length >= 2 && (
                        <p className="text-sm text-muted-foreground text-center py-6">
                          No se encontraron resultados para "{searchTerm}"
                        </p>
                      )}

                      {searchTerm.trim().length < 2 && !loading && (
                        <p className="text-sm text-muted-foreground text-center py-6">
                          Escribe al menos 2 caracteres para buscar
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}