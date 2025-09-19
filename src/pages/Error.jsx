import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Error = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const errorMessage = location.state?.message || '發生未知錯誤';

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold">錯誤</h1>
          <p className="py-6">{errorMessage}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            返回首頁
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error;