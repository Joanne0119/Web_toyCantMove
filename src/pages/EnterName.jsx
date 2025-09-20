import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from "framer-motion";

const EnterName = () => {
  const [name, setName] = useState('');
  const { setNickname } = useGame();
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (name.trim()) {
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
        {/* <h1 className="text-4xl font-bold">不會動的玩具<br/>才正常吧</h1> */}
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
            animate={{ scale: [1, 1.01, 1] }}
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
          style={{ backgroundImage: "url('/images/character.png')", backgroundSize: "cover", backgroundPosition: "right 46% bottom 50%" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",   // 用彈簧模擬的動畫
            stiffness: 120,   // 彈性
            damping: 15,      // 阻尼 (越小越彈)
            duration: 0.8
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-full h-full"
            style={{ backgroundImage: "url('/images/character.png')", backgroundSize: "cover", backgroundPosition: "right 46% bottom 50%" }}
          />
        </motion.div>
      </div>
      <motion.div 
        className="card max-w-sm shadow-xl bg-base-200 translate-y-35"
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
            <label className="label">
              <span className="label-text">請輸入您的暱稱</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="某某某"
              className="input input-bordered mt-3"
            />
          </div>
          <div className="form-control mt-6 flex justify-center">
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
