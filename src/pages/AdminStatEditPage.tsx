import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { statService } from '../services/statService';
import {
  AdminEditLayout, SectionCard, LangDivider, FieldLabel, fieldClass,
} from '../components/admin/AdminEditLayout';

const EMPTY_FORM = { label_mn: '', label_en: '', value: '', icon_name: '', sort_order: 0 };

export const AdminStatEditPage = () => {
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
        const items = await statService.getAll();
        const item = items.find((i: any) => String(i.id) === id);
        if (item) {
          setForm({
            label_mn: item.label_mn, label_en: item.label_en,
            value: item.value, icon_name: item.icon_name, sort_order: item.sort_order,
          });
        }
        setLoading(false);
      })();
    }
  }, [id, isNew]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      label_mn: form.label_mn, label_en: form.label_en,
      value: form.value, icon_name: form.icon_name, sort_order: form.sort_order,
    };
    const ok = isNew
      ? await statService.create(payload)
      : await statService.update(Number(id), payload);
    if (ok) { setDirty(false); window.history.back(); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            {[140, 140].map((h, i) => (
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
      title={t({ mn: isNew ? 'Статистик нэмэх' : 'Статистик засах', en: isNew ? 'Add Stat' : 'Edit Stat' })}
      backPath={`/${lang}/admin/stats`}
      saving={saving}
      onSave={handleSave}
      dirty={dirty}
      sidebar={
        <>
          <SectionCard title={t({ mn: 'Тохиргоо', en: 'Settings' })}>
            <div>
              <FieldLabel required>{t({ mn: 'Утга', en: 'Value' })}</FieldLabel>
              <input className={fieldClass} value={form.value} onChange={(e) => set('value', e.target.value)} placeholder="e.g. 1,200+" required />
            </div>
            <div>
              <FieldLabel>{t({ mn: 'Айкон нэр', en: 'Icon Name' })}</FieldLabel>
              <input className={fieldClass} value={form.icon_name} onChange={(e) => set('icon_name', e.target.value)} placeholder="e.g. Users, Globe" />
            </div>
            <div>
              <FieldLabel>{t({ mn: 'Эрэмбэ', en: 'Sort Order' })}</FieldLabel>
              <input type="number" className={fieldClass} value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
            </div>
          </SectionCard>
        </>
      }
    >
      {/* ─── Mongolian ─── */}
      <SectionCard>
        <LangDivider lang="mn" />
        <div>
          <FieldLabel required>{t({ mn: 'Нэр', en: 'Label' })}</FieldLabel>
          <input className={fieldClass} value={form.label_mn} onChange={(e) => set('label_mn', e.target.value)} placeholder={t({ mn: 'Статистикийн нэр', en: 'Stat label' })} required />
        </div>
      </SectionCard>

      {/* ─── English ─── */}
      <SectionCard>
        <LangDivider lang="en" />
        <div>
          <FieldLabel required>Label</FieldLabel>
          <input className={fieldClass} value={form.label_en} onChange={(e) => set('label_en', e.target.value)} placeholder="Stat label" required />
        </div>
      </SectionCard>
    </AdminEditLayout>
  );
};
