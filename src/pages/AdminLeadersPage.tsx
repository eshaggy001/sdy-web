import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, Plus, Pencil, Trash2, RefreshCw, GripVertical } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { leaderService } from '../services/leaderService';

interface LeaderRow {
  id: string;
  name_mn: string;
  name_en: string;
  role_mn: string;
  role_en: string;
  image: string | null;
  sort_order: number;
}

export const AdminLeadersPage = () => {
  const { t, language: lang } = useI18n();
  const navigate = useNavigate();
  const [items, setItems] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await leaderService.getAll();
    setItems(data as LeaderRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t({ mn: 'Устгах уу?', en: 'Delete this leader?' }))) return;
    await leaderService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-sdy-black dark:text-white tracking-tight">
              {t({ mn: 'Удирдлага', en: 'Leaders' })}
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {t({ mn: `Нийт ${items.length} удирдлага`, en: `${items.length} leaders total` })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
              title={t({ mn: 'Шинэчлэх', en: 'Refresh' })}
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => navigate(`/${lang}/admin/leaders/new`)}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              <Plus size={15} />
              {t({ mn: 'Нэмэх', en: 'Add' })}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Зураг', en: 'Image' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Нэр', en: 'Name' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Албан тушаал', en: 'Role' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <GripVertical size={12} className="inline -mt-0.5 mr-0.5" />{t({ mn: 'Эрэмбэ', en: 'Sort' })}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-28 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-24 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-6 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-16 h-6 bg-gray-100 dark:bg-gray-800 rounded ml-auto animate-pulse" /></td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <Users size={24} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        {t({ mn: 'Удирдлага байхгүй байна', en: 'No leaders yet' })}
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-100 dark:border-gray-800" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                            <Users size={14} className="text-gray-300 dark:text-gray-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sdy-black dark:text-white text-sm">{item.name_mn}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.role_mn}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-400 dark:text-gray-500 tabular-nums">{item.sort_order}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/${lang}/admin/leaders/${item.id}`)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
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
