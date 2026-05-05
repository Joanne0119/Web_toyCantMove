import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, RotateCcw, Trophy } from 'lucide-react';
import { gameplaySteps, youtubeVideos } from '@/constants/officialData';

const iconMap = { Monitor, Smartphone, RotateCcw, Trophy };

const StepCard = ({ step, index }) => {
  const Icon = iconMap[step.icon];

  return (
    <motion.div
      className="flex flex-col items-center text-center"
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative">
        {Icon && <Icon className="w-7 h-7 text-primary" />}
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-content text-xs font-bold flex items-center justify-center">
          {step.step}
        </span>
      </div>
      <h4 className="font-bold text-base mb-2">{step.title}</h4>
      <p className="text-sm text-base-content/60 max-w-[200px]">
        {step.description}
      </p>
    </motion.div>
  );
};

const GameplaySection = () => {
  return (
    <section id="gameplay" className="py-20 px-4 sm:px-8 lg:px-16 bg-base-200/50">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          遊戲玩法
        </h2>
        <p className="text-base-content/60 text-center mb-12 max-w-xl mx-auto">
          四個簡單步驟，立即開始體感遊戲體驗
        </p>

        {/* Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {gameplaySteps.map((step, i) => (
            <StepCard key={step.step} step={step} index={i} />
          ))}
        </div>

        {/* YouTube Videos */}
        <div className="space-y-10">
          {youtubeVideos.map((video) => (
            <motion.div
              key={video.type}
              className="max-w-3xl mx-auto"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-lg font-bold mb-3 text-center">{video.title}</h3>
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default GameplaySection;
