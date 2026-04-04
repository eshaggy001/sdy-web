import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, CalendarDays, ClipboardList, AlertCircle } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { storageService } from '../services/storageService';
import { useEventRegistrations } from '../hooks/useRegistrations';
import { ImageUpload } from '../components/admin/ImageUpload';
import { RegistrationsPanel } from '../components/admin/RegistrationsPanel';
import {
  AdminEditLayout, SectionCard, LangDivider, FieldLabel,
  fieldClass, textareaClass,
} from '../components/admin/AdminEditLayout';
import { logService } from '../lib/logger';
import { toServiceError } from '../lib/errors';

const EMPTY_FORM = {
  title_mn: '', title_en: '',
  description_mn: '', description_en: '',
  content_mn: '', content_en: '',
  image: null as string | null,
  date_start: '',
  date_end: '',
  location_mn: '', location_en: '',
  status: 'draft',
  registration_open: false,
  max_participants: '',
};

const STATUS_OPTIONS = [
  { value: 'draft',     mn: 'Ноорог',              en: 'Draft' },
  { value: 'published', mn: 'Нийтлэгдсэн',         en: 'Published' },
  { value: 'ongoing',   mn: 'Явагдаж байгаа',      en: 'Ongoing' },
  { value: 'completed', mn: 'Дууссан',              en: 'Completed' },
  { value: 'cancelled', mn: 'Цуцлагдсан',           en: 'Cancelled' },
];

