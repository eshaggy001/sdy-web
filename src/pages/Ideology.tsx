import React from 'react';
import { SEOMeta } from '../components/SEOMeta';
import { motion } from 'motion/react';
import { Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

export const Ideology = () => {
  const { t, l } = useI18n();

  const principles = [
    {
      title: { mn: 'Нийгмийн шударга ёс', en: 'Social Justice' },
      description: {
        mn: 'Иргэн бүрт гарал үүсэл, хөрөнгө чинээ үл хамааран тэгш эрх, боломж, нөөц баялгийн шударга хуваарилалтыг хангах.',
        en: 'Ensuring equal rights, opportunities, and fair distribution of resources for all citizens, regardless of their background.'
      },
    },
    {
      title: { mn: 'Эрх чөлөө', en: 'Freedom' },
      description: {
        mn: 'Хувь хүний эрх чөлөө, ардчилсан үйл явцад идэвхтэй оролцох язгуур эрхийг хамгаалах.',
        en: 'Protecting individual liberties and the fundamental right to participate actively in the democratic process.'
      },
    },
    {
      title: { mn: 'Эв нэгдэл', en: 'Solidarity' },
      description: {
        mn: 'Нийтлэг сорилтуудыг даван туулахын тулд нийгмийн бүх түвшинд хамтын нөхөрлөл, харилцан дэмжлэгийг бэхжүүлэх.',
        en: 'Fostering a deep sense of community and mutual support across all levels of society to overcome shared challenges.'
      },
    },
    {
      title: { mn: 'Тэгш эрх', en: 'Equality' },
      description: {
        mn: 'Аливаа хэлбэрийн ялгаварлан гадуурхалтыг арилгаж, хүн бүр өөрийн нөөц бололцоогоо бүрэн дайчлах боломжтой нийгмийг цогцлоох.',
        en: 'Abolishing all forms of discrimination and promoting a society where everyone can thrive and reach their full potential.'
      },
    },
  ];

  return (
    <>
    <SEOMeta
      title={t({ mn: 'Үзэл баримтлал', en: 'Ideology' })}
      description={t({ mn: 'Нийгмийн ардчиллын үнэт зүйлс — нийгмийн шударга ёс, тогтвортой байдал, иргэний эрх чөлөө, ардчиллыг хамгаалах.', en: 'Social democratic values — social justice, sustainability, civil liberties, and democracy for Mongolia\'s future.' })}
      path="/mn/ideology"
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
            {t({ mn: 'Бидний үнэт зүйлс', en: 'Our Values' })}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-sdy-black leading-tight tracking-tighter mb-8">
            {t({ mn: 'Нийгмийн ардчиллын ', en: 'The Foundation of ' })}
            <span className="text-sdy-red">{t({ mn: 'тулгуур багана.', en: 'Social Democracy.' })}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
            {t({
              mn: 'Бидний үзэл баримтлал нь хүчирхэг ардчилалд хувь хүний эрх чөлөө болон хамтын хариуцлага хоёулаа чухал гэсэн итгэл үнэмшилд тулгуурладаг. Бид ашгаас илүү хүнийг эрхэмлэдэг бодлогыг дэмждэг.',
              en: 'Our ideology is rooted in the belief that a strong democracy requires both individual freedom and collective responsibility. We advocate for policies that prioritize people over profit.'
            })}
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-32">
          <div className="space-y-12">
            <h2 className="text-4xl font-black text-sdy-black tracking-tight mb-12 uppercase">
              {t({ mn: 'Үндсэн зарчмууд', en: 'Core Principles' })}
            </h2>
            <div className="grid grid-cols-1 gap-12">
              {principles.map((p, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden transition-transform group-hover:scale-110">
                    <img src="/sdy-check-icon.png" alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-sdy-black mb-3 uppercase tracking-tight">{t(p.title)}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{t(p.description)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="sticky top-32 bg-sdy-black text-white p-12 md:p-16 rounded-[3rem] overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-sdy-red)_1px,_transparent_1px)] bg-[length:40px_40px] opacity-10" />
              <div className="relative z-10">
                <Info className="w-16 h-16 text-sdy-red mb-8" />
                <h2 className="text-4xl font-black mb-8 tracking-tight">
                  {t({ mn: 'Яагаад өнөөдөр чухал вэ?', en: 'Why it matters today.' })}
                </h2>
                <p className="text-xl text-gray-400 leading-relaxed mb-12">
                  {t({
                    mn: 'Хурдацтай өөрчлөгдөж буй дэлхий ертөнцөд нийгмийн ардчиллын үнэт зүйлс нь тогтвортой хөгжлийн зураглалыг гаргаж өгдөг. Бид хот, хөдөөгийн хөгжлийн ялгааг арилгах, хүн бүрт чанартай боловсрол олгох, байгаль орчноо ирээдүй хойч үедээ хамгаалж үлдэхэд анхаарлаа хандуулдаг.',
                    en: 'In a rapidly changing world, social democratic values provide a roadmap for sustainable development. We focus on bridging the gap between urban and rural development, ensuring quality education for all, and protecting our natural environment for future generations.'
                  })}
                </p>
                <Link to={l('/join')} className="btn-primary px-10 py-4 inline-flex items-center gap-2">
                  {t({ mn: 'Хөдөлгөөнд нэгдэх', en: 'Join the Movement' })} <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1626257673566-df7fb7709f1b?auto=format&fit=crop&q=80&w=1200"
              alt="Social Democracy in Action"
              className="w-full aspect-video object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="p-8">
            <h2 className="text-3xl font-black text-sdy-black mb-6 uppercase tracking-tight">
              {t({ mn: 'Алсын хараа 2030', en: 'Our Vision for 2030' })}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {t({
                mn: 'Бид Монгол Улсыг хүний хөгжил, байгаль орчны тогтвортой байдал, ардчиллын үнэт зүйлсээрээ бүс нутагтаа тэргүүлэгч улс болно гэж төсөөлж байна. Манай 2030 оны стратеги нь дижитал шилжилт, ногоон эдийн засаг, хүртээмжтэй засаглалд анхаарлаа хандуулдаг.',
                en: 'We envision a Mongolia that is a regional leader in human development, environmental sustainability, and democratic integrity. Our 2030 strategy focuses on digital transformation, green economy, and inclusive governance.'
              })}
            </p>
            <Link to={l('/about')} className="font-black text-sdy-red hover:underline flex items-center gap-2">
              {t({ mn: 'Бүрэн стратегийг унших', en: 'Read Our Full Strategy' })} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
};
