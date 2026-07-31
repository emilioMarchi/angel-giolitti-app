import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface SearchTrack {
  id: string;
  album_id: string | null;
  title: string;
  audio_url: string;
  duration_seconds: number | null;
  track_order: number;
  album_title?: string;
  cover_url?: string;
  project_title?: string;
  project_slug?: string;
}

export interface SearchAlbum {
  id: string;
  title: string;
  type: string;
  release_year: number;
  cover_url: string | null;
  slug: string;
  project_title?: string;
  project_slug?: string;
}

export interface SearchProject {
  id: string;
  title: string;
  category: string;
  creation_year: number;
  main_video_url: string | null;
  slug: string;
  profile_image_url?: string | null;
  cover_image_url?: string | null;
}

export interface SearchResults {
  tracks: SearchTrack[];
  albums: SearchAlbum[];
  projects: SearchProject[];
}

export function useGlobalSearch(searchTerm: string) {
  const [results, setResults] = useState<SearchResults>({ tracks: [], albums: [], projects: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setResults({ tracks: [], albums: [], projects: [] });
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('global_search', {
          query_text: searchTerm
        });

        if (active) {
          if (!error && data) {
            setResults(data as SearchResults);
          } else {
            console.error('Error al realizar búsqueda global:', error);
          }
        }
      } catch (err) {
        console.error('Excepción en búsqueda global:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 300); // 300ms de Debounce

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  return { results, loading };
}
