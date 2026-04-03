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

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (row: PillarRow) => {
    setEditId(row.id);
    setForm({ title_mn: row.title_mn, title_en: row.title_en, description_mn: row.description_mn, description_en: row.description_en, icon_name: row.icon_name, href: row.href, image: row.image ?? '', sort_order: row.sort_order });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { title_mn: form.title_mn, title_en: form.title_en, description_mn: form.description_mn, description_en: form.description_en, icon_name: form.icon_name, href: form.href, image: form.image, sort_order: form.sort_order };
    const ok = editId !== null ? await pillarService.update(editId, payload) : await pillarService.create(payload);
    if (ok) { setModalOpen(false); await load(); }
    setSaving(false);
  };

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
            <h1 className="text-2xl font-bold text-sdy-black tracking-tight">
              {t({ mn: 'Тулгуур багана', en: 'Pillars' })}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {t({ mn: `Нийт ${items.length} багана`, en: `${items.length} pillars total` })}
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            <Plus size={15} />
            {t({ mn: 'Нэмэх', en: 'Add' })}
          </button>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Гарчиг', en: 'Title' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Айкон', en: 'Icon' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Холбоос', en: 'Href' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Эрэмбэ', en: 'Sort' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="w-28 h-4 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-14 h-5 bg-gray-100 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-20 h-4 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-6 h-4 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-16 h-6 bg-gray-100 rounded ml-auto animate-pulse" /></td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <Columns3 size={24} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400">{t({ mn: 'Тулгуур багана байхгүй байна', en: 'No pillars yet' })}</p>
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <motion.tr key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sdy-black text-sm">{row.title_mn}</div>
                        <div className="text-xs text-gray-400">{row.title_en}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">{row.icon_name}</span>
                      </td>
                      <td className="px-5 py-3.5"><div className="text-sm text-gray-500 font-mono">{row.href}</div></td>
                      <td className="px-5 py-3.5"><div className="text-sm text-gray-400 tabular-nums">{row.sort_order}</div></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEdit(row)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit"><Pencil size={15} /></button>
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

        <AdminModal
          open={modalOpen}
          title={t({ mn: editId !== null ? 'Багана засах' : 'Багана нэмэх', en: editId !== null ? 'Edit Pillar' : 'Add Pillar' })}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          saving={saving}
        >
          <BilingualInput label={t({ mn: 'Гарчиг', en: 'Title' })} valueMn={form.title_mn} valueEn={form.title_en} onChangeMn={(v) => setForm((f) => ({ ...f, title_mn: v }))} onChangeEn={(v) => setForm((f) => ({ ...f, title_en: v }))} required />
          <BilingualTextarea label={t({ mn: 'Тайлбар', en: 'Description' })} valueMn={form.description_mn} valueEn={form.description_en} onChangeMn={(v) => setForm((f) => ({ ...f, description_mn: v }))} onChangeEn={(v) => setForm((f) => ({ ...f, description_en: v }))} required />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t({ mn: 'Айкон нэр', en: 'Icon Name' })}</label>
              <input type="text" className="input input-sm" value={form.icon_name} onChange={(e) => setForm((f) => ({ ...f, icon_name: e.target.value }))} placeholder="e.g. Shield, Heart" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t({ mn: 'Холбоос', en: 'Href' })}</label>
              <input type="text" className="input input-sm" value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))} placeholder="e.g. /ideology" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t({ mn: 'Зураг URL', en: 'Image URL' })}</label>
            <input type="text" className="input input-sm" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://example.com/image.jpg" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t({ mn: 'Эрэмбэ', en: 'Sort Order' })}</label>
            <input type="number" className="input input-sm" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
          </div>
        </AdminModal>
      </div>
    </div>
  );
};
