import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';

// Define which pages allow going back, and where they go
const backRoutes = {
  '/choose-char': '/enter-name',
  '/waiting-room': null,     // Use leave button in page instead
  '/choose-level': null,     // Use leave button in page instead
};

// Pages where back/home buttons should be hidden entirely
const hideNavPages = ['/tutorial', '/playing', '/award'];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { webRTC } = useGame();
  const { disconnect, isConnected } = webRTC;

  const currentPath = location.pathname;

  // Hide navbar entirely on gameplay pages
  if (hideNavPages.includes(currentPath)) {
    return null;
  }

  const backTarget = backRoutes[currentPath];
  const showBackButton = currentPath !== '/enter-name' && backTarget !== undefined && backTarget !== null;

  const handleBack = () => {
    if (backTarget) {
      navigate(backTarget);
    }
  };

  const handleGoHome = () => {
    const confirmGoHome = window.confirm('返回首頁將斷開連線，確認返回首頁？');
    if (confirmGoHome) {
      disconnect();
      navigate('/enter-name');
    }
  };

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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-5 h-5 ml-1 mb-1" fill="white">
              <path d="M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z"/>
            </svg>
            Home
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
