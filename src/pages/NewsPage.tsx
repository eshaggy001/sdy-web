import React from 'react';
import { SEOMeta } from '../components/SEOMeta';
import { motion } from 'motion/react';
import { useNews } from '../hooks/useNews';
import { Calendar, ArrowRight, Search, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

export const NewsPage = () => {
  const { t, l } = useI18n();
  const { data: news } = useNews();


  const categories = [
    { id: 'All', label: { mn: 'Бүх мэдээ', en: 'All News' } },
    { id: 'Opinion', label: { mn: 'Залуучуудын дуу хоолой', en: 'Youth Opinion' } },
    { id: 'Political', label: { mn: 'Улс төр', en: 'Political' } },
    { id: 'Ideology', label: { mn: 'Үзэл баримтлал', en: 'Ideology' } },
    { id: 'International', label: { mn: 'Олон улс', en: 'International' } },
    { id: 'Events', label: { mn: 'Арга хэмжээ', en: 'Events' } },
  ];

  return (
    <>
      <SEOMeta
        title={t({ mn: 'Мэдээ ба шинэчлэлтүүд', en: 'News & Updates' })}
        description={t({ mn: 'Манай сүүлийн үеийн үйл ажиллагаа, бодлогын байр суурь, нийгэмд үзүүлж буй нөлөөллийн мэдээллийг авна уу.', en: 'Stay informed about our latest activities, policy positions, and community impact across Mongolia.' })}
        path="/mn/news"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-32 pb-24"
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mb-24">
          <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-6">
            {t({ mn: 'Мэдээллийн төв', en: 'Media Center' })}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-sdy-black leading-tight tracking-tighter mb-8">
            {t({ mn: 'Мэдээ ба ', en: 'News & ' })}
            <span className="text-sdy-red">{t({ mn: 'шинэчлэлтүүд.', en: 'Updates.' })}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
            {t({ 
              mn: 'Манай сүүлийн үеийн үйл ажиллагаа, бодлогын байр суурь, нийгэмд үзүүлж буй нөлөөллийн талаарх мэдээллийг эндээс авна уу.',
              en: 'Stay informed about our latest activities, policy positions, and community impact across Mongolia.'
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            {news.map((item, index) => (
              <motion.article 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <Link to={l(`/news/${item.id}`)} className="relative overflow-hidden rounded-3xl aspect-[16/10] block">
                    <img
                      src={item.image}
                      alt={t(item.title)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-sdy-red text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {t(item.category)}
                      </span>
                    </div>
                  </Link>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">
                      <Calendar size={14} className="text-sdy-red" />
                      {t(item.date)}
                    </div>
                    <Link to={l(`/news/${item.id}`)}>
                      <h2 className="text-3xl font-black mb-4 group-hover:text-sdy-red transition-colors leading-tight">
                        {t(item.title)}
                      </h2>
                    </Link>
                    <p className="text-gray-600 mb-8 leading-relaxed line-clamp-3">
                      {t(item.excerpt)}
                    </p>
                    <Link to={l(`/news/${item.id}`)} className="inline-flex items-center gap-2 font-black text-sdy-black group-hover:text-sdy-red transition-colors">
                      {t({ mn: 'Дэлгэрэнгүй унших', en: 'Read Full Story' })} <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="space-y-12">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder={t({ mn: 'Мэдээ хайх...', en: 'Search news...' })}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
              />
            </div>

            {/* Categories */}
            <div className="bg-sdy-gray p-8 rounded-[2rem]">
              <h3 className="text-xl font-black text-sdy-black mb-6 uppercase tracking-tight">
                {t({ mn: 'Ангилал', en: 'Categories' })}
              </h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button key={cat.id} className="w-full text-left py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-white hover:text-sdy-red transition-all">
                    {t(cat.label)}
                  </button>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-sdy-black p-8 rounded-[2rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sdy-red/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative z-10">
                <Mail className="w-12 h-12 text-sdy-red mb-6" />
                <h3 className="text-2xl font-black mb-4 tracking-tight">
                  {t({ mn: 'Мэдээлэл авч байх.', en: 'Stay Updated.' })}
                </h3>
                <p className="text-gray-400 mb-8 font-medium">
                  {t({ mn: 'Сүүлийн үеийн мэдээллийг и-мэйлээрээ шууд хүлээн аваарай.', en: 'Get the latest updates delivered straight to your inbox.' })}
                </p>
                <form className="space-y-4">
                  <input 
                    type="email" 
                    placeholder={t({ mn: 'Таны и-мэйл хаяг', en: 'Your email address' })}
                    className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sdy-red transition-all font-bold"
                  />
                  <button className="w-full btn-primary py-4 text-lg">
                    {t({ mn: 'Бүртгүүлэх', en: 'Subscribe' })}
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
    </>
  );
};
