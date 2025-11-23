import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from "framer-motion";
import PodiumBar from '@/components/PodiumBar.jsx';

const MOCK_FINAL_RESULTS = [
  { name: '黃小姿', point: 128, rank: 1, color: 'green', skin: 'wind-up' },
  { name: '爆香怪人', point: 96, rank: 2, color: 'red', skin: 'hat' },
  { name: '柳橙恩', point: 73, rank: 3, color: 'yellow', skin: 'dog' },
  // { name: '青銅王', point: 0, rank: 4, color: 'blue', skin: 'deer' },
];
const MOCK_LOCAL_PLAYER = { color: 'green', avatar: 'wind-up' };


const Award = () => {
  // debug fake data
  const finalResults = MOCK_FINAL_RESULTS;
  const localPlayer = MOCK_LOCAL_PLAYER;

  // const { finalResults, localPlayer } = useGame();
  
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

  // 取前四名顯示在頒獎台
  const top4 = results

  const handlePlayAgain = () => {
    navigate('/choose-level');
  };

  const handleLeave = () => {
    navigate('/');
  };

  const compact = top4.length > 3;

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
              <div className="flex justify-center items-end h-50 mb-8 pb-2 border-b border-base-300">
                {/** if there are 4 players use compact mode to avoid overflow */}
                
                <PodiumBar player={top4[1]} maxScore={maxScore} compact={compact}/>
                
                <div className="z-10 sm:mx-0 scale-110 origin-bottom">
                   <PodiumBar player={top4[0]} maxScore={maxScore} compact={compact} />
                </div>

                <PodiumBar player={top4[2]} maxScore={maxScore} compact={compact} />
                <div className="z-10 sm:mx-0 scale-110 origin-bottom">
                {top4.length > 3 ? <PodiumBar player={top4[3]} maxScore={maxScore} compact={compact} /> : null}
                </div>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="table w-full">
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