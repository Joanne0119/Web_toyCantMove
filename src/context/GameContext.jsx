import React, { createContext, useState, useContext } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useGyroscope } from '../hooks/useGyroscope';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [nickname, setNickname] = useState('');
  const [character, setCharacter] = useState(null);
  const [players, setPlayers] = useState([]);
  const [level, setLevel] = useState(null);
  const [score, setScore] = useState(0);

  // WebRTC integration
  const webRTC = useWebRTC(character?.name,  'stun:stun.l.google.com:19302', {
    videoContainerId: 'remoteVideosContainer',
    localVideoPlayerId: 'localVideoPlayer',
  });

  // Gyroscope integration
  const gyroscope = useGyroscope({
    movementThreshold: 20,
    calibrationTime: 1000,
    smoothingFactor: 0.3,
    deadZone: 5,
    maxThreshold: 60,
    enableAudio: false,
    enableVibration: false,
    debugMode: true,
    autoCalibrate: false,
  });

  const value = {
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
      direction: gyroscope.direction,
      coordinates: gyroscope.coordinates,
      error: gyroscope.error,
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};