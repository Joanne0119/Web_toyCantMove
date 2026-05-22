import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react';
import DinoGame from '@/components/DinoGame.jsx';

const stepVideos = {
  calibrate: '/videos/calibrate.mp4',
  forward: '/videos/forward.mp4',
  left: '/videos/left.mp4',
  right: '/videos/right.mp4',
  backward: '/videos/backward.mp4',
  default: '/videos/idle.mp4'
};

const Tutorial = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { webRTC, gyroscope, connectionStatus, gyroscopeStatus, screenWakeLock, unityPeerId, localPlayer, gameScene, level } = useGame();
  const { init: initGyroscope, calibrate: calibrateGyroscope, isSupported } = gyroscope;
  const inputType = level?.inputType || 'gyro';
  const { lastMessage, sendData: sendWebRTCData, dataChannelConnections } = webRTC;
  const { coordinates, isCalibrated, isInitialized } = gyroscopeStatus;

  // Tutorial 狀態
  const [currentStep, setCurrentStep] = useState('');
  const [instructionText, setInstructionText] = useState('正在檢查設備...');
  const [completedSteps, setCompletedSteps] = useState({
    forward: false,
    left: false,
    right: false,
    backward: false
  });

  const [gyroSupported, setGyroSupported] = useState(null);
  const [isSensorSetupInProgress, setIsSensorSetupInProgress] = useState(false);
  const [skippedTutorial, setSkippedTutorial] = useState(false);
  const [nonGyroCountdown, setNonGyroCountdown] = useState(3);
  const nonGyroCompletedRef = useRef(false);
  const [tapCount, setTapCount] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const TAP_REQUIRED = 4;
  const SWIPE_REQUIRED = 1;
  const touchStartRef = useRef(null);
  const TAP_THRESHOLD = 10;
  const SWIPE_THRESHOLD = 50;

  const hasSentCalibratedRef = useRef(false);

  const lastProcessedTimestamp = useRef(0);

  // 步驟對應的中文說明
  const stepInstructions = {
    forward: '請向前傾斜手機',
    left: '請向左傾斜手機',
    right: '請向右傾斜手機',
    backward: '請向後傾斜手機',
    complete: '太棒了！訓練完成！'
  };

  const cheatVectors = {
    forward: { x: 0, y: -1 },
    backward: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const handleSetupSensors = useCallback(async () => {
    setIsSensorSetupInProgress(true);
    setInstructionText('正在允許感測器權限...');
    try {
      const initSuccess = await initGyroscope();

      if (initSuccess) {
        setInstructionText('請平放手機，校正中...');
        await calibrateGyroscope();
      } else {
        setInstructionText('權限被拒絕，無法開始教學');
        setGyroSupported(false);
      }
    } catch (error) {
      console.error("Sensor setup failed:", error);
      setGyroSupported(false);
    } finally {
      setIsSensorSetupInProgress(false);
    }
  }, [initGyroscope, calibrateGyroscope]);

  useEffect(() => {
    const checkSupport = () => {
      const supported = isSupported();
      setGyroSupported(supported);

      if (!supported) {
        setInstructionText('設備不支援陀螺儀，等待其他玩家...');

        // fake calibrated message to skip tutorial
        // const calibratedMessage = { type: "calibrated" };
        // sendWebRTCData(JSON.stringify(calibratedMessage), null);
        // console.log("Gyro not supported. Sent 'calibrated' message to Unity to start skip flow.");
      }
    };
    // make a small delay to ensure isSupported() works correctly
    const timer = setTimeout(checkSupport, 100);
    return () => clearTimeout(timer);

  }, [isSupported]);

  useEffect(() => {
    // 只有陀螺儀關卡 + 不支援陀螺儀的設備才自動跳過
    if (inputType !== 'gyro') return;
    if (
      gyroSupported === false &&
      dataChannelConnections &&
      dataChannelConnections.length > 0 &&
      !hasSentCalibratedRef.current
    ) {
      hasSentCalibratedRef.current = true;

      const calibratedMessage = {
        type: "tutorial_step_complete",
        step: "calibrate"
      };

      sendWebRTCData(JSON.stringify(calibratedMessage), unityPeerId || null);
      console.log("Gyro not supported. Sent 'tutorial_step_complete: calibrate' message.");
    }
  }, [inputType, gyroSupported, dataChannelConnections, sendWebRTCData, unityPeerId]);

  // screen wake lock
  useEffect(() => {
    if (screenWakeLock) {
      screenWakeLock.request();
    }
  }, [screenWakeLock]);

  // 監聽 gameScene 變化
  useEffect(() => {
    if (gameScene === 'Playing') {
      navigate('/playing');
    }
    if (gameScene === 'ReturnToLobby') {
      navigate('/waiting-room');
    }
  }, [gameScene, navigate]);


  // 監聽 Unity 發來的訊息
  useEffect(() => {
    if (lastMessage && lastMessage.timestamp > lastProcessedTimestamp.current) {
      lastProcessedTimestamp.current = lastMessage.timestamp;
      try {
        const msg = JSON.parse(lastMessage.message);

        // 如果收到教學指示
        if (msg.type === 'tutorial_instruction') {
          const stepName = msg.step;

          // tap 教學：收到 backward 指令時切換到滑動步驟
          if (inputType === 'tap' && stepName === 'backward') {
            setUnityRequestedSwipe(true);
          }

          if (gyroSupported === false || skippedTutorial) {
            // (不支援的玩家 或 已略過教學)
            const cheatVector = cheatVectors[stepName];

            if (cheatVector) {
              setInstructionText('等待其他玩家...');
              setCompletedSteps(prev => ({ ...prev, [stepName]: true }));
              const cheatMessage = { type: "move", vector: cheatVector };
              sendWebRTCData(JSON.stringify(cheatMessage), unityPeerId || null);

              console.log(`Skipping step '${stepName}' with vector:`, cheatVector);
            }

          } else if (gyroSupported === true) {
            // (支援的玩家)
            setCurrentStep(msg.step);
            setInstructionText(msg.message || stepInstructions[msg.step]);
          }
        }

        // 如果收到「進入遊戲」的指令
        if (msg.type === 'navigate_to_game') {
          sendWebRTCData(JSON.stringify({ type: "navigate_ack", target: "tutorial" }), unityPeerId || null);
          navigate('/tutorial');
        }
        if (msg.type === 'navigate_to_playing') {
          sendWebRTCData(JSON.stringify({ type: "navigate_ack", target: "playing" }), unityPeerId || null);
          navigate('/playing');
        }
      } catch (e) {
        console.error('Parse tutorial message error:', e);
      }
    }
  }, [lastMessage, navigate, gyroSupported, skippedTutorial, sendWebRTCData, unityPeerId]);

  // 持續發送傾斜數據給 Unity
  useEffect(() => {
    // 只在支援、連線、校正、啟用的狀態下才發送
    if (gyroSupported === true && connectionStatus && isCalibrated && isInitialized) {
      const vector = { x: coordinates.x, y: coordinates.y };
      const msg = JSON.stringify({ type: 'move', vector });
      webRTC.sendData(msg, null);
    }
  }, [coordinates, connectionStatus, isCalibrated, isInitialized, webRTC, gyroSupported]);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.muted = true;

      const playPromise = videoElement.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("自動播放被瀏覽器阻擋:", error);
        });
      }
    }
  }, [currentStep]);

  // --- 渲染邏輯 ---

  // 非陀螺儀關卡：顯示簡短教學 + 3 秒倒數
  const tutorialInfo = {
    tap: { title: '瘋狂餐桌', desc: '快速點擊螢幕來吃東西！' },
    shake: { title: '搖動賽跑', desc: '上下搖動手機來前進！' },
    count: { title: '數數挑戰', desc: '數數看有幾隻角色跑過去！' },
    spy: { title: '抓出內鬼', desc: '考驗你的演技與推理能力！' }
  };

  // 非陀螺儀關卡的完成邏輯
  // tap 類型：點擊 N 下完成；其他類型：3 秒倒數自動完成
  useEffect(() => {
    if (inputType === 'gyro' || inputType === 'tap' || inputType === 'spy' || nonGyroCompletedRef.current) return;
    const timer = setInterval(() => {
      setNonGyroCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!nonGyroCompletedRef.current) {
            nonGyroCompletedRef.current = true;
            const msg = { type: "tutorial_step_complete", step: "calibrate" };
            sendWebRTCData(JSON.stringify(msg), unityPeerId || null);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [inputType, sendWebRTCData, unityPeerId]);

  // tap 類型：點擊 + 滑動都完成才送完成訊息
  const tapDoneRef = useRef(false);
  const swipeDoneRef = useRef(false);
  const [unityRequestedSwipe, setUnityRequestedSwipe] = useState(false); // 等 Unity 發 backward 指令才進入滑動步驟

  const handleTapPractice = useCallback(() => {
    if (tapDoneRef.current) return;
    setTapCount(prev => {
      const next = prev + 1;
      if (next >= TAP_REQUIRED) {
        tapDoneRef.current = true;
        // 點擊完成 → 送 right
        const msg = { type: "tutorial_step_complete", step: "right" };
        sendWebRTCData(JSON.stringify(msg), unityPeerId || null);
      }
      return next;
    });
  }, [sendWebRTCData, unityPeerId]);

  const handleSwipePractice = useCallback(() => {
    if (swipeDoneRef.current || !tapDoneRef.current || !unityRequestedSwipe) return; // 要先完成點擊且收到 Unity 指令
    setSwipeCount(prev => {
      const next = prev + 1;
      if (next >= SWIPE_REQUIRED) {
        swipeDoneRef.current = true;
        nonGyroCompletedRef.current = true;
        // 滑動完成 → 送 backward
        const msg = { type: "tutorial_step_complete", step: "backward" };
        sendWebRTCData(JSON.stringify(msg), unityPeerId || null);
      }
      return next;
    });
  }, [sendWebRTCData, unityPeerId, unityRequestedSwipe]);

  // 教學用觸控事件（多指追蹤）
  const tutorialTouchMapRef = useRef(new Map());
  const tutorialMouseStartRef = useRef(null);

  const handleTutorialTouchStart = useCallback((e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      tutorialTouchMapRef.current.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
    }
  }, []);

  const handleTutorialTouchMove = useCallback((e) => {
    e.preventDefault(); // 阻止頁面滾動
  }, []);

  const handleTutorialTouchEnd = useCallback((e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const start = tutorialTouchMapRef.current.get(touch.identifier);
      tutorialTouchMapRef.current.delete(touch.identifier);
      if (!start) continue;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (!tapDoneRef.current || !unityRequestedSwipe) {
        // 步驟 1：任何觸碰都算點擊
        handleTapPractice();
      } else if (distance > SWIPE_THRESHOLD) {
        // 步驟 2：只有滑動才算
        handleSwipePractice();
      }
    }
  }, [handleTapPractice, handleSwipePractice, unityRequestedSwipe]);

  const handleTutorialMouseDown = useCallback((e) => {
    tutorialMouseStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleTutorialMouseUp = useCallback((e) => {
    if (!tutorialMouseStartRef.current) return;
    const dx = e.clientX - tutorialMouseStartRef.current.x;
    const dy = e.clientY - tutorialMouseStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!tapDoneRef.current || !unityRequestedSwipe) {
      handleTapPractice();
    } else if (distance > SWIPE_THRESHOLD) {
      handleSwipePractice();
    }
    tutorialMouseStartRef.current = null;
  }, [handleTapPractice, handleSwipePractice, unityRequestedSwipe]);

  // 用 document 綁定事件
  useEffect(() => {
    if (inputType !== 'tap') return;
    if (tapDoneRef.current && swipeDoneRef.current) return;

    document.addEventListener('touchstart', handleTutorialTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTutorialTouchMove, { passive: false });
    document.addEventListener('touchend', handleTutorialTouchEnd, { passive: false });
    document.addEventListener('mousedown', handleTutorialMouseDown);
    document.addEventListener('mouseup', handleTutorialMouseUp);

    return () => {
      document.removeEventListener('touchstart', handleTutorialTouchStart);
      document.removeEventListener('touchmove', handleTutorialTouchMove);
      document.removeEventListener('touchend', handleTutorialTouchEnd);
      document.removeEventListener('mousedown', handleTutorialMouseDown);
      document.removeEventListener('mouseup', handleTutorialMouseUp);
    };
  }, [inputType, handleTutorialTouchStart, handleTutorialTouchEnd, handleTutorialMouseDown, handleTutorialMouseUp]);

  // 非陀螺儀關卡也要監聯 navigate 訊息
  useEffect(() => {
    if (inputType === 'gyro') return;
    if (lastMessage && lastMessage.timestamp > lastProcessedTimestamp.current) {
      lastProcessedTimestamp.current = lastMessage.timestamp;
      try {
        const msg = JSON.parse(lastMessage.message);
        if (msg.type === 'navigate_to_playing') {
          sendWebRTCData(JSON.stringify({ type: "navigate_ack", target: "playing" }), unityPeerId || null);
          navigate('/playing');
        }
      } catch (e) { }
    }
  }, [inputType, lastMessage, navigate, sendWebRTCData, unityPeerId]);

  // tap 教學：點擊 + 滑動練習
  if (inputType === 'tap') {
    const tapDone = tapCount >= TAP_REQUIRED;
    const swipeDone = swipeCount >= SWIPE_REQUIRED;
    const isCompleted = tapDone && swipeDone;
    // 目前步驟：先點擊，完成後等 Unity 指令才進入滑動
    const currentTapStep = (tapDone && unityRequestedSwipe) ? 'swipe' : 'tap';
    return (
      <div
        className="relative w-screen h-screen flex flex-col items-center justify-center bg-base-200 safe-area-bottom select-none overflow-hidden"
        style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center', touchAction: 'none' }}
      >
        <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>

        <motion.div
          className="card bg-base-100 shadow-xl mt-4 mb-4 z-10"
          animate={(tapCount + swipeCount) > 0 ? { scale: [0.95, 1] } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          key={tapCount + swipeCount}
        >
          <div className="card-body items-center text-center p-4">
            <motion.div
              key={isCompleted ? 'done' : currentTapStep}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center mb-3"
            >
              <h1 className="text-2xl font-bold text-base mb-1">
                {isCompleted ? '完成！等待其他玩家...' : currentTapStep === 'swipe' ? '步驟 2：滑動丟棄！' : tapDone ? '等待其他玩家...' : '步驟 1：點擊吃東西！'}
              </h1>
            </motion.div>

            {/* 操作示意影片 */}
            <motion.div
              className="w-48 aspect-square bg-base-200/50 rounded-2xl overflow-hidden mb-2 shadow-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <video
                key={currentTapStep}
                src={currentTapStep === 'swipe' ? '/videos/swipe.mp4' : '/videos/tab.mp4'}
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* 根據步驟只顯示當前的練習進度 */}
            {currentTapStep === 'tap' && !tapDone ? (
              <div className="w-full mb-3">
                <p className="text-xs text-base-content/50 mb-1">點擊練習 {`${tapCount}/${TAP_REQUIRED}`}</p>
                <div className="flex gap-2 justify-center">
                  {Array.from({ length: TAP_REQUIRED }).map((_, i) => (
                    <motion.div
                      key={`tap-${i}`}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < tapCount ? 'bg-green-500 text-white' : 'bg-base-300/50'
                        }`}
                      animate={i === tapCount - 1 && tapCount > 0 ? { scale: [1.3, 1] } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      {i < tapCount ? '✓' : i + 1}
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : !isCompleted ? (
              <div className="w-full mb-3">
                <p className="text-xs text-base-content/50 mb-1">滑動練習 {`${swipeCount}/${SWIPE_REQUIRED}`}</p>
                <div className="flex gap-2 justify-center">
                  {Array.from({ length: SWIPE_REQUIRED }).map((_, i) => (
                    <motion.div
                      key={`swipe-${i}`}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < swipeCount ? 'bg-blue-500 text-white' : 'bg-base-300/50'
                        }`}
                      animate={i === swipeCount - 1 && swipeCount > 0 ? { scale: [1.3, 1] } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      {i < swipeCount ? '✓' : i + 1}
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 步驟指示器 */}
            <div className="flex gap-2 justify-center mb-2">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentTapStep === 'tap' && !isCompleted ? 'bg-primary w-5' : 'bg-green-500'}`} />
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentTapStep === 'swipe' && !isCompleted ? 'bg-primary w-5' : isCompleted ? 'bg-green-500' : 'bg-base-300'}`} />
            </div>

            {/* 狀態指示 */}
            <div className="flex items-center gap-3 text-xs text-base-content/50">
              <div className="flex items-center gap-1">
                {connectionStatus
                  ? <Wifi className="w-3.5 h-3.5 text-success" />
                  : <WifiOff className="w-3.5 h-3.5 text-error" />}
                <span>{connectionStatus ? '已連線' : '未連線'}</span>
              </div>
            </div>

            {!isCompleted && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!nonGyroCompletedRef.current) {
                    nonGyroCompletedRef.current = true;
                    setTapCount(TAP_REQUIRED);
                    setSwipeCount(SWIPE_REQUIRED);
                    const msg = { type: "tutorial_step_complete", step: "calibrate" };
                    sendWebRTCData(JSON.stringify(msg), unityPeerId || null);
                  }
                }}
                className="btn btn-ghost btn-xs text-base-content/30 mt-1"
              >
                略過教學
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ▼ 這是 Spy 教學介面 ▼
  if (inputType === 'spy') {
    const info = tutorialInfo[inputType];

    // 檢查是否已經收到 Unity 傳來的 complete 結束訊號
    const isCompleted = currentStep === 'complete';

    return (
      <div className="hero min-h-screen bg-base-200 safe-area-bottom select-none" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center', minHeight: '100dvh' }}>
        <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center z-10 card bg-base-100 shadow-xl mt-4 w-11/12 max-w-sm"
        >
          <div className="card-body p-6 items-center">
            <h1 className="text-2xl font-bold mb-2">{info.title}</h1>

            {/* 根據狀態改變提示文字 */}
            <p className="text-base mb-6 text-base-content/80">
              {isCompleted ? '教學結束，即將載入關卡...' : '請看大螢幕的規則說明'}
            </p>

            <motion.button
              whileTap={!isCompleted ? { scale: 0.95 } : {}}
              disabled={isCompleted} // 👈 核心修改：收到 complete 就鎖住按鈕
              onClick={(e) => {
                e.stopPropagation();
                if (isCompleted) return; // 雙重防呆

                // 發送切換下一頁的訊號給 Unity
                const msg = { type: "tutorial_spy_next" };
                sendWebRTCData(JSON.stringify(msg), unityPeerId || null);
              }}
              // 鎖住時套用半透明與 disabled 的樣式
              className={`btn btn-primary w-full h-20 text-xl rounded-2xl shadow-lg ${isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isCompleted ? '準備開始遊戲' : '下一頁 ❯'}
            </motion.button>

            <p className="text-xs text-base-content/40 mt-4">閱讀完規則，點擊下一步</p>
          </div>
        </motion.div>
      </div>
    );
  }


  // 其他非陀螺儀關卡（shake、count 等）：倒數自動完成
  if (inputType !== 'gyro') {
    const info = tutorialInfo[inputType] || { title: '準備開始', desc: '遊戲即將開始！' };

    return (
      <div className="hero min-h-screen bg-base-200 safe-area-bottom select-none" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center', minHeight: '100dvh' }}>
        <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center z-10 card bg-base-100 shadow-xl mt-4"
        >
          <div className="card-body p-6 items-center">
            <h1 className="text-2xl font-bold mb-2">{info.title}</h1>
            <p className="text-base mb-6">{info.desc}</p>

            {inputType === 'shake' && (
              <motion.div
                className="text-5xl mb-4"
                animate={{ y: [0, -15, 0, 15, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                📱
              </motion.div>
            )}

            {inputType === 'count' && (
              <motion.div
                className="text-5xl mb-4 font-bold text-primary"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                🔢
              </motion.div>
            )}

            <div className="text-4xl font-bold text-primary">
              {nonGyroCountdown > 0 ? nonGyroCountdown : '開始！'}
            </div>
            <p className="text-xs text-base-content/50 mt-2">等待其他玩家...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // 狀態 1: 正在檢查（陀螺儀關卡）
  if (gyroSupported === null) {
    return (
      <div className="hero min-h-screen bg-base-200 safe-area-bottom" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
        <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
        <div className="text-center z-10 card bg-base-100 shadow-xl p-8">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-lg mt-4">正在檢查設備...</p>
        </div>
      </div>
    );
  }

  // 狀態 2: 支援陀螺儀，但尚未啟用/校正
  if (gyroSupported === true && !isInitialized) {
    return (
      <div className="hero min-h-screen bg-base-200 safe-area-bottom" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
        <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center z-10 card bg-base-100 shadow-xl mt-4">
          <div className="card-body p-4">
            <h1 className="text-2xl font-bold text-base mb-2">控制器教學</h1>
            <p className="text-sm mb-4">{instructionText}</p>
            <motion.div
              className="w-48 aspect-square bg-base/10 rounded-2xl overflow-hidden mb-2 shadow-inner mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <video
                src={stepVideos.calibrate || stepVideos.default}
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                className="w-full h-full object-contain"
              />
            </motion.div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSetupSensors}
              className="btn btn-primary"
              disabled={isSensorSetupInProgress}
            >
              {isSensorSetupInProgress ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                '啟用與校正'
              )}
            </motion.button>
            <button
              onClick={() => {
                setSkippedTutorial(true);
                setInstructionText('等待其他玩家...');
                const calibratedMsg = { type: "tutorial_step_complete", step: "calibrate" };
                sendWebRTCData(JSON.stringify(calibratedMsg), unityPeerId || null);
              }}
              className="btn btn-ghost btn-xs text-base-content/30 mt-2"
            >
              略過教學
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 狀態 3: 不支援陀螺儀 (顯示專屬等待畫面)
  if (gyroSupported === false) {
    return (
      <div className="hero min-h-screen bg-base-200 safe-area-bottom" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
        <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center z-10 card bg-base-100 shadow-xl p-8 w-full px-4 max-w-md"
        >
          <h1 className="text-3xl font-bold text-base mb-4">
            設備不支援陀螺儀
          </h1>
          <p className="text-lg">
            請等待其他玩家完成 <span className="loading loading-dots loading-xs"></span>
          </p>
          <DinoGame playerColor={localPlayer.color || 'red'} />
          <p className="text-sm">等待時可以玩個小遊戲！</p>
        </motion.div>
      </div>
    );
  }

  // 狀態 4: 支援並已校正 (教學中)
  if (gyroSupported === true && isInitialized) {
    const videoSrc = stepVideos[currentStep] || stepVideos.default;
    return (
      <div className="hero min-h-screen bg-base-200 safe-area-bottom overflow-x-hidden select-none" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center', minHeight: '100dvh' }}>
        <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>

        <div className="card bg-base-100 shadow-xl mt-4 mb-4 z-10">
          <div className="card-body items-center text-center p-4">
            <motion.div
              key={instructionText}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center mb-3"
            >
              <h1 className="text-2xl font-bold text-base mb-1">
                {instructionText}
              </h1>
            </motion.div>

            <motion.div
              className="w-48 aspect-square bg-base/10 rounded-2xl overflow-hidden mb-2 shadow-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <video
                ref={videoRef}
                key={currentStep}
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                className="w-full h-full object-contain"
              />
            </motion.div>

            <div className="flex gap-3 mb-4">
              {['forward', 'left', 'right', 'backward'].map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${currentStep === step ? 'ring-4 ring-gray-100' : ''}
                    ${completedSteps[step] ? 'bg-green-500' : 'bg-base/30'}
                    `}>
                    {completedSteps[step] ? (
                      <span className="text-lg">✓</span>
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-xs mt-1">
                    {step === 'forward' ? '向前' :
                      step === 'left' ? '向左' :
                        step === 'right' ? '向右' : '向後'}
                  </span>
                </div>
              ))}
            </div>

            {/* 狀態指示 */}
            <div className="flex items-center gap-3 text-xs text-base-content/50">
              <div className="flex items-center gap-1">
                {connectionStatus
                  ? <Wifi className="w-3.5 h-3.5 text-success" />
                  : <WifiOff className="w-3.5 h-3.5 text-error" />}
                <span>{connectionStatus ? '已連線' : '未連線'}</span>
              </div>
              <span className="text-base-content/20">|</span>
              <div className="flex items-center gap-1">
                {isCalibrated
                  ? <CheckCircle className="w-3.5 h-3.5 text-success" />
                  : <XCircle className="w-3.5 h-3.5 text-error" />}
                <span>{isCalibrated ? '已校正' : '未校正'}</span>
              </div>
            </div>

            {/* 略過教學 */}
            {!skippedTutorial && (
              <button
                onClick={() => {
                  setSkippedTutorial(true);
                  setInstructionText('等待其他玩家...');
                  // 發送 calibrated 訊息讓 Unity 知道這個玩家略過
                  const calibratedMsg = { type: "tutorial_step_complete", step: "calibrate" };
                  sendWebRTCData(JSON.stringify(calibratedMsg), unityPeerId || null);
                }}
                className="btn btn-ghost btn-xs text-base-content/30 mt-2"
              >
                略過教學
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback (理論上不應該執行到這裡)
  return null;
};

export default Tutorial;
