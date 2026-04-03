import { supabase } from '../lib/supabase';

export const storageService = {
  upload: async (bucket: string, file: File, path: string): Promise<string | null> => {
    try {
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      console.error('storageService.upload:', err);
      return null;
    }
  },

  delete: async (bucket: string, paths: string[]): Promise<void> => {
    try {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) throw error;
    } catch (err) {
      console.error('storageService.delete:', err);
    }
  },
};
