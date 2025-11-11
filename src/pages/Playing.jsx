import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


const Playing = () => {
    const { localPlayer, webRTC, connectionStatus, gyroscope, gyroscopeStatus, screenWakeLock } = useGame();
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


    const [isControllerOpen, setIsControllerOpen] = useState(false);

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

        if (!isControllerOpen) {

            if (connectionStatus && isCalibrated) {

                const vector = { x: coordinates.x, y: -coordinates.y };
                const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);

                // 停止時忽略
                if (magnitude < 0.08) return;

                // 方向變化太小時忽略
                // const dx = vector.x - lastVectorRef.current.x;
                // const dy = vector.y - lastVectorRef.current.y;
                // const delta = Math.sqrt(dx * dx + dy * dy);
                // if (delta < 0.02) return; 
                // lastVectorRef.current = vector;

                // 時間限制
                const now = Date.now();
                if (now - lastSentTimeRef.current < 50) return;
                lastSentTimeRef.current = now;

                // 更新 UI
                const newX = smoothX.get() + (vector.x * GAME_SPEED);
                const newY = smoothY.get() - (vector.y * GAME_SPEED);
                smoothX.set(Math.max(0, Math.min(100, newX)));
                smoothY.set(Math.max(0, Math.min(100, newY)));

                // Send Data
                const msg = JSON.stringify({ type: 'move', vector });
                sendWebRTCData(msg, null);
            }
        }
    }, [
        coordinates,
        connectionStatus,
        isCalibrated,
        sendWebRTCData,
        GAME_SPEED,
        smoothX,
        smoothY,
        isControllerOpen,
    ]);

    // Manual Controller Handlers
    const joystickBaseRef = useRef(null);
    const knobX = useMotionValue(0);
    const knobY = useMotionValue(0);
    const isDraggingRef = useRef(false);
    const sendIntervalRef = useRef(null);
    const currentVectorRef = useRef({ x: 0, y: 0 });

    const sendManualMove = useCallback((vector) => {
        if (connectionStatus && dataChannelConnections.length > 0) {
            const msg = JSON.stringify({ type: "manualMove", vector });
            sendWebRTCData(msg, null);
        }
    }, [connectionStatus, dataChannelConnections, sendWebRTCData]);

    const startSendingLoop = useCallback(() => {
        if (sendIntervalRef.current) return;
        
        sendIntervalRef.current = setInterval(() => {
            const vector = currentVectorRef.current;
            sendManualMove(vector);

            const newX = smoothX.get() + (vector.x * GAME_SPEED);
            const newY = smoothY.get() - (vector.y * GAME_SPEED);
            smoothX.set(Math.max(0, Math.min(100, newX)));
            smoothY.set(Math.max(0, Math.min(100, newY)));

        }, 100); // 每 100ms 發送一次
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
        const knobRadius = baseRadius / 2; 
        
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
    }, [knobX, knobY, stopSendingLoop]);

    // 綁定全域事件監聽 (確保手指滑出搖桿範圍仍有效)
    useEffect(() => {
        // 只有在控制器展開時才綁定 move 和 up 事件
        if (isControllerOpen) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
            window.addEventListener('pointercancel', handlePointerUp);
        }

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
            
            // 如果組件卸載或控制器關閉時還在拖曳，確保停止
            if (isDraggingRef.current) {
                stopSendingLoop();
                isDraggingRef.current = false;
            }
        };
    }, [isControllerOpen, handlePointerMove, handlePointerUp, stopSendingLoop]);

    return (
        <div className="relative w-screen h-screen px-6 flex flex-col items-center justify-center " style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
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

            {/* Game Area */}
            <motion.div
                className="relative w-full max-h-full aspect-square bg-base-200/60 rounded-2xl shadow-inner-xl overflow-hidden backdrop-blur-xs"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 15,
                    duration: 0.8,
                    delay: 0.2
                }}
            >
                <motion.div
                    className="absolute w-10 h-16"
                    style={{
                        left: transformedX,
                        top: transformedY,
                        backgroundImage: `url(${localPlayer.avatar ? `/images/${localPlayer.color || 'gray'}_${localPlayer.avatar}Pin.png` : '/images/gray_wind-upPin.png'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                    rotate={rotation}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 15,
                        duration: 0.8
                    }}
                ></motion.div>

            </motion.div>

            {/* Manual Controller UI */}
            <motion.div
                className="card absolute bottom-4 bg-base-100 shadow-xl px-6 py-2 max-w-md z-20"
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",   // 用彈簧模擬的動畫
                    stiffness: 120,   // 彈性
                    damping: 15,      // 阻尼 (越小越彈)
                    duration: 0.8,
                    delay: 0.3
                }}
            >
                <div className="card-body items-center text-center py-4">
                    <div className="flex justify-center items-center w-full relative" onClick={() => setIsControllerOpen(!isControllerOpen)}>
                        <h2 className="card-title">手動控制器</h2>
                        <button
                            className="btn btn-ghost btn-sm btn-circle absolute right-0"
                            aria-label={isControllerOpen ? "收合控制器" : "展開控制器"}
                        >
                            {isControllerOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                            )}
                        </button>
                    </div>
                    <div className={`
                        flex justify-center items-center w-full select-none
                        transition-all duration-300 ease-in-out overflow-hidden 
                        ${isControllerOpen ? 'max-h-96 mt-4' : 'max-h-0 mt-0'}
                    `}>
                        <div 
                            ref={joystickBaseRef}
                            className="relative w-40 h-40 bg-primary/20 rounded-full flex items-center justify-center text-primary-content" 
                            style={{ touchAction: 'none' }}
                            onPointerDown={handlePointerDown}
                        >
                            <svg className="w-4 h-4 absolute top-3 left-1/2 -translate-x-1/2" viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <polygon points="5,1 9,9 1,9" />
                            </svg>
                            <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 rotate-90" viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <polygon points="5,1 9,9 1,9" />
                            </svg>
                            <svg className="w-4 h-4 absolute bottom-3 left-1/2 -translate-x-1/2 rotate-180" viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <polygon points="5,1 9,9 1,9" />
                            </svg>
                            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 -rotate-90" viewBox="0 0 10 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <polygon points="5,1 9,9 1,9" />
                            </svg>

                            {/* 滾球 */}
                            <motion.div
                                className="w-20 h-20 bg-primary/80 rounded-full shadow-lg cursor-grab"
                                style={{ 
                                    x: knobX, 
                                    y: knobY 
                                }}
                                whileTap={{ cursor: 'grabbing' }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default Playing;
