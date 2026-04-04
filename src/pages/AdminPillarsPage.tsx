import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Columns3, Plus, Pencil, Trash2 } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { pillarService } from '../services/pillarService';

interface PillarRow {
  id: string;
  title_mn: string;
  title_en: string;
  icon_name: string;
  href: string;
  sort_order: number;
}

export const AdminPillarsPage = () => {
  const { t, language: lang } = useI18n();
  const navigate = useNavigate();
  const [items, setItems] = useState<PillarRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await pillarService.getAll();
    setItems(data as PillarRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t({ mn: 'Устгах уу?', en: 'Delete this item?' }))) return;
    await pillarService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-sdy-black dark:text-white tracking-tight">
              {t({ mn: 'Тулгуур багана', en: 'Pillars' })}
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {t({ mn: `Нийт ${items.length} багана`, en: `${items.length} pillars total` })}
            </p>
          </div>
          <button onClick={() => navigate(`/${lang}/admin/pillars/new`)} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            <Plus size={15} />
            {t({ mn: 'Нэмэх', en: 'Add' })}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Гарчиг', en: 'Title' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Айкон', en: 'Icon' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Холбоос', en: 'Href' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Эрэмбэ', en: 'Sort' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="w-28 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-14 h-5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-20 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-6 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-16 h-6 bg-gray-100 dark:bg-gray-800 rounded ml-auto animate-pulse" /></td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <Columns3 size={24} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{t({ mn: 'Тулгуур багана байхгүй байна', en: 'No pillars yet' })}</p>
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <motion.tr key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sdy-black dark:text-white text-sm">{row.title_mn}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{row.title_en}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{row.icon_name}</span>
                      </td>
                      <td className="px-5 py-3.5"><div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{row.href}</div></td>
                      <td className="px-5 py-3.5"><div className="text-sm text-gray-400 dark:text-gray-500 tabular-nums">{row.sort_order}</div></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => navigate(`/${lang}/admin/pillars/${row.id}`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit"><Pencil size={15} /></button>
                          <button onClick={() => handleDelete(row.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
