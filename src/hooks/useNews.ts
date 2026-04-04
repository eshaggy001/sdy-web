import { useState, useEffect } from 'react';
import { supabase, isAuthError, tryRefreshSession } from '../lib/supabase';
import { mapNewsItem } from '../lib/mappers';
import type { NewsItem } from '../types';

export function useNews() {
  const [data, setData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        let { data: rows, error } = await supabase
          .from('news_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (error && isAuthError(error) && await tryRefreshSession()) {
          const retry = await supabase.from('news_items').select('*').order('created_at', { ascending: false });
          rows = retry.data;
          error = retry.error;
        }

        if (error) {
          console.error('[useNews]', error.message);
          if (isAuthError(error)) setAuthError(true);
        }
        setData((rows ?? []).map(mapNewsItem));
      } catch (err) {
        console.error('[useNews] fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading, authError };
}

export function useNewsItem(id: string | undefined) {
  const [data, setData] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const fetch = async () => {
      try {
        const { data: row, error } = await supabase
          .from('news_items')
          .select('*')
          .eq('id', id)
          .single();
        if (error) console.error('[useNewsItem]', error.message);
        setData(row ? mapNewsItem(row) : null);
      } catch (err) {
        console.error('[useNewsItem] fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { data, loading };
}
