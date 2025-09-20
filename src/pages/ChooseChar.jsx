import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from "framer-motion";

const characters = [
  { name: 'red', speed: 8, power: 10, skill: 7, src: '/images/red.png' },
  { name: 'blue', speed: 10, power: 6, skill: 9, src: '/images/blue.png' },
  { name: 'yellow', speed: 7, power: 9, skill: 8, src: '/images/yellow.png' },
  { name: 'green', speed: 8, power: 10, skill: 7, src: '/images/green.png' },
];

const ChooseChar = () => {
  const { nickname, setCharacter, webRTC, gyroscope, connectionStatus } = useGame();
  const [selectedChar, setSelectedChar] = useState(characters[0]);
  const navigate = useNavigate();

  const { isConnected: isWebRTCConnected, connect: connectWebRTC, disconnect: disconnectWebRTC } = webRTC;
  const { isSupported: isGyroscopeSupported, init: initGyroscope } = gyroscope;

  // Handle character selection
  const handleSelectChar = (char) => {
    setSelectedChar(char);
  };

  // Handle confirmation
  const handleConfirm = useCallback(() => {
    // Save the selected character
    setCharacter(selectedChar);
    // Navigate to the waiting room if everything is successful
    navigate('/waiting-room');
  }, [ navigate, selectedChar, setCharacter]);

  return (
    <div className="hero min-h-screen bg-base-200 overflow-x-hidden" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
      <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
      <div className="hero-content text-center">
        <div className="max-w-md">
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
              <h2 className="card-title">你好，{nickname}，請選擇角色</h2>
              <div className="flex flex-col items-center my-4">
                <div className="avatar online">
                  <div className="w-48 h-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 flex justify-center items-center overflow-hidden">
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
                  <div
                    key={char.name}
                    className={`avatar cursor-pointer ${selectedChar.name === char.name ? 'ring ring-primary ring-offset-base-100 ring-offset-2 rounded-full' : ''}`}
                    onClick={() => handleSelectChar(char)}
                  >
                    <div className="w-16 rounded-full">
                      <img src={char.src} alt={char.name}/>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-actions justify-center">
                <button
                  onClick={handleConfirm}
                  className="btn btn-primary"
                  disabled={connectionStatus} // Disable if already connected
                >
                  確定
                </button>
                <button
                  onClick={disconnectWebRTC}
                  className="btn btn-warning"
                  disabled={!connectionStatus} // Disable if not connected
                >
                  斷線
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChooseChar;
