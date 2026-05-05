import React from 'react';
import { motion } from 'framer-motion';
import { characters } from '@/constants/officialData';
import CharacterCard from './CharacterCard';

const CharactersSection = () => {
  return (
    <section id="characters" className="py-20 px-4 sm:px-8 lg:px-16 bg-base-200/50">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          選擇你的角色
        </h2>
        <p className="text-base-content/60 text-center mb-12 max-w-xl mx-auto">
          五個個性鮮明的玩具角色，各有獨特的能力值。將滑鼠移到角色上，看看他們的真面目！
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {characters.map((char, i) => (
            <CharacterCard key={char.id} character={char} index={i} />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default CharactersSection;
