import React from 'react';
import { useNavigate } from 'react-router-dom';

const OfficialFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-neutral text-neutral-content">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo + title */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" alt="Logo" className="h-10 w-10" />
              <span className="text-lg font-bold">不會動的玩具才正常吧</span>
            </div>
            <p className="text-neutral-content/60 text-sm text-center md:text-left">
              一款結合體感操控的多人派對遊戲
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/enter-name')}
            className="btn btn-primary"
          >
            開始遊戲
          </button>
        </div>

        <div className="divider before:bg-neutral-content/20 after:bg-neutral-content/20 my-6" />

        <div className="text-center text-neutral-content/40 text-xs">
          <p>&copy; {new Date().getFullYear()} 不會動的玩具才正常吧. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default OfficialFooter;
