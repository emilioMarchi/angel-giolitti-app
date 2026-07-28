import { supabase } from './supabase';

export async function incrementPlay(trackId: string) {
  await supabase.rpc('increment_track_play', { target_track_id: trackId });
}

export async function incrementLike(trackId: string) {
  await supabase.rpc('increment_track_like', { target_track_id: trackId });
}

export async function decrementLike(trackId: string) {
  await supabase.rpc('decrement_track_like', { target_track_id: trackId });
}

export async function getArtistMetrics() {
  const { data, error } = await supabase.rpc('get_artist_metrics');
  if (error) return null;
  return data as { total_plays: number; total_likes: number; total_tracks: number; total_followers: number; total_listeners: number };
}

export async function incrementFollow() {
  await supabase.rpc('increment_artist_follow');
}

export async function decrementFollow() {
  await supabase.rpc('decrement_artist_follow');
}

export async function incrementListener() {
  await supabase.rpc('increment_artist_listener');
}
