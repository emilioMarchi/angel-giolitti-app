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

function buildShuffleOrder(length: number, firstIndex?: number, excludeLastIndex?: number): number[] {
  if (length <= 0) return [];
  if (length === 1) return [0];

  const indices = Array.from({ length }, (_, i) => i);
  let available = indices;

  if (firstIndex !== undefined && firstIndex >= 0 && firstIndex < length) {
    available = indices.filter((i) => i !== firstIndex);
  }

  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  if (excludeLastIndex !== undefined && available.length > 1 && available[0] === excludeLastIndex) {
    [available[0], available[1]] = [available[1], available[0]];
  }

  if (firstIndex !== undefined && firstIndex >= 0 && firstIndex < length) {
    return [firstIndex, ...available];
  }

  return available;
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
        const { isShuffle, popularTracks } = get();
        let activeQueue = newQueue && newQueue.length > 0 ? newQueue : get().queue;

        if (activeQueue.length <= 1 && popularTracks.length > 0) {
          if (popularTracks.some((t) => t.id === track.id)) {
            activeQueue = popularTracks;
          } else {
            activeQueue = [track, ...popularTracks.filter((t) => t.id !== track.id)];
          }
        } else if (!activeQueue.some((t) => t.id === track.id)) {
          activeQueue = [...activeQueue, track];
        }

        let index = activeQueue.findIndex((t) => t.id === track.id);
        if (index === -1) {
          activeQueue = [track, ...activeQueue];
          index = 0;
        }

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

      togglePlay: () => set((state) => {
        if (!state.currentTrack) {
          if (state.queue.length > 0) {
            return { currentTrack: state.queue[0], currentIndex: 0, isPlaying: true, progress: 0 };
          }
          if (state.popularTracks.length > 0) {
            return {
              queue: state.popularTracks,
              currentTrack: state.popularTracks[0],
              currentIndex: 0,
              isPlaying: true,
              progress: 0,
            };
          }
          return { isPlaying: false };
        }

        let activeQueue = state.queue;
        if (activeQueue.length <= 1 && state.popularTracks.length > 1) {
          if (state.popularTracks.some((t) => t.id === state.currentTrack!.id)) {
            activeQueue = state.popularTracks;
          } else {
            activeQueue = [state.currentTrack!, ...state.popularTracks.filter((t) => t.id !== state.currentTrack!.id)];
          }
          const index = activeQueue.findIndex((t) => t.id === state.currentTrack!.id);
          return {
            queue: activeQueue,
            currentIndex: index >= 0 ? index : 0,
            isPlaying: !state.isPlaying,
          };
        }

        return { isPlaying: !state.isPlaying };
      }),

      setPlaying: (isPlaying) => set({ isPlaying }),

      nextTrack: () => {
        const { queue, currentIndex, isShuffle, repeatMode, shuffleOrder, shufflePosition, popularTracks, currentTrack } = get();
        let activeQueue = queue;
        if (activeQueue.length <= 1 && popularTracks.length > 1) {
          if (currentTrack && popularTracks.some((t) => t.id === currentTrack.id)) {
            activeQueue = popularTracks;
          } else if (currentTrack) {
            activeQueue = [currentTrack, ...popularTracks.filter((t) => t.id !== currentTrack.id)];
          } else {
            activeQueue = popularTracks;
          }
        }

        if (activeQueue.length === 0) return;

        if (repeatMode === 'one') {
          set({ progress: 0, isPlaying: true });
          return;
        }

        let nextIndex: number;
        let newShufflePosition = shufflePosition;

        if (isShuffle) {
          let currentOrder = shuffleOrder;
          if (currentOrder.length !== activeQueue.length) {
            currentOrder = buildShuffleOrder(activeQueue.length, currentIndex);
          }

          newShufflePosition = shufflePosition + 1;
          if (newShufflePosition >= currentOrder.length) {
            const extraTracks = popularTracks.filter((t) => !activeQueue.some((q) => q.id === t.id));
            const expandedQueue = extraTracks.length > 0 ? [...activeQueue, ...extraTracks] : activeQueue;
            const lastPlayedIdx = expandedQueue.findIndex((t) => t.id === currentTrack?.id);
            const newOrder = buildShuffleOrder(expandedQueue.length, undefined, lastPlayedIdx >= 0 ? lastPlayedIdx : undefined);
            nextIndex = newOrder[0];
            set({
              queue: expandedQueue,
              shuffleOrder: newOrder,
              shufflePosition: 0,
              currentIndex: nextIndex,
              currentTrack: expandedQueue[nextIndex],
              progress: 0,
              isPlaying: true,
            });
            return;
          } else {
            nextIndex = currentOrder[newShufflePosition];
            set({
              queue: activeQueue,
              shuffleOrder: currentOrder,
              shufflePosition: newShufflePosition,
              currentIndex: nextIndex,
              currentTrack: activeQueue[nextIndex],
              progress: 0,
              isPlaying: true,
            });
            return;
          }
        } else {
          if (currentIndex >= activeQueue.length - 1 || currentIndex < 0) {
            if (repeatMode === 'all') {
              nextIndex = 0;
            } else {
              const extraTracks = popularTracks.filter((t) => !activeQueue.some((q) => q.id === t.id));
              if (extraTracks.length > 0) {
                const expandedQueue = [...activeQueue, ...extraTracks];
                nextIndex = activeQueue.length;
                set({
                  queue: expandedQueue,
                  currentIndex: nextIndex,
                  currentTrack: expandedQueue[nextIndex],
                  progress: 0,
                  isPlaying: true,
                });
                return;
              }
              nextIndex = 0;
            }
          } else {
            nextIndex = currentIndex + 1;
          }
          set({
            queue: activeQueue,
            currentIndex: nextIndex,
            currentTrack: activeQueue[nextIndex],
            progress: 0,
            isPlaying: true,
          });
        }
      },

      previousTrack: () => {
        const { queue, currentIndex, progress, isShuffle, repeatMode, shuffleOrder, shufflePosition, popularTracks } = get();
        let activeQueue = queue.length > 0 ? queue : popularTracks;
        if (activeQueue.length === 0) return;

        if (progress > 3) {
          set({ progress: 0 });
          return;
        }

        if (isShuffle && shuffleOrder.length > 0) {
          const newShufflePosition = shufflePosition > 0 ? shufflePosition - 1 : shuffleOrder.length - 1;
          const prevIndex = shuffleOrder[newShufflePosition];
          set({
            queue: activeQueue,
            shufflePosition: newShufflePosition,
            currentIndex: prevIndex,
            currentTrack: activeQueue[prevIndex],
            progress: 0,
            isPlaying: true,
          });
        } else {
          const prevIndex = currentIndex <= 0 ? activeQueue.length - 1 : currentIndex - 1;
          set({
            queue: activeQueue,
            currentIndex: prevIndex,
            currentTrack: activeQueue[prevIndex],
            progress: 0,
            isPlaying: true,
          });
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

      setTrack: (track: Track, newQueue?: Track[]) => set((state) => ({
        currentTrack: track,
        queue: newQueue && newQueue.length > 0 ? newQueue : (state.queue.length > 0 ? state.queue : [track]),
        currentIndex: (newQueue || state.queue).findIndex((t) => t.id === track.id) !== -1 ? (newQueue || state.queue).findIndex((t) => t.id === track.id) : 0,
        isPlaying: false,
        progress: 0,
        shuffleOrder: [],
        shufflePosition: -1,
      })),

      setPopularTracks: (tracks) => set((state) => ({
        popularTracks: tracks,
        queue: state.queue.length === 0 ? tracks : state.queue,
        currentIndex: state.queue.length === 0 ? 0 : state.currentIndex,
        currentTrack: state.currentTrack || (tracks.length > 0 ? tracks[0] : null),
      })),

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
