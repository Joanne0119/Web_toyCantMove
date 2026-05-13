import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const COUNTDOWN_SECONDS = 10;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-base-100 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
        <div className="text-4xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mx-auto text-warning">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
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
