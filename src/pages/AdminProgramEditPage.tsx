import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, X, MapPin, CalendarDays, Users as UsersIcon, Clock, ClipboardList } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { programService } from '../services/programService';
import { pillarService } from '../services/pillarService';
import { registrationService } from '../services/registrationService';
import { storageService } from '../services/storageService';
import { useProgramRegistrations } from '../hooks/useRegistrations';
import { ImageUpload } from '../components/admin/ImageUpload';
import { RegistrationsPanel } from '../components/admin/RegistrationsPanel';
import {
  AdminEditLayout, SectionCard, LangDivider, FieldLabel,
  fieldClass, textareaClass,
} from '../components/admin/AdminEditLayout';

interface HighlightRow {
  text_mn: string;
  text_en: string;
  sort_order: number;
}

interface PillarOption {
  id: string;
  title_mn: string;
  title_en: string;
}

const STATUS_OPTIONS = [
  { value: 'active',    mn: 'Идэвхтэй',        en: 'Active' },
  { value: 'upcoming',  mn: 'Удахгүй',          en: 'Upcoming' },
  { value: 'completed', mn: 'Дууссан',           en: 'Completed' },
  { value: 'draft',     mn: 'Ноорог',            en: 'Draft' },
  { value: 'cancelled', mn: 'Цуцлагдсан',        en: 'Cancelled' },
];

