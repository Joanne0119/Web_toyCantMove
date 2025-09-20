import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const WaitingRoom = () => {
  const navigate = useNavigate();
  const { nickname, character, webRTC, gyroscope, connectionStatus } = useGame();
  
  // ✅ SOLUTION: All connection logic now lives here
  useEffect(() => {
    // Safety check: If user refreshes this page, character might be null.
    // Send them back to the start.
    if (!nickname || !character) {
      navigate('/');
      return;
    }

    // Connect function to run inside the effect
    const connectAll = async () => {
      try {
        // 1. Initialize Gyroscope
        if (gyroscope.isSupported()) {
          await gyroscope.init();
        }

        // 2. Connect WebRTC
        const websocketUrl = 'wss://server-for-toy-cant-move.onrender.com';
        
        // At this point, `useWebRTC` has re-rendered with `character.name`
        // and the WebRTCManager is ready.
        const connectionResult = await webRTC.connect(websocketUrl, false, true);
        
        if (!connectionResult) {
          throw new Error('連線錯誤，請檢查網路狀態或伺服器是否正常');
        }

        // 3. (Optional) If connection is successful,
        // you can navigate to the next page or wait for game state.
        // For example:
        // navigate('/choose-level');
        console.log('Successfully connected as', character.name);

      } catch (error) {
        navigate('/error', { state: { message: error.message } });
      }
    };

    // Only attempt to connect if we aren't already connected
    if (!connectionStatus) {
      connectAll();
    }

  }, [nickname, character, gyroscope, webRTC, connectionStatus, navigate]);

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Joining Room...</h1>
          <p className="py-6">Connecting as {character?.name || '...'} with nickname {nickname || '...'}</p>
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;