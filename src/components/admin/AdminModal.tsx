import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Loader2 } from 'lucide-react';
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
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-sdy-black">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="px-7 py-6 space-y-5 max-h-[65vh] overflow-y-auto">
              {children}
            </div>

            {/* Footer */}
            <div className="px-7 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <button
                onClick={onSave}
                disabled={saving}
                className="flex-grow btn-primary py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {t({ mn: 'Хадгалах', en: 'Save' })}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
              >
                {t({ mn: 'Цуцлах', en: 'Cancel' })}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
