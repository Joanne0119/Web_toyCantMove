import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const Error = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { webRTC } = useGame();
  const errorMessage = location.state?.message || '發生未知錯誤';

  const handleBackHome = () => {
    webRTC.disconnect(); 
    navigate('/');
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold">錯誤</h1>
          <p className="py-6">{errorMessage}</p>
          <button onClick={handleBackHome} className="btn btn-primary">
            返回首頁
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error;