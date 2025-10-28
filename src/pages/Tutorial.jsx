import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';

const Tutorial = () => {
  const navigate = useNavigate();
  const { webRTC, gyroscope, connectionStatus, gyroscopeStatus, screenWakeLock } = useGame();
  const { init: initGyroscope, calibrate: calibrateGyroscope } = gyroscope;
  const { isSupported } = gyroscope;
  const { lastMessage, sendData: sendWebRTCData } = webRTC;
  const { coordinates, isCalibrated, isInitialized } = gyroscopeStatus;

  // Tutorial 狀態
  const [currentStep, setCurrentStep] = useState('forward'); // forward, left, right, backward
  const [instructionText, setInstructionText] = useState('請向前傾斜手機');
  const [completedSteps, setCompletedSteps] = useState({
    forward: false,
    left: false,
    right: false,
    backward: false
  });

  // 步驟對應的中文說明
  const stepInstructions = {
    forward: '請向前傾斜手機',
    left: '請向左傾斜手機',
    right: '請向右傾斜手機',
    backward: '請向後傾斜手機',
    complete: '太棒了！訓練完成！'
  };

  const handleSetupSensors = useCallback(async () => {

    if (!isSupported()) {
      alert('您的設備不支援陀螺儀。');
      return;
    }
    // 更新 UI 提示
    setInstructionText('請允許感測器權限...');
    const initSuccess = await initGyroscope();
    
    if (initSuccess) {
      setInstructionText('請平放手機，校正中...');
      await calibrateGyroscope();
      // 校正成功後，useGyroscope 會自動將 isCalibrated 設為 true
      // 我們再發送一個 calibrated 訊息給 Unity
      const calibratedMessage = { type: "calibrated" };
      sendWebRTCData(JSON.stringify(calibratedMessage), null);
      console.log("Sent 'calibrated' message to Unity.");
    } else {
      setInstructionText('權限被拒絕，無法開始教學');
    }
  }, [initGyroscope, calibrateGyroscope, isSupported, sendWebRTCData]);


  // screen wake lock
    useEffect(() => {
        if (screenWakeLock) {
        screenWakeLock.request();
        }
    }, [screenWakeLock]); 

  // 監聽 Unity 發來的訊息
  useEffect(() => {
    if (lastMessage) {
      try {
        const msg = JSON.parse(lastMessage.message);
        
        // 如果收到教學指示
        if (msg.type === 'tutorial_instruction') {
          setCurrentStep(msg.step);
          setInstructionText(msg.message || stepInstructions[msg.step]);
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
  }, [lastMessage, navigate]);

  // 持續發送傾斜數據給 Unity
  useEffect(() => {
    if (connectionStatus && isCalibrated && isInitialized) {
      const vector = { x: coordinates.x, y: coordinates.y };
      const msg = JSON.stringify({ type: 'move', vector });
      webRTC.sendData(msg, null);
    }
  }, [coordinates, connectionStatus, isCalibrated, isInitialized, webRTC]);

  // 視覺化提示：根據當前步驟顯示不同顏色
  const getStepColor = (step) => {
    if (completedSteps[step]) return 'success';
    if (currentStep === step) return 'primary';
    return 'neutral';
  };

  return (
    <div className="hero min-h-screen bg-base-200 overflow-x-hidden select-none" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
      <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
      {!isInitialized ? (
        // --- 啟用前的畫面 ---
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center z-10 card bg-base-100 shadow-xl mt-8">
            <div className="card-body">
                <h1 className="text-4xl font-bold text-base mb-4">控制器教學</h1>
                <p className="text-base text-lg mb-8">首先，啟用並校正你的感測器。</p>
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSetupSensors}
                    className="btn btn-primary btn-lg"
                >
                    啟用與校正
                </motion.button>
            </div>
        </motion.div>
      ) : (
        <div>
        {/* 主要提示文字 */}
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
                <p className="text-base text-lg">
                等待所有玩家完成...
                </p>
            </motion.div>

            {/* 示意動畫區域 */}
            <motion.div
                className="w-64 h-64 bg-base/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8"
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

            {/* 步驟指示器 */}
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
            </div>
            {/* 當前傾斜數據顯示（除錯用） */}
            <div className="text-base p-4 items-center text-center mb-4">
                <p>當前座標: ({coordinates.x.toFixed(2)}, {coordinates.y.toFixed(2)})</p>
                <p>校正狀態: {isCalibrated ? '✅ 已校正' : '❌ 未校正'}</p>
                <p>連線狀態: {connectionStatus ? '✅ 已連線' : '❌ 未連線'}</p>
            </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default Tutorial;