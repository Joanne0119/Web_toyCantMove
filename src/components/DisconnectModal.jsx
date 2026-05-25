import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const COUNTDOWN_SECONDS = 30;
const CIRCLE_SIZE = 80;
const STROKE_WIDTH = 5;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const DisconnectModal = () => {
  const navigate = useNavigate();
  const { unityDisconnected, setGameScene, gameScene } = useGame();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  // 不在遊戲流程中（Lobby / Awards）不顯示
  const shouldShow = unityDisconnected && gameScene !== 'Lobby' && gameScene !== 'Awards';

  useEffect(() => {
    if (!shouldShow) return;

    setCountdown(COUNTDOWN_SECONDS);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [shouldShow]);

  // 倒數結束時跳轉
  useEffect(() => {
    if (shouldShow && countdown === 0) {
      setGameScene('Lobby');
      navigate('/enter-name');
    }
  }, [countdown, shouldShow, navigate, setGameScene]);

  const handleNavigateNow = () => {
    setGameScene('Lobby');
    navigate('/enter-name');
  };

  if (!shouldShow) return null;

  // 圓環進度：從滿到空
  const progress = countdown / COUNTDOWN_SECONDS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
        {/* 圓環倒數 */}
        <div className="flex justify-center mb-4">
          <div className="relative" style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
            <svg
              width={CIRCLE_SIZE}
              height={CIRCLE_SIZE}
              className="transform -rotate-90"
            >
              {/* 背景圓環 */}
              <circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth={STROKE_WIDTH}
                className="text-base-300"
              />
              {/* 倒數圓環 */}
              <circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                className="text-warning"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            {/* 中間秒數 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{countdown}</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold mb-2">連線已中斷</h3>
        <p className="text-base-content/70 mb-4">
          與遊戲主機的連線已斷開，{countdown} 秒後將自動返回首頁
        </p>
        <button
          onClick={handleNavigateNow}
          className="btn btn-primary w-full"
        >
          立即返回
        </button>
      </div>
    </div>
  );
};

export default DisconnectModal;
