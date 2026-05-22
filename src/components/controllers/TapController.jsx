import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const TAP_THRESHOLD = 10;    // 移動距離 < 10px 算點擊
const SWIPE_THRESHOLD = 50;  // 移動距離 > 50px 算滑動丟棄
const TAP_COOLDOWN = 50;

const TapController = () => {
  const navigate = useNavigate();
  const { webRTC, connectionStatus, screenWakeLock, unityPeerId, localPlayer } = useGame();
  const { lastMessage, sendData: sendWebRTCData } = webRTC;

  const [isEating, setIsEating] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const lastTapTimeRef = useRef(0);
  const lastProcessedTimestamp = useRef(0);

  // 觸控追蹤（用 Map 追蹤每隻手指，避免多指快速點擊誤判為滑動）
  const touchMapRef = useRef(new Map());
  const mouseStartRef = useRef(null);

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

  // 發送吃東西
  const sendTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < TAP_COOLDOWN) return;
    lastTapTimeRef.current = now;

    setIsEating(true);
    setTimeout(() => setIsEating(false), 150);

    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 80);

    if (connectionStatus) {
      sendWebRTCData(JSON.stringify({ type: 'tap_action' }), unityPeerId || null);
    }
  }, [connectionStatus, sendWebRTCData, unityPeerId]);

  // 發送丟棄
  const sendDiscard = useCallback(() => {
    setIsDiscarding(true);
    setTimeout(() => setIsDiscarding(false), 300);

    if (connectionStatus) {
      sendWebRTCData(JSON.stringify({ type: 'discard_action' }), unityPeerId || null);
    }
  }, [connectionStatus, sendWebRTCData, unityPeerId]);

  // 觸控事件：每隻手指各自追蹤
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      touchMapRef.current.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const start = touchMapRef.current.get(touch.identifier);
      touchMapRef.current.delete(touch.identifier);
      if (!start) continue;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < TAP_THRESHOLD) {
        sendTap();
      } else if (distance > SWIPE_THRESHOLD) {
        sendDiscard();
      }
    }
  }, [sendTap, sendDiscard]);

  // 滑鼠事件（桌機測試用）
  const handleMouseDown = useCallback((e) => {
    mouseStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback((e) => {
    if (!mouseStartRef.current) return;
    const dx = e.clientX - mouseStartRef.current.x;
    const dy = e.clientY - mouseStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < TAP_THRESHOLD) {
      sendTap();
    } else if (distance > SWIPE_THRESHOLD) {
      sendDiscard();
    }
    mouseStartRef.current = null;
  }, [sendTap, sendDiscard]);

  // 綁定事件
  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleTouchStart, handleTouchEnd, handleMouseDown, handleMouseUp]);

  const avatarSrc = localPlayer.color
    ? `/images/${localPlayer.color}_${localPlayer.avatar || 'wind-up'}Pin.png`
    : `/images/gray_${localPlayer.avatar || 'wind-up'}Pin.png`;

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

      {/* 丟棄回饋（紅色閃光） */}
      <AnimatePresence>
        {isDiscarding && (
          <motion.div
            className="absolute inset-0 bg-red-500/20 z-20 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* 盤子 + 角色 */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="relative flex items-center justify-center"
          animate={
            isDiscarding
              ? { x: [0, -20, 20, -10, 10, 0], rotate: [0, -5, 5, -3, 3, 0] }
              : isEating
                ? { scale: [1, 1.15, 0.92, 1] }
                : { scale: 1, x: 0, rotate: 0 }
          }
          transition={{ duration: isDiscarding ? 0.3 : 0.15 }}
        >
          {/* 盤子 */}
          <div className="w-64 h-64 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center border-4 border-base-300/30">
            <div className="w-48 h-48 rounded-full bg-base-200/40 flex items-center justify-center">
              {/* 角色 Pin */}
              <img
                src={avatarSrc}
                alt="角色"
                className="w-28 h-28 object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </motion.div>

        <div className="mt-6 text-center">
          <motion.p
            className="text-lg text-base-content/60 drop-shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            點擊吃東西 · 滑動丟棄
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default TapController;
