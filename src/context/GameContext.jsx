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
  movementThreshold: 12,
    calibrationTime: 1000,
    smoothingFactor: 0.3,
    deadZone: 5,
    maxThreshold: 60,
    enableAudio: false,
    enableVibration: false,
    debugMode: true,
    autoCalibrate: false,
}

// ICE Servers 設定（包含 STUN 和 TURN）
// TURN credentials 從環境變數讀取
const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME;
const TURN_CREDENTIAL = import.meta.env.VITE_TURN_CREDENTIAL;

const ICE_SERVERS = [
  { urls: "stun:stun.relay.metered.ca:80" },
  {
    urls: "turn:global.relay.metered.ca:80",
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  },
  {
    urls: "turn:global.relay.metered.ca:80?transport=tcp",
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  },
  {
    urls: "turn:global.relay.metered.ca:443",
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  },
  {
    urls: "turns:global.relay.metered.ca:443?transport=tcp",
    username: TURN_USERNAME,
    credential: TURN_CREDENTIAL,
  },
];

export const GameProvider = ({ children }) => {
  const [level, setLevel] = useState(null);
  const [score, setScore] = useState(0);
  const [hostId, setHostId] = useState(null); 
  const [gameScene, setGameScene] = useState('Lobby');
  const [peerId] = useState(() => {
    // 1. 嘗試從 localStorage 讀取
    // const savedId = localStorage.getItem('myPeerId');
    // if (savedId) return savedId;

    // 2. 如果沒有，才生成新的，並存起來
    const newId = 'web-' + Math.random().toString(36).substring(2, 9);
    // localStorage.setItem('myPeerId', newId);
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
  const [terminateImageLink, setTerminateImageLink] = useState(null);
  const [unityPeerId, setUnityPeerId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlUnityPeerId = params.get('peerId'); 
    
    if (urlUnityPeerId) {
      console.log("Found Unity Peer ID in URL:", urlUnityPeerId);
      setUnityPeerId(urlUnityPeerId);
    }
  }, []);

  // WebRTC integration（使用 STUN + TURN servers）
  const webRTC = useWebRTC(
    peerId,
    ICE_SERVERS,
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

  useEffect(() => {
    const isConnectedToUnity = unityPeerId && webRTC.dataChannelConnections.includes(unityPeerId);
    let retryTimer = null;

    // 已連線，尚未發送過身分資料
    if (isConnectedToUnity && !localPlayer.color) {
      console.log(`🔗 Connected to Unity (${unityPeerId})! Sending P2P Identify...`);
      const sendIdentify = () => {
        const identifyMsg = {
          type: "identify",
          nickname: localPlayer.name || `Player ${peerId.substring(0, 4)}`,
          characterName: localPlayer.avatar || "wind_up"
        };

        webRTC.sendData(JSON.stringify(identifyMsg), unityPeerId);
        console.log("[GameContext] Identify 發送指令已執行。");
      };

      sendIdentify();

      // 每秒重試，直到收到顏色
      retryTimer = setInterval(() => {
        console.log("[GameContext] 1秒...還沒收到顏色，重試發送");
        sendIdentify();
      }, 1000);
    }
    // 斷線時的 log
    else if (!isConnectedToUnity && unityPeerId) {
      console.log("⚠️ [GameContext] 與 Unity 斷線或尚未連通。");
    }

    // 清理函數：清除 interval，防止重複發送
    return () => {
      if (retryTimer) {
        clearInterval(retryTimer);
        retryTimer = null;
      }
    };
  }, [webRTC.dataChannelConnections, localPlayer.color, peerId, webRTC, unityPeerId]);

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

        if (msg.type === "level_selected") {
          console.log("Received level_selected from Unity:", msg.level);
          // 更新選擇的關卡（讓非房主也能看到）
          // 根據 sceneName 找到對應的 inputType
          const inputTypeMap = {
            '4_Toybox': 'gyro',
            '4_ColorPaper': 'gyro',
            '4_TapEat': 'tap',
            '4_ShakeRace': 'shake',
            '4_CountChallenge': 'count',
          };
          setLevel(prevLevel => ({
            ...prevLevel,
            sceneName: msg.level,
            inputType: inputTypeMap[msg.level] || 'gyro',
          }));
        }

        if (msg.type === "navigate_to_game") {
          console.log("Received navigate command from Unity, changing scene to Tutorial.");
          setGameScene('Tutorial');
          // ACK 回傳給 Unity，確認收到跳轉指令
          webRTC.sendData(JSON.stringify({ type: "navigate_ack", target: "tutorial" }), null);
        }

        if (msg.type === "navigate_to_playing") {
          console.log("Received navigate command from Unity, changing scene to Playing.");
          setGameScene('Playing');
          // ACK 回傳給 Unity，確認收到跳轉指令
          webRTC.sendData(JSON.stringify({ type: "navigate_ack", target: "playing" }), null);
        }
        if (msg.type === "terminate") {
          console.log("Received terminate message from Unity:", msg.finalPlayerDatas);
          console.log("Terminate image link:", msg.link);
          // ACK 回傳給 Unity，確認收到結束指令
          webRTC.sendData(JSON.stringify({ type: "navigate_ack", target: "terminate" }), null);
          setFinalResults(msg.finalPlayerDatas || []);
          setTerminateImageLink(msg.link || null);
          setGameScene('Awards');
          webRTC.disconnect();
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
    terminateImageLink,
    unityPeerId,
    setUnityPeerId,
  }), [
    peerId, hostId, gameScene, localPlayer, otherPlayers, level, score,
    webRTC, gyroscope, screenWakeLockValue, gyroscopeStatus, finalResults, terminateImageLink, unityPeerId
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};