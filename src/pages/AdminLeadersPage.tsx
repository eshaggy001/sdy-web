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
              onClick={openCreate}
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
                            onClick={() => openEdit(item)}
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

        {/* Modal */}
        <AdminModal
          open={modalOpen}
          title={t({ mn: editingId ? 'Удирдлага засах' : 'Удирдлага нэмэх', en: editingId ? 'Edit Leader' : 'Add Leader' })}
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
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {t({ mn: 'Эрэмбэ', en: 'Sort Order' })}
            </label>
            <input
              type="number"
              className="input input-sm"
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
