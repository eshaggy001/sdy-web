import React from 'react';
import { Hero } from '../components/Hero';
import { ImpactBar } from '../components/ImpactBar';
import { Pillars } from '../components/Pillars';
import { Programs } from '../components/Programs';
import { PollsSection } from '../components/PollsSection';
import { News } from '../components/News';
import { JoinFlow } from '../components/JoinFlow';
import { motion } from 'motion/react';

export const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <ImpactBar />
      <Pillars />
      <Programs />
      <PollsSection />
      <News />
      <JoinFlow />
    </motion.div>
  );
};
