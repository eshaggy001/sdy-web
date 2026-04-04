import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapEvent } from '../lib/mappers';
import type { SDYEvent } from '../types';

export function useEvents(publishedOnly = false) {
  const [data, setData] = useState<SDYEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        let query = supabase
          .from('events')
          .select('*')
          .order('date_start', { ascending: false });

        if (publishedOnly) {
          query = query.in('status', ['published', 'ongoing', 'completed']);
        }

        const { data: rows, error } = await query;
        if (error) console.error('[useEvents]', error.message);
        setData((rows ?? []).map(mapEvent));
      } catch (err) {
        console.error('[useEvents] fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [publishedOnly]);

  return { data, loading };
}

export function useEvent(id: string | undefined) {
  const [data, setData] = useState<SDYEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const fetch = async () => {
      try {
        const { data: row, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();
        if (error) console.error('[useEvent]', error.message);
        setData(row ? mapEvent(row) : null);
      } catch (err) {
        console.error('[useEvent] fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { data, loading };
}
