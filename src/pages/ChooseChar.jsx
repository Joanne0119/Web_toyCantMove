import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from "framer-motion";

const characters = [
  { name: 'red', speed: 8, power: 10, skill: 7, src: '/images/red.png', pinSrc: '/images/redPin.png' },
  { name: 'blue', speed: 10, power: 6, skill: 9, src: '/images/blue.png', pinSrc: '/images/bluePin.png' },
  { name: 'yellow', speed: 7, power: 9, skill: 8, src: '/images/yellow.png', pinSrc: '/images/yellowPin.png' },
  { name: 'green', speed: 8, power: 10, skill: 7, src: '/images/green.png', pinSrc: '/images/greenPin.png' },
];

const ringColorMap = {
  red: 'ring-red-600/50',
  blue: 'ring-blue-600/50',
  yellow: 'ring-yellow-600/50',
  green: 'ring-green-600/50',
};

const ChooseChar = () => {
  const { nickname, setCharacter, webRTC, gyroscope, connectionStatus, screenWakeLock } = useGame();
  const [selectedChar, setSelectedChar] = useState(characters[0]);
  const navigate = useNavigate();

  const { isConnected: isWebRTCConnected, connect: connectWebRTC, disconnect: disconnectWebRTC } = webRTC;
  const { isSupported: isGyroscopeSupported, init: initGyroscope } = gyroscope;

  // Handle character selection
  const handleSelectChar = (char) => {
    setSelectedChar(char);
  };

  // Handle confirmation
  const handleConfirm = useCallback(async () => {
    try {
      await screenWakeLock.request();
      console.log('Wake Lock enabled');

      setCharacter(selectedChar);

      navigate('/waiting-room');
    } catch (err) {
      console.error('Failed to enable Wake Lock or connect:', err);
    }
  }, [screenWakeLock.request,, setCharacter, selectedChar, navigate]);

  return (
    <div className="hero min-h-screen bg-base-200 overflow-x-hidden select-none" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
      <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
      <div className="hero-content text-center">
        <div className="max-w-lg">
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
              <h2 className="card-title">哈囉！{nickname}，請選擇角色</h2>
              <div className="flex flex-col items-center my-4">
                <div className="avatar online">
                  <div className={`w-48 h-48 rounded-full ${ringColorMap[selectedChar.name]} ring-4 ring-offset-base-100 ring-offset-2 flex justify-center items-center overflow-hidden`}>
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedChar.name}
                        src={selectedChar.src}
                        alt={selectedChar.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-xs object-contain"
                      />
                    </AnimatePresence>
                  </div>
                </div>
                <div className="text-2xl font-bold capitalize mt-4">{selectedChar.name}</div>
                <div className="stats bg-transparent mt-2">
                  <div className="stat">
                    <div className="stat-title">速度</div>
                    <div className="stat-value">{selectedChar.speed}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">力量</div>
                    <div className="stat-value">{selectedChar.power}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">技巧</div>
                    <div className="stat-value">{selectedChar.skill}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-3 mb-6">
                {characters.map((char) => (
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    key={char.name}
                    className={`avatar cursor-pointer ${selectedChar.name === char.name ? `ring ${ringColorMap[char.name]} ring-offset-base-100 ring-offset-2 rounded-full` : ''}`}
                    onClick={() => handleSelectChar(char)}
                  >
                    <div className="w-16 rounded-full">
                      <img src={char.src} alt={char.name}/>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="card-actions justify-center">
                {!connectionStatus ? 
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleConfirm}
                  className="btn btn-primary text-base"
                  disabled={connectionStatus} // Disable if already connected
                >
                  確定
                </motion.button>
                :
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {navigate('/waiting-room');}}
                  className="btn btn-primary text-base"
                  disabled={ !connectionStatus} 
                >
                  下一步
                </motion.button>
                }
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={disconnectWebRTC}
                  className="btn btn-error text-base"
                  disabled={!connectionStatus} // Disable if not connected
                >
                  斷線
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChooseChar;
