import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Plus, Pencil, Trash2, RefreshCw, X } from 'lucide-react';
import { useRegistrationCounts } from '../hooks/useRegistrations';
import { useI18n } from '../contexts/I18nContext';
import { programService } from '../services/programService';
import { storageService } from '../services/storageService';
import { AdminModal } from '../components/admin/AdminModal';
import { BilingualInput } from '../components/admin/BilingualInput';
import { BilingualTextarea } from '../components/admin/BilingualTextarea';
import { ImageUpload } from '../components/admin/ImageUpload';

interface HighlightRow {
  text_mn: string;
  text_en: string;
  sort_order: number;
}

interface ProgramRow {
  id: string;
  title_mn: string;
  title_en: string;
  pillar_mn: string;
  pillar_en: string;
  status_mn: string;
  status_en: string;
  description_mn: string;
  description_en: string;
  image: string | null;
  date_mn: string;
  date_en: string;
  location_mn: string;
  location_en: string;
  capacity_mn: string;
  capacity_en: string;
  deadline_mn: string;
  deadline_en: string;
  content_mn: string;
  content_en: string;
  max_participants: number | null;
  registration_open: boolean;
  program_highlights: HighlightRow[];
}

const EMPTY_FORM = {
  title_mn: '',
  title_en: '',
  pillar_mn: '',
  pillar_en: '',
  status_mn: '',
  status_en: '',
  description_mn: '',
  description_en: '',
  image: null as string | null,
  date_mn: '',
  date_en: '',
  location_mn: '',
  location_en: '',
  capacity_mn: '',
  capacity_en: '',
  deadline_mn: '',
  deadline_en: '',
  content_mn: '',
  content_en: '',
  max_participants: '',
  registration_open: false,
};

const EMPTY_HIGHLIGHT: HighlightRow = { text_mn: '', text_en: '', sort_order: 0 };

