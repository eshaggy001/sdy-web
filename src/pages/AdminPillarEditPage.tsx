import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { pillarService } from '../services/pillarService';
import {
  AdminEditLayout, SectionCard, LangDivider, FieldLabel,
  fieldClass, textareaClass,
} from '../components/admin/AdminEditLayout';

const EMPTY_FORM = {
  title_mn: '', title_en: '',
  description_mn: '', description_en: '',
  icon_name: '', href: '', image: '', sort_order: 0,
};

export const AdminPillarEditPage = () => {
  const { lang, id } = useParams();
  const { t } = useI18n();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const set = useCallback(<K extends keyof typeof EMPTY_FORM>(key: K, val: (typeof EMPTY_FORM)[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setDirty(true);
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      (async () => {
        const items = await pillarService.getAll();
        const item = items.find((i: any) => i.id === id);
        if (item) {
          setForm({
            title_mn: item.title_mn, title_en: item.title_en,
            description_mn: item.description_mn, description_en: item.description_en,
            icon_name: item.icon_name, href: item.href, image: item.image ?? '', sort_order: item.sort_order,
          });
        }
        setLoading(false);
      })();
    }
  }, [id, isNew]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title_mn: form.title_mn, title_en: form.title_en,
      description_mn: form.description_mn, description_en: form.description_en,
      icon_name: form.icon_name, href: form.href, image: form.image, sort_order: form.sort_order,
    };
    const ok = isNew
      ? await pillarService.create(payload)
      : await pillarService.update(id!, payload);
    if (ok) { setDirty(false); window.history.back(); }
    setSaving(false);
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
      title={t({ mn: isNew ? 'Багана нэмэх' : 'Багана засах', en: isNew ? 'Add Pillar' : 'Edit Pillar' })}
      backPath={`/${lang}/admin/pillars`}
      saving={saving}
      onSave={handleSave}
      dirty={dirty}
      sidebar={
        <>
          <SectionCard title={t({ mn: 'Тохиргоо', en: 'Settings' })}>
            <div>
              <FieldLabel>{t({ mn: 'Айкон нэр', en: 'Icon Name' })}</FieldLabel>
              <input className={fieldClass} value={form.icon_name} onChange={(e) => set('icon_name', e.target.value)} placeholder="e.g. Shield, Heart" />
            </div>
            <div>
              <FieldLabel>{t({ mn: 'Холбоос', en: 'Href' })}</FieldLabel>
              <input className={fieldClass} value={form.href} onChange={(e) => set('href', e.target.value)} placeholder="e.g. /ideology" />
            </div>
            <div>
              <FieldLabel>{t({ mn: 'Эрэмбэ', en: 'Sort Order' })}</FieldLabel>
              <input type="number" className={fieldClass} value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
            </div>
          </SectionCard>

          <SectionCard title={t({ mn: 'Зураг', en: 'Image' })}>
            <div>
              <FieldLabel>{t({ mn: 'Зураг URL', en: 'Image URL' })}</FieldLabel>
              <input className={fieldClass} value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://example.com/image.jpg" />
            </div>
            {form.image && (
              <img src={form.image} alt="" className="w-full h-32 object-cover rounded-lg border border-gray-100 dark:border-gray-800" />
            )}
          </SectionCard>
        </>
      }
    >
      {/* ─── Mongolian ─── */}
      <SectionCard>
        <LangDivider lang="mn" />
        <div>
          <FieldLabel required>{t({ mn: 'Гарчиг', en: 'Title' })}</FieldLabel>
          <input className={fieldClass} value={form.title_mn} onChange={(e) => set('title_mn', e.target.value)} placeholder={t({ mn: 'Баганын нэр', en: 'Pillar name' })} required />
        </div>
        <div>
          <FieldLabel required>{t({ mn: 'Тайлбар', en: 'Description' })}</FieldLabel>
          <textarea className={textareaClass} rows={5} style={{ minHeight: 120 }} value={form.description_mn} onChange={(e) => set('description_mn', e.target.value)} placeholder={t({ mn: 'Тайлбар бичнэ үү...', en: 'Write description...' })} required />
        </div>
      </SectionCard>

      {/* ─── English ─── */}
      <SectionCard>
        <LangDivider lang="en" />
        <div>
          <FieldLabel required>Title</FieldLabel>
          <input className={fieldClass} value={form.title_en} onChange={(e) => set('title_en', e.target.value)} placeholder="Pillar name" required />
        </div>
        <div>
          <FieldLabel required>Description</FieldLabel>
          <textarea className={textareaClass} rows={5} style={{ minHeight: 120 }} value={form.description_en} onChange={(e) => set('description_en', e.target.value)} placeholder="Write description..." required />
        </div>
      </SectionCard>
    </AdminEditLayout>
  );
};
