import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <section
      id="hero"
      className="relative w-full h-screen overflow-hidden"
    >
      {/* Background image + blur overlay (same as EnterName) */}
      <div
        className="absolute inset-0 bg-cover"
        style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundPosition: "left 47% center" }}
      >
        <div className="absolute inset-0" style={{ backdropFilter: 'blur(1px) saturate(80%)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-base-100/60 via-base-100/30 to-base-100/80" />
      </div>

      {/* Game title background layer - spring pop-in (delay 0.5s, same as EnterName) */}
      <motion.div
        className="absolute inset-0 bg-contain bg-no-repeat z-[1]"
        style={{
          backgroundImage: isMobile
            ? "url('/images/gameTitle-mobile.png')"
            : "url('/images/gameTitle.png')",
          backgroundPosition: "left 47% top 30%",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 15,
          duration: 0.8,
          delay: 0.5,
        }}
      />

      {/* Character background layer - spring pop-in (no delay, same as EnterName) + breathing */}
      <motion.div
        className="absolute inset-0 z-[2]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 10,
          duration: 1.0,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-full h-full bg-cover bg-no-repeat"
          style={{ backgroundImage: "url('/images/character.png')", backgroundPosition: "right 53% bottom 50%" }}
        />
      </motion.div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full text-center px-4 pb-36">
        <motion.img
          src="/images/teamLogo.png"
          alt="Team Logo"
          className="w-16 sm:w-18 md:w-20 mb-3 drop-shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 15,
            duration: 0.8,
            delay: 0.9,
          }}
        />
        <motion.p
          className="text-base-content/80 text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl font-medium drop-shadow-sm"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 15,
            duration: 0.8,
            delay: 0.8,
          }}
        >
          一款結合體感操控的多人派對遊戲
        </motion.p>
        <motion.div
          className="flex gap-4"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 15,
            duration: 0.8,
            delay: 1.0,
          }}
        >
          <button
            onClick={() => navigate('/enter-name')}
            className="btn btn-primary btn-lg shadow-xl"
          >
            開始遊戲
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('about');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="btn btn-outline btn-lg"
          >
            了解更多
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-base-content/50">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
