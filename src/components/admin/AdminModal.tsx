import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

interface AdminModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving?: boolean;
  children: React.ReactNode;
}

export const AdminModal: React.FC<AdminModalProps> = ({ open, title, onClose, onSave, saving, children }) => {
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-sdy-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-sdy-black uppercase tracking-tight">{title}</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {children}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="flex-grow btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {t({ mn: 'Хадгалах', en: 'Save' })}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-4 bg-gray-100 text-gray-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-200 transition-all"
                >
                  {t({ mn: 'Цуцлах', en: 'Cancel' })}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
