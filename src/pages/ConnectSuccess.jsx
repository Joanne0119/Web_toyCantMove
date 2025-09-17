import React from 'react'
import Slogan from '@/components/Slogan';

const ConnectSuccess = () => (
    <div className="flex flex-col items-center min-h-screen bg-white font-sans">
        <Slogan>不會動的玩具<br />才正常吧</Slogan>
        <div className="mt-48 flex flex-col items-center">
            <div className="bg-gray-200 text-xl py-4 rounded-full text-center w-80 max-w-full min-h-12 flex items-center justify-center">
                連線成功!!
            </div>
        </div>
    </div>
);

export default ConnectSuccess
