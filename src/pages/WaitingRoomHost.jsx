import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router';
import PlayerRow from './PlayerRow.jsx';
import {images} from '@/assets/constants';
import Slogan from '@/components/Slogan';

const WaitingRoomHost = () => {
    const navigate = useNavigate();
    const [player, setPlayer] = useState({ name: '', image: '' });
    
    const otherPlayers = [
        { name: '黃小姿', image: images.green },
        { name: '爆香怪人', image: images.red },
        { name: '柳橙恩', image: images.yellow }
    ];

    useEffect(() => {
        const nickname = localStorage.getItem('nickname') || '你';
        const characterImage = localStorage.getItem('characterImage') || images.green;
        setPlayer({ name: nickname, image: characterImage });
    }, []);

    return (
        <div className="flex flex-col items-center min-h-screen bg-white font-sans">
            <Slogan>不會動的玩具<br />才正常吧</Slogan>
            <div className="flex flex-col items-center gap-12 mt-12 w-full px-5">
                <div className="my-6 text-xl">等待玩家進入...</div>
                <div className="bg-gray-100 mx-auto py-4 rounded-2xl w-full max-w-sm flex flex-col gap-4 items-center">
                    <PlayerRow name={player.name} image={player.image} />
                    {otherPlayers.map(p => <PlayerRow key={p.name} name={p.name} image={p.image} />)}
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4 w-full mt-8 max-w-xs">
                    <button onClick={() => navigate('/')} className="bg-gray-200 text-xl py-4 rounded-full w-full border-none">離開房間</button>
                    <button onClick={() => navigate('/choose-level-host')} className="bg-gray-400 text-xl py-4 rounded-full w-full border-none">下一步</button>
                </div>
            </div>
        </div>
    );
};

export default WaitingRoomHost
