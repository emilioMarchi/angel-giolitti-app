'use client';

import { useRef, useEffect, useCallback } from 'react';
import { usePlayerStore, Track } from '@/store/usePlayerStore';
import { getR2Url } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Music,
  Heart,
  ListMusic,
  Maximize2,
} from 'lucide-react';

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    progress,
    duration,
    queue,
    currentIndex,
    togglePlay,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    setProgress,
    setDuration,
  } = usePlayerStore();

  // Tema por defecto al cargar el sitio
  useEffect(() => {
    if (!currentTrack) {
      const defaultAudioUrl = 'tracks/handangel/handangel/patio-colibri.mp3';

      supabase
        .from('tracks')
        .select('id, album_id, title, audio_url, duration_seconds, track_order, albums(title, cover_url)')
        .eq('audio_url', defaultAudioUrl)
        .single()
        .then(({ data }) => {
          const store = usePlayerStore.getState();
          let track: Track;
          if (data) {
            const t = data as any;
            track = {
              id: t.id,
              album_id: t.album_id,
              title: t.title,
              audio_url: t.audio_url,
              duration_seconds: t.duration_seconds,
              track_order: t.track_order,
              album_title: t.albums?.title || '',
              cover_url: getR2Url(t.albums?.cover_url) || undefined,
            };
          } else {
            track = {
              id: 'default-patio-colibri',
              album_id: null,
              title: 'Patio Colibrí',
              audio_url: defaultAudioUrl,
              duration_seconds: null,
              track_order: 1,
              album_title: '',
              cover_url: undefined,
            };
          }
          store.playTrack(track, [track]);
          store.setPlaying(false);
        });
    }
  }, []);

  // Sincronizar src del audio cuando cambia el track
  const hasInteracted = useRef(false);

  // Desmutear en el primer click/touch del usuario
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleInteraction = () => {
      if (!hasInteracted.current) {
        hasInteracted.current = true;
        audio.muted = false;
        audio.volume = volume;
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      }
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const absoluteAudioUrl = getR2Url(currentTrack.audio_url);
    if (audio.src !== absoluteAudioUrl) {
      audio.src = absoluteAudioUrl;
      audio.load();
    }
  }, [currentTrack]);

  // Sincronizar play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      if (!hasInteracted.current) {
        audio.muted = true;
      } else {
        audio.muted = false;
      }
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Sincronizar volumen y mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setProgress(audio.currentTime);
  }, [setProgress]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration);
  }, [setDuration]);

  const handleEnded = useCallback(() => {
    nextTrack();
  }, [nextTrack]);

  // Seek en la barra de progreso
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressBarRef.current;
      const audio = audioRef.current;
      if (!bar || !audio || !duration) return;

      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newTime = ratio * duration;
      audio.currentTime = newTime;
      setProgress(newTime);
    },
    [duration, setProgress]
  );

  // Control de volumen
  const handleVolumeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = volumeBarRef.current;
      if (!bar) return;

      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setVolume(ratio);
    },
    [setVolume]
  );

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const hasNext = currentIndex < queue.length - 1;
  const hasPrev = currentIndex > 0 || progress > 3;
  const effectiveVolume = isMuted ? 0 : volume;

  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      {/* Elemento de audio oculto */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* ── Barra del reproductor tipo Spotify ── */}
      <footer className="player-bar">
        {/* ═══ Columna izquierda: Info del track ═══ */}
        <div className="player-track-info">
          {currentTrack ? (
            <>
              <div className="player-cover">
                {currentTrack.cover_url ? (
                  <img
                    src={getR2Url(currentTrack.cover_url)}
                    alt={currentTrack.title}
                    className="player-cover-img"
                  />
                ) : (
                  <div className="player-cover-placeholder">
                    <Music className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="player-track-text">
                <p className="player-track-title">{currentTrack.title}</p>
                {currentTrack.album_title && (
                  <p className="player-track-artist">{currentTrack.album_title}</p>
                )}
              </div>
              <button className="player-like-btn" aria-label="Me gusta">
                <Heart className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="player-track-text">
              <p className="player-track-title text-muted-foreground">Sin reproducción</p>
              <p className="player-track-artist">Ángel Giolitti</p>
            </div>
          )}
        </div>

        {/* ═══ Columna central: Controles + barra de progreso ═══ */}
        <div className="player-controls-center">
          {/* Botones de control */}
          <div className="player-controls-buttons">
            <button
              className="player-control-btn"
              aria-label="Aleatorio"
            >
              <Shuffle className="h-4 w-4" />
            </button>

            <button
              onClick={previousTrack}
              disabled={!hasPrev}
              className="player-control-btn"
              aria-label="Anterior"
            >
              <SkipBack className="h-4 w-4" fill="currentColor" />
            </button>

            <button
              onClick={togglePlay}
              className="player-play-btn"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" fill="currentColor" />
              ) : (
                <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
              )}
            </button>

            <button
              onClick={nextTrack}
              disabled={!hasNext}
              className="player-control-btn"
              aria-label="Siguiente"
            >
              <SkipForward className="h-4 w-4" fill="currentColor" />
            </button>

            <button
              className="player-control-btn"
              aria-label="Repetir"
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          {/* Barra de progreso */}
          <div className="player-progress-row">
            <span className="player-time">{formatTime(progress)}</span>
            <div
              ref={progressBarRef}
              onClick={handleProgressClick}
              className="player-progress-bar"
            >
              <div className="player-progress-bg" />
              <div
                className="player-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="player-progress-dot"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
            <span className="player-time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* ═══ Columna derecha: Volumen y extras ═══ */}
        <div className="player-controls-right">
          <button className="player-control-btn hidden sm:flex" aria-label="Cola de reproducción">
            <ListMusic className="h-4 w-4" />
          </button>

          <div className="player-volume-group">
            <button
              onClick={toggleMute}
              className="player-control-btn"
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              <VolumeIcon className="h-4 w-4" />
            </button>
            <div
              ref={volumeBarRef}
              onClick={handleVolumeClick}
              className="player-volume-bar"
            >
              <div className="player-volume-bg" />
              <div
                className="player-volume-fill"
                style={{ width: `${effectiveVolume * 100}%` }}
              />
              <div
                className="player-volume-dot"
                style={{ left: `${effectiveVolume * 100}%` }}
              />
            </div>
          </div>

          <button className="player-control-btn hidden lg:flex" aria-label="Pantalla completa">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </>
  );
}
