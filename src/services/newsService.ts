import { supabase } from '../lib/supabase';

export const newsService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('newsService.getAll:', error);
      return [];
    }
    return data ?? [];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('news_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('newsService.getById:', error);
      return null;
    }
    return data;
  },

  create: async (item: Record<string, unknown>) => {
    const id = crypto.randomUUID();
    const { error } = await supabase.from('news_items').insert({ id, view_count: 0, ...item });
    if (error) {
      console.error('newsService.create:', error);
      return false;
    }
    return true;
  },

  update: async (id: string, item: Record<string, unknown>) => {
    const { error } = await supabase.from('news_items').update(item).eq('id', id);
    if (error) {
      console.error('newsService.update:', error);
      return false;
    }
    return true;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('news_items').delete().eq('id', id);
    if (error) {
      console.error('newsService.delete:', error);
      return false;
    }
    return true;
  },
};
