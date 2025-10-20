import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { webRTC } = useGame(); 
  const { disconnect,isConnected } = webRTC;

  const handleBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    const confirmGoHome = window.confirm('返回首頁將斷開連線，確認返回首頁？');
    if (confirmGoHome) {
      disconnect();
      navigate('/'); 
    }
  };

  // Only show the back button if we are not on the home page
  const showBackButton = location.pathname !== '/';

  return (
    <div className="navbar absolute top-0 left-0 right-0 z-10">
      <div className="navbar-start">
        {showBackButton && (
          <button className="btn btn-ghost text-white" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
        )}
      </div>
      <div className="navbar-end">
         {isConnected && (
          <button className="btn btn-ghost text-white" onClick={handleGoHome}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 12l6-6m-6 6l6 6" />
            </svg>
            Home
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
