import React, { useState } from 'react';
import { motion } from 'framer-motion';

const StatBar = ({ label, value, maxValue = 25, delay = 0 }) => {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-10 text-base-content/60 font-medium">{label}</span>
      <div className="flex-1 bg-base-300 rounded-full h-2 overflow-hidden">
        <motion.div
          className="bg-primary h-full rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      </div>
      <span className="w-6 text-right text-base-content/60 font-mono">{value}</span>
    </div>
  );
};

const CharacterCard = ({ character, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="card bg-base-200 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden"
    >
      <figure className="px-6 pt-6 pb-2">
        <motion.img
          src={isHovered ? character.colorSrc : character.graySrc}
          alt={character.charName}
          className="h-32 w-auto object-contain drop-shadow-md"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        />
      </figure>
      <div className="card-body items-center text-center pt-2 pb-5 px-4">
        <h3 className="card-title text-base">
          {character.charName}
          <span className="text-xs font-normal text-base-content/50">{character.engName}</span>
        </h3>
        <p className="text-xs text-base-content/50 mb-2">{character.type}</p>

        <div className="w-full space-y-1.5">
          <StatBar label="速度" value={character.speed} delay={index * 0.1} />
          <StatBar label="力量" value={character.power} delay={index * 0.1 + 0.1} />
          <StatBar label="技巧" value={character.skill} delay={index * 0.1 + 0.2} />
        </div>

        <p className="text-xs text-base-content/60 mt-3 line-clamp-2">
          {character.description}
        </p>
      </div>
    </motion.div>
  );
};

export default CharacterCard;
