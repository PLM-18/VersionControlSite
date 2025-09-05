import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      className="absolute top-6 left-6 flex items-center space-x-2 text-gray-300 hover:text-white transition-colors z-20"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 19l-7-7 7-7" 
        />
      </svg>
      <span className="font-medium">Back to Home</span>
    </button>
  );
};

export default BackButton;