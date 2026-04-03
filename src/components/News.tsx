import React from 'react';
import { useNews } from '../hooks/useNews';
import { motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

export const News = () => {
  const { t, l } = useI18n();
  const { data: news, loading } = useNews();

  const [featured, ...rest] = news;

  return (
    <section id="news" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <div className="section-label">
              <span className="w-1.5 h-1.5 rounded-full bg-sdy-red" />
              {t({ mn: 'Мэдээ мэдээлэл', en: 'In The News' })}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-sdy-black tracking-tighter leading-[1.05]">
              {t({ mn: 'Сүүлийн үеийн мэдээ', en: 'Recent Updates' })}
            </h2>
          </div>
          <Link
            to={l('/news')}
            className="flex items-center gap-2 font-black text-sdy-black hover:text-sdy-red transition-colors flex-shrink-0 text-sm"
          >
            {t({ mn: 'Бүх мэдээг үзэх', en: 'View All News' })}
            <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* Layout: featured large + two smaller */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-pulse">
            <div className="lg:col-span-3">
              <div className="rounded-2xl aspect-[16/10] bg-gray-100 mb-5" />
              <div className="h-4 bg-gray-100 rounded w-1/4 mb-3" />
              <div className="h-6 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-full" />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-6">
              {[0, 1].map((i) => (
                <div key={i} className="flex gap-5">
                  <div className="w-28 h-24 rounded-xl bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Featured article */}
          {featured && (
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="lg:col-span-3 group cursor-pointer"
            >
              <Link to={l(`/news/${featured.id}`)} className="block h-full">
                <div className="relative overflow-hidden rounded-2xl aspect-[16/10] mb-5">
                  <img
                    src={featured.image}
                    alt={t(featured.title)}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sdy-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-sdy-red text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                      {t(featured.category)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 mb-3 uppercase tracking-widest">
                  <Calendar size={12} className="text-sdy-red" />
                  {t(featured.date)}
                </div>
                <h3 className="text-2xl font-black mb-3 group-hover:text-sdy-red transition-colors duration-200 leading-tight">
                  {t(featured.title)}
                </h3>
                <p className="text-gray-500 mb-5 leading-relaxed line-clamp-2 text-sm">
                  {t(featured.excerpt)}
                </p>
                <span className="inline-flex items-center gap-2 font-black text-sdy-black group-hover:text-sdy-red transition-colors text-sm">
                  {t({ mn: 'Дэлгэрэнгүй', en: 'Read More' })}
                  <ArrowRight size={14} />
                </span>
              </Link>
            </motion.article>
          )}

          {/* Smaller articles */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {rest.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 1) * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="group cursor-pointer flex gap-5 items-start"
              >
                <Link to={l(`/news/${item.id}`)} className="flex gap-5 items-start w-full">
                  <div className="relative overflow-hidden rounded-xl w-28 h-24 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={t(item.title)}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                      <span className="w-1 h-1 rounded-full bg-sdy-red" />
                      {t(item.category)}
                    </div>
                    <h3 className="font-black text-[15px] leading-snug mb-1 group-hover:text-sdy-red transition-colors duration-200 line-clamp-2">
                      {t(item.title)}
                    </h3>
                    <p className="text-[12px] text-gray-400 font-bold">{t(item.date)}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  );
};
