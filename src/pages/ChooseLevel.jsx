import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from "framer-motion";

const levels = [
  { name: "玩具紙箱", image: "/images/toyboxLevel.png", disable: false },
  { name: "書桌探險", image: "/images/tableLevel.png", disable: true },
  { name: "凌亂床鋪", image: "/images/bedLevel.png", disable: true }
];

const ChooseLevel = () => {
  const { nickname, players, level, setLevel, webRTC, peerId, hostId, gameScene, screenWakeLock } = useGame();
  const navigate = useNavigate();
  const isHost = peerId === hostId;

  // screen wake lock
  useEffect(() => {
    if (screenWakeLock) {
      screenWakeLock.request();
    }
  }, [screenWakeLock]); 
  
  useEffect(() => {
    if (gameScene === 'Tutorial' && isHost) {
      navigate('/tutorial'); 
    }
  }, [gameScene, isHost, navigate]);

  const handleSelectLevel = (selectedLevel) => {
    if (isHost && !selectedLevel.disable) {
      setLevel(selectedLevel);
    }
  };

  const handleStartGame = () => {
    if (level) {
      const startGameMessage = {
        type: "start_game",
        levelName: level.name 
      };
      webRTC.sendData(JSON.stringify(startGameMessage), null); 
      
    } else {
      alert('Please select a level');
    }
  };

  const handleLeave = () => {
    webRTC.disconnect();
    navigate('/');
  };

  return (
    <div className="hero min-h-screen bg-base-200 select-none" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
      <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
      <div className="hero-content text-center">
        {/* <div className="max-w-lg"> */}
          <motion.div 
            className="card bg-base-100 shadow-xl mt-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",   // 用彈簧模擬的動畫
              stiffness: 120,   // 彈性
              damping: 15,      // 阻尼 (越小越彈)
              duration: 0.8
            }}
          >
            <div className="card-body">
              <h2 className="card-title">{isHost ? '請選擇遊戲場景' : '等待房主選擇關卡...'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                {levels.map((l) => (
                  <motion.div 
                    whileTap={isHost && !l.disable ? { scale: 0.95 } : false}
                    key={l.name}
                    className={`card bg-base-200 shadow-md cursor-pointer relative ${level?.name === l.name ? 'ring ring-primary' : ''} ${l.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${!isHost && 'cursor-default'}`}
                    onClick={() => handleSelectLevel(l)}
                    style={{
                      pointerEvents: l.disable ? 'none' : 'auto' 
                    }}
                  >
                    <figure><img src={l.image} alt={l.name} className="w-60 object-cover" style={{ filter: l.disable ? 'grayscale(90%)' : 'none' }}/></figure>
                    <div className="card-body p-4 items-center text-center">
                      <h2 className="card-title">{l.name}</h2>
                    </div>
                    {l.disable && (
                      <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
                        <img src="/images/ComingSoon.png" alt="comming soon" className="h-18" style={{ rotate: '-20deg', filter: ' grayscale(100%) brightness(200%)' }}/>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="card-actions justify-center">
                <div className="flex flex-col space-y-2 w-full">
                  {isHost ? (
                    <motion.button whileTap={{ scale: 0.9 }} onClick={handleStartGame} className="btn btn-primary text-base">
                      開始遊戲
                    </motion.button>
                  ) : null}
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleLeave} className="btn btn-ghost">
                    離開房間
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        {/* </div> */}
      </div>
    </div>
  );
};

export default ChooseLevel;