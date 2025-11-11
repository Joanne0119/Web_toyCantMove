import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import DinoGame from '@/components/DinoGame.jsx';

const Tutorial = () => {
  const navigate = useNavigate();
  const { webRTC, gyroscope, connectionStatus, gyroscopeStatus, screenWakeLock } = useGame();
  const { init: initGyroscope, calibrate: calibrateGyroscope, isSupported } = gyroscope;
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
    const initSuccess = await initGyroscope();
    
    if (initSuccess) {
      setInstructionText('請平放手機，校正中...');
      await calibrateGyroscope();
    } else {
      setInstructionText('權限被拒絕，無法開始教學');
    }
    setIsSensorSetupInProgress(false);
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
      
      sendWebRTCData(JSON.stringify(calibratedMessage), null);
      console.log("Gyro not supported. Sent 'tutorial_step_complete: calibrate' message.");
    }
  }, [gyroSupported, dataChannelConnections, sendWebRTCData]);

  // screen wake lock
    useEffect(() => {
        if (screenWakeLock) {
        screenWakeLock.request();
        }
    }, [screenWakeLock]); 

  // 監聽 Unity 發來的訊息
  useEffect(() => {
    if (lastMessage && lastMessage.timestamp > lastProcessedTimestamp.current) {
      lastProcessedTimestamp.current = lastMessage.timestamp;
      try {
        const msg = JSON.parse(lastMessage.message);
        
        // 如果收到教學指示
        if (msg.type === 'tutorial_instruction') {
          const stepName = msg.step;
          if (gyroSupported === false) {
            // (不支援的玩家)
            const cheatVector = cheatVectors[stepName];

            if (cheatVector) {
              setInstructionText('等待其他玩家...');
              setCompletedSteps(prev => ({ ...prev, [stepName]: true }));
              const cheatMessage = { type: "move", vector: cheatVector };
              sendWebRTCData(JSON.stringify(cheatMessage), null);
              
              console.log(`Gyro not supported. Cheating step '${stepName}' with vector:`, cheatVector);
            }

          } else if (gyroSupported === true) {
            // (支援的玩家)
            setCurrentStep(msg.step);
            setInstructionText(msg.message || stepInstructions[msg.step]);
          }
        }
        
        // 如果收到「進入遊戲」的指令
        if (msg.type === 'navigate_to_game') {
          navigate('/tutorial');
        }
        if (msg.type === 'navigate_to_playing') {
          navigate('/playing'); 
        }
      } catch (e) {
        console.error('Parse tutorial message error:', e);
      }
    }
  }, [lastMessage, navigate, gyroSupported, sendWebRTCData,  cheatVectors]);

  // 持續發送傾斜數據給 Unity
  useEffect(() => {
    // 只在支援、連線、校正、啟用的狀態下才發送
    if (gyroSupported === true && connectionStatus && isCalibrated && isInitialized) {
      const vector = { x: coordinates.x, y: coordinates.y };
      const msg = JSON.stringify({ type: 'move', vector });
      webRTC.sendData(msg, null);
    }
  }, [coordinates, connectionStatus, isCalibrated, isInitialized, webRTC, gyroSupported]);

  // --- 渲染邏輯 (4 種狀態) ---

  // 狀態 1: 正在檢查
  if (gyroSupported === null) {
    return (
      <div className="hero min-h-screen bg-base-200" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
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
      <div className="hero min-h-screen bg-base-200" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
        <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center z-10 card bg-base-100 shadow-xl mt-8">
            <div className="card-body">
                <h1 className="text-4xl font-bold text-base mb-4">控制器教學</h1>
                <p className="text-base text-lg mb-8">{instructionText}</p>
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSetupSensors}
                    className="btn btn-primary btn-lg"
                    disabled={isSensorSetupInProgress}
                >
                    {isSensorSetupInProgress ? (
                        <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                        '啟用與校正'
                    )}
                </motion.button>
            </div>
        </motion.div>
      </div>
    );
  }

  // 狀態 3: 不支援陀螺儀 (顯示專屬等待畫面)
  if (gyroSupported === false) {
    return (
      <div className="hero min-h-screen bg-base-200" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
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
          <DinoGame />
          <p className="text-sm">等待時可以玩個小遊戲！</p>
        </motion.div>
      </div>
    );
  }

  // 狀態 4: 支援並已校正 (教學中)
  if (gyroSupported === true && isInitialized) {
    return (
      <div className="hero min-h-screen bg-base-200 overflow-x-hidden select-none" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
        <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
        
        <div className="card bg-base-100 shadow-xl mt-8 mb-8 z-10">
        <div className="card-body items-center text-center">
            <motion.div
                key={instructionText}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center mb-8"
            >
                <h1 className="text-4xl font-bold text-base mb-4">
                {instructionText}
                </h1>
            </motion.div>

            <motion.div
                className="w-38 h-38 bg-base/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8"
                animate={{
                rotateZ: 
                    currentStep === 'forward' ? -15 :
                    currentStep === 'backward' ? 15 :
                    currentStep === 'left' ? 15 :
                    currentStep === 'right' ? -15 : 0
                }}
                transition={{ duration: 0.5 }}
            >
                <div className="w-24 h-32 bg-base rounded-2xl shadow-2xl flex items-center justify-center">
                <span className="text-6xl">📱</span>
                </div>
            </motion.div>

            <div className="flex gap-4 mb-8">
                {['forward', 'left', 'right', 'backward'].map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                    <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${currentStep === step ? 'ring-4 ring-gray-100' : ''}
                    ${completedSteps[step] ? 'bg-green-500' : 'bg-base/30'}
                    `}>
                    {completedSteps[step] ? (
                        <span className="text-2xl">✓</span>
                    ) : (
                        <span className="text-base font-bold">{index + 1}</span>
                    )}
                    </div>
                    <span className="text-base text-xs mt-2">
                    {step === 'forward' ? '向前' :
                    step === 'left' ? '向左' :
                    step === 'right' ? '向右' : '向後'}
                    </span>
                </div>
                ))}
            </div>        
            
            <div className="text-base p-4 items-center text-center mb-4">
                <div>
                  <p>當前座標: ({coordinates.x.toFixed(2)}, {coordinates.y.toFixed(2)})</p>
                  <p>校正狀態: {isCalibrated ? '✅ 已校正' : '❌ 未校正'}</p>
                </div>
                <p>連線狀態: {connectionStatus ? '✅ 已連線' : '❌ 未連線'}</p>
            </div>
        </div>
      </div>
      </div>
    );
  }

  // Fallback (理論上不應該執行到這裡)
  return null; 
};  

export default Tutorial;