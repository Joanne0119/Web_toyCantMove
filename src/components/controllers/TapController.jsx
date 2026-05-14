import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const TAP_COOLDOWN = 50; // 防抖冷卻 (ms)

const TapController = () => {
  const navigate = useNavigate();
  const { webRTC, connectionStatus, screenWakeLock, unityPeerId, localPlayer } = useGame();
  const { lastMessage, sendData: sendWebRTCData } = webRTC;

  const [isEating, setIsEating] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const lastTapTimeRef = useRef(0);
  const lastProcessedTimestamp = useRef(0);

  // Screen wake lock
  useEffect(() => {
    if (screenWakeLock) {
      screenWakeLock.request();
    }
  }, [screenWakeLock]);

  // 監聽 Unity 訊息（terminate 等）
  useEffect(() => {
    if (lastMessage && lastMessage.timestamp > lastProcessedTimestamp.current) {
      lastProcessedTimestamp.current = lastMessage.timestamp;
      try {
        const data = JSON.parse(lastMessage.message);
        if (data.type === 'terminate') {
          navigate('/award');
        }
      } catch (e) {}
    }
  }, [lastMessage, navigate]);

  // 處理點擊
  const handleTap = useCallback((e) => {
    e.preventDefault();

    const now = Date.now();
    if (now - lastTapTimeRef.current < TAP_COOLDOWN) return;
    lastTapTimeRef.current = now;

    // 吃東西動畫
    setIsEating(true);
    setTimeout(() => setIsEating(false), 150);

    // 閃光回饋
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 80);

    // 發送給 Unity
    if (connectionStatus) {
      const msg = JSON.stringify({ type: 'tap_action' });
      sendWebRTCData(msg, unityPeerId || null);
    }
  }, [connectionStatus, sendWebRTCData, unityPeerId]);

  // 綁定全螢幕點擊
  useEffect(() => {
    document.addEventListener('touchstart', handleTap, { passive: false });
    document.addEventListener('mousedown', handleTap);

    return () => {
      document.removeEventListener('touchstart', handleTap);
      document.removeEventListener('mousedown', handleTap);
    };
  }, [handleTap]);

  const avatarSrc = localPlayer.color
    ? `/images/${localPlayer.color}_${localPlayer.avatar || 'wind-up'}.png`
    : `/images/gray_${localPlayer.avatar || 'wind-up'}.png`;

  return (
    <div
      className="relative w-screen h-screen flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        backgroundImage: "url('/images/coverLarge.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'left 47% center',
        minHeight: '100dvh',
      }}
    >
      {/* 背景濾鏡 */}
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(1px) saturate(80%)' }} />

      {/* 點擊閃光回饋 */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="absolute inset-0 bg-white/20 z-20 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>

      {/* 角色 + 盤子 */}
      <div className="relative z-10 flex flex-col items-center">
        {/* 角色 */}
        <motion.img
          src={avatarSrc}
          alt="角色"
          className="w-36 h-36 object-contain drop-shadow-lg"
          animate={isEating
            ? { scale: [1, 1.25, 0.9, 1], y: [0, -10, 5, 0] }
            : { scale: 1, y: 0 }
          }
          transition={{ duration: 0.15 }}
        />

        {/* 盤子 */}
        <div className="w-48 h-12 bg-white/80 rounded-[50%] shadow-lg -mt-4" />

        <motion.p
          className="text-lg text-base-content/60 drop-shadow-sm mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          點擊螢幕吃東西！
        </motion.p>
      </div>
    </div>
  );
};

export default TapController;
