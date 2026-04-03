import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Plus, Pencil, Trash2, RefreshCw, X } from 'lucide-react';
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
};

const EMPTY_HIGHLIGHT: HighlightRow = { text_mn: '', text_en: '', sort_order: 0 };

export const AdminProgramsPage = () => {
  const { t } = useI18n();
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
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
              <BookOpen size={16} />
              {t({ mn: 'Хөтөлбөр', en: 'Programs' })}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-sdy-black leading-tight tracking-tighter">
              {t({ mn: 'Хөтөлбөр ', en: 'Programs' })}
              <span className="text-sdy-red">{t({ mn: 'удирдлага.', en: '.' })}</span>
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
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Багана', en: 'Pillar' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Төлөв', en: 'Status' })}</th>
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
                      {t({ mn: 'Хөтөлбөр байхгүй байна', en: 'No programs yet' })}
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
                            <BookOpen size={14} className="text-gray-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-black text-sdy-black max-w-[250px] truncate">{item.title_mn}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500">
                          {item.pillar_mn}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-sdy-red/10 text-sdy-red">
                          {item.status_mn}
                        </span>
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
          title={t({ mn: editingId ? 'Засах' : 'Нэмэх', en: editingId ? 'Edit Program' : 'Add Program' })}
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
          <ImageUpload
            label={t({ mn: 'Зураг', en: 'Image' })}
            value={form.image}
            onChange={(file) => setImageFile(file)}
          />

          {/* Highlights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-sdy-black uppercase tracking-widest">
                {t({ mn: 'Онцлох', en: 'Highlights' })}
              </label>
              <button
                type="button"
                onClick={addHighlight}
                className="flex items-center gap-1 text-xs font-black text-sdy-red hover:text-sdy-red/70 uppercase tracking-widest transition-colors"
              >
                <Plus size={14} />
                {t({ mn: 'Нэмэх', en: 'Add' })}
              </button>
            </div>
            {highlights.length === 0 && (
              <p className="text-xs text-gray-300 font-bold">
                {t({ mn: 'Онцлох зүйл нэмээгүй байна', en: 'No highlights added' })}
              </p>
            )}
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
                  className="mt-7 p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-all shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </AdminModal>
      </div>
    </div>
  );
};