export const AdminProgramsPage = () => {
  const { t } = useI18n();
  const { counts: regCounts } = useRegistrationCounts();
  const [items, setItems] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [highlights, setHighlights] = useState<HighlightRow[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await programService.getAll();
    setItems(data as ProgramRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setHighlights([]);
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (item: ProgramRow) => {
    setEditingId(item.id);
    setForm({
      title_mn: item.title_mn,
      title_en: item.title_en,
      pillar_mn: item.pillar_mn ?? '',
      pillar_en: item.pillar_en ?? '',
      status_mn: item.status_mn ?? '',
      status_en: item.status_en ?? '',
      description_mn: item.description_mn ?? '',
      description_en: item.description_en ?? '',
      image: item.image,
      date_mn: item.date_mn ?? '',
      date_en: item.date_en ?? '',
      location_mn: item.location_mn ?? '',
      location_en: item.location_en ?? '',
      capacity_mn: item.capacity_mn ?? '',
      capacity_en: item.capacity_en ?? '',
      deadline_mn: item.deadline_mn ?? '',
      deadline_en: item.deadline_en ?? '',
      content_mn: item.content_mn ?? '',
      content_en: item.content_en ?? '',
      max_participants: item.max_participants != null ? String(item.max_participants) : '',
      registration_open: item.registration_open ?? false,
    });
    setHighlights(
      (item.program_highlights ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((h) => ({ text_mn: h.text_mn, text_en: h.text_en, sort_order: h.sort_order }))
    );
    setImageFile(null);
    setModalOpen(true);
  };

  const addHighlight = () => {
    setHighlights((prev) => [...prev, { ...EMPTY_HIGHLIGHT, sort_order: prev.length }]);
  };

  const removeHighlight = (index: number) => {
    setHighlights((prev) =>
      prev.filter((_, i) => i !== index).map((h, i) => ({ ...h, sort_order: i }))
    );
  };

  const updateHighlight = (index: number, field: 'text_mn' | 'text_en', value: string) => {
    setHighlights((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
  };

  const handleSave = async () => {
    setSaving(true);

    const id = editingId ?? crypto.randomUUID();
    let imageUrl = form.image;

    if (imageFile) {
      const ext = imageFile.name.split('.').pop() ?? 'jpg';
      const uploaded = await storageService.upload('images', imageFile, 'programs/' + id + '.' + ext);
      if (uploaded) imageUrl = uploaded;
    }

    const payload = {
      title_mn: form.title_mn,
      title_en: form.title_en,
      pillar_mn: form.pillar_mn,
      pillar_en: form.pillar_en,
      status_mn: form.status_mn,
      status_en: form.status_en,
      description_mn: form.description_mn,
      description_en: form.description_en,
      image: imageUrl,
      date_mn: form.date_mn,
      date_en: form.date_en,
      location_mn: form.location_mn,
      location_en: form.location_en,
      capacity_mn: form.capacity_mn,
      capacity_en: form.capacity_en,
      deadline_mn: form.deadline_mn,
      deadline_en: form.deadline_en,
      content_mn: form.content_mn,
      content_en: form.content_en,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      registration_open: form.registration_open,
    };

    const highlightPayload = highlights.map((h, i) => ({
      text_mn: h.text_mn,
      text_en: h.text_en,
      sort_order: i,
    }));

    const success = editingId
      ? await programService.update(editingId, payload, highlightPayload)
      : await programService.create({ id, ...payload }, highlightPayload);

    if (success) {
      setModalOpen(false);
      await load();
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t({ mn: 'Устгах уу?', en: 'Delete this program?' }))) return;
    await programService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-sdy-black tracking-tight">
              {t({ mn: 'Хөтөлбөрүүд', en: 'Programs' })}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {t({ mn: `Нийт ${items.length} хөтөлбөр`, en: `${items.length} programs total` })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
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
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Зураг', en: 'Image' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Гарчиг', en: 'Title' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Багана', en: 'Pillar' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Төлөв', en: 'Status' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Бүртгэл', en: 'Reg.' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="w-14 h-9 bg-gray-100 rounded-lg animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-32 h-4 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-16 h-5 bg-gray-100 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-14 h-5 bg-gray-100 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-12 h-5 bg-gray-100 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-16 h-6 bg-gray-100 rounded ml-auto animate-pulse" /></td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <BookOpen size={24} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400">
                        {t({ mn: 'Хөтөлбөр байхгүй байна', en: 'No programs yet' })}
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-14 h-9 rounded-lg object-cover border border-gray-100" />
                        ) : (
                          <div className="w-14 h-9 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                            <BookOpen size={13} className="text-gray-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sdy-black text-sm max-w-[220px] truncate">{item.title_mn}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
                          {item.pillar_mn}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-sdy-red/8 text-sdy-red">
                          {item.status_mn}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {item.registration_open ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                            {regCounts[item.id] ?? 0}{item.max_participants ? ` / ${item.max_participants}` : ''}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-400">
                            {t({ mn: 'Хаалттай', en: 'Closed' })}
                          </span>
                        )}
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
          title={t({ mn: editingId ? 'Хөтөлбөр засах' : 'Хөтөлбөр нэмэх', en: editingId ? 'Edit Program' : 'Add Program' })}
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
            label={t({ mn: 'Багана', en: 'Pillar' })}
            valueMn={form.pillar_mn}
            valueEn={form.pillar_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, pillar_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, pillar_en: v }))}
            required
          />
          <BilingualInput
            label={t({ mn: 'Төлөв', en: 'Status' })}
            valueMn={form.status_mn}
            valueEn={form.status_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, status_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, status_en: v }))}
            required
          />
          <BilingualTextarea
            label={t({ mn: 'Тайлбар', en: 'Description' })}
            valueMn={form.description_mn}
            valueEn={form.description_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, description_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, description_en: v }))}
            rows={3}
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
          <BilingualInput
            label={t({ mn: 'Байршил', en: 'Location' })}
            valueMn={form.location_mn}
            valueEn={form.location_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, location_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, location_en: v }))}
          />
          <BilingualInput
            label={t({ mn: 'Багтаамж', en: 'Capacity' })}
            valueMn={form.capacity_mn}
            valueEn={form.capacity_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, capacity_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, capacity_en: v }))}
          />
          <BilingualInput
            label={t({ mn: 'Эцсийн хугацаа', en: 'Deadline' })}
            valueMn={form.deadline_mn}
            valueEn={form.deadline_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, deadline_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, deadline_en: v }))}
          />
          <BilingualTextarea
            label={t({ mn: 'Агуулга', en: 'Content' })}
            valueMn={form.content_mn}
            valueEn={form.content_en}
            onChangeMn={(v) => setForm((f) => ({ ...f, content_mn: v }))}
            onChangeEn={(v) => setForm((f) => ({ ...f, content_en: v }))}
            rows={8}
          />
          {/* Registration settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {t({ mn: 'Дээд оролцогчид', en: 'Max Participants' })}
              </label>
              <input
                type="number"
                min={0}
                value={form.max_participants}
                onChange={(e) => setForm((f) => ({ ...f, max_participants: e.target.value }))}
                placeholder={t({ mn: 'Хязгааргүй', en: 'Unlimited' })}
                className="input input-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {t({ mn: 'Бүртгэл нээлттэй', en: 'Registration Open' })}
              </label>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, registration_open: !f.registration_open }))}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                  form.registration_open
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}
              >
                {form.registration_open
                  ? t({ mn: 'Нээлттэй', en: 'Open' })
                  : t({ mn: 'Хаалттай', en: 'Closed' })}
              </button>
            </div>
          </div>

          <ImageUpload
            label={t({ mn: 'Зураг', en: 'Image' })}
            value={form.image}
            onChange={(file) => setImageFile(file)}
          />

          {/* Highlights */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t({ mn: 'Онцлох', en: 'Highlights' })}
              </label>
              <button
                type="button"
                onClick={addHighlight}
                className="flex items-center gap-1 text-xs font-semibold text-sdy-red hover:text-sdy-red/70 transition-colors"
              >
                <Plus size={13} />
                {t({ mn: 'Нэмэх', en: 'Add' })}
              </button>
            </div>
            {highlights.length === 0 && (
              <p className="text-xs text-gray-300">
                {t({ mn: 'Онцлох зүйл нэмээгүй байна', en: 'No highlights added' })}
              </p>
            )}
            <div className="space-y-2">
              {highlights.map((hl, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-grow">
                    <BilingualInput
                      label={`#${index + 1}`}
                      valueMn={hl.text_mn}
                      valueEn={hl.text_en}
                      onChangeMn={(v) => updateHighlight(index, 'text_mn', v)}
                      onChangeEn={(v) => updateHighlight(index, 'text_en', v)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="mt-7 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </AdminModal>
      </div>
    </div>
  );
};
