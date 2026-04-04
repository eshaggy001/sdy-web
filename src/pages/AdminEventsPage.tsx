import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CalendarDays, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useEventRegistrationCounts } from '../hooks/useRegistrations';
import { useI18n } from '../contexts/I18nContext';
import { eventService } from '../services/eventService';
import type { EventStatus } from '../types';

interface EventRow {
  id: string;
  title_mn: string;
  title_en: string;
  status: EventStatus;
  date_start: string | null;
  date_end: string | null;
  image: string | null;
  max_participants: number | null;
}

const STATUS_LABELS: Record<EventStatus, { mn: string; en: string }> = {
  draft:     { mn: 'Ноорог',            en: 'Draft' },
  published: { mn: 'Нийтлэгдсэн',       en: 'Published' },
  ongoing:   { mn: 'Явагдаж байгаа',    en: 'Ongoing' },
  completed: { mn: 'Дууссан',            en: 'Completed' },
  cancelled: { mn: 'Цуцлагдсан',        en: 'Cancelled' },
};

const STATUS_COLORS: Record<EventStatus, string> = {
  draft:     'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  published: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  ongoing:   'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  completed: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
};

type FilterTab = 'all' | EventStatus;

const FILTER_TABS: { value: FilterTab; mn: string; en: string }[] = [
  { value: 'all',       mn: 'Бүгд',             en: 'All' },
  { value: 'draft',     mn: 'Ноорог',            en: 'Draft' },
  { value: 'published', mn: 'Нийтлэгдсэн',       en: 'Published' },
  { value: 'ongoing',   mn: 'Явагдаж байгаа',    en: 'Ongoing' },
  { value: 'completed', mn: 'Дууссан',            en: 'Completed' },
  { value: 'cancelled', mn: 'Цуцлагдсан',        en: 'Cancelled' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export const AdminEventsPage = () => {
  const { t, language: lang } = useI18n();
  const navigate = useNavigate();
  const { counts: regCounts } = useEventRegistrationCounts();
  const [items, setItems] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const load = async () => {
    setLoading(true);
    const data = await eventService.getAll();
    setItems(data as EventRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t({ mn: 'Устгах уу?', en: 'Delete this event?' }))) return;
    await eventService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = activeTab === 'all' ? items : items.filter((i) => i.status === activeTab);

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-sdy-black dark:text-white tracking-tight">
              {t({ mn: 'Арга хэмжээ', en: 'Events' })}
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {t({ mn: `Нийт ${items.length} арга хэмжээ`, en: `${items.length} events total` })}
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
              onClick={() => navigate(`/${lang}/admin/events/new`)}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              <Plus size={15} />
              {t({ mn: 'Нэмэх', en: 'Add' })}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mb-5 flex-wrap">
          {FILTER_TABS.map((tab) => {
            const count = tab.value === 'all' ? items.length : items.filter((i) => i.status === tab.value).length;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-sdy-black dark:bg-white text-white dark:text-sdy-black'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {t({ mn: tab.mn, en: tab.en })}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-white/20 dark:bg-black/20'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Зураг', en: 'Image' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Гарчиг', en: 'Title' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Огноо', en: 'Date' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Төлөв', en: 'Status' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Бүртгэл', en: 'Reg.' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="w-14 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-32 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-24 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-20 h-5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-12 h-5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-16 h-6 bg-gray-100 dark:bg-gray-800 rounded ml-auto animate-pulse" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <CalendarDays size={24} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        {t({ mn: 'Арга хэмжээ байхгүй байна', en: 'No events yet' })}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
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
                            <CalendarDays size={13} className="text-gray-300 dark:text-gray-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sdy-black dark:text-white text-sm max-w-[220px] truncate">{item.title_mn}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(item.date_start)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${STATUS_COLORS[item.status] ?? STATUS_COLORS.draft}`}>
                          {t(STATUS_LABELS[item.status] ?? STATUS_LABELS.draft)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                          {regCounts[item.id] ?? 0}{item.max_participants ? ` / ${item.max_participants}` : ''}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/${lang}/admin/events/${item.id}`)}
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
