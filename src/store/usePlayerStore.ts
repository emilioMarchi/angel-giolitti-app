import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { incrementLike, decrementLike, incrementFollow, decrementFollow } from '@/lib/metrics';

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

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  currentIndex: number;
  volume: number;
  isMuted: boolean;
  progress: number;
  duration: number;
  popularTracks: Track[];
  likedTrackIds: string[];
  isFollowing: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  shuffleOrder: number[];
  shufflePosition: number;

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
  setPopularTracks: (tracks: Track[]) => void;
  toggleLike: (trackId: string) => void;
  toggleFollow: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

function buildShuffleOrder(length: number, excludeIndex?: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  if (excludeIndex !== undefined && excludeIndex >= 0 && excludeIndex < length) {
    const idx = indices.indexOf(excludeIndex);
    if (idx > 0) {
      [indices[0], indices[idx]] = [indices[idx], indices[0]];
    }
  }
  return indices;
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
      popularTracks: [],
      likedTrackIds: [],
      isFollowing: false,
      isShuffle: false,
      repeatMode: 'off',
      shuffleOrder: [],
      shufflePosition: -1,

      playTrack: (track, newQueue) => {
        const { isShuffle } = get();
        let activeQueue = get().queue;
        if (newQueue) {
          activeQueue = newQueue;
        } else if (!activeQueue.some((t) => t.id === track.id)) {
          activeQueue = [...activeQueue, track];
        }

        const index = activeQueue.findIndex((t) => t.id === track.id);
        const shuffleOrder = isShuffle ? buildShuffleOrder(activeQueue.length, index) : [];
        const shufflePosition = isShuffle ? 0 : -1;

        set({
          currentTrack: track,
          queue: activeQueue,
          currentIndex: index,
          shuffleOrder,
          shufflePosition,
          isPlaying: true,
          progress: 0,
        });
      },

      playQueue: (queue, startIndex = 0) => {
        if (queue.length === 0) return;
        const { isShuffle } = get();
        const index = Math.max(0, Math.min(startIndex, queue.length - 1));
        const shuffleOrder = isShuffle ? buildShuffleOrder(queue.length, index) : [];
        const shufflePosition = isShuffle ? 0 : -1;

        set({
          queue,
          currentIndex: index,
          currentTrack: queue[index],
          shuffleOrder,
          shufflePosition,
          isPlaying: true,
          progress: 0,
        });
      },

      togglePlay: () => set((state) => ({ isPlaying: state.currentTrack ? !state.isPlaying : false })),

      setPlaying: (isPlaying) => set({ isPlaying }),

      nextTrack: () => {
        const { queue, currentIndex, isShuffle, repeatMode, shuffleOrder, shufflePosition } = get();
        if (queue.length === 0) return;

        if (repeatMode === 'one') {
          set({ progress: 0, isPlaying: true });
          return;
        }

        let nextIndex: number;
        let newShufflePosition = shufflePosition;

        if (isShuffle && shuffleOrder.length > 0) {
          newShufflePosition = shufflePosition + 1;
          if (newShufflePosition >= shuffleOrder.length) {
            if (repeatMode === 'all') {
              const newOrder = buildShuffleOrder(queue.length, currentIndex);
              newShufflePosition = 0;
              nextIndex = newOrder[0];
              set({
                shuffleOrder: newOrder,
                shufflePosition: newShufflePosition,
                currentIndex: nextIndex,
                currentTrack: queue[nextIndex],
                progress: 0,
                isPlaying: true,
              });
              return;
            } else {
              return;
            }
          }
          nextIndex = shuffleOrder[newShufflePosition];
          set({
            shufflePosition: newShufflePosition,
            currentIndex: nextIndex,
            currentTrack: queue[nextIndex],
            progress: 0,
            isPlaying: true,
          });
        } else {
          if (currentIndex >= queue.length - 1) {
            if (repeatMode === 'all') {
              nextIndex = 0;
            } else {
              return;
            }
          } else {
            nextIndex = currentIndex + 1;
          }
          set({
            currentIndex: nextIndex,
            currentTrack: queue[nextIndex],
            progress: 0,
            isPlaying: true,
          });
        }
      },

      previousTrack: () => {
        const { queue, currentIndex, progress, isShuffle, repeatMode, shuffleOrder, shufflePosition } = get();
        if (queue.length === 0) return;

        if (progress > 3) {
          set({ progress: 0 });
          return;
        }

        if (isShuffle && shuffleOrder.length > 0) {
          if (shufflePosition > 0) {
            const newShufflePosition = shufflePosition - 1;
            const prevIndex = shuffleOrder[newShufflePosition];
            set({
              shufflePosition: newShufflePosition,
              currentIndex: prevIndex,
              currentTrack: queue[prevIndex],
              progress: 0,
              isPlaying: true,
            });
          } else if (repeatMode === 'all') {
            const newShufflePosition = shuffleOrder.length - 1;
            const prevIndex = shuffleOrder[newShufflePosition];
            set({
              shufflePosition: newShufflePosition,
              currentIndex: prevIndex,
              currentTrack: queue[prevIndex],
              progress: 0,
              isPlaying: true,
            });
          }
        } else {
          if (currentIndex <= 0) {
            if (repeatMode === 'all') {
              const prevIndex = queue.length - 1;
              set({
                currentIndex: prevIndex,
                currentTrack: queue[prevIndex],
                progress: 0,
                isPlaying: true,
              });
            }
          } else {
            const prevIndex = currentIndex - 1;
            set({
              currentIndex: prevIndex,
              currentTrack: queue[prevIndex],
              progress: 0,
              isPlaying: true,
            });
          }
        }
      },

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(volume, 1)) }),

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      setProgress: (progress) => set({ progress }),

      setDuration: (duration) => set({ duration }),

      clearQueue: () => set({
        queue: [],
        currentIndex: -1,
        currentTrack: null,
        isPlaying: false,
        progress: 0,
        duration: 0,
        shuffleOrder: [],
        shufflePosition: -1,
      }),

      setTrack: (track: Track, newQueue?: Track[]) => set({
        currentTrack: track,
        queue: newQueue || [track],
        currentIndex: 0,
        isPlaying: false,
        progress: 0,
        shuffleOrder: [],
        shufflePosition: -1,
      }),

      setPopularTracks: (tracks) => set({ popularTracks: tracks }),

      addToQueue: (track) => {
        const { queue } = get();
        if (!queue.some((t) => t.id === track.id)) {
          set({ queue: [...queue, track] });
        }
      },

      toggleLike: (trackId) => {
        const { likedTrackIds } = get();
        const isLiked = likedTrackIds.includes(trackId);
        if (isLiked) {
          set({ likedTrackIds: likedTrackIds.filter((id) => id !== trackId) });
          decrementLike(trackId);
        } else {
          set({ likedTrackIds: [...likedTrackIds, trackId] });
          incrementLike(trackId);
        }
      },

      toggleFollow: () => {
        const { isFollowing } = get();
        if (isFollowing) {
          set({ isFollowing: false });
          decrementFollow();
        } else {
          set({ isFollowing: true });
          incrementFollow();
        }
      },

      toggleShuffle: () => {
        const { isShuffle, queue, currentIndex } = get();
        if (!isShuffle) {
          const shuffleOrder = buildShuffleOrder(queue.length, currentIndex);
          set({
            isShuffle: true,
            shuffleOrder,
            shufflePosition: 0,
          });
        } else {
          set({
            isShuffle: false,
            shuffleOrder: [],
            shufflePosition: -1,
          });
        }
      },

      toggleRepeat: () => set((state) => {
        const modes: RepeatMode[] = ['off', 'all', 'one'];
        const nextIndex = (modes.indexOf(state.repeatMode) + 1) % modes.length;
        return { repeatMode: modes[nextIndex] };
      }),
    }),
    {
      name: 'angel-giolitti-player-storage',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        likedTrackIds: state.likedTrackIds,
        isFollowing: state.isFollowing,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
      }),
    }
  )
);
