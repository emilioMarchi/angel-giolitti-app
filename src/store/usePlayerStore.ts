import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
  id: string;
  album_id: string | null;
  title: string;
  audio_url: string;
  duration_seconds: number | null;
  track_order: number;
  album_title?: string;
  cover_url?: string;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentIndex: number;
  volume: number; // 0 a 1
  isMuted: boolean;
  progress: number; // segundos
  duration: number; // segundos
  
  // Acciones
  playTrack: (track: Track, newQueue?: Track[]) => void;
  playQueue: (queue: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  setPlaying: (isPlaying: boolean) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  clearQueue: () => void;
  addToQueue: (track: Track) => void;
  setTrack: (track: Track, newQueue?: Track[]) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      currentIndex: -1,
      volume: 0.8,
      isMuted: false,
      progress: 0,
      duration: 0,

      playTrack: (track, newQueue) => {
        let activeQueue = get().queue;
        if (newQueue) {
          activeQueue = newQueue;
        } else if (!activeQueue.some((t) => t.id === track.id)) {
          activeQueue = [...activeQueue, track];
        }

        const index = activeQueue.findIndex((t) => t.id === track.id);
        set({
          currentTrack: track,
          queue: activeQueue,
          currentIndex: index,
          isPlaying: true,
          progress: 0,
        });
      },

      playQueue: (queue, startIndex = 0) => {
        if (queue.length === 0) return;
        const index = Math.max(0, Math.min(startIndex, queue.length - 1));
        set({
          queue,
          currentIndex: index,
          currentTrack: queue[index],
          isPlaying: true,
          progress: 0,
        });
      },

      togglePlay: () => set((state) => ({ isPlaying: state.currentTrack ? !state.isPlaying : false })),
      
      setPlaying: (isPlaying) => set({ isPlaying }),

      nextTrack: () => {
        const { queue, currentIndex } = get();
        if (currentIndex < queue.length - 1) {
          const nextIndex = currentIndex + 1;
          set({
            currentIndex: nextIndex,
            currentTrack: queue[nextIndex],
            progress: 0,
            isPlaying: true,
          });
        }
      },

      previousTrack: () => {
        const { queue, currentIndex, progress } = get();
        // Si el tema lleva más de 3 segundos, lo reiniciamos
        if (progress > 3) {
          set({ progress: 0 });
          return;
        }

        if (currentIndex > 0) {
          const prevIndex = currentIndex - 1;
          set({
            currentIndex: prevIndex,
            currentTrack: queue[prevIndex],
            progress: 0,
            isPlaying: true,
          });
        }
      },

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(volume, 1)) }),

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      setProgress: (progress) => set({ progress }),

      setDuration: (duration) => set({ duration }),

      clearQueue: () => set({ queue: [], currentIndex: -1, currentTrack: null, isPlaying: false, progress: 0, duration: 0 }),

      setTrack: (track: Track, newQueue?: Track[]) => set({
        currentTrack: track,
        queue: newQueue || [track],
        currentIndex: 0,
        isPlaying: false,
        progress: 0,
      }),

      addToQueue: (track) => {
        const { queue } = get();
        if (!queue.some((t) => t.id === track.id)) {
          set({ queue: [...queue, track] });
        }
      },
    }),
    {
      name: 'angel-giolitti-player-storage',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
      }),
    }
  )
);
