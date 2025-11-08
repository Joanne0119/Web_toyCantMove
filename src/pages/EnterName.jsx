import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from "framer-motion";
import { useFullscreen } from '../hooks/useFullScreen';

const EnterName = () => {
  const [name, setName] = useState('');
  const { setNickname } = useGame();
  const navigate = useNavigate();
  const [isFullscreen, toggleFullscreen] = useFullscreen(null);

  const handleSubmit = async () => {
    if (name.trim()) {
      if (!isFullscreen) {
        try {
          await toggleFullscreen(); 
        } catch (err) {
          console.warn("Error toggling fullscreen: due to iOS device restrictions", err.message);
        }
      }
      setNickname(name.trim());
      navigate('/choose-char');
    } else {
      alert('Please enter a nickname');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" data-theme="dark" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center'}}>
      <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
      <div className="text-center mb-8">
        <motion.div
          className="absolute top-0 left-0 w-full h-full 
             bg-no-repeat bg-contain
             bg-[url('/images/gameTitle-mobile.png')] 
            lg:bg-[url('/images/gameTitle.png')]"
          style={{ backgroundPosition: 'left 47% top 30%' }}
          // style={{ backgroundImage: "url('/images/gameTitle.png')", backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", backgroundPosition: 'left 47% top 30%' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",   // 用彈簧模擬的動畫
            stiffness: 120,   // 彈性
            damping: 15,      // 阻尼 (越小越彈)
            duration: 0.8,
            delay: 0.5
          }}
        />

        <motion.div 
          className="absolute top-0 left-0 w-full h-full" 
          style={{ backgroundImage: "url('/images/legos.png')", backgroundSize: "cover", backgroundPosition: "right 43% bottom 50%"}}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",   // 用彈簧模擬的動畫
            stiffness: 120,   // 彈性
            damping: 15,      // 阻尼 (越小越彈)
            duration: 0.8,
            delay: 0.3
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-full h-full"
            style={{
              backgroundImage: "url('/images/legos.png')",
              backgroundSize: "cover",
              backgroundPosition: "right 43% bottom 50%"
            }}
          />
        </motion.div>
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          style={{ backgroundImage: "url('/images/character.png')", backgroundSize: "cover", backgroundPosition: "right 53% bottom 50%" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",   // 用彈簧模擬的動畫
            stiffness: 120,   // 彈性
            damping: 10,      // 阻尼 (越小越彈)
            duration: 1.0
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-full h-full"
            style={{ backgroundImage: "url('/images/character.png')", backgroundSize: "cover", backgroundPosition: "right 53% bottom 50%" }}
          />
        </motion.div>
      </div>
      <motion.div 
        className="card max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl shadow-xl bg-base-200 translate-y-30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",   // 用彈簧模擬的動畫
          stiffness: 120,   // 彈性
          damping: 15,      // 阻尼 (越小越彈)
          duration: 0.8,
          delay: 0.8
        }}
      >
        <div className="card-body">
          <div className="form-control">
            <label className="label select-none">
              <span className="label-text text-base">請輸入您的暱稱</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="取個名字吧！"
              className="input input-bordered mt-3 text-base"
            />
          </div>
          <div className="form-control mt-6 flex justify-center text-base">
            <button onClick={handleSubmit} className="btn btn-primary">
              確定
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnterName;
