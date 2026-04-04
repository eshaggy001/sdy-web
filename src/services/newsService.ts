import { supabase } from '../lib/supabase';
import { logService } from '../lib/logger';
import { toServiceError } from '../lib/errors';

function logErr(operation: string, err: unknown) {
  const se = toServiceError(operation, err);
  logService('error', se.code, {
    operation: se.operation,
    message: se.message,
    retryable: se.retryable,
  });
}

export const newsService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        logErr('newsService.getAll', error);
        return [];
      }
      return data ?? [];
    } catch (err) {
      logErr('newsService.getAll', err);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('news_items')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        logErr('newsService.getById', error);
        return null;
      }
      return data;
    } catch (err) {
      logErr('newsService.getById', err);
      return null;
    }
  },

  create: async (item: Record<string, unknown>) => {
    try {
      const id = crypto.randomUUID();
      const { error } = await supabase.from('news_items').insert({ id, view_count: 0, ...item });
      if (error) {
        logErr('newsService.create', error);
        return false;
      }
      return true;
    } catch (err) {
      logErr('newsService.create', err);
      return false;
    }
  },

  update: async (id: string, item: Record<string, unknown>) => {
    try {
      const { error } = await supabase.from('news_items').update(item).eq('id', id);
      if (error) {
        logErr('newsService.update', error);
        return false;
      }
      return true;
    } catch (err) {
      logErr('newsService.update', err);
      return false;
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase.from('news_items').delete().eq('id', id);
      if (error) {
        logErr('newsService.delete', error);
        return false;
      }
      return true;
    } catch (err) {
      logErr('newsService.delete', err);
      return false;
    }
  },
};
