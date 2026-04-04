import { supabase } from '../lib/supabase';
import { logService } from '../lib/logger';
import { toServiceError } from '../lib/errors';

interface ProgramHighlight {
  text_mn: string;
  text_en: string;
  sort_order: number;
}

function logErr(operation: string, err: unknown) {
  const se = toServiceError(operation, err);
  logService('error', se.code, {
    operation: se.operation,
    message: se.message,
    retryable: se.retryable,
  });
}

export const programService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*, program_highlights(*)')
        .order('created_at', { ascending: false });
      if (error) {
        logErr('programService.getAll', error);
        return [];
      }
      return data ?? [];
    } catch (err) {
      logErr('programService.getAll', err);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*, program_highlights(*)')
        .eq('id', id)
        .single();
      if (error) {
        logErr('programService.getById', error);
        return null;
      }
      return data;
    } catch (err) {
      logErr('programService.getById', err);
      return null;
    }
  },

  create: async (item: Record<string, unknown>, highlights: ProgramHighlight[] = []) => {
    try {
      const id = crypto.randomUUID();
      const { error } = await supabase.from('programs').insert({ id, ...item });
      if (error) {
        logErr('programService.create', error);
        return false;
      }

      if (highlights.length > 0) {
        const { error: hlError } = await supabase
          .from('program_highlights')
          .insert(highlights.map((h) => ({ program_id: id, ...h })));
        if (hlError) {
          logErr('programService.create.highlights', hlError);
          return false;
        }
      }

      return true;
    } catch (err) {
      logErr('programService.create', err);
      return false;
    }
  },

  update: async (id: string, item: Record<string, unknown>, highlights?: ProgramHighlight[]) => {
    try {
      const { error } = await supabase.from('programs').update(item).eq('id', id);
      if (error) {
        logErr('programService.update', error);
        return false;
      }

      if (highlights !== undefined) {
        const { error: delError } = await supabase
          .from('program_highlights')
          .delete()
          .eq('program_id', id);
        if (delError) {
          logErr('programService.update.delete_highlights', delError);
          return false;
        }

        if (highlights.length > 0) {
          const { error: hlError } = await supabase
            .from('program_highlights')
            .insert(highlights.map((h) => ({ program_id: id, ...h })));
          if (hlError) {
            logErr('programService.update.insert_highlights', hlError);
            return false;
          }
        }
      }

      return true;
    } catch (err) {
      logErr('programService.update', err);
      return false;
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) {
        logErr('programService.delete', error);
        return false;
      }
      return true;
    } catch (err) {
      logErr('programService.delete', err);
      return false;
    }
  },
};
