import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

interface AdminEditLayoutProps {
  title: string;
  backPath: string;
  saving: boolean;
  onSave: () => void;
  children: React.ReactNode;
  sidebar: React.ReactNode;
  dirty?: boolean;
}

export const AdminEditLayout: React.FC<AdminEditLayoutProps> = ({
  title, backPath, saving, onSave, children, sidebar, dirty = false,
}) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const goBack = () => {
    if (dirty && !window.confirm(t({ mn: 'Хадгалаагүй өөрчлөлт алдагдана. Гарах уу?', en: 'You have unsaved changes. Leave?' }))) return;
    navigate(backPath);
  };

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={goBack}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {dirty && (
            <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              {t({ mn: 'Хадгалаагүй', en: 'Unsaved' })}
            </span>
          )}
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Left - Main Content */}
          <div className="space-y-6 min-w-0">
            {children}
          </div>

          {/* Right - Sticky Sidebar */}
          <div className="lg:sticky lg:top-6 space-y-5">
            {/* Actions Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
              <button
                onClick={onSave}
                disabled={saving}
                className="w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 rounded-lg"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={15} />}
                {t({ mn: 'Хадгалах', en: 'Save' })}
              </button>
              <button
                onClick={goBack}
                className="w-full py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                {t({ mn: 'Цуцлах', en: 'Cancel' })}
              </button>
            </div>

            {/* Sidebar Content */}
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Shared sub-components ─── */

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
    )}
    <div className="p-6 space-y-4">
      {children}
    </div>
  </div>
);

interface LangDividerProps {
  lang: 'mn' | 'en';
}

export const LangDivider: React.FC<LangDividerProps> = ({ lang }) => (
  <div className="flex items-center gap-3 pt-1">
    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
      {lang === 'mn' ? 'Монгол' : 'English'}
    </span>
    <div className="flex-grow h-px bg-gray-100 dark:bg-gray-800" />
  </div>
);

interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({ children, required }) => (
  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
    {children}
    {required && <span className="text-sdy-red ml-0.5">*</span>}
  </label>
);

export const fieldClass = 'w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:border-sdy-red focus:ring-1 focus:ring-sdy-red/20 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600';

export const textareaClass = `${fieldClass} resize-none`;
