import React from 'react';

const FeatureCard = ({ title, color, icon }) => {
  return (
    <div className={`${color} p-6 rounded-2xl hover:scale-105 transition-transform cursor-pointer group relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative z-10">
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-white font-semibold text-lg leading-tight">
          {title}
        </h3>
      </div>
    </div>
  );
};

export default FeatureCard;