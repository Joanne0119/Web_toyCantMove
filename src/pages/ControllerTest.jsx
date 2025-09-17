import React from 'react';
import { useNavigate } from 'react-router-dom';

const ControllerTest = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    // In a real game, you would have game logic here.
    // For now, we'll just go to the award screen.
    navigate('/award');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold">測試您的控制器</h1>
        <p className="text-lg mt-2">請根據指示傾斜您的手機</p>
      </div>
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md text-center">
        {/* You can add device orientation logic here */}
        <p className="mb-6">[Controller test area]</p>
        <button onClick={handleStart} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
          準備開始
        </button>
      </div>
    </div>
  );
};

export default ControllerTest;
