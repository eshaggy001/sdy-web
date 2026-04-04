import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { leaderService } from '../services/leaderService';
import { storageService } from '../services/storageService';
import { ImageUpload } from '../components/admin/ImageUpload';
import {
  AdminEditLayout, SectionCard, LangDivider, FieldLabel,
  fieldClass, textareaClass,
} from '../components/admin/AdminEditLayout';
import { logService } from '../lib/logger';
import { toServiceError } from '../lib/errors';

const EMPTY_FORM = {
  name_mn: '', name_en: '',
  role_mn: '', role_en: '',
  bio_mn: '', bio_en: '',
  image: null as string | null,
  sort_order: 0,
};

export const AdminLeaderEditPage = () => {
  const { lang, id } = useParams();
  const { t } = useI18n();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const set = useCallback(<K extends keyof typeof EMPTY_FORM>(key: K, val: (typeof EMPTY_FORM)[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setDirty(true);
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      (async () => {
        const items = await leaderService.getAll();
        const item = items.find((i: any) => i.id === id);
        if (item) {
          setForm({
            name_mn: item.name_mn, name_en: item.name_en,
            role_mn: item.role_mn, role_en: item.role_en,
            bio_mn: item.bio_mn ?? '', bio_en: item.bio_en ?? '',
            image: item.image, sort_order: item.sort_order ?? 0,
          });
        }
        setLoading(false);
      })();
    }
  }, [id, isNew]);

  const handleSave = async () => {
    if (saving) {
      logService('warn', 'save.reentry_blocked', { operation: 'AdminLeaderEditPage.handleSave' });
      return;
    }

    logService('info', 'save.start', {
      operation: 'AdminLeaderEditPage.handleSave',
      mode: isNew ? 'create' : 'update',
      id: id ?? 'new',
    });

    setSaving(true);
    setSaveError(null);

    try {
      const itemId = isNew ? crypto.randomUUID() : id!;

      let imageUrl = form.image;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop() ?? 'jpg';
        try {
          const uploaded = await storageService.upload('images', imageFile, 'leaders/' + itemId + '.' + ext);
          if (uploaded) {
            imageUrl = uploaded;
          } else {
            logService('warn', 'save.image_upload_failed', { operation: 'AdminLeaderEditPage.handleSave', itemId });
          }
        } catch (err) {
          logService('error', 'save.image_upload_threw', {
            operation: 'AdminLeaderEditPage.handleSave',
            message: toServiceError('storageService.upload', err).message,
          });
        }
      }

      const payload = {
        name_mn: form.name_mn, name_en: form.name_en,
        role_mn: form.role_mn, role_en: form.role_en,
        bio_mn: form.bio_mn, bio_en: form.bio_en,
        image: imageUrl, sort_order: form.sort_order,
      };

      const success = isNew
        ? await leaderService.create({ id: itemId, ...payload })
        : await leaderService.update(itemId, payload);

      if (success) {
        logService('info', 'save.success', {
          operation: 'AdminLeaderEditPage.handleSave',
          itemId,
          mode: isNew ? 'create' : 'update',
        });
        setDirty(false);
        window.history.back();
      } else {
        logService('warn', 'save.service_returned_false', {
          operation: 'AdminLeaderEditPage.handleSave',
          mode: isNew ? 'create' : 'update',
        });
        setSaveError(
          t({ mn: 'Хадгалахад алдаа гарлаа. Дахин оролдоно уу.', en: 'Save failed. Please try again.' }),
        );
      }
    } catch (err) {
      const se = toServiceError('AdminLeaderEditPage.handleSave', err);
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
      setSaving(false);
      logService('info', 'save.finished', { operation: 'AdminLeaderEditPage.handleSave' });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            {[180, 180].map((h, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" style={{ height: h }} />
            ))}
          </div>
          <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <AdminEditLayout
      title={t({ mn: isNew ? 'Удирдлага нэмэх' : 'Удирдлага засах', en: isNew ? 'Add Leader' : 'Edit Leader' })}
      backPath={`/${lang}/admin/leaders`}
      saving={saving}
      onSave={handleSave}
      dirty={dirty}
      sidebar={
        <>
          <SectionCard title={t({ mn: 'Тохиргоо', en: 'Settings' })}>
            <div>
              <FieldLabel>{t({ mn: 'Эрэмбэ', en: 'Sort Order' })}</FieldLabel>
              <input
                type="number" min={0} className={fieldClass}
                value={form.sort_order}
                onChange={(e) => set('sort_order', parseInt(e.target.value) || 0)}
              />
            </div>
          </SectionCard>

          <SectionCard title={t({ mn: 'Зураг', en: 'Photo' })}>
            <ImageUpload
              value={form.image}
              onChange={(file) => { setImageFile(file); setDirty(true); }}
            />
          </SectionCard>
        </>
      }
    >
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

      {/* ─── Mongolian ─── */}
      <SectionCard>
        <LangDivider lang="mn" />
        <div>
          <FieldLabel required>{t({ mn: 'Нэр', en: 'Name' })}</FieldLabel>
          <input className={fieldClass} value={form.name_mn} onChange={(e) => set('name_mn', e.target.value)} placeholder={t({ mn: 'Овог нэр', en: 'Full name' })} required />
        </div>
        <div>
          <FieldLabel required>{t({ mn: 'Албан тушаал', en: 'Role' })}</FieldLabel>
          <input className={fieldClass} value={form.role_mn} onChange={(e) => set('role_mn', e.target.value)} placeholder={t({ mn: 'Жишээ: Дарга', en: 'e.g. Chairman' })} required />
        </div>
        <div>
          <FieldLabel>{t({ mn: 'Танилцуулга', en: 'Bio' })}</FieldLabel>
          <textarea className={textareaClass} rows={5} style={{ minHeight: 120 }} value={form.bio_mn} onChange={(e) => set('bio_mn', e.target.value)} placeholder={t({ mn: 'Товч танилцуулга...', en: 'Short bio...' })} />
        </div>
      </SectionCard>

      {/* ─── English ─── */}
      <SectionCard>
        <LangDivider lang="en" />
        <div>
          <FieldLabel required>Name</FieldLabel>
          <input className={fieldClass} value={form.name_en} onChange={(e) => set('name_en', e.target.value)} placeholder="Full name" required />
        </div>
        <div>
          <FieldLabel required>Role</FieldLabel>
          <input className={fieldClass} value={form.role_en} onChange={(e) => set('role_en', e.target.value)} placeholder="e.g. Chairman" required />
        </div>
        <div>
          <FieldLabel>Bio</FieldLabel>
          <textarea className={textareaClass} rows={5} style={{ minHeight: 120 }} value={form.bio_en} onChange={(e) => set('bio_en', e.target.value)} placeholder="Short bio..." />
        </div>
      </SectionCard>
    </AdminEditLayout>
  );
};