const formatDateMn = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const formatDateEn = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const toInputDate = (mnOrEn: string) => {
  if (!mnOrEn) return '';
  // Try parsing YYYY.MM.DD format
  const dotMatch = mnOrEn.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
  if (dotMatch) return `${dotMatch[1]}-${dotMatch[2]}-${dotMatch[3]}`;
  // Try parsing any date string
  try {
    const d = new Date(mnOrEn);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch { /* ignore */ }
  return '';
};

const EMPTY_FORM = {
  title_mn: '', title_en: '',
  pillar_mn: '', pillar_en: '',
  status_mn: '', status_en: '',
  description_mn: '', description_en: '',
  image: null as string | null,
  date_mn: '', date_en: '',
  location_mn: '', location_en: '',
  capacity_mn: '', capacity_en: '',
  deadline_mn: '', deadline_en: '',
  content_mn: '', content_en: '',
  max_participants: '',
  registration_open: false,
};

export const AdminProgramEditPage = () => {
  const { lang, id } = useParams();
  const { t } = useI18n();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [highlights, setHighlights] = useState<HighlightRow[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'registrations'>('details');
  const [pillars, setPillars] = useState<PillarOption[]>([]);
  const [newPillarMn, setNewPillarMn] = useState('');
  const [newPillarEn, setNewPillarEn] = useState('');
  const [showNewPillar, setShowNewPillar] = useState(false);
  const { data: registrations, loading: regsLoading, refresh: refreshRegs } = useProgramRegistrations(isNew ? undefined : id);

  const set = useCallback(<K extends keyof typeof EMPTY_FORM>(key: K, val: (typeof EMPTY_FORM)[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setDirty(true);
  }, []);

  // Load pillars from DB
  useEffect(() => {
    (async () => {
      const data = await pillarService.getAll();
      setPillars(data as PillarOption[]);
    })();
  }, []);

  const handleAddPillar = async () => {
    if (!newPillarMn.trim() || !newPillarEn.trim()) return;
    const ok = await pillarService.create({ title_mn: newPillarMn.trim(), title_en: newPillarEn.trim(), sort_order: pillars.length });
    if (ok) {
      const data = await pillarService.getAll();
      setPillars(data as PillarOption[]);
      set('pillar_mn', newPillarMn.trim());
      set('pillar_en', newPillarEn.trim());
      setNewPillarMn('');
      setNewPillarEn('');
      setShowNewPillar(false);
    }
  };

  // Reset UI state when switching between items
  useEffect(() => {
    setDirty(false);
    setActiveTab('details');
    setImageFile(null);
    setForm(EMPTY_FORM);
    setHighlights([]);
    setShowNewPillar(false);
  }, [id]);

  useEffect(() => {
    if (!isNew && id) {
      (async () => {
        const items = await programService.getAll();
        const item = items.find((i: any) => i.id === id);
        if (item) {
          setForm({
            title_mn: item.title_mn, title_en: item.title_en,
            pillar_mn: item.pillar_mn ?? '', pillar_en: item.pillar_en ?? '',
            status_mn: STATUS_OPTIONS.find(o => o.mn === item.status_mn || o.en === item.status_en)?.value ?? item.status_mn ?? '',
            status_en: '',
            description_mn: item.description_mn ?? '', description_en: item.description_en ?? '',
            image: item.image,
            date_mn: toInputDate(item.date_mn ?? ''), date_en: '',
            location_mn: item.location_mn ?? '', location_en: item.location_en ?? '',
            capacity_mn: item.capacity_mn ?? '', capacity_en: '',
            deadline_mn: toInputDate(item.deadline_mn ?? ''), deadline_en: '',
            content_mn: item.content_mn ?? '', content_en: item.content_en ?? '',
            max_participants: item.max_participants != null ? String(item.max_participants) : '',
            registration_open: item.registration_open ?? false,
          });
          setHighlights(
            (item.program_highlights ?? [])
              .sort((a: any, b: any) => a.sort_order - b.sort_order)
              .map((h: any) => ({ text_mn: h.text_mn, text_en: h.text_en, sort_order: h.sort_order }))
          );
        }
        setLoading(false);
      })();
    }
  }, [id, isNew]);

  const addHighlight = () => {
    setHighlights((prev) => [...prev, { text_mn: '', text_en: '', sort_order: prev.length }]);
    setDirty(true);
  };
  const removeHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index).map((h, i) => ({ ...h, sort_order: i })));
    setDirty(true);
  };
  const updateHighlight = (index: number, field: 'text_mn' | 'text_en', value: string) => {
    setHighlights((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
    setDirty(true);
  };

  const handleRegStatusUpdate = async (regId: string, status: 'approved' | 'rejected') => {
    const ok = await registrationService.updateStatus(regId, status);
    if (ok) refreshRegs();
  };

  const handleRegDelete = async (regId: string) => {
    const ok = await registrationService.delete(regId);
    if (ok) refreshRegs();
  };

  const handleSave = async () => {
    setSaving(true);
    const itemId = isNew ? crypto.randomUUID() : id!;
    let imageUrl = form.image;
    if (imageFile) {
      const ext = imageFile.name.split('.').pop() ?? 'jpg';
      const uploaded = await storageService.upload('images', imageFile, 'programs/' + itemId + '.' + ext);
      if (uploaded) imageUrl = uploaded;
    }
    const statusOpt = STATUS_OPTIONS.find(o => o.value === form.status_mn);
    const payload = {
      title_mn: form.title_mn, title_en: form.title_en,
      pillar_mn: form.pillar_mn, pillar_en: form.pillar_en,
      status_mn: statusOpt?.mn ?? form.status_mn,
      status_en: statusOpt?.en ?? form.status_mn,
      description_mn: form.description_mn, description_en: form.description_en,
      image: imageUrl,
      date_mn: formatDateMn(form.date_mn), date_en: formatDateEn(form.date_mn),
      location_mn: form.location_mn, location_en: form.location_en,
      capacity_mn: form.capacity_mn, capacity_en: form.capacity_mn,
      deadline_mn: formatDateMn(form.deadline_mn), deadline_en: formatDateEn(form.deadline_mn),
      content_mn: form.content_mn, content_en: form.content_en,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      registration_open: form.registration_open,
    };
    const highlightPayload = highlights.map((h, i) => ({ text_mn: h.text_mn, text_en: h.text_en, sort_order: i }));
    const success = isNew
      ? await programService.create({ id: itemId, ...payload }, highlightPayload)
      : await programService.update(itemId, payload, highlightPayload);
    if (success) {
      setDirty(false);
      window.history.back();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            {[200, 300, 120].map((h, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" style={{ height: h }} />
            ))}
          </div>
          <div className="space-y-5">
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminEditLayout
      title={t({ mn: isNew ? 'Хөтөлбөр нэмэх' : 'Хөтөлбөр засах', en: isNew ? 'Add Program' : 'Edit Program' })}
      backPath={`/${lang}/admin/programs`}
      saving={saving}
      onSave={handleSave}
      dirty={dirty}
      sidebar={
        <>
          {/* Settings */}
          <SectionCard title={t({ mn: 'Тохиргоо', en: 'Settings' })}>
            <div>
              <FieldLabel>{t({ mn: 'Багана', en: 'Pillar' })}</FieldLabel>
              <select
                className={fieldClass}
                value={pillars.some(p => p.title_mn === form.pillar_mn) ? form.pillar_mn : '__custom'}
                onChange={(e) => {
                  if (e.target.value === '__new') {
                    setShowNewPillar(true);
                  } else {
                    const p = pillars.find(p => p.title_mn === e.target.value);
                    if (p) {
                      set('pillar_mn', p.title_mn);
                      set('pillar_en', p.title_en);
                    }
                    setShowNewPillar(false);
                  }
                }}
              >
                {!form.pillar_mn && <option value="__custom">{t({ mn: 'Сонгоно уу...', en: 'Select...' })}</option>}
                {form.pillar_mn && !pillars.some(p => p.title_mn === form.pillar_mn) && (
                  <option value="__custom">{form.pillar_mn}</option>
                )}
                {pillars.map((p) => (
                  <option key={p.id} value={p.title_mn}>
                    {t({ mn: p.title_mn, en: p.title_en })}
                  </option>
                ))}
                <option value="__new">+ {t({ mn: 'Шинээр нэмэх', en: 'Add new' })}</option>
              </select>
              {showNewPillar && (
                <div className="mt-2 space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input
                    className={fieldClass}
                    placeholder={t({ mn: 'Нэр (MN)', en: 'Name (MN)' })}
                    value={newPillarMn}
                    onChange={(e) => setNewPillarMn(e.target.value)}
                  />
                  <input
                    className={fieldClass}
                    placeholder={t({ mn: 'Нэр (EN)', en: 'Name (EN)' })}
                    value={newPillarEn}
                    onChange={(e) => setNewPillarEn(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddPillar}
                      className="px-3 py-1.5 text-xs font-semibold bg-sdy-red text-white rounded-lg hover:bg-sdy-red/90 transition-colors"
                    >
                      {t({ mn: 'Нэмэх', en: 'Add' })}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewPillar(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {t({ mn: 'Болих', en: 'Cancel' })}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <FieldLabel>{t({ mn: 'Төлөв', en: 'Status' })}</FieldLabel>
              <select
                className={fieldClass}
                value={form.status_mn}
                onChange={(e) => set('status_mn', e.target.value)}
              >
                <option value="">{t({ mn: 'Сонгоно уу...', en: 'Select...' })}</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t({ mn: opt.mn, en: opt.en })}
                  </option>
                ))}
              </select>
            </div>
          </SectionCard>

          {/* Registration */}
          <SectionCard title={t({ mn: 'Бүртгэл', en: 'Registration' })}>
            <div>
              <FieldLabel>{t({ mn: 'Дээд оролцогчид', en: 'Max Participants' })}</FieldLabel>
              <input
                type="number" min={0} className={fieldClass}
                value={form.max_participants}
                onChange={(e) => set('max_participants', e.target.value)}
                placeholder={t({ mn: 'Хязгааргүй', en: 'Unlimited' })}
              />
            </div>
            <div>
              <FieldLabel>{t({ mn: 'Бүртгэл', en: 'Registration' })}</FieldLabel>
              <button
                type="button"
                onClick={() => { set('registration_open', !form.registration_open); }}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  form.registration_open
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-800'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700'
                }`}
              >
                {form.registration_open
                  ? t({ mn: 'Нээлттэй', en: 'Open' })
                  : t({ mn: 'Хаалттай', en: 'Closed' })}
              </button>
            </div>
          </SectionCard>

          {/* Details */}
          <SectionCard title={t({ mn: 'Нэмэлт мэдээлэл', en: 'Details' })}>
            <div>
              <FieldLabel><CalendarDays size={12} className="inline mr-1 -mt-0.5" />{t({ mn: 'Огноо', en: 'Date' })}</FieldLabel>
              <input
                type="date"
                className={fieldClass}
                value={form.date_mn}
                onChange={(e) => set('date_mn', e.target.value)}
              />
            </div>
            <div>
              <FieldLabel><MapPin size={12} className="inline mr-1 -mt-0.5" />{t({ mn: 'Байршил', en: 'Location' })}</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                <input className={fieldClass} placeholder="MN" value={form.location_mn} onChange={(e) => set('location_mn', e.target.value)} />
                <input className={fieldClass} placeholder="EN" value={form.location_en} onChange={(e) => set('location_en', e.target.value)} />
              </div>
            </div>
            <div>
              <FieldLabel><UsersIcon size={12} className="inline mr-1 -mt-0.5" />{t({ mn: 'Оролцогчид', en: 'Participants' })}</FieldLabel>
              <input
                type="number"
                min={0}
                className={fieldClass}
                value={form.capacity_mn}
                onChange={(e) => set('capacity_mn', e.target.value)}
                placeholder={t({ mn: 'Тоо оруулна уу', en: 'Enter number' })}
              />
            </div>
            <div>
              <FieldLabel><Clock size={12} className="inline mr-1 -mt-0.5" />{t({ mn: 'Эцсийн хугацаа', en: 'Deadline' })}</FieldLabel>
              <input
                type="date"
                className={fieldClass}
                value={form.deadline_mn}
                onChange={(e) => set('deadline_mn', e.target.value)}
              />
            </div>
          </SectionCard>

          {/* Media */}
          <SectionCard title={t({ mn: 'Зураг', en: 'Image' })}>
            <ImageUpload
              value={form.image}
              onChange={(file) => { setImageFile(file); setDirty(true); }}
            />
          </SectionCard>
        </>
      }
    >
      {/* Tab Navigation */}
      {!isNew && (
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'details'
                ? 'bg-white dark:bg-gray-900 text-sdy-black dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
            }`}
          >
            {t({ mn: 'Мэдээлэл', en: 'Details' })}
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'registrations'
                ? 'bg-white dark:bg-gray-900 text-sdy-black dark:text-white shadow-sm'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'
            }`}
          >
            <ClipboardList size={13} />
            {t({ mn: 'Бүртгэлүүд', en: 'Registrations' })}
            {registrations.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-sdy-red/10 text-sdy-red">{registrations.length}</span>
            )}
          </button>
        </div>
      )}

      {activeTab === 'details' || isNew ? (
        <>
          {/* ─── Mongolian Content ─── */}
          <SectionCard>
            <LangDivider lang="mn" />
            <div>
              <FieldLabel required>{t({ mn: 'Гарчиг', en: 'Title' })}</FieldLabel>
              <input className={fieldClass} value={form.title_mn} onChange={(e) => set('title_mn', e.target.value)} placeholder={t({ mn: 'Хөтөлбөрийн нэр', en: 'Program name' })} required />
            </div>
            <div>
              <FieldLabel>{t({ mn: 'Тайлбар', en: 'Description' })}</FieldLabel>
              <textarea className={textareaClass} rows={3} value={form.description_mn} onChange={(e) => set('description_mn', e.target.value)} placeholder={t({ mn: 'Товч тайлбар...', en: 'Short description...' })} />
            </div>
            <div>
              <FieldLabel>{t({ mn: 'Агуулга', en: 'Content' })}</FieldLabel>
              <textarea className={textareaClass} rows={10} style={{ minHeight: 220 }} value={form.content_mn} onChange={(e) => set('content_mn', e.target.value)} placeholder={t({ mn: 'Дэлгэрэнгүй агуулга бичнэ үү...', en: 'Write detailed content...' })} />
            </div>
          </SectionCard>

          {/* ─── English Content ─── */}
          <SectionCard>
            <LangDivider lang="en" />
            <div>
              <FieldLabel required>Title</FieldLabel>
              <input className={fieldClass} value={form.title_en} onChange={(e) => set('title_en', e.target.value)} placeholder="Program name" required />
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea className={textareaClass} rows={3} value={form.description_en} onChange={(e) => set('description_en', e.target.value)} placeholder="Short description..." />
            </div>
            <div>
              <FieldLabel>Content</FieldLabel>
              <textarea className={textareaClass} rows={10} style={{ minHeight: 220 }} value={form.content_en} onChange={(e) => set('content_en', e.target.value)} placeholder="Write detailed content..." />
            </div>
          </SectionCard>

          {/* ─── Highlights ─── */}
          <SectionCard title={t({ mn: 'Онцлох зүйлс', en: 'Highlights' })}>
            {highlights.length === 0 && (
              <p className="text-sm text-gray-300 dark:text-gray-600">
                {t({ mn: 'Онцлох зүйл нэмээгүй байна', en: 'No highlights added' })}
              </p>
            )}
            <div className="space-y-3">
              {highlights.map((hl, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-300 dark:text-gray-600 w-5 text-center shrink-0">{index + 1}</span>
                  <input className={`${fieldClass} flex-1`} placeholder="MN" value={hl.text_mn} onChange={(e) => updateHighlight(index, 'text_mn', e.target.value)} />
                  <input className={`${fieldClass} flex-1`} placeholder="EN" value={hl.text_en} onChange={(e) => updateHighlight(index, 'text_en', e.target.value)} />
                  <button type="button" onClick={() => removeHighlight(index)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-md transition-colors shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addHighlight} className="flex items-center gap-1.5 text-xs font-semibold text-sdy-red hover:text-sdy-red/70 transition-colors mt-1">
              <Plus size={13} />
              {t({ mn: 'Онцлох нэмэх', en: 'Add Highlight' })}
            </button>
          </SectionCard>
        </>
      ) : (
        <RegistrationsPanel
          items={registrations}
          loading={regsLoading}
          onRefresh={refreshRegs}
          onUpdateStatus={handleRegStatusUpdate}
          onDelete={handleRegDelete}
          showMemberInfo
        />
      )}
    </AdminEditLayout>
  );
};
