import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router';
import Slogan from '@/components/Slogan';
import { images } from '@/assets/constants';

const Award = () => {
    const navigate = useNavigate();
    
    const [results, setResults] = useState([]);
    const [me, setMe] = useState({ name: '', score: 0, avatar: '' });

    useEffect(() => {
        const mockData = [
            { name: '黃小姿', score: 200, avatar: images.green },
            { name: '爆香怪人', score: 150, avatar: images.red },
            { name: '柳橙恩', score: 100, avatar: images.yellow },
            { name: 'Judy', score: 20, avatar: images.blue },
            { name: 'Candy', score: 20, avatar: images.blue },
        ];
        let data = [...mockData];
        const meName = localStorage.getItem('nickname');
        const meScore = Number(localStorage.getItem('finalScore')) || 50;
        const meAvatar = localStorage.getItem('characterImage') || '';
        
        if (meName) {
            data = data.filter(r => r.name !== meName);
            data.push({ name: meName, score: meScore, avatar: meAvatar });
        }
        data.sort((a, b) => b.score - a.score);
        setResults(data);
        setMe({ name: meName, score: meScore });
    }, []);
    
    const top3 = results.slice(0, 3);
    const myIndex = results.findIndex(r => r.name === me.name);

    const PodiumItem = ({ player, rank }) => (
        <div className="flex flex-col items-center gap-2">
            <div className={`bg-gray-300 bg-cover bg-center rounded-2xl ${rank === 1 ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-20 h-20 sm:w-24 sm:h-24'}`} style={{ backgroundImage: `url(${player?.avatar})` }}/>
            <div className="bg-gray-100 py-2 px-4 rounded-full text-sm sm:text-base text-center truncate w-full">{player?.name || '—'}</div>
            <div className={`flex items-center justify-center font-bold rounded-2xl text-white ${rank === 1 ? 'w-full h-24 text-5xl sm:text-6xl bg-yellow-500' : 'w-full h-20 text-4xl sm:text-5xl'} ${rank === 2 ? 'bg-slate-400' : ''} ${rank === 3 ? 'bg-orange-400' : ''}`}>
                {rank}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center min-h-screen bg-white font-sans">
            <Slogan>頒獎台</Slogan>
            <div className="flex flex-col items-center gap-8 sm:gap-12 mt-8 sm:mt-12 w-full px-4 sm:px-5">
                <div className="grid grid-cols-3 items-end gap-2 sm:gap-4 w-full max-w-sm sm:max-w-md">
                    <PodiumItem player={top3[1]} rank={2} />
                    <PodiumItem player={top3[0]} rank={1} />
                    <PodiumItem player={top3[2]} rank={3} />
                </div>
                
                <div className="w-full max-w-sm sm:max-w-md bg-gray-100 rounded-2xl p-2 sm:p-4 flex flex-col">
                    <div className="grid grid-cols-[1fr,3fr,1.5fr] items-center gap-3 text-base sm:text-lg bg-gray-300 rounded-xl px-3 py-2 mb-3">
                        <div>排名</div>
                        <div>玩家</div>
                        <div className="text-right">分數</div>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-40 sm:max-h-48">
                        {results.map((r, i) => (
                            <div key={i} className="grid grid-cols-[1fr,3fr,1.5fr] items-center h-10 sm:h-12 bg-gray-400 rounded-xl px-3 text-base sm:text-lg mb-2">
                                <div>{i + 1}</div>
                                <div className="truncate">{r.name}</div>
                                <div className="text-right">{r.score}</div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-[1fr,3fr,1.5fr] items-center h-10 sm:h-12 bg-gray-500 text-white rounded-xl px-3 text-base sm:text-lg mt-2 sticky bottom-0">
                        {myIndex >= 0 ? (
                            <>
                                <div>{myIndex + 1}</div>
                                <div className="truncate">{me.name}</div>
                                <div className="text-right">{me.score}</div>
                            </>
                        ) : (
                            <>
                                <div>-</div>
                                <div>{me.name || '我'}</div>
                                <div className="text-right">0</div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 w-full mt-4 max-w-xs">
                    <button onClick={() => navigate('/')} className="bg-gray-200 text-lg sm:text-xl py-3 sm:py-4 rounded-full w-full border-none">離開房間</button>
                    <button onClick={() => navigate('/choose-level-host')} className="bg-gray-400 text-lg sm:text-xl py-3 sm:py-4 rounded-full w-full border-none">再玩一次</button>
                </div>
            </div>
        </div>
    );
};

export default Award
