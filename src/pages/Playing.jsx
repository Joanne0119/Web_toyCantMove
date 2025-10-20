import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext'; 
import { motion, useSpring, useTransform  } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useScreenWakeLock } from '../hooks/useScreenWakeLock';


const Playing = () => {
    const { character, webRTC, connectionStatus, gyroscope, gyroscopeStatus } = useGame();
    const { lastMessage, sendData: sendWebRTCData, dataChannelConnections } = webRTC;
    const { isCalibrated, coordinates, isInitialized } = gyroscopeStatus;
    const { calibrate: calibrateGyroscope } = gyroscope; 

    const { requestWakeLock } = useScreenWakeLock((err) => {
      console.warn("Wake Lock Error:", err);
    });

    // --- Game State ---
    const GAME_SPEED = 5;

    const springConfig = { stiffness: 300, damping: 30 }; 
    const smoothX = useSpring(50, springConfig);
    const smoothY = useSpring(50, springConfig);

    const transformedX = useTransform(smoothX, (v) => `calc(${v}% - 16px)`);
    const transformedY = useTransform(smoothY, (v) => `calc(${v}% - 16px)`);

    const rotation = useSpring(0, { stiffness: 300, damping: 30 });

    useEffect(() => {
        requestWakeLock(); 
    }, [requestWakeLock]); 

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


    useEffect(() => {
      const isManuallyControlled = Object.values(pressed.current).some(v => v);
      
      if (connectionStatus && isCalibrated && !isManuallyControlled) { 
        const vector = { x: coordinates.x, y: -coordinates.y };
        
        const newX = smoothX.get() + (vector.x * GAME_SPEED);
        const newY = smoothY.get() - (vector.y * GAME_SPEED);
        
        smoothX.set(Math.max(0, Math.min(100, newX)));
        smoothY.set(Math.max(0, Math.min(100, newY)));

        const msg = JSON.stringify({ type: 'move', vector });
        sendWebRTCData(msg, null); 
      }
    }, [coordinates, connectionStatus, isCalibrated, sendWebRTCData, GAME_SPEED, smoothX, smoothY]); // ✅ 加上依賴項


    // --- Button Controls (Manual Sender) ---
    const pressed = useRef({ up: false, down: false, left: false, right: false });
    const sendIntervalRef = useRef(null);

    const vectorMap = {
        up: [0, 1],
        down: [0, -1],
        left: [-1, 0],
        right: [1, 0]
    };

    const getMoveVector = useCallback(() => {
        let x = 0, y = 0;
        for (const dir in pressed.current) {
            if (pressed.current[dir]) {
                x += vectorMap[dir][0];
                y += vectorMap[dir][1];
            }
        }
        return { x, y };
    }, []);

    const startSendingManual = useCallback(() => {
        if (!sendIntervalRef.current) {
            sendIntervalRef.current = setInterval(() => {
                const vec = getMoveVector();
                if (vec.x === 0 && vec.y === 0) return; // Don't send if not moving

                if (connectionStatus && dataChannelConnections.length > 0) {
                    const msg = JSON.stringify({ type: "manualMove", vector: vec });
                    sendWebRTCData(msg, null);
                } else {
                    console.warn("WebRTC not connected or data channel not open, cannot send manual move vector.");
                }
            }, 100); // Send every 100ms
        }
    }, [connectionStatus, dataChannelConnections, getMoveVector, sendWebRTCData]);

    const stopSendingManualIfNoDirection = useCallback(() => {
        if (!Object.values(pressed.current).some(v => v)) {
            clearInterval(sendIntervalRef.current);
            sendIntervalRef.current = null;
        }
    }, []);

    const setupButtonHandlers = useCallback((id) => {
        return {
            onPointerDown: (e) => {
                e.preventDefault();
                pressed.current[id] = true;
                startSendingManual();
            },
            onPointerUp: (e) => {
                e.preventDefault();
                pressed.current[id] = false;
                stopSendingManualIfNoDirection();
            },
            onPointerLeave: (e) => {
                e.preventDefault();
                pressed.current[id] = false;
                stopSendingManualIfNoDirection();
            },
            onPointerCancel: (e) => {
                e.preventDefault();
                pressed.current[id] = false;
                stopSendingManualIfNoDirection();
            },
        };
    }, [startSendingManual, stopSendingManualIfNoDirection]);

    return (
        <div className="relative w-screen h-screen px-6 flex flex-col items-center justify-center" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center'}}>
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
                disabled={!isInitialized} // 只有在啟用感測器後才能校正
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
                        backgroundImage: `url(${character ? character.pinSrc : '/images/redPin.png'})`, 
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
                        grid grid-cols-3 gap-2 select-none
                        transition-all duration-300 ease-in-out overflow-hidden 
                        ${isControllerOpen ? 'max-h-96 mt-4' : 'max-h-0 mt-0'}
                    `} style={{ touchAction: 'none' }}>
                        <div className="col-span-1"></div>
                        <motion.button whileTap={{ scale: 0.9 }} className="btn btn-outline btn-primary btn-circle p-6 text-xl font-bold" {...setupButtonHandlers('up')}>↑</motion.button>
                        <div className="col-span-1"></div>

                        <motion.button whileTap={{ scale: 0.9 }} className="btn btn-outline btn-primary btn-circle p-6 text-xl font-bold" {...setupButtonHandlers('left')}>←</motion.button>
                        <div className="col-span-1"></div>
                        <motion.button whileTap={{ scale: 0.9 }} className="btn btn-outline btn-primary btn-circle p-6 text-xl font-bold" {...setupButtonHandlers('right')}>→</motion.button>

                        <div className="col-span-1"></div>
                        <motion.button whileTap={{ scale: 0.9 }} className="btn btn-outline btn-primary btn-circle p-6 text-xl font-bold" {...setupButtonHandlers('down')}>↓</motion.button>
                        <div className="col-span-1"></div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default Playing;
