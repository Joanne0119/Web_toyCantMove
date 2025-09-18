import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { useGyroscope } from '../hooks/useGyroscope';

const characters = [
  { name: 'red', speed: 8, power: 10, skill: 7, src: '/images/red.png' },
  { name: 'blue', speed: 10, power: 6, skill: 9, src: '/images/blue.png' },
  { name: 'yellow', speed: 7, power: 9, skill: 8, src: '/images/yellow.png' },
  { name: 'green', speed: 8, power: 10, skill: 7, src: '/images/green.png' },
];

const ChooseChar = () => {
  const { nickname, setCharacter } = useGame();
  const [selectedChar, setSelectedChar] = useState(characters[0]);
  const navigate = useNavigate();

  // WebRTC State and Hooks
  const [websocketUrl] = useState('wss://server-for-toy-cant-move.onrender.com');
  const uiConfig = {
    videoContainerId: 'remoteVideosContainer',
    localVideoPlayerId: 'localVideoPlayer',
  };

  const {
    isConnected: isWebRTCConnected,
    connect: connectWebRTC,
    disconnect: disconnectWebRTC,
  } = useWebRTC(selectedChar.name, 'stun:stun.l.google.com:19302', uiConfig);

  // Gyroscope State and Hooks
  const {
    isSupported: isGyroscopeSupported,
    init: initGyroscope,
    error: gyroscopeError,
  } = useGyroscope({
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

  // Handle character selection
  const handleSelectChar = (char) => {
    setSelectedChar(char);
  };

  // Handle confirmation
  const handleConfirm = useCallback(async () => {
    try {
      // Save the selected character
      setCharacter(selectedChar);

      // Initialize the gyroscope if supported
      if (isGyroscopeSupported()) {
        await initGyroscope();
      }

      // Connect WebRTC
      const connectionResult = await connectWebRTC(websocketUrl, false, true);
      if (!connectionResult) {
        throw new Error('WebRTC 連線失敗，請檢查網路或伺服器設定。');
      }

      // Navigate to the waiting room if everything is successful
      navigate('/waiting-room');
    } catch (error) {
      // Navigate to the error page with the error message
      navigate('/error', { state: { message: error.message } });
    }
  }, [connectWebRTC, initGyroscope, isGyroscopeSupported, navigate, selectedChar, setCharacter, websocketUrl]);

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">選擇角色</h1>
          <div className="card bg-base-100 shadow-xl mt-8">
            <div className="card-body">
              <h2 className="card-title">你好，{nickname}，請選擇角色</h2>
              <div className="flex flex-col items-center my-4">
                <div className="avatar online">
                  <div className="w-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={selectedChar.src} alt={selectedChar.name} />
                  </div>
                </div>
                <div className="text-2xl font-bold capitalize mt-4">{selectedChar.name}</div>
                <div className="stats bg-transparent mt-2">
                  <div className="stat">
                    <div className="stat-title">速度</div>
                    <div className="stat-value">{selectedChar.speed}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">力量</div>
                    <div className="stat-value">{selectedChar.power}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">技巧</div>
                    <div className="stat-value">{selectedChar.skill}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-3 mb-6">
                {characters.map((char) => (
                  <div
                    key={char.name}
                    className={`avatar cursor-pointer ${selectedChar.name === char.name ? 'ring ring-primary ring-offset-base-100 ring-offset-2 rounded-full' : ''}`}
                    onClick={() => handleSelectChar(char)}
                  >
                    <div className="w-16 rounded-full">
                      <img src={char.src} alt={char.name} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-actions justify-center">
                <button
                  onClick={handleConfirm}
                  className="btn btn-primary"
                  disabled={isWebRTCConnected} // Disable if already connected
                >
                  確定
                </button>
                <button
                  onClick={disconnectWebRTC}
                  className="btn btn-warning"
                  disabled={!isWebRTCConnected} // Disable if not connected
                >
                  斷線
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseChar;