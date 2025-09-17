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
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold">不會動的玩具<br/>才正常吧</h1>
      </div>
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl mb-4 text-center">你好，{nickname}，請選擇角色</h2>
        
        <div className="flex flex-col items-center mb-4">
          <img id="main-character-img" src={selectedChar.src} alt={selectedChar.name} className="w-48 h-48 object-cover mb-4 rounded-full border-4 border-blue-500"/>
          <div className="text-2xl font-bold capitalize">{selectedChar.name}</div>
          <div className="text-left mt-2">
            <div>速度：<span className="font-semibold">{selectedChar.speed}</span></div>
            <div>力量：<span className="font-semibold">{selectedChar.power}</span></div>
            <div>技巧：<span className="font-semibold">{selectedChar.skill}</span></div>
          </div>
        </div>

        <div className="flex justify-center space-x-3 mb-6">
          {characters.map((char) => (
            <div 
              key={char.name}
              className={`cursor-pointer p-1 rounded-full ${selectedChar.name === char.name ? 'bg-blue-500' : ''}`}
              onClick={() => handleSelectChar(char)}
            >
              <img src={char.src} alt={char.name} className="w-16 h-16 object-cover rounded-full" />
            </div>
          ))}
        </div>

        <button onClick={handleConfirm} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
          確定
        </button>
      </div>
    </div>
  );
};

export default ChooseChar;
