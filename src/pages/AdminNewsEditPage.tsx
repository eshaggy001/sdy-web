import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { newsService } from '../services/newsService';
import { storageService } from '../services/storageService';
import { ImageUpload } from '../components/admin/ImageUpload';
import {
  AdminEditLayout, SectionCard, LangDivider, FieldLabel,
  fieldClass, textareaClass,
} from '../components/admin/AdminEditLayout';

const EMPTY_FORM = {
  title_mn: '', title_en: '',
  category_mn: '', category_en: '',
  date_mn: '', date_en: '',
  image: null as string | null,
  excerpt_mn: '', excerpt_en: '',
  content_mn: '', content_en: '',
};

export const AdminNewsEditPage = () => {
  const { lang, id } = useParams();
  const { t } = useI18n();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
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
        const item = await newsService.getById(id);
        if (item) {
          setForm({
            title_mn: item.title_mn, title_en: item.title_en,
            category_mn: item.category_mn ?? '', category_en: item.category_en ?? '',
            date_mn: item.date_mn ?? '', date_en: item.date_en ?? '',
            image: item.image,
            excerpt_mn: item.excerpt_mn ?? '', excerpt_en: item.excerpt_en ?? '',
            content_mn: item.content_mn ?? '', content_en: item.content_en ?? '',
          });
        }
        setLoading(false);
      })();
    }
  }, [id, isNew]);

  const handleSave = async () => {
    setSaving(true);
    const itemId = isNew ? crypto.randomUUID() : id!;
    let imageUrl = form.image;
    if (imageFile) {
      const ext = imageFile.name.split('.').pop() ?? 'jpg';
      const uploaded = await storageService.upload('images', imageFile, 'news/' + itemId + '.' + ext);
      if (uploaded) imageUrl = uploaded;
    }
    const payload = {
      title_mn: form.title_mn, title_en: form.title_en,
      category_mn: form.category_mn, category_en: form.category_en,
      date_mn: form.date_mn, date_en: form.date_en,
      image: imageUrl,
      excerpt_mn: form.excerpt_mn, excerpt_en: form.excerpt_en,
      content_mn: form.content_mn, content_en: form.content_en,
    };
    const success = isNew
      ? await newsService.create({ id: itemId, ...payload })
      : await newsService.update(itemId, payload);
    if (success) { setDirty(false); window.history.back(); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            {[200, 300].map((h, i) => (
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
      title={t({ mn: isNew ? 'Мэдээ нэмэх' : 'Мэдээ засах', en: isNew ? 'Add News' : 'Edit News' })}
      backPath={`/${lang}/admin/news`}
      saving={saving}
      onSave={handleSave}
      dirty={dirty}
      sidebar={
        <>
          <SectionCard title={t({ mn: 'Ангилал & Огноо', en: 'Category & Date' })}>
            <div>
              <FieldLabel>{t({ mn: 'Ангилал', en: 'Category' })}</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                <input className={fieldClass} placeholder="MN" value={form.category_mn} onChange={(e) => set('category_mn', e.target.value)} />
                <input className={fieldClass} placeholder="EN" value={form.category_en} onChange={(e) => set('category_en', e.target.value)} />
              </div>
            </div>
            <div>
              <FieldLabel>{t({ mn: 'Огноо', en: 'Date' })}</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                <input className={fieldClass} placeholder="2025.11.15" value={form.date_mn} onChange={(e) => set('date_mn', e.target.value)} />
                <input className={fieldClass} placeholder="Nov 15, 2025" value={form.date_en} onChange={(e) => set('date_en', e.target.value)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title={t({ mn: 'Зураг', en: 'Image' })}>
            <ImageUpload
              value={form.image}
              onChange={(file) => { setImageFile(file); setDirty(true); }}
            />
          </SectionCard>
        </>
      }
    >
      {/* ─── Mongolian ─── */}
      <SectionCard>
        <LangDivider lang="mn" />
        <div>
          <FieldLabel required>{t({ mn: 'Гарчиг', en: 'Title' })}</FieldLabel>
          <input className={fieldClass} value={form.title_mn} onChange={(e) => set('title_mn', e.target.value)} placeholder={t({ mn: 'Мэдээний гарчиг', en: 'News title' })} required />
        </div>
        <div>
          <FieldLabel>{t({ mn: 'Товч', en: 'Excerpt' })}</FieldLabel>
          <textarea className={textareaClass} rows={3} value={form.excerpt_mn} onChange={(e) => set('excerpt_mn', e.target.value)} placeholder={t({ mn: 'Товч тайлбар...', en: 'Short excerpt...' })} />
        </div>
        <div>
          <FieldLabel>{t({ mn: 'Агуулга', en: 'Content' })}</FieldLabel>
          <textarea className={textareaClass} rows={12} style={{ minHeight: 260 }} value={form.content_mn} onChange={(e) => set('content_mn', e.target.value)} placeholder={t({ mn: 'Дэлгэрэнгүй агуулга бичнэ үү...', en: 'Write detailed content...' })} />
        </div>
      </SectionCard>

      {/* ─── English ─── */}
      <SectionCard>
        <LangDivider lang="en" />
        <div>
          <FieldLabel required>Title</FieldLabel>
          <input className={fieldClass} value={form.title_en} onChange={(e) => set('title_en', e.target.value)} placeholder="News title" required />
        </div>
        <div>
          <FieldLabel>Excerpt</FieldLabel>
          <textarea className={textareaClass} rows={3} value={form.excerpt_en} onChange={(e) => set('excerpt_en', e.target.value)} placeholder="Short excerpt..." />
        </div>
        <div>
          <FieldLabel>Content</FieldLabel>
          <textarea className={textareaClass} rows={12} style={{ minHeight: 260 }} value={form.content_en} onChange={(e) => set('content_en', e.target.value)} placeholder="Write detailed content..." />
        </div>
      </SectionCard>
    </AdminEditLayout>
  );
};
