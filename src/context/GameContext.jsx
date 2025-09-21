import React, { createContext, useState, useContext, useMemo } from 'react';
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

  const { isConnected: webRTCIsConnected } = webRTC;
  const { 
    isSupported: gyroIsSupported, 
    isCalibrated: gyroIsCalibrated, 
    isInitialized: gyroIsInitialized, 
    direction: gyroDirection, 
    coordinates: gyroCoordinates, 
    error: gyroError 
  } = gyroscope;

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