import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from "framer-motion";

// const mockPlayers = [
//   { name: '黃小姿', avatar: '/images/green.png' },
//   { name: '爆香怪人', avatar: '/images/red.png' },
//   { name: '柳橙恩', avatar: '/images/yellow.png' },
// ];

const WaitingRoom = () => {
  const {
    nickname,
    character,
    players,
    setPlayers,
    peerId,
    hostId,
    gameScene,
    webRTC,
    gyroscope,
    connectionStatus,
    screenWakeLock
  } = useGame();

  const { dataChannelConnections, sendData } = webRTC;
  
  const navigate = useNavigate();

  const isHost = peerId === hostId;
  
  const hasAttemptedConnection = useRef(false);
  const hasSentIdentify = useRef(false);

  // screen wake lock
  useEffect(() => {
    if (screenWakeLock) {
      screenWakeLock.request();
    }
  }, [screenWakeLock]); 

  useEffect(() => {
    if (character && dataChannelConnections && dataChannelConnections.length > 0 && !hasSentIdentify.current) {
      
      hasSentIdentify.current = true;

      const identityMessage = {
        type: "identify",
        characterName: character.name, 
        nickname: nickname
      };
      
      sendData(JSON.stringify(identityMessage), null);

      console.log('Data Channel is open. Sent identity to Unity:', identityMessage);
    }
  }, [dataChannelConnections, character, nickname, sendData]);

  useEffect(() => {
    if (gameScene === 'Tutorial' && !isHost) { 
      navigate('/tutorial');
    }
  }, [gameScene, isHost, navigate]);

  
  useEffect(() => {
    const connectAll = async () => {
      try {
        const websocketUrl = 'wss://server-for-toy-cant-move.onrender.com';
        
        const connectionResult = await webRTC.connect(websocketUrl, true, false);
        
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
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
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