import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const levels = [
  { name: "齒輪城堡", image: "/images/level1.png" },
  { name: "書桌探險", image: "/images/level2.png" },
  { name: "陰暗床底", image: "/images/level3.png" }
];

const ChooseLevel = () => {
  const { nickname, players, level, setLevel } = useGame();
  const navigate = useNavigate();
  const isHost = players.length > 0 && players[0].name === nickname;

  const handleSelectLevel = (selectedLevel) => {
    if (isHost) {
      setLevel(selectedLevel);
    }
  };

  const handleStartGame = () => {
    if (level) {
      navigate('/testing');
    } else {
      alert('Please select a level');
    }
  };

  const handleLeave = () => {
    navigate('/');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold">不會動的玩具<br/>才正常吧</h1>
      </div>
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl mb-4 text-center">{isHost ? '請選擇遊戲場景' : '等待房主選擇關卡...'}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {levels.map((l) => (
            <div 
              key={l.name}
              className={`p-2 rounded-lg cursor-pointer ${level?.name === l.name ? 'bg-blue-500' : 'bg-gray-700'} ${!isHost && 'cursor-default'}`}
              onClick={() => handleSelectLevel(l)}
            >
              <img src={l.image} alt={l.name} className="w-full h-24 object-cover rounded-md mb-2"/>
              <div className="text-center">{l.name}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col space-y-2">
          {isHost ? (
            <button onClick={handleStartGame} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
              開始遊戲
            </button>
          ) : null}
          <button onClick={handleLeave} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
            離開房間
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseLevel;
