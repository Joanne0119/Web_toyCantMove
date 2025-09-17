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
    // Add the current player to the list
    if (nickname && character) {
      setPlayers([{ name: nickname, avatar: character.src }, ...mockPlayers]);
    } else {
      // If there's no player info, go back to the start
      navigate('/');
    }
  }, [nickname, character, setPlayers, navigate]);

  const handleNext = () => {
    navigate('/choose-level');
  };

  const handleLeave = () => {
    // Clear context and go back to home
    // (This would be more robust with a proper state reset)
    navigate('/');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold">不會動的玩具<br/>才正常吧</h1>
      </div>
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl mb-4 text-center">等待玩家進入...</h2>
        
        <div className="space-y-3">
          {players.map((player, index) => (
            <div key={index} className="flex items-center bg-gray-700 p-2 rounded-lg">
              <img src={player.avatar} alt={player.name} className="w-12 h-12 rounded-full object-cover mr-4" />
              <span className="text-lg">{player.name}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col space-y-2">
          {isHost ? (
            <button onClick={handleNext} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
              下一步
            </button>
          ) : (
            <p className='text-center'>等待房主開始遊戲...</p>
          )}
          <button onClick={handleLeave} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
            離開房間
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
