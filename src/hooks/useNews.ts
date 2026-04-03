import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapNewsItem } from '../lib/mappers';
import type { NewsItem } from '../types';

export function useNews() {
  const [data, setData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('news_items')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data: rows }) => {
        setData((rows ?? []).map(mapNewsItem));
        setLoading(false);
      });
  }, []);

  return { data, loading };
}

export function useNewsItem(id: string | undefined) {
  const [data, setData] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    supabase
      .from('news_items')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data: row }) => {
        setData(row ? mapNewsItem(row) : null);
        setLoading(false);
      });
  }, [id]);

  return { data, loading };
}
