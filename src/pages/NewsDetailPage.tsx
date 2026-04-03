import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, ArrowLeft, ArrowRight, Mail, Tag } from 'lucide-react';
import { useNews, useNewsItem } from '../hooks/useNews';
import { useI18n } from '../contexts/I18nContext';
import { SEOMeta } from '../components/SEOMeta';

export const NewsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, l } = useI18n();
  const { data: article, loading } = useNewsItem(id);
  const { data: news, loading: newsLoading } = useNews();

  if (loading) return null;
  if (!article) return <Navigate to={l('/news')} replace />;

  const currentIndex = newsLoading ? -1 : news.findIndex((n) => n.id === id);
  const prevArticle = currentIndex > 0 ? news[currentIndex - 1] : null;
  const nextArticle = currentIndex < news.length - 1 ? news[currentIndex + 1] : null;

  const relatedArticles = news.filter((n) => n.id !== id).slice(0, 3);

  // Split content into paragraphs for rendering
  const paragraphs = article.content
    ? t(article.content).split('\n\n').filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-28 pb-24"
    >
      <SEOMeta
        title={t(article.title)}
        description={t(article.excerpt)}
        image={article.image}
        path={`/mn/news/${article.id}`}
      />
      {/* Hero image with title overlay */}
      <div className="relative w-full aspect-[21/9] max-h-[560px] overflow-hidden">
        <img
          src={article.image}
          alt={t(article.title)}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sdy-black/80 via-sdy-black/30 to-transparent" />

        {/* Title block — aligned to the same grid as the content below */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:w-2/3"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-sdy-red text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  {t(article.category)}
                </span>
                <span className="flex items-center gap-1.5 text-white/60 text-xs font-bold uppercase tracking-widest">
                  <Calendar size={12} />
                  {t(article.date)}
                </span>
              </div>
              <h1
                className="font-black text-white tracking-tighter leading-[1.05]"
                style={{ fontSize: 'clamp(26px, 4vw, 52px)' }}
              >
                {t(article.title)}
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-12">

          {/* ── Main article body ── */}
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2"
          >
            {/* Back link */}
            <Link
              to={l('/news')}
              className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-sdy-red transition-colors mb-10 uppercase tracking-widest"
            >
              <ArrowLeft size={14} />
              {t({ mn: 'Бүх мэдээ', en: 'All News' })}
            </Link>

            {/* Excerpt / lead */}
            <p className="text-xl text-gray-500 leading-relaxed font-medium mb-10 border-l-4 border-sdy-red pl-6">
              {t(article.excerpt)}
            </p>

            {/* Body paragraphs */}
            <div className="space-y-6 text-gray-700 leading-[1.85] text-[17px]">
              {paragraphs.length > 0 ? (
                paragraphs.map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))
              ) : (
                <p className="text-gray-400 italic">
                  {t({ mn: 'Нийтлэлийн агуулга удахгүй нэмэгдэнэ.', en: 'Full article content coming soon.' })}
                </p>
              )}
            </div>

            {/* Category tag */}
            <div className="flex items-center gap-2 mt-12 pt-8 border-t border-gray-100">
              <Tag size={14} className="text-sdy-red" />
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                {t(article.category)}
              </span>
            </div>

            {/* Prev / Next navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
              {prevArticle ? (
                <Link
                  to={l(`/news/${prevArticle.id}`)}
                  className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-sdy-red/30 hover:bg-sdy-red/[0.03] transition-all"
                >
                  <ArrowLeft size={16} className="text-sdy-red flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                      {t({ mn: 'Өмнөх', en: 'Previous' })}
                    </p>
                    <p className="font-black text-sdy-black group-hover:text-sdy-red transition-colors text-sm leading-snug line-clamp-2">
                      {t(prevArticle.title)}
                    </p>
                  </div>
                </Link>
              ) : <div />}

              {nextArticle ? (
                <Link
                  to={l(`/news/${nextArticle.id}`)}
                  className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-sdy-red/30 hover:bg-sdy-red/[0.03] transition-all sm:text-right sm:flex-row-reverse"
                >
                  <ArrowRight size={16} className="text-sdy-red flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                      {t({ mn: 'Дараагийн', en: 'Next' })}
                    </p>
                    <p className="font-black text-sdy-black group-hover:text-sdy-red transition-colors text-sm leading-snug line-clamp-2">
                      {t(nextArticle.title)}
                    </p>
                  </div>
                </Link>
              ) : <div />}
            </div>
          </motion.article>

          {/* ── Sidebar ── */}
          <aside className="space-y-10">

            {/* Newsletter */}
            <div className="bg-sdy-black p-8 rounded-[2rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-sdy-red/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <Mail className="w-10 h-10 text-sdy-red mb-5" />
                <h3 className="text-xl font-black mb-3 tracking-tight">
                  {t({ mn: 'Мэдээлэл авч байх.', en: 'Stay Updated.' })}
                </h3>
                <p className="text-gray-400 mb-6 text-sm font-medium leading-relaxed">
                  {t({ mn: 'Сүүлийн үеийн мэдээллийг и-мэйлээрээ шууд хүлээн аваарай.', en: 'Get the latest updates delivered straight to your inbox.' })}
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder={t({ mn: 'Таны и-мэйл хаяг', en: 'Your email address' })}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sdy-red transition-all font-bold text-sm"
                  />
                  <button className="w-full btn-primary py-3.5">
                    {t({ mn: 'Бүртгүүлэх', en: 'Subscribe' })}
                  </button>
                </form>
              </div>
            </div>

            {/* Related articles */}
            <div>
              <h3 className="text-lg font-black text-sdy-black mb-6 uppercase tracking-tight">
                {t({ mn: 'Холбоотой мэдээ', en: 'Related Articles' })}
              </h3>
              <div className="space-y-5">
                {relatedArticles.map((item) => (
                  <Link
                    key={item.id}
                    to={l(`/news/${item.id}`)}
                    className="group flex gap-4 items-start"
                  >
                    <div className="relative overflow-hidden rounded-xl w-20 h-16 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={t(item.title)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        {t(item.date)}
                      </p>
                      <p className="font-black text-[13px] leading-snug group-hover:text-sdy-red transition-colors line-clamp-2">
                        {t(item.title)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                to={l('/news')}
                className="inline-flex items-center gap-2 mt-8 font-black text-sm text-sdy-black hover:text-sdy-red transition-colors"
              >
                {t({ mn: 'Бүх мэдээг үзэх', en: 'View All News' })}
                <ArrowRight size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
};
