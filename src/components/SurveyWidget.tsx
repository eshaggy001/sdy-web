import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export const SurveyWidget = () => {
  const [voted, setVoted] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const { t } = useI18n();

  const handleVote = (val: string) => {
    setChoice(val);
    setVoted(true);
  };

  return (
    <section className="py-24 bg-sdy-gray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-64 md:h-auto relative">
              <img 
                src="https://picsum.photos/seed/survey/800/800" 
                alt="Survey Topic" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-sdy-red text-white text-[10px] font-black tracking-widest uppercase rounded">
                  {t({ mn: 'Нийгмийн дэвшил', en: 'Social Progress' })}
                </span>
              </div>
            </div>
            
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {!voted ? (
                  <motion.div
                    key="question"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-2xl md:text-3xl font-black text-sdy-black mb-6 leading-tight">
                      {t({ 
                        mn: 'Та Улаанбаатар хотын залуучуудын хөдөлмөр эрхлэлтийг дэмжих шинэ санаачилгыг дэмжиж байна уу?',
                        en: 'Do you support the new youth employment initiative in Ulaanbaatar?'
                      })}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleVote(t({ mn: 'Тийм', en: 'Yes' }))}
                        className="py-4 rounded-xl border-2 border-gray-200 font-bold hover:border-sdy-red hover:text-sdy-red transition-all active:scale-95"
                      >
                        {t({ mn: 'Тийм', en: 'Yes' })}
                      </button>
                      <button 
                        onClick={() => handleVote(t({ mn: 'Үгүй', en: 'No' }))}
                        className="py-4 rounded-xl border-2 border-gray-200 font-bold hover:border-sdy-black hover:text-sdy-black transition-all active:scale-95"
                      >
                        {t({ mn: 'Үгүй', en: 'No' })}
                      </button>
                    </div>
                    <p className="mt-6 text-xs text-gray-400 font-medium">
                      {t({ mn: '* Таны санал бидэнд илүү сайн бодлого боловсруулахад тусална.', en: '* Your vote helps us advocate for better policies.' })}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-sdy-black mb-2">
                      {t({ mn: 'Санал өгсөнд баярлалаа!', en: 'Thank you for voting!' })}
                    </h3>
                    <p className="text-gray-500 mb-8">
                      {t({ mn: 'Таны санал: ', en: 'You voted: ' })}
                      <span className="font-bold text-sdy-red">{choice}</span>
                    </p>
                    
                    <div className="space-y-4 text-left">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider">
                          <span>{t({ mn: 'Тийм', en: 'Yes' })}</span>
                          <span>78%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '78%' }}
                            className="h-full bg-sdy-red"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider">
                          <span>{t({ mn: 'Үгүй', en: 'No' })}</span>
                          <span>22%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '22%' }}
                            className="h-full bg-sdy-black"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
