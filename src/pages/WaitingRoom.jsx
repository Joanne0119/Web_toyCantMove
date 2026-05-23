import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Timer } from 'lucide-react';
import LazyImage from '@/components/LazyImage';

const WaitingRoom = () => {
  const {
    localPlayer,
    otherPlayers,
    setPlayers,
    peerId,
    hostId,
    gameScene,
    webRTC,
    gyroscope,
    connectionStatus,
    screenWakeLock,
    unityPeerId,
    resetGameState,
    setGameScene
  } = useGame();

  const { dataChannelConnections, sendData } = webRTC;

  const navigate = useNavigate();

  const isHost = peerId === hostId;

  const hasAttemptedConnection = useRef(false);
  const hasSentIdentify = useRef(false);
  const [showNoGameModal, setShowNoGameModal] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState(false);

  // Check if Unity game is running (peerId in URL)
  useEffect(() => {
    if (!unityPeerId) {
      setShowNoGameModal(true);
    }
  }, [unityPeerId]);

  // Connection timeout: if connected to server but no Unity data channel after 15s
  useEffect(() => {
    if (!connectionStatus || !unityPeerId) return;

    const timer = setTimeout(() => {
      const isConnectedToUnity = dataChannelConnections.includes(unityPeerId);
      if (!isConnectedToUnity) {
        setConnectionTimeout(true);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [connectionStatus, unityPeerId, dataChannelConnections]);

  // Clear timeout state if Unity connects
  useEffect(() => {
    if (unityPeerId && dataChannelConnections.includes(unityPeerId)) {
      setConnectionTimeout(false);
    }
  }, [dataChannelConnections, unityPeerId]);

  // screen wake lock
  useEffect(() => {
    if (screenWakeLock) {
      screenWakeLock.request();
    }
  }, [screenWakeLock]);

  useEffect(() => {
    if (gameScene === 'Tutorial' && !isHost) {
      navigate('/tutorial');
    }
  }, [gameScene, isHost, navigate]);

  // Unity 按 ESC 或重玩回到大廳 → 已經在 WaitingRoom，重置 gameScene
  useEffect(() => {
    if (gameScene === 'ReturnToLobby') {
      setGameScene('Lobby');
    }
  }, [gameScene]);


  useEffect(() => {
    const connectAll = async () => {
      try {
        const websocketUrl = 'wss://server-for-toy-cant-move.onrender.com';

        const connectionResult = await webRTC.connect(websocketUrl, true, false);

        if (!connectionResult) {
          throw new Error('連線失敗 (connectionResult is false)');
        }

        console.log('Successfully connected as', localPlayer.name);

      } catch (error) {
        navigate('/error', { state: { message: error.message } });
      }
    };

    if (!localPlayer.avatar || !webRTC) {
      return;
    }
    if (!connectionStatus && !hasAttemptedConnection.current) {

      hasAttemptedConnection.current = true;

      connectAll();
    }

  }, [localPlayer.avatar, webRTC, connectionStatus, navigate, gyroscope]);


  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleNext = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmNext = () => {
    setShowConfirmModal(false);
    navigate('/choose-level');
  };

  const handleLeave = () => {
    hasAttemptedConnection.current = true; // 防止 disconnect 後 useEffect 又觸發 connect
    webRTC.disconnect();
    resetGameState();
    navigate('/enter-name');
  };

  const allPlayers = [localPlayer, ...otherPlayers].filter(p => p && p.name);

  return (
    <div className="hero min-h-screen bg-base-200 safe-area-bottom select-none" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center', minHeight: '100dvh'}}>
      <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
      <div className="hero-content text-center">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
          <motion.div
            className="card bg-base-100 shadow-xl mt-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 15,
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
                  <p className="text-center">以 {localPlayer.name || '...'} 的身份加入...</p>
                </div>
              ) : (
                <div>
                  <h2 className="card-title">等待玩家進入...</h2>
                  <div className="space-y-3 mt-4">
                    {allPlayers.map((player) => (
                      <div key={player.id} className="flex items-center bg-base-200 p-2 rounded-lg ">
                        <div className="avatar mr-4">
                          <div className="w-14 rounded-full">
                            <LazyImage
                              src={player.color ? `/images/${player.color}_${player.avatar}.png` : `/images/gray_${player.avatar}.png`}
                              alt={player.name}
                            />
                          </div>
                        </div>
                        <span className="text-lg">{player.name} </span>
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

      {/* Modal: 確認所有人都加入了 */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              className="card bg-base-100 shadow-2xl mx-4 max-w-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="card-body items-center text-center">
                <h3 className="card-title text-lg">確認開始</h3>
                <p className="text-sm text-base-content/70 mt-2">
                  所有人都加入了嗎？開始後無法再加入新玩家。
                </p>
                <div className="card-actions mt-4 w-full flex flex-col gap-2">
                  <button onClick={handleConfirmNext} className="btn btn-primary w-full">
                    確定，開始遊戲
                  </button>
                  <button onClick={() => setShowConfirmModal(false)} className="btn btn-ghost w-full">
                    再等一下
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: No Unity game detected */}
      <AnimatePresence>
        {showNoGameModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="card bg-base-100 shadow-2xl mx-4 max-w-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
            >
              <div className="card-body items-center text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Gamepad2 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="card-title text-lg">請先開啟遊戲</h3>
                <p className="text-sm text-base-content/70 mt-2">
                  請先在電腦上開啟遊戲主程式，再透過遊戲畫面上的 QR Code 掃碼加入。
                </p>
                <div className="card-actions mt-4 w-full">
                  <button
                    onClick={() => { hasAttemptedConnection.current = true; webRTC.disconnect(); resetGameState(); navigate('/enter-name'); }}
                    className="btn btn-primary btn-block"
                  >
                    返回首頁
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Connection timeout */}
      <AnimatePresence>
        {connectionTimeout && !showNoGameModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="card bg-base-100 shadow-2xl mx-4 max-w-sm"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
            >
              <div className="card-body items-center text-center">
                <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center mb-2">
                  <Timer className="w-7 h-7 text-warning" />
                </div>
                <h3 className="card-title text-lg">連線逾時</h3>
                <p className="text-sm text-base-content/70 mt-2">
                  無法連接到遊戲主程式，請確認電腦上的遊戲是否已開啟。
                </p>
                <div className="card-actions mt-4 w-full flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setConnectionTimeout(false);
                      hasAttemptedConnection.current = false;
                    }}
                    className="btn btn-primary btn-block"
                  >
                    重新連線
                  </button>
                  <button
                    onClick={() => { hasAttemptedConnection.current = true; webRTC.disconnect(); resetGameState(); navigate('/enter-name'); }}
                    className="btn btn-ghost btn-block"
                  >
                    返回首頁
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaitingRoom;