const toDatetimeLocal = (iso: string | null | undefined): string => {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

export const AdminEventEditPage = () => {
  const { lang, id } = useParams();
  const { t } = useI18n();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'registrations'>('details');
  const { data: registrations, loading: regsLoading, refresh: refreshRegs } = useEventRegistrations(isNew ? undefined : id);

  const set = useCallback(<K extends keyof typeof EMPTY_FORM>(key: K, val: (typeof EMPTY_FORM)[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setDirty(true);
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      (async () => {
        const item = await eventService.getById(id);
        if (item) {
          setForm({
            title_mn: item.title_mn ?? '',
            title_en: item.title_en ?? '',
            description_mn: item.description_mn ?? '',
            description_en: item.description_en ?? '',
            content_mn: item.content_mn ?? '',
            content_en: item.content_en ?? '',
            image: item.image ?? null,
            date_start: toDatetimeLocal(item.date_start),
            date_end: toDatetimeLocal(item.date_end),
            location_mn: item.location_mn ?? '',
            location_en: item.location_en ?? '',
            status: item.status ?? 'draft',
            registration_open: item.registration_open ?? false,
            max_participants: item.max_participants != null ? String(item.max_participants) : '',
          });
        }
        setLoading(false);
      })();
    }
  }, [id, isNew]);

  const handleRegStatusUpdate = async (regId: string, status: 'approved' | 'rejected') => {
    const ok = await registrationService.updateEventStatus(regId, status);
    if (ok) refreshRegs();
  };

  const handleRegDelete = async (regId: string) => {
    const ok = await registrationService.deleteEventRegistration(regId);
    if (ok) refreshRegs();
  };

  const handleSave = async () => {
    // Guard against double-click re-entry. React batches, but two rapid clicks
    // can still race on the async handler.
    if (saving) {
      logService('warn', 'save.reentry_blocked', { operation: 'AdminEventEditPage.handleSave' });
      return;
    }

    logService('info', 'save.start', {
      operation: 'AdminEventEditPage.handleSave',
      mode: isNew ? 'create' : 'update',
      id: id ?? 'new',
    });

    setSaving(true);
    setSaveError(null);

    try {
      const itemId = isNew ? crypto.randomUUID() : id!;

      // Image upload is best-effort: if it fails, we keep the previous image
      // and continue saving the event. Failure is logged but non-fatal.
      let imageUrl = form.image;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop() ?? 'jpg';
        try {
          const uploaded = await storageService.upload('images', imageFile, 'events/' + itemId + '.' + ext);
          if (uploaded) {
            imageUrl = uploaded;
          } else {
            logService('warn', 'save.image_upload_failed', { operation: 'AdminEventEditPage.handleSave', itemId });
          }
        } catch (err) {
          logService('error', 'save.image_upload_threw', {
            operation: 'AdminEventEditPage.handleSave',
            message: toServiceError('storageService.upload', err).message,
          });
          // Continue without image update
        }
      }

      const payload = {
        title_mn: form.title_mn,
        title_en: form.title_en,
        description_mn: form.description_mn,
        description_en: form.description_en,
        content_mn: form.content_mn,
        content_en: form.content_en,
        image: imageUrl,
        date_start: form.date_start ? new Date(form.date_start).toISOString() : null,
        date_end: form.date_end ? new Date(form.date_end).toISOString() : null,
        location_mn: form.location_mn,
        location_en: form.location_en,
        status: form.status,
        registration_open: form.registration_open,
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      };

      const success = isNew
        ? await eventService.create({ id: itemId, ...payload })
        : await eventService.update(itemId, payload);

      if (success) {
        logService('info', 'save.success', {
          operation: 'AdminEventEditPage.handleSave',
          itemId,
          mode: isNew ? 'create' : 'update',
        });
        setDirty(false);
        window.history.back();
      } else {
        // Service returned false — failure was already logged inside the service.
        // Surface a visible error to the user instead of silently doing nothing.
        logService('warn', 'save.service_returned_false', {
          operation: 'AdminEventEditPage.handleSave',
          mode: isNew ? 'create' : 'update',
        });
        setSaveError(
          t({
            mn: 'Хадгалахад алдаа гарлаа. Дахин оролдоно уу.',
            en: 'Save failed. Please try again.',
          }),
        );
      }
    } catch (err) {
      // ANY thrown error — network, JS bug, anything. Convert to visible UI state.
      const se = toServiceError('AdminEventEditPage.handleSave', err);
      logService('error', 'save.threw', {
        operation: se.operation,
        code: se.code,
        message: se.message,
      });
      setSaveError(
        se.code === 'NETWORK'
          ? t({ mn: 'Сүлжээний алдаа. Интернэтээ шалгаад дахин оролдоно уу.', en: 'Network error. Check your connection and try again.' })
          : t({ mn: `Хадгалахад алдаа гарлаа: ${se.message}`, en: `Save failed: ${se.message}` }),
      );
    } finally {
      // CRITICAL: always reset saving state, regardless of success/failure/throw.
      // Without this finally block, any unhandled rejection above leaves the
      // button stuck with a spinner forever.
      setSaving(false);
      logService('info', 'save.finished', { operation: 'AdminEventEditPage.handleSave' });
    }
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
      title={t({ mn: isNew ? 'Арга хэмжээ нэмэх' : 'Арга хэмжээ засах', en: isNew ? 'Add Event' : 'Edit Event' })}
      backPath={`/${lang}/admin/events`}
      saving={saving}
      onSave={handleSave}
      dirty={dirty}
      sidebar={
        <>
          {/* Settings */}
          <SectionCard title={t({ mn: 'Тохиргоо', en: 'Settings' })}>
            <div>
              <FieldLabel>{t({ mn: 'Төлөв', en: 'Status' })}</FieldLabel>
              <select
                className={fieldClass}
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
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
              <FieldLabel>{t({ mn: 'Бүртгэлийн төлөв', en: 'Registration Status' })}</FieldLabel>
              <button
                type="button"
                onClick={() => set('registration_open', !form.registration_open)}
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
            {form.registration_open && (
              <div>
                <FieldLabel>{t({ mn: 'Дээд оролцогчид', en: 'Max Participants' })}</FieldLabel>
                <input
                  type="number"
                  min={0}
                  className={fieldClass}
                  value={form.max_participants}
                  onChange={(e) => set('max_participants', e.target.value)}
                  placeholder={t({ mn: 'Хязгааргүй', en: 'Unlimited' })}
                />
              </div>
            )}
          </SectionCard>

          {/* Details */}
          <SectionCard title={t({ mn: 'Нэмэлт мэдээлэл', en: 'Details' })}>
            <div>
              <FieldLabel required>
                <CalendarDays size={12} className="inline mr-1 -mt-0.5" />
                {t({ mn: 'Эхлэх огноо', en: 'Start Date' })}
              </FieldLabel>
              <input
                type="datetime-local"
                className={fieldClass}
                value={form.date_start}
                onChange={(e) => set('date_start', e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>
                <CalendarDays size={12} className="inline mr-1 -mt-0.5" />
                {t({ mn: 'Дуусах огноо', en: 'End Date' })}
              </FieldLabel>
              <input
                type="datetime-local"
                className={fieldClass}
                value={form.date_end}
                onChange={(e) => set('date_end', e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>
                <MapPin size={12} className="inline mr-1 -mt-0.5" />
                {t({ mn: 'Байршил', en: 'Location' })}
              </FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={fieldClass}
                  placeholder="MN"
                  value={form.location_mn}
                  onChange={(e) => set('location_mn', e.target.value)}
                />
                <input
                  className={fieldClass}
                  placeholder="EN"
                  value={form.location_en}
                  onChange={(e) => set('location_en', e.target.value)}
                />
              </div>
            </div>
          </SectionCard>

          {/* Image */}
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

      {saveError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-3 text-xs text-red-700 dark:text-red-400"
        >
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold mb-0.5">{t({ mn: 'Хадгалах амжилтгүй', en: 'Save failed' })}</div>
            <div>{saveError}</div>
          </div>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300 text-lg leading-none"
            aria-label={t({ mn: 'Хаах', en: 'Dismiss' })}
          >
            ×
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
              <input
                className={fieldClass}
                value={form.title_mn}
                onChange={(e) => set('title_mn', e.target.value)}
                placeholder={t({ mn: 'Арга хэмжээний нэр', en: 'Event name' })}
                required
              />
            </div>
            <div>
              <FieldLabel required>{t({ mn: 'Тайлбар', en: 'Description' })}</FieldLabel>
              <textarea
                className={textareaClass}
                rows={3}
                value={form.description_mn}
                onChange={(e) => set('description_mn', e.target.value)}
                placeholder={t({ mn: 'Товч тайлбар...', en: 'Short description...' })}
              />
            </div>
            <div>
              <FieldLabel>{t({ mn: 'Агуулга', en: 'Content' })}</FieldLabel>
              <textarea
                className={textareaClass}
                rows={10}
                style={{ minHeight: 220 }}
                value={form.content_mn}
                onChange={(e) => set('content_mn', e.target.value)}
                placeholder={t({ mn: 'Дэлгэрэнгүй агуулга бичнэ үү...', en: 'Write detailed content...' })}
              />
            </div>
          </SectionCard>

          {/* ─── English Content ─── */}
          <SectionCard>
            <LangDivider lang="en" />
            <div>
              <FieldLabel required>Title</FieldLabel>
              <input
                className={fieldClass}
                value={form.title_en}
                onChange={(e) => set('title_en', e.target.value)}
                placeholder="Event name"
                required
              />
            </div>
            <div>
              <FieldLabel required>Description</FieldLabel>
              <textarea
                className={textareaClass}
                rows={3}
                value={form.description_en}
                onChange={(e) => set('description_en', e.target.value)}
                placeholder="Short description..."
              />
            </div>
            <div>
              <FieldLabel>Content</FieldLabel>
              <textarea
                className={textareaClass}
                rows={10}
                style={{ minHeight: 220 }}
                value={form.content_en}
                onChange={(e) => set('content_en', e.target.value)}
                placeholder="Write detailed content..."
              />
            </div>
          </SectionCard>
        </>
      ) : (
        <RegistrationsPanel
          items={registrations}
          loading={regsLoading}
          onRefresh={refreshRegs}
          onUpdateStatus={handleRegStatusUpdate}
          onDelete={handleRegDelete}
        />
      )}
    </AdminEditLayout>
  );
};
