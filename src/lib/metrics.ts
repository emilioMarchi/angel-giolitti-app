import { supabase } from './supabase';

export async function incrementPlay(trackId: string) {
  const { error } = await supabase.rpc('increment_track_play', { target_track_id: trackId });
  if (error) console.error('Error incrementando play:', error.message);
}

export async function incrementLike(trackId: string) {
  const { error } = await supabase.rpc('increment_track_like', { target_track_id: trackId });
  if (error) console.error('Error incrementando like:', error.message);
}

export async function decrementLike(trackId: string) {
  const { error } = await supabase.rpc('decrement_track_like', { target_track_id: trackId });
  if (error) console.error('Error decrementando like:', error.message);
}

export async function getArtistMetrics() {
  const { data, error } = await supabase.rpc('get_artist_metrics');
  if (error) {
    console.error('Error obteniendo métricas del artista:', error.message);
    return null;
  }
  return data as { total_plays: number; total_likes: number; total_tracks: number; total_followers: number; total_listeners: number };
}

export async function incrementFollow() {
  const { error } = await supabase.rpc('increment_artist_follow');
  if (error) console.error('Error incrementando follow:', error.message);
}

export async function decrementFollow() {
  const { error } = await supabase.rpc('decrement_artist_follow');
  if (error) console.error('Error decrementando follow:', error.message);
}

export async function incrementListener() {
  const { error } = await supabase.rpc('increment_artist_listener');
  if (error) console.error('Error incrementando listener:', error.message);
}

export async function incrementPageView(path: string) {
  const { error } = await supabase.rpc('increment_page_view', { target_path: path });
  if (error) console.error('Error registrando vista de página:', error.message);
}
