import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from "framer-motion";

const mockPlayers = [
  { name: '黃小姿', avatar: '/images/green.png' },
  { name: '爆香怪人', avatar: '/images/red.png' },
  { name: '柳橙恩', avatar: '/images/yellow.png' },
];

const WaitingRoom = () => {
  const {
    nickname,
    character,
    players,
    setPlayers,
    webRTC,
    gyroscope,
    connectionStatus
  } = useGame();
  
  const navigate = useNavigate();
  const isHost = players.length > 0 && players[0].name === nickname;
  
  const hasAttemptedConnection = useRef(false);

  useEffect(() => {
    if (!nickname || !character) {
      navigate('/');
      return; 
    }
    
    setPlayers([{ name: nickname, avatar: character.src }, ...mockPlayers]);
  
  }, [nickname, character, setPlayers, navigate]); 
  
  useEffect(() => {
    const connectAll = async () => {
      try {
        // if (gyroscope.isSupported()) {
        //   await gyroscope.init();
        // }

        const websocketUrl = 'wss://server-for-toy-cant-move.onrender.com';
        
        console.log('Attempting to connect...'); // 除錯日誌
        const connectionResult = await webRTC.connect(websocketUrl, false, true);
        
        if (!connectionResult) {
          throw new Error('連線失敗 (connectionResult is false)');
        }

        console.log('Successfully connected as', character.name);

      } catch (error) {
        navigate('/error', { state: { message: error.message } });
      }
    };

    if (!character || !webRTC) {
      return;
    }
    if (!connectionStatus && !hasAttemptedConnection.current) {

      hasAttemptedConnection.current = true;
      
      connectAll();
    }
    
  }, [character, webRTC, connectionStatus, navigate, gyroscope]); 


  const handleNext = () => {
    navigate('/choose-level');
  };

  const handleLeave = () => {
    webRTC.disconnect();
    navigate('/');
  };

  return (
    <div className="hero min-h-screen bg-base-200" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center'}}>
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
              {!connectionStatus ? (
                <div>
                  <h2 className="card-title justify-center">正在連線至伺服器...</h2>
                  <div className="flex justify-center my-4">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                  <p className="text-center">以 {character?.name || '...'} 的身份加入...</p>
                </div>
              ) : (
                <div>
                  <h2 className="card-title">等待玩家進入...</h2>
                  <div className="space-y-3 mt-4">
                    {players.map((player, index) => (
                      <div key={index} className="flex items-center bg-base-200 p-2 rounded-lg ">
                        <div className="avatar mr-4">
                          <div className="w-14 rounded-full">
                            <img src={player.avatar} alt={player.name} />
                          </div>
                        </div>
                        <span className="text-lg">{player.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="card-actions justify-center mt-6">
                    <div className="flex flex-col space-y-2 w-full">
                      {isHost ? (
                        <button onClick={handleNext} className="btn btn-primary">
                          下一步
                        </button>
                      ) : (
                        <p className='text-center'>等待房主開始遊戲...</p>
                      )}
                      <button onClick={handleLeave} className="btn btn-ghost">
                        離開房間
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;