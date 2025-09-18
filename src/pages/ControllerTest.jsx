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
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">測試您的控制器</h1>
          <p className="py-6">請根據指示傾斜您的手機</p>
          <div className="card bg-base-100 shadow-xl mt-8">
            <div className="card-body items-center text-center">
              <p className="mb-6">[Controller test area]</p>
              <div className="card-actions justify-center">
                <button onClick={handleStart} className="btn btn-primary">
                  準備開始
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControllerTest;