import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


const Playing = () => {
    const { webRTC, connectionStatus } = useGame();
    const { lastMessage, sendData: sendWebRTCData, dataChannelConnections } = webRTC;

    // --- Game State ---
    const [characterPosition, setCharacterPosition] = useState({ x: 50, y: 50 }); // Position in percentage
    const GAME_SPEED = 2;

    const [isControllerOpen, setIsControllerOpen] = useState(false);
    
    // Effect to handle incoming WebRTC messages for game control
    useEffect(() => {
        if (lastMessage) {
            try {
                const data = JSON.parse(lastMessage.message);
                if ((data.type === "move" || data.type === "manualMove") && data.vector) {
                    setCharacterPosition(prevPos => {
                        const newX = prevPos.x + (data.vector.x * GAME_SPEED);
                        const newY = prevPos.y - (data.vector.y * GAME_SPEED); // Y is often inverted in screen coordinates

                        return {
                            x: Math.max(0, Math.min(100, newX)),
                            y: Math.max(0, Math.min(100, newY)),
                        };
                    });
                }
            } catch (e) {
                console.error("Failed to parse incoming message:", e);
            }
        }
    }, [lastMessage]);


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
        <div className="relative w-screen h-screen p-6 flex flex-col items-center justify-center" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center'}}>
            <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
            {/* Game Area */}
            <motion.div 
                className="relative w-full max-h-full aspect-square bg-base-200/60 rounded-2xl shadow-inner-xl overflow-hidden backdrop-blur-xs"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    type: "spring",   // 用彈簧模擬的動畫
                    stiffness: 120,   // 彈性
                    damping: 15,      // 阻尼 (越小越彈)
                    duration: 0.8
                }}
            >
                <motion.div 
                    className="absolute w-8 h-8 bg-blue-500 rounded-full shadow-lg transition-all duration-100"
                    style={{ 
                        left: `calc(${characterPosition.x}% - 16px)`, 
                        top: `calc(${characterPosition.y}% - 16px)` 
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",   // 用彈簧模擬的動畫
                        stiffness: 120,   // 彈性
                        damping: 15,      // 阻尼 (越小越彈)
                        duration: 0.8
                    }}
                ></motion.div>
            </motion.div>

            {/* Manual Controller UI */}
            <motion.div 
                className="card absolute bottom-4 bg-base-100 shadow-xl px-6 py-2 max-w-md"
                initial={{ scale: 0, opacity: 0 }}
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
