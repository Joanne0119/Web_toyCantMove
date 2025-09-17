import React from 'react'
import Slogan from '@/components/Slogan';

const Connect = () => (
    <div className="flex flex-col items-center min-h-screen bg-white font-sans px-4">
        <Slogan>不會動的玩具<br />才正常吧</Slogan>
        <div className="mt-24 sm:mt-32 md:mt-48 flex flex-col items-center w-full">
            <div className="bg-gray-200 text-xl py-4 rounded-full text-center w-full max-w-xs sm:max-w-sm min-h-12 flex items-center justify-center">
                正在連線...
            </div>
        </div>
    </div>
);

export default Connect
