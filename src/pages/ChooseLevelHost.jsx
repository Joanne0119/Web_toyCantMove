import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router';
import Slogan from '@/components/Slogan';
import LevelItem from '@/components/LevelItem';
import { levels } from '@/assets/constants.js';

const ChooseLevelHost = () => {
    const navigate = useNavigate();
    const [selectedLevel, setSelectedLevel] = useState('');

    useEffect(() => {
        setSelectedLevel(localStorage.getItem("selectedLevel") || '');
    }, []);

    const handleSelect = (levelName) => {
        setSelectedLevel(levelName);
        localStorage.setItem("selectedLevel", levelName);
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-white font-sans">
            <Slogan>不會動的玩具<br />才正常吧</Slogan>
            <div className="my-6 text-lg sm:text-xl text-center">請選擇遊戲場景</div>
            <div className="flex flex-col items-center gap-8 sm:gap-12 mt-8 sm:mt-12 w-full px-5">
                <div className="bg-gray-100 mx-auto py-4 rounded-2xl w-full max-w-xs sm:max-w-sm flex flex-col gap-4 items-center">
                    {levels.map(level => <LevelItem key={level.name} level={level} isSelected={level.name === selectedLevel} onSelect={() => handleSelect(level.name)} />)}
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4 w-full mt-8 max-w-xs">
                    <button onClick={() => navigate('/')} className="bg-gray-200 text-lg sm:text-xl py-3 sm:py-4 rounded-full w-full border-none">離開房間</button>
                    <button onClick={() => navigate('/testing')} className="bg-gray-400 text-lg sm:text-xl py-3 sm:py-4 rounded-full w-full border-none">開始遊戲</button>
                </div>
            </div>
        </div>
    );
};


export default ChooseLevelHost
