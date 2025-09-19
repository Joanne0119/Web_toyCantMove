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
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-8">頒獎台</h1>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {/* Podium */}
              <div className="flex justify-center items-end h-48 mb-6">
                {top3[1] && (
                  <div className="text-center mx-2">
                    <div className="avatar">
                      <div className="w-16 rounded-full ring ring-gray-400">
                        <img src={top3[1].avatar} />
                      </div>
                    </div>
                    <div className="font-bold">{top3[1].name}</div>
                    <div className="bg-gray-400 text-black p-2 rounded-t-lg h-16 flex items-center justify-center">2</div>
                  </div>
                )}
                {top3[0] && (
                  <div className="text-center mx-2">
                     <div className="avatar">
                      <div className="w-20 rounded-full ring ring-yellow-400">
                        <img src={top3[0].avatar} />
                      </div>
                    </div>
                    <div className="font-bold">{top3[0].name}</div>
                    <div className="bg-yellow-400 text-black p-2 rounded-t-lg h-24 flex items-center justify-center">1</div>
                  </div>
                )}
                {top3[2] && (
                  <div className="text-center mx-2">
                    <div className="avatar">
                      <div className="w-16 rounded-full ring ring-yellow-700">
                        <img src={top3[2].avatar} />
                      </div>
                    </div>
                    <div className="font-bold">{top3[2].name}</div>
                    <div className="bg-yellow-700 text-black p-2 rounded-t-lg h-12 flex items-center justify-center">3</div>
                  </div>
                )}
              </div>

              {/* Leaderboard */}
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className={`${r.name === nickname ? 'active' : ''}`}>
                        <th>{i + 1}</th>
                        <td>{r.name}</td>
                        <td>{r.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card-actions justify-center mt-6">
                <button onClick={handleLeave} className="btn btn-ghost">離開房間</button>
                <button onClick={handlePlayAgain} className="btn btn-primary">再玩一次</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Award;