import React from 'react'

const LevelItem = ({ level, isSelected, onSelect }) => (
    <div onClick={onSelect} className={`bg-gray-400 rounded-2xl w-10/12 flex items-center p-3 gap-4 ${onSelect ? 'cursor-pointer transition-transform duration-200 hover:scale-105' : ''} ${isSelected ? 'border-2 border-black' : ''}`}>
        <img src={level.image} alt={level.name} className="w-24 h-16 bg-gray-300 rounded-lg object-cover"/>
        <div className="text-xl">{level.name}</div>
    </div>
);

export default LevelItem
