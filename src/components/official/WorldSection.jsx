import React from 'react';
import { motion } from 'framer-motion';

const WorldSection = () => {
  return (
    <section id="world" className="relative py-24 overflow-hidden">
      {/* Parallax background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/coverLarge.png')" }}
      >
        <div className="absolute inset-0 bg-base-100/75 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-center mb-12"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          玩具的世界
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Story text */}
          <motion.div
            className="space-y-5"
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-base-content/80 leading-relaxed text-lg">
              在一個你看不見的角落，玩具們有著自己的生活。每當房間的燈熄滅，他們便開始動了起來。
            </p>
            <p className="text-base-content/70 leading-relaxed">
              發條玩具「沃寶」是這裡最有力量的存在，總是保護著身邊的夥伴。速度飛快的「冒冒」喜歡在紙箱之間穿梭冒險。聰明的小老鼠「雷米」總能找到最巧妙的路線。忠誠的「菲菲」從不落下任何一個朋友。優雅的「夢鹿」則在月光下翩翩起舞。
            </p>
            <p className="text-base-content/70 leading-relaxed">
              他們的世界充滿了色彩——從堆滿回憶的玩具紙箱，到充滿創意的塗鴉畫紙，每一個場景都是一段新的故事。而當天亮時，他們又會回到原來的位置，假裝什麼都沒發生過。
            </p>
            <p className="text-base-content/60 leading-relaxed italic">
              因為⋯⋯不會動的玩具，才正常吧？
            </p>
          </motion.div>

          {/* Character ensemble image */}
          <motion.div
            className="flex justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <img
                src="/images/character.png"
                alt="玩具角色們"
                className="w-full max-w-md h-auto drop-shadow-2xl rounded-xl"
              />
              {/* Postcard frame overlay */}
              <div className="absolute -bottom-4 -right-4 -left-4 -top-4 pointer-events-none opacity-30">
                <img
                  src="/images/postcard_frame_top.png"
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WorldSection;
