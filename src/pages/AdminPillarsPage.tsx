import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Columns3, Plus, Pencil, Trash2 } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { pillarService } from '../services/pillarService';
import { AdminModal } from '../components/admin/AdminModal';
import { BilingualInput } from '../components/admin/BilingualInput';
import { BilingualTextarea } from '../components/admin/BilingualTextarea';

interface PillarRow {
  id: string;
  title_mn: string;
  title_en: string;
  description_mn: string;
  description_en: string;
  icon_name: string;
  href: string;
  image: string;
  sort_order: number;
}

const EMPTY_FORM = {
  title_mn: '', title_en: '',
  description_mn: '', description_en: '',
  icon_name: '', href: '', image: '', sort_order: 0,
};

export const AdminPillarsPage = () => {
  const { t } = useI18n();
  const [items, setItems] = useState<PillarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    const data = await pillarService.getAll();
    setItems(data as PillarRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (row: PillarRow) => {
    setEditId(row.id);
    setForm({
      title_mn: row.title_mn,
      title_en: row.title_en,
      description_mn: row.description_mn,
      description_en: row.description_en,
      icon_name: row.icon_name,
      href: row.href,
      image: row.image ?? '',
      sort_order: row.sort_order,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title_mn: form.title_mn,
      title_en: form.title_en,
      description_mn: form.description_mn,
      description_en: form.description_en,
      icon_name: form.icon_name,
      href: form.href,
      image: form.image,
      sort_order: form.sort_order,
    };

    const ok = editId !== null
      ? await pillarService.update(editId, payload)
      : await pillarService.create(payload);

    if (ok) {
      setModalOpen(false);
      await load();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t({ mn: 'Устгах уу?', en: 'Delete this item?' }))) return;
    await pillarService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
              <Columns3 size={16} />
              {t({ mn: 'Тулгуур багана', en: 'Pillars' })}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-sdy-black leading-tight tracking-tighter">
              {t({ mn: 'Тулгуур баганын ', en: 'Pillars' })}
              <span className="text-sdy-red">{t({ mn: 'удирдлага.', en: 'management.' })}</span>
            </h1>
          </div>
          <button onClick={openCreate} className="btn-primary px-6 py-3 flex items-center gap-2">
            <Plus size={18} />
            {t({ mn: 'Нэмэх', en: 'Add New' })}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[3rem] overflow-hidden card-shadow border-2 border-gray-50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Гарчиг (MN)', en: 'Title (MN)' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Айкон', en: 'Icon' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Холбоос', en: 'Href' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Эрэмбэ', en: 'Sort' })}</th>
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
                      {t({ mn: 'Тулгуур багана байхгүй байна', en: 'No pillars yet' })}
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="font-black text-sdy-black">{row.title_mn}</div>
                        <div className="text-xs font-bold text-gray-400">{row.title_en}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500">
                          {row.icon_name}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-gray-500 font-mono">{row.href}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-gray-400 tabular-nums">{row.sort_order}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(row)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
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
          title={t({ mn: editId !== null ? 'Багана засах' : 'Багана нэмэх', en: editId !== null ? 'Edit Pillar' : 'Add Pillar' })}
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
          <BilingualTextarea
            label={t({ mn: 'Тайлбар', en: 'Description' })}
            valueMn={form.description_mn}
            valueEn={form.description_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, description_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, description_en: v }))}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-sdy-black uppercase tracking-widest">
                {t({ mn: 'Айкон нэр', en: 'Icon Name' })}
              </label>
              <input
                type="text"
                className="w-full px-3 py-3 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold text-sm"
                value={form.icon_name}
                onChange={(e) => setForm((f) => ({ ...f, icon_name: e.target.value }))}
                placeholder="e.g. Shield, Heart, Globe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-sdy-black uppercase tracking-widest">
                {t({ mn: 'Холбоос', en: 'Href' })}
              </label>
              <input
                type="text"
                className="w-full px-3 py-3 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold text-sm"
                value={form.href}
                onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
                placeholder="e.g. /ideology"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-sdy-black uppercase tracking-widest">
              {t({ mn: 'Зураг URL', en: 'Image URL' })}
            </label>
            <input
              type="text"
              className="w-full px-3 py-3 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold text-sm"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-sdy-black uppercase tracking-widest">
              {t({ mn: 'Эрэмбэ', en: 'Sort Order' })}
            </label>
            <input
              type="number"
              className="w-full px-3 py-3 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold text-sm"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
            />
          </div>
        </AdminModal>
      </div>
    </div>
  );
};
