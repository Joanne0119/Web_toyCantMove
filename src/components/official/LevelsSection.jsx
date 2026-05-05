import React from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import { levels } from '@/constants/officialData';

const LevelCard = ({ level, index, isMobile }) => {
  return (
    <motion.div
      className={`grid grid-cols-1 md:grid-cols-2 gap-6 py-6 my-4 rounded-2xl shadow-xl px-5 overflow-hidden ${level.bgClass}`}
      style={
        isMobile
          ? {}
          : {
              position: 'sticky',
              top: `calc(100px + ${index * 20}px)`,
            }
      }
      initial={{ y: 60, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
    >
      {/* Level image */}
      <div className="flex items-center justify-center">
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <img
            src={level.image}
            alt={level.name}
            className="w-full h-auto object-cover"
            style={level.comingSoon ? { filter: 'grayscale(70%) blur(1px)' } : {}}
          />
          {level.comingSoon && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <img
                src="/images/ComingSoon.png"
                alt="Coming Soon"
                className="h-16"
                style={{ rotate: '-15deg', filter: 'grayscale(100%) brightness(200%)' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Level info */}
      <div className="flex flex-col justify-center p-4">
        <h3 className="text-2xl sm:text-3xl font-bold mb-1">
          {level.name}
        </h3>
        <p className="text-sm text-base-content/50 mb-4 font-medium">
          {level.engName}
        </p>
        <p className="text-base-content/80 leading-relaxed">
          {level.description}
        </p>
      </div>
    </motion.div>
  );
};

const LevelsSection = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <section id="levels" className="py-20 px-4 sm:px-8 lg:px-16 bg-base-100">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          遊戲關卡
        </h2>
        <p className="text-base-content/60 text-center mb-4 max-w-xl mx-auto">
          探索不同的玩具世界場景，每個關卡都有獨特的玩法和挑戰
        </p>
        <motion.p
          className="text-base-content/50 text-center text-sm mb-12 max-w-2xl mx-auto italic leading-relaxed"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          在一個你看不見的角落，玩具們有著自己的生活。每當房間的燈熄滅，他們便開始動了起來。
          從堆滿回憶的玩具紙箱，到充滿創意的塗鴉畫紙，每一個場景都是一段新的故事。
          而當天亮時，他們又會回到原來的位置，假裝什麼都沒發生過——因為，不會動的玩具才正常吧？
        </motion.p>

        <div>
          {levels.map((level, i) => (
            <LevelCard key={level.id} level={level} index={i} isMobile={isMobile} />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default LevelsSection;
