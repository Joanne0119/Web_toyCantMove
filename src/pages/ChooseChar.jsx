import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router';
import Slogan from '@/components/Slogan';
import PlayerRow from './PlayerRow.jsx';
import { images } from '@/assets/constants';

const ChooseChar = () => {
    const navigate = useNavigate();
    const initialCharacters = [
        { name: 'red', speed: '8', power: '10', skill: '7', src: images.red },
        { name: 'blue', speed: '10', power: '6', skill: '9', src: images.blue },
        { name: 'yellow', speed: '7', power: '9', skill: '8', src: images.yellow },
    ];
    
    const [nickname, setNickname] = useState('');
    const [mainChar, setMainChar] = useState({ name: "green", speed: "8", power: "10", skill: "7", src: images.green });
    const [thumbChars, setThumbChars] = useState(initialCharacters);

    useEffect(() => {
        setNickname(localStorage.getItem('nickname') || '玩家');
    }, []);

    const handleThumbClick = (char) => {
        setThumbChars(prev => [...prev.filter(c => c.name !== char.name), mainChar]);
        setMainChar(char);
    };

    const handleConfirm = () => {
        localStorage.setItem('character', JSON.stringify(mainChar));
        localStorage.setItem('characterImage', mainChar.src);
        // Decide if user is host or player. For now, let's assume player.
        navigate('/waiting-room'); 
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-white font-sans">
            <Slogan>不會動的玩具<br />才正常吧</Slogan>
            <div className="flex flex-col items-center gap-6 mt-8 sm:mt-12 w-full px-5">
                <label className="text-lg sm:text-xl mb-4 text-center">{`你好，${nickname}，請選擇角色`}</label>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                    <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-gray-200 overflow-hidden flex justify-center items-center">
                        <img src={mainChar.src} alt={mainChar.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-base sm:text-lg bg-gray-500 text-white p-3 sm:p-4 rounded-lg leading-loose w-40 sm:w-32">
                        <div>速度：<span>{mainChar.speed}</span></div>
                        <div>力量：<span>{mainChar.power}</span></div>
                        <div>技巧：<span>{mainChar.skill}</span></div>
                    </div>
                </div>
                <div className="bg-gray-200 py-2 px-6 rounded-full text-base sm:text-lg my-4 text-center">
                    {mainChar.name}
                </div>
                <div className="flex gap-4 overflow-x-auto py-4 w-full justify-center">
                    {thumbChars.map(char => (
                        <div key={char.name} className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-200 overflow-hidden cursor-pointer" onClick={() => handleThumbClick(char)}>
                            <img src={char.src} alt={char.name} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
                <button onClick={handleConfirm} className="bg-gray-200 text-lg sm:text-xl py-3 sm:py-4 rounded-full text-center w-full max-w-xs mt-4 border-none">
                    確定
                </button>
            </div>
        </div>
    );
};


export default ChooseChar
