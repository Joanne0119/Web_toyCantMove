import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const mockResults = [
  { name: '黃小姿', score: 200, avatar: '/images/green.png' },
  { name: '爆香怪人', score: 150, avatar: '/images/red.png' },
  { name: '柳橙恩', score: 100, avatar: '/images/yellow.png' },
  { name: 'Judy', score: 20,  avatar: '/images/blue.png' },
];

const Award = () => {
  const { nickname, score } = useGame();
  const navigate = useNavigate();

  // Add the current player to the results
  const results = [...mockResults, { name: nickname, score: score, avatar: '/images/blue.png' }].sort((a, b) => b.score - a.score);

  const top3 = results.slice(0, 3);

  const handlePlayAgain = () => {
    navigate('/choose-level');
  };

  const handleLeave = () => {
    navigate('/');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold my-6">頒獎台</h1>
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
        {/* Podium */}
        <div className="flex justify-center items-end h-48 mb-6">
          {top3[1] && (
            <div className="text-center mx-2">
              <img src={top3[1].avatar} className="w-16 h-16 rounded-full border-2 border-gray-400 mx-auto"/>
              <div className="font-bold">{top3[1].name}</div>
              <div className="bg-gray-400 text-black p-2 rounded-t-lg h-16 flex items-center justify-center">2</div>
            </div>
          )}
          {top3[0] && (
            <div className="text-center mx-2">
              <img src={top3[0].avatar} className="w-20 h-20 rounded-full border-2 border-yellow-400 mx-auto"/>
              <div className="font-bold">{top3[0].name}</div>
              <div className="bg-yellow-400 text-black p-2 rounded-t-lg h-24 flex items-center justify-center">1</div>
            </div>
          )}
          {top3[2] && (
            <div className="text-center mx-2">
              <img src={top3[2].avatar} className="w-16 h-16 rounded-full border-2 border-yellow-700 mx-auto"/>
              <div className="font-bold">{top3[2].name}</div>
              <div className="bg-yellow-700 text-black p-2 rounded-t-lg h-12 flex items-center justify-center">3</div>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`flex justify-between items-center p-2 rounded-lg ${r.name === nickname ? 'bg-blue-600' : 'bg-gray-700'}`}>
              <div className="flex items-center">
                <span className="w-8">{i + 1}</span>
                <span>{r.name}</span>
              </div>
              <span>{r.score}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex space-x-2">
          <button onClick={handleLeave} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
            離開房間
          </button>
          <button onClick={handlePlayAgain} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
            再玩一次
          </button>
        </div>
      </div>
    </div>
  );
};

export default Award;
