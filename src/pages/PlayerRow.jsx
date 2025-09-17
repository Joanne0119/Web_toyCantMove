import React from 'react'

const PlayerRow = ({ image, name }) => (
    <div className="flex items-center gap-4 sm:gap-8 w-full p-2">
        <img src={image} alt={name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg bg-gray-300" />
        <div className="text-lg sm:text-xl text-left">{name}</div>
    </div>
);

export default PlayerRow
