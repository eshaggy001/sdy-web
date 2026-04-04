import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Newspaper, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { newsService } from '../services/newsService';

interface NewsRow {
  id: string;
  title_mn: string;
  title_en: string;
  category_mn: string;
  category_en: string;
  date_mn: string;
  date_en: string;
  image: string | null;
}

export const AdminNewsPage = () => {
  const { t, language: lang } = useI18n();
  const navigate = useNavigate();
  const [items, setItems] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await newsService.getAll();
    setItems(data as NewsRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t({ mn: 'Устгах уу?', en: 'Delete this news item?' }))) return;
    await newsService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-sdy-black dark:text-white tracking-tight">
              {t({ mn: 'Мэдээ мэдээлэл', en: 'News' })}
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {t({ mn: `Нийт ${items.length} мэдээ`, en: `${items.length} articles total` })}
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
              onClick={() => navigate(`/${lang}/admin/news/new`)}
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
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Гарчиг', en: 'Title' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Ангилал', en: 'Category' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Огноо', en: 'Date' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="w-14 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-40 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-16 h-5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-20 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-16 h-6 bg-gray-100 dark:bg-gray-800 rounded ml-auto animate-pulse" /></td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <Newspaper size={24} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        {t({ mn: 'Мэдээ байхгүй байна', en: 'No news yet' })}
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
                          <img src={item.image} alt="" className="w-14 h-9 rounded-lg object-cover border border-gray-100 dark:border-gray-800" />
                        ) : (
                          <div className="w-14 h-9 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                            <Newspaper size={13} className="text-gray-300 dark:text-gray-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sdy-black dark:text-white text-sm max-w-[250px] truncate">{item.title_mn}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          {item.category_mn}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs text-gray-400 dark:text-gray-500">{item.date_mn}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/${lang}/admin/news/${item.id}`)}
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
