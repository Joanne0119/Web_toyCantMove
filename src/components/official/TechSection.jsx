import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, Compass, Gamepad2, Code } from 'lucide-react';
import { techStack } from '@/constants/officialData';

const iconMap = { Wifi, Compass, Gamepad2, Code };

const TechCard = ({ tech, index }) => {
  const Icon = iconMap[tech.icon];

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ y: -5 }}
      className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      <div className="card-body items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
          {Icon && <Icon className="w-7 h-7 text-primary" />}
        </div>
        <h3 className="card-title text-base">{tech.name}</h3>
        <p className="text-sm text-base-content/60 leading-relaxed">
          {tech.description}
        </p>
      </div>
    </motion.div>
  );
};

const TechSection = () => {
  return (
    <section id="tech" className="py-20 px-4 sm:px-8 lg:px-16 bg-base-100">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-center mb-4"
        >
          技術架構
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-base-content/60 text-center mb-12 max-w-xl mx-auto"
        >
          融合多項現代技術，打造流暢的跨裝置遊戲體驗
        </motion.p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((tech, i) => (
            <TechCard key={tech.id} tech={tech} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechSection;
