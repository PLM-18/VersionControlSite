import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard.js';
import SignUpModal from '../components/SignUpModal.js';
import {
  Users,
  FolderOpen,
  Share,
  RefreshCw,
} from "lucide-react";

const LandingPage = () => {
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      title: 'Collaborate and Add friends',
      color: 'bg-red-500',
      icon: <Users className="w-6 h-6" />
    },
    {
      title: 'View Other Projects',
      color: 'bg-pink-500',
      icon: <FolderOpen className="w-6 h-6" />
    },
    {
      title: 'Share and Create Projects',
      color: 'bg-green-500',
      icon: <Share className="w-6 h-6" />
    },
    {
      title: 'Update and Share Project files',
      color: 'bg-blue-500',
      icon: <RefreshCw className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #4f46e5 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, #06b6d4 0%, transparent 50%)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-lg">S</span>
          </div>
          <h1 className="text-2xl font-bold text-green-400">SyncSphere</h1>
        </div>
        <button 
          onClick={() => navigate('/signin')}
          className="bg-green-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-green-500 transition-colors"
        >
          Sign In
        </button>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-between px-8 py-16 max-w-7xl mx-auto">
        {/* Left Side */}
        <div className="flex-1 max-w-2xl">
          <h1 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Version Control
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Collaborate seamlessly, track changes effortlessly, and deploy with confidence. 
            The next generation of version control built for modern development teams.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="w-96 ml-12">
          <SignUpModal onClose={() => setShowSignUpModal(false)} />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;