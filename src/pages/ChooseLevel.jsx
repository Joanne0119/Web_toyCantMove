import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from "framer-motion";
import LazyImage from '@/components/LazyImage';

const levels = [
  { name: "玩具紙箱", sceneName: "4_Toybox", image: "/images/toyboxLevel.png", inputType: "gyro", disable: false },
  { name: "塗鴉畫紙", sceneName: "4_ColorPaper", image: "/images/tableLevel.png", inputType: "gyro", disable: false },
  { name: "瘋狂餐桌", sceneName: "4_TapEat", image: "/images/foodLevel.png", inputType: "tap", disable: false },
  { name: "數學考卷", sceneName: "4_SpyGame", image: "/images/foodLevel.png", inputType: "spy", disable: false },
];

const CARD_WIDTH_PERCENT = 65; // 卡片佔容器寬度的百分比
const GAP = 12;

const ChooseLevel = () => {
  const { nickname, players, level, setLevel, webRTC, peerId, hostId, gameScene, screenWakeLock, totalPlayerCount } = useGame();
  const navigate = useNavigate();
  const isHost = peerId === hostId;
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const cardWidth = containerWidth * (CARD_WIDTH_PERCENT / 100);
  const sidePadding = (containerWidth - cardWidth) / 2;

  const currentSelectedLevel = levels[currentIndex];
  const isSpyLocked = currentSelectedLevel.inputType === 'spy' && totalPlayerCount < 4;

  useEffect(() => {
    if (screenWakeLock) {
      screenWakeLock.request();
    }
  }, [screenWakeLock]);

  useEffect(() => {
    if (gameScene === 'Tutorial' && isHost) {
      navigate('/tutorial');
    }
  }, [gameScene, isHost, navigate]);

  useEffect(() => {
    if (gameScene === 'ReturnToLobby') {
      navigate('/waiting-room');
    }
  }, [gameScene, navigate]);

  // 取得容器寬度
  useEffect(() => {
    if (!scrollRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  // 同步非房主的選擇
  useEffect(() => {
    if (level?.sceneName) {
      const idx = levels.findIndex(l => l.sceneName === level.sceneName);
      if (idx !== -1 && idx !== currentIndex) {
        setCurrentIndex(idx);
        scrollToIndex(idx);
      }
    }
  }, [level?.sceneName]);

  const scrollToIndex = useCallback((index) => {
    if (!scrollRef.current || !cardWidth) return;
    const scrollTarget = index * (cardWidth + GAP);
    scrollRef.current.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  }, [cardWidth]);

  // 偵測滾動位置更新 currentIndex（debounce 防止抖動）
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let timer;
    const onScroll = () => {
      if (!cardWidth) return;
      const index = Math.round(el.scrollLeft / (cardWidth + GAP));
      const clamped = Math.max(0, Math.min(index, levels.length - 1));
      setCurrentIndex(clamped);

      // debounce 選關卡，等滾動穩定後才發送
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (isHost && !levels[clamped].disable) {
          selectLevel(levels[clamped]);
        }
      }, 200);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, [cardWidth, isHost]);

  const paginate = (dir) => {
    const newIndex = currentIndex + dir;
    if (newIndex < 0 || newIndex >= levels.length) return;
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
    if (isHost && !levels[newIndex].disable) {
      selectLevel(levels[newIndex]);
    }
  };

  const selectLevel = (selectedLevel) => {
    if (!isHost || selectedLevel.disable) return;
    setLevel(selectedLevel);

    const selectLevelMessage = {
      type: "select_level",
      level: selectedLevel.sceneName
    };
    webRTC.sendData(JSON.stringify(selectLevelMessage), null);
    console.log("Sent select_level:", selectedLevel.sceneName);
  };

  const handleCardClick = (index) => {
    setCurrentIndex(index);
    scrollToIndex(index);
    if (isHost && !levels[index].disable) {
      selectLevel(levels[index]);
    }
  };

  const handleStartGame = () => {
    if (level) {
      const startGameMessage = {
        type: "start_game",
        levelName: level.name
      };
      webRTC.sendData(JSON.stringify(startGameMessage), null);
    } else {
      alert('Please select a level');
    }
  };

  const handleLeave = () => {
    webRTC.disconnect();
    navigate('/enter-name');
  };

  return (
    <div className="hero min-h-screen bg-base-200 safe-area-bottom select-none" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center', minHeight: '100dvh' }}>
      <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
      <div className="hero-content text-center">
        <motion.div
          className="card bg-base-100 shadow-xl w-80 max-w-[90vw]"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 15,
            duration: 0.8
          }}
        >
          <div className="card-body p-4">
            <h2 className="card-title text-base justify-center">
              {isHost ? '請選擇遊戲場景' : '等待房主選擇關卡...'}
            </h2>

            {/* 卡片輪播區 */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto py-3 -mx-4"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                gap: `${GAP}px`,
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              <style>{`
                .choose-level-scroll::-webkit-scrollbar { display: none; }
              `}</style>
              {/* 前方 spacer，確保第一張能置中 */}
              <div className="flex-shrink-0" style={{ width: `${sidePadding - GAP}px` }} />
              {levels.map((l, i) => (
                <div
                  key={l.sceneName}
                  onClick={() => handleCardClick(i)}
                  className="flex-shrink-0 transition-all duration-300 cursor-pointer choose-level-scroll"
                  style={{
                    scrollSnapAlign: 'center',
                    width: `${cardWidth}px`,
                    transform: i === currentIndex ? 'scale(1.05)' : 'scale(0.78)',
                    opacity: i === currentIndex ? 1 : 0.4,
                  }}
                >
                  <div className={`card bg-base-200 shadow-md rounded-xl overflow-hidden relative ${level?.name === l.name ? 'ring-2 ring-primary' : ''
                    }`}>
                    <figure>
                      <LazyImage
                        src={l.image}
                        alt={l.name}
                        className="w-full aspect-video object-cover"
                        style={{ filter: l.disable ? 'grayscale(90%)' : 'none' }}
                      />
                    </figure>
                    <div className="p-2 text-center">
                      <h3 className="font-bold text-sm">{l.name}</h3>
                    </div>
                    {l.disable && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                        <img src="/images/ComingSoon.png" alt="coming soon" className="h-18" style={{ rotate: '-20deg', filter: 'grayscale(100%) brightness(200%)' }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* 尾部 spacer，確保最後一張能滾到中間 */}
              <div className="flex-shrink-0" style={{ width: `${sidePadding - GAP}px` }} />
            </div>

            {/* 圓點指示器 + 左右箭頭 */}
            <div className="flex justify-center items-center gap-3 mb-2">
              <button
                onClick={() => paginate(-1)}
                disabled={currentIndex === 0}
                className="btn btn-circle btn-ghost btn-xs disabled:opacity-20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <div className="flex gap-2">
                {levels.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleCardClick(i)}
                    className={`rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-primary w-5 h-2' : 'bg-base-300 w-2 h-2'
                      }`}
                  />
                ))}
              </div>
              <button
                onClick={() => paginate(1)}
                disabled={currentIndex === levels.length - 1}
                className="btn btn-circle btn-ghost btn-xs disabled:opacity-20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            {/* 按鈕區 */}

            <div className="card-actions justify-center">
              <div className="flex flex-col space-y-2 w-full">
                {isHost ? (
                  <motion.button
                    whileTap={!isSpyLocked ? { scale: 0.9 } : {}}
                    onClick={handleStartGame}
                    className="btn btn-primary btn-sm w-full"
                    disabled={isSpyLocked}
                  >
                    {/* 🌟 3. UI 顯示現在人數 */}
                    {isSpyLocked ? `人數不足 (目前:${totalPlayerCount}/4人)` : '開始遊戲'}
                  </motion.button>
                ) : null}
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleLeave} className="btn btn-ghost btn-sm">
                  離開房間
                </motion.button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChooseLevel;
