import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };

  // Only show the back button if we are not on the home page
  const showBackButton = location.pathname !== '/';

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        {showBackButton && (
          <button className="btn btn-ghost" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>
        )}
      </div>
      <div className="navbar-center">
        <a className="btn btn-ghost normal-case text-xl">Toy Cant Move</a>
      </div>
      <div className="navbar-end">
        {/* You can add other navbar items here */}
      </div>
    </div>
  );
};

export default Navbar;
