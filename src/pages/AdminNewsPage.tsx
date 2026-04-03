import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Newspaper, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { newsService } from '../services/newsService';
import { storageService } from '../services/storageService';
import { AdminModal } from '../components/admin/AdminModal';
import { BilingualInput } from '../components/admin/BilingualInput';
import { BilingualTextarea } from '../components/admin/BilingualTextarea';
import { ImageUpload } from '../components/admin/ImageUpload';

interface NewsRow {
  id: string;
  title_mn: string;
  title_en: string;
  category_mn: string;
  category_en: string;
  date_mn: string;
  date_en: string;
  image: string | null;
  excerpt_mn: string;
  excerpt_en: string;
  content_mn: string;
  content_en: string;
}

const EMPTY_FORM = {
  title_mn: '',
  title_en: '',
  category_mn: '',
  category_en: '',
  date_mn: '',
  date_en: '',
  image: null as string | null,
  excerpt_mn: '',
  excerpt_en: '',
  content_mn: '',
  content_en: '',
};

export const AdminNewsPage = () => {
  const { t } = useI18n();
  const [items, setItems] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await newsService.getAll();
    setItems(data as NewsRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (item: NewsRow) => {
    setEditingId(item.id);
    setForm({
      title_mn: item.title_mn,
      title_en: item.title_en,
      category_mn: item.category_mn ?? '',
      category_en: item.category_en ?? '',
      date_mn: item.date_mn ?? '',
      date_en: item.date_en ?? '',
      image: item.image,
      excerpt_mn: item.excerpt_mn ?? '',
      excerpt_en: item.excerpt_en ?? '',
      content_mn: item.content_mn ?? '',
      content_en: item.content_en ?? '',
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);

    const id = editingId ?? crypto.randomUUID();
    let imageUrl = form.image;

    if (imageFile) {
      const ext = imageFile.name.split('.').pop() ?? 'jpg';
      const uploaded = await storageService.upload('images', imageFile, 'news/' + id + '.' + ext);
      if (uploaded) imageUrl = uploaded;
    }

    const payload = {
      title_mn: form.title_mn,
      title_en: form.title_en,
      category_mn: form.category_mn,
      category_en: form.category_en,
      date_mn: form.date_mn,
      date_en: form.date_en,
      image: imageUrl,
      excerpt_mn: form.excerpt_mn,
      excerpt_en: form.excerpt_en,
      content_mn: form.content_mn,
      content_en: form.content_en,
    };

    const success = editingId
      ? await newsService.update(editingId, payload)
      : await newsService.create({ id, ...payload });

    if (success) {
      setModalOpen(false);
      await load();
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t({ mn: 'Устгах уу?', en: 'Delete this news item?' }))) return;
    await newsService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
              <Newspaper size={16} />
              {t({ mn: 'Мэдээ', en: 'News' })}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-sdy-black leading-tight tracking-tighter">
              {t({ mn: 'Мэдээ ', en: 'News' })}
              <span className="text-sdy-red">{t({ mn: 'мэдээлэл.', en: '.' })}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-sdy-red transition-colors uppercase tracking-widest"
            >
              <RefreshCw size={14} />
              {t({ mn: 'Шинэчлэх', en: 'Refresh' })}
            </button>
            <button
              onClick={openCreate}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <Plus size={16} />
              {t({ mn: 'Нэмэх', en: 'Add' })}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[3rem] overflow-hidden card-shadow border-2 border-gray-50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Зураг', en: 'Image' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Гарчиг', en: 'Title' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Ангилал', en: 'Category' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Огноо', en: 'Date' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest text-right">{t({ mn: 'Үйлдэл', en: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-50">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-12 bg-white" />
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-300 font-black uppercase tracking-widest text-sm">
                      {t({ mn: 'Мэдээ байхгүй байна', en: 'No news yet' })}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-16 h-10 rounded-lg object-cover border-2 border-gray-100" />
                        ) : (
                          <div className="w-16 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Newspaper size={14} className="text-gray-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-black text-sdy-black max-w-[250px] truncate">{item.title_mn}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500">
                          {item.category_mn}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-bold text-gray-400 whitespace-nowrap">{item.date_mn}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
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

        {/* Modal */}
        <AdminModal
          open={modalOpen}
          title={t({ mn: editingId ? 'Засах' : 'Нэмэх', en: editingId ? 'Edit News' : 'Add News' })}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          saving={saving}
        >
          <BilingualInput
            label={t({ mn: 'Гарчиг', en: 'Title' })}
            valueMn={form.title_mn}
            valueEn={form.title_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, title_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, title_en: v }))}
            required
          />
          <BilingualInput
            label={t({ mn: 'Ангилал', en: 'Category' })}
            valueMn={form.category_mn}
            valueEn={form.category_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, category_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, category_en: v }))}
          />
          <BilingualInput
            label={t({ mn: 'Огноо', en: 'Date' })}
            valueMn={form.date_mn}
            valueEn={form.date_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, date_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, date_en: v }))}
            placeholderMn="2025.11.15"
            placeholderEn="Nov 15, 2025"
          />
          <BilingualTextarea
            label={t({ mn: 'Товч', en: 'Excerpt' })}
            valueMn={form.excerpt_mn}
            valueEn={form.excerpt_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, excerpt_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, excerpt_en: v }))}
            rows={3}
          />
          <BilingualTextarea
            label={t({ mn: 'Агуулга', en: 'Content' })}
            valueMn={form.content_mn}
            valueEn={form.content_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, content_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, content_en: v }))}
            rows={8}
          />
          <ImageUpload
            label={t({ mn: 'Зураг', en: 'Image' })}
            value={form.image}
            onChange={(file) => setImageFile(file)}
          />
        </AdminModal>
      </div>
    </div>
  );
};
