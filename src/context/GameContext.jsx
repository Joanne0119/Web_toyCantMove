import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useGyroscope } from '../hooks/useGyroscope';

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
  const [nickname, setNickname] = useState('');
  const [character, setCharacter] = useState(null);
  const [players, setPlayers] = useState([]);
  const [level, setLevel] = useState(null);
  const [score, setScore] = useState(0);

  const [peerId] = useState('web-' + Math.random().toString(36).substring(2, 9));


  // WebRTC integration
  const webRTC = useWebRTC(
    peerId,
    'stun:stun.l.google.com:19302',
    STABLE_UI_CONFIG
  );

  // Gyroscope integration
  const gyroscope = useGyroscope(STABLE_GYRO_CONFIG);

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
    if (character && nickname) {
      setPlayers(prev => [
        ...prev.filter(p => p.id !== peerId), 
        {
          id: peerId,
          name: nickname,
          avatar: character.src
        }
      ]);
    }
  }, [character, nickname, peerId]);

  useEffect(() => {
    setPlayers(currentPlayers => {
      const updatedPlayers = currentPlayers.filter(p =>
        p.id === peerId || 
        peerIds.includes(p.id) 
      );

      peerIds.forEach(id => {
        if (!updatedPlayers.some(p => p.id === id)) {
          updatedPlayers.push({
            id: id,
            name: "玩家載入中...",
            avatar: "/images/gray.png"
          });
        }
      });
      return updatedPlayers;
    });
  }, [peerIds, peerId]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const msg = JSON.parse(lastMessage.message);
        
        if (msg.type === "identify") {
          setPlayers(currentPlayers =>
            currentPlayers.map(p =>
              p.id === lastMessage.peerId 
                ? { ...p, name: msg.nickname, avatar: `/images/${msg.characterName}.png` } 
                : p
            )
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [lastMessage]); 

  const value = useMemo(() => ({
    nickname,
    setNickname,
    character,
    setCharacter,
    players,
    setPlayers,
    level,
    setLevel,
    score,
    setScore,
    webRTC,
    gyroscope,
    connectionStatus: webRTC.isConnected,
    gyroscopeStatus: {
      isSupported: gyroscope.isSupported(),
      isCalibrated: gyroscope.isCalibrated,
      isInitialized: gyroscope.isInitialized,
      direction: gyroscope.direction,
      coordinates: gyroscope.coordinates,
      error: gyroscope.error,
    },
  }), [nickname, character, players, level, score, 
    webRTC, gyroscope, webRTCIsConnected, gyroIsCalibrated, gyroIsInitialized, gyroDirection, gyroCoordinates, gyroError 
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};