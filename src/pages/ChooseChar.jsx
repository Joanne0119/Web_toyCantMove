import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

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

  const handleSelectChar = (char) => {
    setSelectedChar(char);
  };

  const handleConfirm = () => {
    setCharacter(selectedChar);
    navigate('/waiting-room');
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">不會動的玩具<br/>才正常吧</h1>
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
                <button onClick={handleConfirm} className="btn btn-primary">
                  確定
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