import React from 'react'
import { useNavigate } from 'react-router';

const Testing = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white font-sans px-4 text-center">
             <div className="flex flex-col items-center gap-8 sm:gap-12 w-full">
                <div className="text-xl sm:text-2xl">測試您的控制器</div>
                <div className="text-lg sm:text-xl">請根據指示傾斜您的手機</div>
                <button onClick={() => navigate('/award')} className="mt-8 bg-gray-200 text-lg sm:text-xl py-3 sm:py-4 rounded-full w-full max-w-xs border-none">
                    準備開始
                </button>
            </div>
        </div>
    );
};

export default Testing
