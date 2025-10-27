import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
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
  const [nickname, setNickname] = useState('');
  const [character, setCharacter] = useState(null);
  const [players, setPlayers] = useState([]);
  const [level, setLevel] = useState(null);
  const [score, setScore] = useState(0);
  const [hostId, setHostId] = useState(null); 
  const [gameScene, setGameScene] = useState('Lobby');
  const [peerId] = useState('web-' + Math.random().toString(36).substring(2, 9));


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
    if (character && nickname) {
      setPlayers(prev => [
        ...prev.filter(p => p.id !== peerId), 
        {
          id: peerId,
          name: nickname,
          avatar: character.name,
          color: character.color
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
      return updatedPlayers;
    });
  }, [peerIds, peerId]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const msg = JSON.parse(lastMessage.message);
        const peerId = lastMessage.peerId; 

        if (msg.type === "identify") {
          const newPlayerInfo = {
            id: peerId,
            name: msg.nickname,
            avatar: msg.characterName
          };

          setPlayers(currentPlayers => {
            const playerExists = currentPlayers.some(p => p.id === peerId);
            
            if (playerExists) {
              return currentPlayers.map(p =>
                p.id === peerId ? newPlayerInfo : p
              );
            } else {
              return [...currentPlayers, newPlayerInfo];
            }
          });
        }

        if (msg.type === "initial") {
          const { color } = msg;
          console.log("Received color:", color);
          console.log("players before update:", players);
          setPlayers(currentPlayers => {
            const updatedPlayers = currentPlayers.map(player => {
              if (player.id === peerId) { 
                return { ...player, color }; 
              }
              console.log("Player after update attempt:", player);
              return player; 
            });

            setCharacter(prevChar => {
              if (prevChar) {
                return { ...prevChar, color };
              }
              return prevChar;
            });

            return updatedPlayers;
          });

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
      } catch (e) {
        console.error(e);
      }
    }
  }, [lastMessage, players, peerId]); 

  const value = useMemo(() => ({
    peerId: peerId,     
    hostId: hostId, 
    gameScene: gameScene,
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
    screenWakeLock: {
      isSupported: screenWakeLock.isSupported,
      isActive: screenWakeLock.isActive,
      request: screenWakeLock.requestWakeLock,
      release: screenWakeLock.releaseWakeLock,
    },
    connectionStatus: webRTC.isConnected,
    gyroscopeStatus: {
      isSupported: gyroscope.isSupported(),
      isCalibrated: gyroscope.isCalibrated,
      isInitialized: gyroscope.isInitialized,
      direction: gyroscope.direction,
      coordinates: gyroscope.coordinates,
      error: gyroscope.error,
    },
  }), [peerId, hostId, gameScene, nickname, character, players, level, score,
    webRTC, gyroscope, webRTCIsConnected, gyroIsCalibrated, gyroIsInitialized, gyroDirection, gyroCoordinates, gyroError, screenWakeLock.isSupported,
    screenWakeLock.isActive, screenWakeLock.requestWakeLock, screenWakeLock.releaseWakeLock
  ]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};