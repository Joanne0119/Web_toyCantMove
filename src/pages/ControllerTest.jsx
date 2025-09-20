import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from "framer-motion";

const ControllerTest = () => {
  const navigate = useNavigate();
  const { webRTC, gyroscope, connectionStatus, gyroscopeStatus } = useGame();

  const { connect: connectWebRTC, sendData: sendWebRTCData } = webRTC;
  const {
    init: initGyroscope,
    calibrate: calibrateGyroscope,
  } = gyroscope;

  const {
    isSupported,
    isCalibrated,
    isInitialized,
    direction,
    coordinates,
    error: gyroscopeError,
  } = gyroscopeStatus;

  const handleInitWebRTC = useCallback(async () => {
    const websocketUrl = 'wss://server-for-toy-cant-move.onrender.com';
    await connectWebRTC(websocketUrl, false, false); // 只用數據通道
  }, [connectWebRTC]);

  useEffect(() => {
    if (connectionStatus && isCalibrated) {
      const vector = { x: coordinates.x, y: coordinates.y }; // 直接用 coordinates 作為向量
      const msg = JSON.stringify({ type: 'move', vector }); // 匹配 Playing.jsx 的格式
      sendWebRTCData(msg, null); // null 表示廣播到所有 peer（遊戲端）
      console.log('Sent gyroscope move:', vector); // 除錯
    }
  }, [coordinates, connectionStatus, isCalibrated, sendWebRTCData]);

  const handleInitGyroscope = useCallback(async () => {
    if (!isSupported) {
      alert('您的設備不支援陀螺儀，或未提供完整的感應器數據。');
      return;
    }
    await initGyroscope();
  }, [initGyroscope, isSupported]);

  const handleCalibrateGyroscope = useCallback(async () => {
    await calibrateGyroscope();
  }, [calibrateGyroscope]);

  const handleStartGame = () => {
    navigate('/playing');
  };

  return (
    <div className="hero min-h-screen bg-base-200" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
      <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
      <div className="hero-content text-center">
        <div className="max-w-md">
          <motion.h1 
            className="text-4xl font-bold"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",   // 用彈簧模擬的動畫
              stiffness: 120,   // 彈性
              damping: 15,      // 阻尼 (越小越彈)
              duration: 0.8
            }}
          >
              控制器測試
          </motion.h1>

          {/* WebRTC Section */}
          <motion.div 
            className="card bg-base-100 shadow-xl mt-8 mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",   // 用彈簧模擬的動畫
              stiffness: 120,   // 彈性
              damping: 15,      // 阻尼 (越小越彈)
              duration: 0.8,
              delay: 0.15
            }}
          >
            <div className="card-body items-center text-center">
              <h2 className="card-title">連線控制</h2>
              <p>連線狀態: <span className="font-bold">{connectionStatus ? '已連線' : '未連線'}</span></p>
              <div className="flex gap-2 mt-4">
                <button onClick={handleInitWebRTC} className="btn btn-primary" disabled={connectionStatus}>
                  連線
                </button>
              </div>
            </div>
          </motion.div>

          {/* Gyroscope Section */}
          <motion.div
            className="card bg-base-100 shadow-xl mt-8 mb-4"
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
            <div className="card-body items-center text-center">
              <h2 className="card-title">陀螺儀控制</h2>
              {gyroscopeError && <div className="alert alert-error">錯誤: {gyroscopeError.msg}</div>}
              {!isSupported && <div className="alert alert-warning">您的設備可能不支援陀螺儀。</div>}
              <div className="flex gap-2 mt-4">
                <button onClick={handleInitGyroscope} className="btn btn-primary" disabled={!isSupported}>
                  {isInitialized ? '感測器已啟用' : (isSupported ? '啟用感測器' : '不支援')}
                </button>
                <button onClick={handleCalibrateGyroscope} className="btn btn-primary" disabled={!isInitialized}>
                  {isCalibrated ? '重新校正' : '校正'}
                </button>
              </div>
              <p className="mt-4">目前座標: <span className="font-bold">({coordinates.x.toFixed(2)}, {coordinates.y.toFixed(2)})</span></p>
              <p>目前方向: <span className="font-bold">{direction}</span></p>
              <p>校正狀態: <span className="font-bold">{isCalibrated ? '已校正' : '未校正'}</span></p>
            </div>
          </motion.div>

          <motion.div
            className="card-actions justify-center mt-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",   // 用彈簧模擬的動畫
              stiffness: 120,   // 彈性
              damping: 15,      // 阻尼 (越小越彈)
              duration: 0.8,
              delay: 0.6
            }}
          >
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleStartGame} className="btn btn-primary">
              準備開始
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ControllerTest;
