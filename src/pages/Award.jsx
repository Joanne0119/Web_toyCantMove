import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from "framer-motion";
import PodiumBar from '@/components/PodiumBar.jsx';


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
        rank: r.rank, 
        avatar,
        color: r.color,
        skin: r.skin
      };
    });
  }, [finalResults]); 

  // 計算最高分，用於計算高度百分比
  const maxScore = useMemo(() => {
    if (results.length === 0) return 100;
    return Math.max(...results.map(r => r.score));
  }, [results]);

  // 取前三名顯示在頒獎台
  const top3 = results.slice(0, 3);

  const handlePlayAgain = () => {
    navigate('/choose-level');
  };

  const handleLeave = () => {
    navigate('/');
  };

  return (
    <div className="hero min-h-screen bg-base-200 overflow-x-hidden select-none" style={{ backgroundImage: "url('/images/coverLarge.png')", backgroundSize: 'cover', backgroundPosition: 'left 47% center', minHeight: '100dvh'}}>
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
            <div className="card-body p-4 sm:p-8">
              <div className="flex justify-center items-end h-64 mb-8 pb-2 border-b border-base-300">
                <PodiumBar player={top3[1]} maxScore={maxScore}/>
                
                <div className="z-10 -mx-2 sm:mx-0 scale-110 origin-bottom">
                   <PodiumBar player={top3[0]} maxScore={maxScore} />
                </div>

                <PodiumBar player={top3[2]} maxScore={maxScore} />
              </div>

              <div className="overflow-x-auto w-full">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="text-center">
                      <th className="bg-base-200/50">名次</th>
                      <th className="bg-base-200/50">玩家</th>
                      <th className="bg-base-200/50">分數</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr 
                        key={i} 
                        className={`text-center hover ${
                          r.color === localPlayer.color && r.skin === localPlayer.avatar 
                          ? 'bg-primary/20 font-bold' 
                          : ''
                        }`}
                      >
                        <th>
                          {r.rank}
                        </th>
                        <td>
                          <div className="flex items-center justify-center gap-2">
                            <div className="avatar">
                              <div className="w-8 rounded-full">
                                <img src={r.avatar} alt={r.name} />
                              </div>
                            </div>
                            {r.name}
                          </div>
                        </td>
                        <td className="font-mono text-lg">{r.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* <div className="card-actions justify-center mt-6">
                <button onClick={handleLeave} className="btn btn-ghost">離開房間</button>
                <button onClick={handlePlayAgain} className="btn btn-primary">再玩一次</button>
              </div> */}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Award;