import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from "framer-motion";

const Award = () => {
  const { finalResults, localPlayer } = useGame();
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!finalResults || finalResults.length === 0) {
      return []; 
    }

    return finalResults.map(r => {
      
      const name = `${r.name}`; 

      const avatar = `/images/${r.color}_${r.skin}.png`; 

      return {
        name,
        score: r.point,
        avatar,
        color: r.color,
        skin: r.skin
      };
    });
  }, [finalResults]); 

  const top3 = results.slice(0, 3);

  const handlePlayAgain = () => {
    navigate('/choose-level');
  };

  const handleLeave = () => {
    navigate('/');
  };

  return (
    <div className="hero min-h-screen bg-base-200 overflow-x-hidden select-none" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center' }}>
      <div className='absolute top-0 left-0 w-full h-full' style={{ backdropFilter: 'blur(1px) saturate(80%)' }}></div>
      <div className="hero-content text-center">
        <div className="max-w-lg">
          <motion.div 
            className="card bg-base-100 shadow-xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",   
              stiffness: 120,   
              damping: 15,      
              duration: 0.8
            }}
          >
            <div className="card-body">
              {/* Podium */}
              <div className="flex justify-center items-end h-48 mb-6">
                {/* 顯示第 2 名 (index 1) */}
                {top3[1] && (
                  <div className="text-center mx-2">
                    <div className="avatar">
                      <div className="w-16">
                        <img src={top3[1].avatar} alt={top3[1].name} />
                      </div>
                    </div>
                    <div className="font-bold">{top3[1].name}</div>
                    <div className="bg-gray-400 text-black p-2 rounded-t-lg h-16 flex items-center justify-center">2</div>
                  </div>
                )}
                {/* 顯示第 1 名 (index 0) */}
                {top3[0] && (
                  <div className="text-center mx-2">
                     <div className="avatar">
                      <div className="w-20">
                        <img src={top3[0].avatar} alt={top3[0].name} />
                      </div>
                    </div>
                    <div className="font-bold">{top3[0].name}</div>
                    <div className="bg-yellow-400 text-black p-2 rounded-t-lg h-24 flex items-center justify-center">1</div>
                  </div>
                )}
                {/* 顯示第 3 名 (index 2) */}
                {top3[2] && (
                  <div className="text-center mx-2">
                    <div className="avatar">
                      <div className="w-16">
                        <img src={top3[2].avatar} alt={top3[2].name} />
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
                      <tr 
                        key={i} 
                        // 7. 高亮邏輯：
                        // 假設 localPlayer.avatar 對應到 finalResults 的 skin
                        // 並且 localPlayer.color 對應到 finalResults 的 color
                        className={`${
                          r.color === localPlayer.color && r.skin === localPlayer.avatar 
                          ? 'active' 
                          : ''
                        }`}
                      >
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
                {/* <button onClick={handlePlayAgain} className="btn btn-primary">再玩一次</button> */}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Award;