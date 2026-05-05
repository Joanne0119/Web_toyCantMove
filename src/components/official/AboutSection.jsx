import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Users, ToyBrick } from 'lucide-react';

const fadeInUp = {
  hidden: { y: 60, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const cards = [
  { Icon: Smartphone, title: '體感互動', desc: '拿起你的手機，傾斜、旋轉、搖晃——用最直覺的方式操控你的玩具角色。不需要按鍵，你的身體就是控制器。' },
  { Icon: Users, title: '多人派對', desc: '最好玩的遊戲，總是和朋友一起。透過手機即時連線，在同一個畫面上展開歡樂的競爭與合作。' },
  { Icon: ToyBrick, title: '玩具世界', desc: '走進一個充滿想像力的玩具世界，每個角色都有自己的故事和個性。在紙箱、畫紙和床鋪上展開冒險。' },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4 sm:px-8 lg:px-16 bg-base-100">
      <motion.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        variants={fadeInUp}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          遊戲理念
        </h2>
        <p className="text-base-content/60 text-center mb-12 max-w-2xl mx-auto">
          在玩具的世界裡，不會動的才是正常的...對吧？
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              className="card bg-base-200 shadow-md hover:shadow-xl transition-shadow duration-300"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="card-body items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <card.Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="card-title text-lg">{card.title}</h3>
                <p className="text-base-content/70 text-sm">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AboutSection;
