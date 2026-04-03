import React from 'react';
import { PILLARS } from '../constants';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

export const Pillars = () => {
  const { t, l } = useI18n();

  return (
    <section id="pillars" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="section-label">
              <span className="w-1.5 h-1.5 rounded-full bg-sdy-red" />
              {t({ mn: 'Бид юуны төлөө зогсдог вэ', en: 'What We Stand For' })}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-sdy-black tracking-tighter leading-[1.05]">
              {t({
                mn: 'Дөрвөн тулгуур баганаар дамжуулан гэрэлт ирээдүйг бүтээх нь.',
                en: 'Building a Brighter Tomorrow Through Four Pillars.',
              })}
            </h2>
          </div>
          <p className="text-gray-500 max-w-sm text-base leading-relaxed">
            {t({
              mn: 'Монголын залуучуудын цогц хөгжил, нийгмийн тогтвортой өсөлтийг хангах үндсэн чиглэлүүд.',
              en: 'Core areas ensuring holistic development of Mongolian youth and sustainable growth of our society.',
            })}
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <Link
                to={l(pillar.href)}
                className="group block h-full"
              >
                {/* Image area */}
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-5">
                  <img
                    src={pillar.image}
                    alt={t(pillar.title)}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-sdy-black/75 via-sdy-black/15 to-transparent" />

                  {/* Icon */}
                  <div className="absolute top-4 left-4 w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center text-white border border-white/20 transition-colors duration-300 group-hover:bg-sdy-red group-hover:border-sdy-red">
                    <pillar.icon size={20} />
                  </div>

                  {/* Arrow on hover */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowUpRight size={14} className="text-sdy-black" />
                  </div>

                  {/* Title on image */}
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-lg font-black text-white leading-tight">
                      {t(pillar.title)}
                    </h3>
                  </div>
                </div>

                {/* Description below image */}
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 group-hover:text-gray-700 transition-colors duration-200">
                  {t(pillar.description)}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
