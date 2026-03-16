import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


const Playing = () => {
    const navigate = useNavigate();
    
    const { localPlayer, webRTC, connectionStatus, gyroscope, gyroscopeStatus, screenWakeLock, unityPeerId, level } = useGame();

    // 判斷是否為 Toybox 關卡
    const isToybox = level?.sceneName?.includes('Toybox') || level?.sceneName?.includes('toybox');
    const { lastMessage, sendData: sendWebRTCData, dataChannelConnections } = webRTC;
    const { isCalibrated, coordinates, isInitialized } = gyroscopeStatus;
    const { calibrate: calibrateGyroscope } = gyroscope;

    // --- Game State ---
    const GAME_SPEED = 4;

    const springConfig = { stiffness: 300, damping: 30 };
    const smoothX = useSpring(50, springConfig);
    const smoothY = useSpring(50, springConfig);

    const transformedX = useTransform(smoothX, (v) => `calc(${v}% - 16px)`);
    const transformedY = useTransform(smoothY, (v) => `calc(${v}% - 16px)`);

    const rotation = useSpring(0, { stiffness: 300, damping: 30 });

    // Manual Controller Handlers
    const joystickBaseRef = useRef(null);
    const knobX = useMotionValue(0);
    const knobY = useMotionValue(0);
    const isDraggingRef = useRef(false);
    const sendIntervalRef = useRef(null);
    const currentVectorRef = useRef({ x: 0, y: 0 });

    // 按壓按鈕狀態（用於繪圖）
    const [isPressing, setIsPressing] = useState(false);
    const isPressingRef = useRef(false);  // 用於 interval 內讀取最新狀態

    // screen wake lock
    useEffect(() => {
        if (screenWakeLock) {
            screenWakeLock.request();
        }
    }, [screenWakeLock]);

    useEffect(() => {
        const updateRotation = () => {
            const vx = smoothX.getVelocity();
            const vy = smoothY.getVelocity();

            if (Math.abs(vx) > 1 || Math.abs(vy) > 1) {
                const newAngle = Math.atan2(vy, vx) * (180 / Math.PI) + 90;
                rotation.set(newAngle);
            }
        };

        const unsubscribeX = smoothX.onChange(updateRotation);
        const unsubscribeY = smoothY.onChange(updateRotation);

        return () => {
            unsubscribeX();
            unsubscribeY();
        };
    }, [smoothX, smoothY, rotation]);


    // Effect to handle incoming WebRTC messages for game control
    useEffect(() => {
        if (lastMessage) {
            try {
                const data = JSON.parse(lastMessage.message);
                if ((data.type === "move" || data.type === "manualMove") && data.vector) {
                    const newX = smoothX.get() + (data.vector.x * GAME_SPEED);
                    const newY = smoothY.get() - (data.vector.y * GAME_SPEED);

                    smoothX.set(Math.max(0, Math.min(100, newX)));
                    smoothY.set(Math.max(0, Math.min(100, newY)));
                }
                if (data.type === 'terminate') {
                    navigate('/award');
                }
            } catch (e) {
                console.error("Failed to parse incoming message:", e);
            }
        }
    }, [lastMessage, GAME_SPEED, smoothX, smoothY]);

    // 上次發送時間
    const lastSentTimeRef = useRef(0);
    // 上次方向
    const lastVectorRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // 只有在 1. 陀螺儀可用 且 2. 手指 "沒有" 放在搖桿上時 才運作
        console.log(`Gyro Effect: isInitialized=${isInitialized}, isDragging=${isDraggingRef.current}`);
        if (isInitialized && !isDraggingRef.current) {

            console.log(`Gyro Effect: Running. Coords: { x: ${coordinates.x}, y: ${coordinates.y} }`);
            const vector = { x: coordinates.x, y: -coordinates.y };
            const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);
            
            let finalVector = vector;
            if (magnitude < 0.08) {
                finalVector = { x: 0, y: 0 };
            }

            if (joystickBaseRef.current) {
                const baseRect = joystickBaseRef.current.getBoundingClientRect();
                const baseRadius = baseRect.width / 2;
                
                const knobRadius = baseRect.width / 3 / 2;
                const maxDistance = baseRadius - knobRadius;

                const visualKnobX = finalVector.x * maxDistance;
                const visualKnobY = -finalVector.y * maxDistance;

                console.log(`Gyro Effect: Setting Knobs -> { x: ${visualKnobX}, y: ${visualKnobY} }`);
                
                knobX.set(visualKnobX);
                knobY.set(visualKnobY);
            }

            if (magnitude < 0.08) return;

            if (!connectionStatus || !isCalibrated) return;

            const now = Date.now();
            if (now - lastSentTimeRef.current < 50) { 
                console.log("Gyro Effect: Throttled (too fast).");
                return;
            }
            lastSentTimeRef.current = now;

            console.log(`%Gyro Effect: SENDING SIGNAL { x: ${vector.x}, y: ${vector.y}, is_press: ${isPressingRef.current} }`, "color: blue; font-weight: bold;");

            const newX = smoothX.get() + (vector.x * GAME_SPEED);
            const newY = smoothY.get() - (vector.y * GAME_SPEED);
            smoothX.set(Math.max(0, Math.min(100, newX)));
            smoothY.set(Math.max(0, Math.min(100, newY)));

            const msg = JSON.stringify({ type: 'move', vector, is_press: isPressingRef.current });
            sendWebRTCData(msg, unityPeerId || null);
        }
    }, [
        coordinates,
        connectionStatus,
        isCalibrated,
        isInitialized,
        sendWebRTCData,
        GAME_SPEED,
        smoothX,
        smoothY,
        knobX, 
        knobY,
        unityPeerId
    ]);

    const sendManualMove = useCallback((vector) => {
        if (connectionStatus && dataChannelConnections.length > 0) {
            const msg = JSON.stringify({ type: "move", vector, is_press: isPressingRef.current });
            sendWebRTCData(msg, unityPeerId || null);
        }
    }, [connectionStatus, dataChannelConnections, sendWebRTCData, unityPeerId]);

    const startSendingLoop = useCallback(() => {
        if (sendIntervalRef.current) return;
        
        sendIntervalRef.current = setInterval(() => {
            const vector = currentVectorRef.current;
            sendManualMove(vector);
            const newX = smoothX.get() + (vector.x * GAME_SPEED);
            const newY = smoothY.get() - (vector.y * GAME_SPEED);
            smoothX.set(Math.max(0, Math.min(100, newX)));
            smoothY.set(Math.max(0, Math.min(100, newY)));

        }, 100); 
    }, [sendManualMove, smoothX, smoothY, GAME_SPEED]);

    const stopSendingLoop = useCallback(() => {
        if (sendIntervalRef.current) {
            clearInterval(sendIntervalRef.current);
            sendIntervalRef.current = null;
        }
        sendManualMove({ x: 0, y: 0 });
        currentVectorRef.current = { x: 0, y: 0 };
    }, [sendManualMove]);

    const updateJoystick = useCallback((clientX, clientY) => {
        if (!joystickBaseRef.current) return;

        const baseRect = joystickBaseRef.current.getBoundingClientRect();
        const baseRadius = baseRect.width / 2;
        const knobRadius = baseRect.width / 3 / 2;
        
        // 滾球中心點能移動的最大距離
        const maxDistance = baseRadius - knobRadius;

        const centerX = baseRect.left + baseRadius;
        const centerY = baseRect.top + baseRadius;

        // 計算點擊位置相對於中心的 delta
        let dx = clientX - centerX;
        let dy = clientY - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        let clampedX = dx;
        let clampedY = dy;

        // 如果拖曳距離超過最大範圍，就限制它
        if (distance > maxDistance) {
            clampedX = Math.cos(angle) * maxDistance;
            clampedY = Math.sin(angle) * maxDistance;
        }
        
        // 更新 UI
        knobX.set(clampedX);
        knobY.set(clampedY);

        // 計算並儲存標準化 (normalized) 向量 (-1 到 +1)
        // 上為正
        currentVectorRef.current = {
            x: clampedX / maxDistance,
            y: -(clampedY / maxDistance) 
        };

    }, [knobX, knobY]);

    // 處理 Pointer 事件
    const handlePointerDown = useCallback((e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        updateJoystick(e.clientX, e.clientY);
        startSendingLoop();
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
    }, [updateJoystick, startSendingLoop]);

    const handlePointerMove = useCallback((e) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        updateJoystick(e.clientX, e.clientY);
    }, [updateJoystick]);

    const handlePointerUp = useCallback((e) => {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        isDraggingRef.current = false;

        // 滾球歸位
        knobX.set(0);
        knobY.set(0);

        stopSendingLoop();

        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
    }, [knobX, knobY, stopSendingLoop]);

    // 按壓按鈕事件處理
    const handlePressStart = useCallback((e) => {
        e.preventDefault();
        setIsPressing(true);
        isPressingRef.current = true;
    }, []);

    const handlePressEnd = useCallback((e) => {
        e.preventDefault();
        setIsPressing(false);
        isPressingRef.current = false;
    }, []);

    return (
        <div className="relative w-screen min-h-screen px-6 flex flex-col items-center justify-center " style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center', minHeight: '100dvh' }}>
            <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
            <motion.button
                whileTap={{ scale: 0.9 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 15,
                    duration: 0.8
                }}
                className={`btn btn-sm btn-primary text-base z-10 mb-4 ${isInitialized ? 'visible' : 'invisible'}`}
                onClick={calibrateGyroscope}
                disabled={!isInitialized}
            >
                重新校正
            </motion.button>

            {/* Manual Controller UI */}
            <motion.div
                className="card bg-base-100 shadow-xl px-6 py-2 z-20 mt-4"
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 15,
                    duration: 0.8,
                    delay: 0.3
                }}
            >
                <div className="card-body items-center text-center py-4">
                    <div className="flex justify-center items-center w-full relative">
                        <h2 className="card-title">控制器</h2>
                    </div>

                    <div className="flex flex-col justify-center items-center w-full select-none mt-4 gap-4">
                        {/* 搖桿 */}
                        <div
                            ref={joystickBaseRef}
                            className="relative w-52 h-52 bg-primary/20 rounded-full flex items-center justify-center text-primary-content/40"
                            style={{ touchAction: 'none' }}
                            onPointerDown={handlePointerDown}
                        >
                            <svg className="w-6 h-6 absolute top-5 left-1/2 -translate-x-1/2" viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><polygon points="5,1 9,9 1,9" /></svg>
                            <svg className="w-6 h-6 absolute right-5 top-1/2 -translate-y-1/2 rotate-90" viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><polygon points="5,1 9,9 1,9" /></svg>
                            <svg className="w-6 h-6 absolute bottom-5 left-1/2 -translate-x-1/2 rotate-180" viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><polygon points="5,1 9,9 1,9" /></svg>
                            <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 -rotate-90" viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><polygon points="5,1 9,9 1,9" /></svg>

                            <motion.div
                                className="w-20 h-20 cursor-grab"
                                style={{
                                    x: knobX,
                                    y: knobY,
                                    backgroundImage: `url(${
                                                            localPlayer.color
                                                                ? `/images/${localPlayer.color}_${localPlayer.avatar || 'wind-up'}Pin.png`
                                                                : `/images/gray_${localPlayer.avatar || 'wind-up'}Pin.png`
                                                            })`,
                                    backgroundSize: 'contain',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                                whileTap={{ cursor: 'grabbing' }}
                                rotate={rotation}
                            />
                        </div>

                        {/* 技能/繪圖按鈕 */}
                        <motion.div
                            className={`
                                w-full h-16 rounded-full flex items-center justify-center cursor-pointer select-none
                                transition-all duration-150 shadow-lg
                                ${isPressing
                                    ? 'bg-accent scale-105 shadow-accent/50'
                                    : 'bg-primary hover:bg-primary-focus'
                                }
                            `}
                            style={{ touchAction: 'none' }}
                            onPointerDown={handlePressStart}
                            onPointerUp={handlePressEnd}
                            onPointerLeave={handlePressEnd}
                            onPointerCancel={handlePressEnd}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className={`flex items-center gap-3 ${isPressing ? 'text-accent-content' : 'text-primary-content'}`}>
                                {/* 圖示：Toybox 用閃電，ColorPaper 用顏料 */}
                                {isToybox ? (
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13 10h7l-9 13v-9H4l9-13v9z"/>
                                    </svg>
                                ) : (
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19.228 18.732l1.768-1.768 1.767 1.768a2.5 2.5 0 1 1-3.535 0zM8.878 1.08l11.314 11.313a1 1 0 0 1 0 1.415l-8.485 8.485a1 1 0 0 1-1.414 0l-8.485-8.485a1 1 0 0 1 0-1.415l7.778-7.778-2.122-2.121L8.88 1.08zM11 6.03L3.929 13.1 11 20.173l7.071-7.071L11 6.029z"/>
                                    </svg>
                                )}
                                <span className="text-lg font-bold">
                                    {isToybox
                                        ? (isPressing ? '使用中...' : '按住使用技能')
                                        : (isPressing ? '繪圖中...' : '按住繪圖')
                                    }
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default Playing;
