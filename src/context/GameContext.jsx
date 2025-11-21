import React, { createContext, useState, useContext, useMemo, useEffect, useRef } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useGyroscope } from '../hooks/useGyroscope';
import { useScreenWakeLock } from '../hooks/useScreenWakeLock';
import { color, m } from 'framer-motion';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const STABLE_UI_CONFIG = {
  videoContainerId: 'remoteVideosContainer',
  localVideoPlayerId: 'localVideoPlayer',
};

const STABLE_GYRO_CONFIG = {
  movementThreshold: 20,
    calibrationTime: 1000,
    smoothingFactor: 0.3,
    deadZone: 5,
    maxThreshold: 60,
    enableAudio: false,
    enableVibration: false,
    debugMode: true,
    autoCalibrate: false,
}

export const GameProvider = ({ children }) => {
  const hasIdentifiedRef = useRef(new Map());
  const [level, setLevel] = useState(null);
  const [score, setScore] = useState(0);
  const [hostId, setHostId] = useState(null); 
  const [gameScene, setGameScene] = useState('Lobby');
  const [peerId] = useState(() => {
    // 1. 嘗試從 localStorage 讀取
    const savedId = localStorage.getItem('myPeerId');
    if (savedId) return savedId;

    // 2. 如果沒有，才生成新的，並存起來
    const newId = 'web-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('myPeerId', newId);
    return newId;
  });
  const [localPlayer, setLocalPlayer] = useState({
    id: peerId,
    name: '',
    avatar: null, // 'wind-up', 'dog' 等
    color: null   // 'red', 'blue' 等
  });
  const [otherPlayers, setOtherPlayers] = useState([]);
  const [finalResults, setFinalResults] = useState([]);
  const [unityPeerId, setUnityPeerId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUnityPeerId = params.get('peerId'); 
    
    if (urlUnityPeerId) {
      console.log("Found Unity Peer ID in URL:", urlUnityPeerId);
      setUnityPeerId(urlUnityPeerId);
    }
  }, []);

  // WebRTC integration
  const webRTC = useWebRTC(
    peerId,
    'stun:stun.l.google.com:19302',
    STABLE_UI_CONFIG
  );

  // Gyroscope integration
  const gyroscope = useGyroscope(STABLE_GYRO_CONFIG);

  const screenWakeLock = useScreenWakeLock((err) => {
    console.warn("Global Wake Lock Error:", err);
  });

  const { isConnected: webRTCIsConnected, peers: peerIds, lastMessage } = webRTC;
  
  const { 
    isSupported: gyroIsSupported, 
    isCalibrated: gyroIsCalibrated, 
    isInitialized: gyroIsInitialized, 
    direction: gyroDirection, 
    coordinates: gyroCoordinates, 
    error: gyroError 
  } = gyroscope;

  useEffect(() => {
    setOtherPlayers(currentOtherPlayers => { 
      const updatedPlayers = currentOtherPlayers.filter(p =>
        peerIds.includes(p.id) 
      );
      return updatedPlayers;
    });
  }, [peerIds]);

  // GameContext.jsx

  useEffect(() => {
    // 除錯 Log：印出目前的所有狀態
    console.log("🔄 [GameContext] 檢查連線狀態...", {
      unityPeerId,
      dataChannelConnections,
      isConnectedToUnity: unityPeerId && dataChannelConnections.includes(unityPeerId),
      hasIdentified: hasIdentifiedRef.current
    });

    const isConnectedToUnity = unityPeerId && dataChannelConnections.includes(unityPeerId);

    // 情況 1: 條件完全符合，準備發送
    if (isConnectedToUnity && !hasIdentifiedRef.current) {
      console.log(`✅ [GameContext] 條件達成！正在發送 Identify 給 ${unityPeerId}...`);

      const identifyMsg = {
        type: "identify",
        nickname: localPlayer.name || `Player ${peerId.substring(0, 4)}`,
        characterName: localPlayer.avatar || "wind_up"
      };
      
      // 真正的發送動作
      webRTC.sendData(JSON.stringify(identifyMsg), unityPeerId);
      
      // 標記為已發送
      hasIdentifiedRef.current = true; 
      console.log("🚀 [GameContext] Identify 發送指令已執行。");
    } 
    // 情況 2: 斷線重置
    else if (!isConnectedToUnity && hasIdentifiedRef.current) {
        console.log("⚠️ [GameContext] 與 Unity 斷線，重置 Identify 標記。");
        hasIdentifiedRef.current = false;
    }
    // 情況 3: 正在等待
    else if (unityPeerId && !isConnectedToUnity) {
        console.log("⏳ [GameContext] 已知目標 Unity ID，但 DataChannel 尚未連通...");
    }

  }, [webRTC.dataChannelConnections, localPlayer, peerId, webRTC, unityPeerId]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const msg = JSON.parse(lastMessage.message);
        const senderPeerId = lastMessage.peerId; 

        if (msg.type === "identify") {
          const newPlayerInfo = {
            id: senderPeerId, 
            name: msg.nickname,
            avatar: msg.characterName
          };

          setOtherPlayers(currentOtherPlayers => { 
            const playerExists = currentOtherPlayers.some(p => p.id === senderPeerId);
            
            if (playerExists) {
              return currentOtherPlayers.map(p =>
                p.id === senderPeerId ? newPlayerInfo : p 
              );
            } else {
              return [...currentOtherPlayers, newPlayerInfo];
            }
          });
        }

        if (msg.type === "initial") {
          const { color } = msg;
          console.log("Received color:", color);
          setLocalPlayer(prevPlayer => ({
            ...prevPlayer,
            color: color
          }));
        }

        if (msg.type === "host_update") {
          console.log("New host is:", msg.hostId); 
          setHostId(msg.hostId);
        }

        if (msg.type === "navigate_to_game") {
          console.log("Received navigate command from Unity, changing scene to Tutorial.");
          setGameScene('Tutorial');
        }

        if (msg.type === "navigate_to_playing") {
          console.log("Received navigate command from Unity, changing scene to Playing.");
          setGameScene('Playing'); 
        }
        if (msg.type === "terminate") {
          console.log("Received terminate message from Unity:", msg.finalPlayerDatas);
          setFinalResults(msg.finalPlayerDatas || []); 
          setGameScene('Awards'); 
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [lastMessage, peerId]); 

  const gyroscopeStatus = useMemo(() => ({
    isSupported: gyroscope.isSupported(),
    isCalibrated: gyroscope.isCalibrated,
    isInitialized: gyroscope.isInitialized,
    direction: gyroscope.direction,
    coordinates: gyroscope.coordinates,
    error: gyroscope.error,
  }), [
    gyroscope.isSupported, gyroscope.isCalibrated, gyroscope.isInitialized,
    gyroscope.direction, gyroscope.coordinates, gyroscope.error
  ]);

  const screenWakeLockValue = useMemo(() => ({
    isSupported: screenWakeLock.isSupported,
    isActive: screenWakeLock.isActive,
    request: screenWakeLock.requestWakeLock,
    release: screenWakeLock.releaseWakeLock,
  }), [
    screenWakeLock.isSupported, screenWakeLock.isActive,
    screenWakeLock.requestWakeLock, screenWakeLock.releaseWakeLock
  ]);

  const value = useMemo(() => ({
    peerId: peerId,     
    hostId: hostId, 
    gameScene: gameScene,
    localPlayer,
    setLocalPlayer,
    otherPlayers,
    level,
    setLevel,
    score,
    setScore,
    webRTC, 
    gyroscope,
    screenWakeLock: screenWakeLockValue,
    connectionStatus: webRTC.isConnected,
    gyroscopeStatus: gyroscopeStatus, 
    finalResults,
    unityPeerId, 
    setUnityPeerId,
  }), [
    peerId, hostId, gameScene, localPlayer, otherPlayers, level, score,
    webRTC, gyroscope, screenWakeLockValue, gyroscopeStatus, finalResults, unityPeerId
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};