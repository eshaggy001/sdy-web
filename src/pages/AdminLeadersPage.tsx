import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, Pencil, Trash2, RefreshCw, GripVertical } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { leaderService } from '../services/leaderService';
import { storageService } from '../services/storageService';
import { AdminModal } from '../components/admin/AdminModal';
import { BilingualInput } from '../components/admin/BilingualInput';
import { BilingualTextarea } from '../components/admin/BilingualTextarea';
import { ImageUpload } from '../components/admin/ImageUpload';

interface LeaderRow {
  id: string;
  name_mn: string;
  name_en: string;
  role_mn: string;
  role_en: string;
  bio_mn: string;
  bio_en: string;
  image: string | null;
  sort_order: number;
}

const EMPTY_FORM = {
  name_mn: '',
  name_en: '',
  role_mn: '',
  role_en: '',
  bio_mn: '',
  bio_en: '',
  image: null as string | null,
  sort_order: 0,
};

export const AdminLeadersPage = () => {
  const { t } = useI18n();
  const [items, setItems] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await leaderService.getAll();
    setItems(data as LeaderRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (item: LeaderRow) => {
    setEditingId(item.id);
    setForm({
      name_mn: item.name_mn,
      name_en: item.name_en,
      role_mn: item.role_mn,
      role_en: item.role_en,
      bio_mn: item.bio_mn ?? '',
      bio_en: item.bio_en ?? '',
      image: item.image,
      sort_order: item.sort_order ?? 0,
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
      const uploaded = await storageService.upload('images', imageFile, 'leaders/' + id + '.' + ext);
      if (uploaded) imageUrl = uploaded;
    }

    const payload = {
      name_mn: form.name_mn,
      name_en: form.name_en,
      role_mn: form.role_mn,
      role_en: form.role_en,
      bio_mn: form.bio_mn,
      bio_en: form.bio_en,
      image: imageUrl,
      sort_order: form.sort_order,
    };

    const success = editingId
      ? await leaderService.update(editingId, payload)
      : await leaderService.create({ id, ...payload });

    if (success) {
      setModalOpen(false);
      await load();
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t({ mn: 'Устгах уу?', en: 'Delete this leader?' }))) return;
    await leaderService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
              <Users size={16} />
              {t({ mn: 'Удирдлага', en: 'Leaders' })}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-sdy-black leading-tight tracking-tighter">
              {t({ mn: 'Удирдах ', en: 'Leadership' })}
              <span className="text-sdy-red">{t({ mn: 'зөвлөл.', en: '.' })}</span>
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
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Нэр', en: 'Name' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Албан тушаал', en: 'Role' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">
                    <GripVertical size={14} className="inline -mt-0.5" /> {t({ mn: 'Эрэмбэ', en: 'Sort' })}
                  </th>
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
                      {t({ mn: 'Удирдлага байхгүй байна', en: 'No leaders yet' })}
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
                          <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover border-2 border-gray-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Users size={16} className="text-gray-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-black text-sdy-black">{item.name_mn}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-gray-600">{item.role_mn}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-gray-400 tabular-nums">{item.sort_order}</span>
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
          title={t({ mn: editingId ? 'Засах' : 'Нэмэх', en: editingId ? 'Edit Leader' : 'Add Leader' })}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          saving={saving}
        >
          <BilingualInput
            label={t({ mn: 'Нэр', en: 'Name' })}
            valueMn={form.name_mn}
            valueEn={form.name_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, name_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, name_en: v }))}
            required
          />
          <BilingualInput
            label={t({ mn: 'Албан тушаал', en: 'Role' })}
            valueMn={form.role_mn}
            valueEn={form.role_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, role_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, role_en: v }))}
            required
          />
          <BilingualTextarea
            label={t({ mn: 'Танилцуулга', en: 'Bio' })}
            valueMn={form.bio_mn}
            valueEn={form.bio_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, bio_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, bio_en: v }))}
          />
          <ImageUpload
            label={t({ mn: 'Зураг', en: 'Image' })}
            value={form.image}
            onChange={(file) => setImageFile(file)}
          />
          <div className="space-y-2">
            <label className="text-xs font-black text-sdy-black uppercase tracking-widest">
              {t({ mn: 'Эрэмбэ', en: 'Sort Order' })}
            </label>
            <input
              type="number"
              className="w-full px-3 py-3 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold text-sm"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
              min={0}
            />
          </div>
        </AdminModal>
      </div>
    </div>
  );
};
