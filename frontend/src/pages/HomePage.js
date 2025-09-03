import React from 'react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
          Hey from Homepage!
        </h1>
        <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
          <span className="text-black font-bold text-3xl">🎉</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;