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
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold">選擇關卡</h1>
          <div className="card bg-base-100 shadow-xl mt-8">
            <div className="card-body">
              <h2 className="card-title">{isHost ? '請選擇遊戲場景' : '等待房主選擇關卡...'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                {levels.map((l) => (
                  <div 
                    key={l.name}
                    className={`card bg-base-200 shadow-md cursor-pointer ${level?.name === l.name ? 'ring ring-primary' : ''} ${!isHost && 'cursor-default'}`}
                    onClick={() => handleSelectLevel(l)}
                  >
                    <figure><img src={l.image} alt={l.name} className="h-24 object-cover"/></figure>
                    <div className="card-body p-4 items-center text-center">
                      <h2 className="card-title">{l.name}</h2>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-actions justify-center">
                <div className="flex flex-col space-y-2 w-full">
                  {isHost ? (
                    <button onClick={handleStartGame} className="btn btn-primary">
                      開始遊戲
                    </button>
                  ) : null}
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

export default ChooseLevel;