import { supabase } from '../lib/supabase';

export const statService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('stats')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('statService.getAll:', error);
      return [];
    }
    return data ?? [];
  },

  create: async (item: Record<string, unknown>) => {
    const { error } = await supabase.from('stats').insert(item);
    if (error) {
      console.error('statService.create:', error);
      return false;
    }
    return true;
  },

  update: async (id: number, item: Record<string, unknown>) => {
    const { error } = await supabase.from('stats').update(item).eq('id', id);
    if (error) {
      console.error('statService.update:', error);
      return false;
    }
    return true;
  },

  delete: async (id: number) => {
    const { error } = await supabase.from('stats').delete().eq('id', id);
    if (error) {
      console.error('statService.delete:', error);
      return false;
    }
    return true;
  },
};
