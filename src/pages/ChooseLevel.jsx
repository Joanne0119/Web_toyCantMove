import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router';
import Slogan from '@/components/Slogan';
import LevelItem from '@/components/LevelItem';
import { levels } from '@/assets/constants.js';

const ChooseLevel = () => {
    const navigate = useNavigate();
    const [selectedLevel, setSelectedLevel] = useState('');

    useEffect(() => {
        // In a real app, this would come from a server/websocket
        setSelectedLevel(localStorage.getItem("selectedLevel"));
    }, []);

    return (
        <div className="flex flex-col items-center min-h-screen bg-white font-sans">
            <Slogan>不會動的玩具<br />才正常吧</Slogan>
            <div className="text-lg sm:text-xl my-6 text-center">等待房主選擇關卡...</div>
            <div className="flex flex-col items-center gap-8 sm:gap-12 mt-8 sm:mt-12 w-full px-5">
                <div className="bg-gray-100 mx-auto py-4 rounded-2xl w-full max-w-xs sm:max-w-sm flex flex-col gap-4 items-center">
                    {levels.map(level => <LevelItem key={level.name} level={level} isSelected={level.name === selectedLevel} />)}
                </div>
                <button onClick={() => navigate('/')} className="mt-8 bg-gray-200 text-lg sm:text-xl py-3 sm:py-4 rounded-full w-full max-w-xs border-none">
                    離開房間
                </button>
            </div>
        </div>
    );
};

export default ChooseLevel
