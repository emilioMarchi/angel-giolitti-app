'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Search, Music, Disc, FolderGit2, Volume2, Share2, MessageCircle, MessageSquare } from '@/lib/lucide';
import { useGlobalSearch, SearchTrack } from '@/hooks/useGlobalSearch';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getR2Url } from '@/lib/utils';

export default function TopBar() {
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const { results, loading } = useGlobalSearch(searchTerm);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 769);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchTerm('');
      }
    };
    if (isSearchOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSearchOpen]);

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    if (isSearchOpen) setSearchTerm('');
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (shareOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shareOpen]);

  const showTracks = results.tracks.length > 0;
  const showAlbums = results.albums.length > 0;
  const showProjects = results.projects.length > 0;
  const hasResults = showTracks || showAlbums || showProjects;

  if (isMobile) return null;

  return (
    <>
      <header className="topbar">
        <div className="topbar-actions">
          <div className="relative">
            <button
              onClick={() => setShareOpen(!shareOpen)}
              className="topbar-profile-btn flex transition-colors"
              aria-label="Compartir"
            >
              <Share2 className="h-5 w-5" />
            </button>
            {shareOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-white/10 rounded-lg shadow-xl py-2 z-50 animate-fade-in">
                <button className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-white/5 w-full text-left" onClick={() => { navigator.share({ title: 'Ángel Giolitti', text: 'Escucha a Ángel Giolitti', url: window.location.href }); setShareOpen(false); }}>
                  <MessageCircle className="h-4 w-4" />
                  Compartir
                </button>
                <button className="flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-white/5 w-full text-left" onClick={() => { navigator.clipboard.writeText(window.location.href); setShareOpen(false); }}>
                  <MessageSquare className="h-4 w-4" />
                  Copiar enlace
                </button>
              </div>
            )}
          </div>
          <button
            onClick={toggleSearch}
            className={`topbar-profile-btn flex transition-colors ${isSearchOpen ? 'text-primary' : ''}`}
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </header>

      {isSearchOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
            onClick={closeSearch}
          />
          <div
            ref={panelRef}
            className="fixed left-0 right-0 z-25 top-16 max-h-[calc(100vh-4rem-90px)] bg-background border-b border-border shadow-2xl overflow-y-auto"
          >
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">Buscar</h2>
                <button
                  onClick={closeSearch}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label="Cerrar búsqueda"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
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
                  className="w-full bg-transparent border-0 px-3 py-3 text-white placeholder-muted-foreground focus:outline-none focus:ring-0 text-sm"
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
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {searchTerm.trim().length >= 2 && (
                <div className="mt-4 space-y-4 pb-4">
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
                                <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {showAlbums && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Disc className="w-3.5 h-3.5" /> Álbumes
                      </h3>
                      <div className="space-y-1">
                        {results.albums.slice(0, 3).map((album) => (
                          <Link
                            key={album.id}
                            href={`/musica?album=${album.slug}`}
                            onClick={closeSearch}
                            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/20 transition"
                          >
                            <div className="w-8 h-8 rounded bg-neutral-900 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              <Disc className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{album.title}</p>
                              <p className="text-xs text-muted-foreground">{album.release_year}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {showProjects && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FolderGit2 className="w-3.5 h-3.5" /> Proyectos
                      </h3>
                      <div className="space-y-1">
                        {results.projects.slice(0, 3).map((project) => (
                          <Link
                            key={project.id}
                            href={`/proyectos/${project.slug}`}
                            onClick={closeSearch}
                            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/20 transition"
                          >
                            <div className="w-8 h-8 rounded bg-neutral-900 flex items-center justify-center flex-shrink-0">
                              <FolderGit2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{project.title}</p>
                              <p className="text-xs text-muted-foreground">{project.category}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {!hasResults && !loading && (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No se encontraron resultados para &quot;{searchTerm}&quot;
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </>
  );
}
