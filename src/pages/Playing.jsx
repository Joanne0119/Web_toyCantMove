import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';

const generatePeerId = () => "game-" + Math.random().toString(36).substring(2, 11);

const Playing = () => {
    // --- Game State ---
    const [characterPosition, setCharacterPosition] = useState({ x: 50, y: 50 }); // Position in percentage
    const GAME_SPEED = 2;

    // --- WebRTC State and Hooks ---
    const [localPeerId, setLocalPeerId] = useState(generatePeerId);
    const [targetPeerId, setTargetPeerId] = useState('');
    const [websocketUrl, setWebsocketUrl] = useState('wss://server-for-toy-cant-move.onrender.com');
    
    const uiConfig = useRef({}).current; // No video elements needed for this page

    const { 
        isConnected: isWebRTCConnected,
        dataChannelConnections,
        lastMessage,
        error: webRTCError,
        connect: connectWebRTC,
        disconnect: disconnectWebRTC,
        sendData: sendWebRTCData,
    } = useWebRTC(localPeerId, 'stun:stun.l.google.com:19302', uiConfig);

    // --- WebRTC Handlers ---
    const handleConnectWebRTC = useCallback(async () => {
        await connectWebRTC(websocketUrl, false, false); // This page is a receiver/sender of data only
    }, [connectWebRTC, websocketUrl]);

    const handleDisconnectWebRTC = useCallback(() => {
        disconnectWebRTC();
    }, [disconnectWebRTC]);
    
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

                if (isWebRTCConnected && dataChannelConnections.length > 0) {
                    const msg = JSON.stringify({ type: "manualMove", vector: vec });
                    sendWebRTCData(msg, targetPeerId || null);
                } else {
                    console.warn("WebRTC not connected or data channel not open, cannot send manual move vector.");
                }
            }, 100); // Send every 100ms
        }
    }, [isWebRTCConnected, dataChannelConnections, getMoveVector, sendWebRTCData, targetPeerId]);

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
        <div className="container mx-auto p-4 flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-4">遊戲畫面</h1>

            {/* Game Area */}
            <div className="relative w-full max-w-2xl aspect-video bg-gray-200 rounded-lg shadow-inner overflow-hidden mb-4 border-2 border-gray-300">
                <div 
                    className="absolute w-8 h-8 bg-blue-500 rounded-full shadow-lg transition-all duration-100"
                    style={{ 
                        left: `calc(${characterPosition.x}% - 16px)`, 
                        top: `calc(${characterPosition.y}% - 16px)` 
                    }}
                ></div>
            </div>

            {/* Manual Controller UI */}
            <div className="card bg-base-100 shadow-xl w-full max-w-md">
                <div className="card-body items-center text-center">
                    <h2 className="card-title">手動控制器</h2>
                    <div className="grid grid-cols-3 gap-2 w-48 mt-4 select-none" style={{ touchAction: 'none' }}>
                        <div className="col-span-1"></div>
                        <button className="btn btn-outline btn-circle" {...setupButtonHandlers('up')}>↑</button>
                        <div className="col-span-1"></div>

                        <button className="btn btn-outline btn-circle" {...setupButtonHandlers('left')}>←</button>
                        <div className="col-span-1"></div>
                        <button className="btn btn-outline btn-circle" {...setupButtonHandlers('right')}>→</button>

                        <div className="col-span-1"></div>
                        <button className="btn btn-outline btn-circle" {...setupButtonHandlers('down')}>↓</button>
                        <div className="col-span-1"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Playing;
