import { supabase, isAuthError, tryRefreshSession } from '../lib/supabase';

export const eventService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date_start', { ascending: false });

    if (error) {
      console.error('eventService.getAll:', error);
      if (isAuthError(error) && await tryRefreshSession()) {
        const retry = await supabase.from('events').select('*').order('date_start', { ascending: false });
        if (!retry.error) return retry.data ?? [];
      }
      return [];
    }
    return data ?? [];
  },

  getPublished: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('status', ['published', 'ongoing', 'completed'])
      .order('date_start', { ascending: false });

    if (error) {
      console.error('eventService.getPublished:', error);
      if (isAuthError(error) && await tryRefreshSession()) {
        const retry = await supabase.from('events').select('*').in('status', ['published', 'ongoing', 'completed']).order('date_start', { ascending: false });
        if (!retry.error) return retry.data ?? [];
      }
      return [];
    }
    return data ?? [];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('eventService.getById:', error);
      return null;
    }
    return data;
  },

  create: async (item: Record<string, unknown>) => {
    const { error } = await supabase.from('events').insert(item);
    if (error) {
      console.error('eventService.create:', error);
      return false;
    }
    return true;
  },

  update: async (id: string, item: Record<string, unknown>) => {
    const { error } = await supabase.from('events').update({ ...item, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      console.error('eventService.update:', error);
      return false;
    }
    return true;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error('eventService.delete:', error);
      return false;
    }
    return true;
  },
};
