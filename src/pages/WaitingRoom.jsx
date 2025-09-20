import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const mockPlayers = [
  { name: '黃小姿', avatar: '/images/green.png' },
  { name: '爆香怪人', avatar: '/images/red.png' },
  { name: '柳橙恩', avatar: '/images/yellow.png' },
];

const WaitingRoom = () => {
  const { nickname, character, players, setPlayers } = useGame();
  const navigate = useNavigate();

  // For now, we'll treat the first player as the host.
  const isHost = players.length > 0 && players[0].name === nickname;

  useEffect(() => {
    // Safety check: If there's no player info, go back to the start
    if (!nickname || !character) {
      navigate('/');
      return; // Stop the effect
    }

    // --- Your existing logic ---
    // Add the current player to the list
    setPlayers([{ name: nickname, avatar: character.src }, ...mockPlayers]);

    // --- The MISSING connection logic ---
    const connectAll = async () => {
      try {
        // 1. Initialize Gyroscope
        if (gyroscope.isSupported()) {
          await gyroscope.init();
        }

        // 2. Connect WebRTC
        const websocketUrl = 'wss://server-for-toy-cant-move.onrender.com';
        
        // At this point, useWebRTC has the correct peerId (e.g., "red")
        // and is ready to connect.
        const connectionResult = await webRTC.connect(websocketUrl, false, true);
        
        if (!connectionResult) {
          throw new Error('WebRTC connection failed.');
        }

        console.log('Successfully connected as', character.name);

      } catch (error) {
        // Use the Error.jsx page to show the error
        navigate('/error', { state: { message: error.message } });
      }
    };

    // 3. Only attempt to connect if we aren't already connected
    if (!connectionStatus) {
      connectAll();
    }

  }, [
    nickname, 
    character, 
    setPlayers, 
    navigate, 
    gyroscope, 
    webRTC, 
    connectionStatus
  ]); 
  const handleNext = () => {
    navigate('/choose-level');
  };

  const handleLeave = () => {
    navigate('/');
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold">不會動的玩具<br/>才正常吧</h1>
          <div className="card bg-base-100 shadow-xl mt-8">
            <div className="card-body">
              <h2 className="card-title">等待玩家進入...</h2>
              <div className="space-y-3 mt-4">
                {players.map((player, index) => (
                  <div key={index} className="flex items-center bg-base-200 p-2 rounded-lg">
                    <div className="avatar mr-4">
                      <div className="w-12 rounded-full">
                        <img src={player.avatar} alt={player.name} />
                      </div>
                    </div>
                    <span className="text-lg">{player.name}</span>
                  </div>
                ))}
              </div>
              <div className="card-actions justify-center mt-6">
                <div className="flex flex-col space-y-2 w-full">
                  {isHost ? (
                    <button onClick={handleNext} className="btn btn-primary">
                      下一步
                    </button>
                  ) : (
                    <p className='text-center'>等待房主開始遊戲...</p>
                  )}
                  <button onClick={handleLeave} className="btn btn-ghost">
                    離開房間
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;