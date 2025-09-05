import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from '../components/BackButton.js';

const UsernameSetupPage = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { email, password } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password
        }),
      });

      if (response.ok) {
        navigate('/home');
      } else {
        const data = await response.json();
        setError(data.message || 'Username setup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

      <div className="relative z-10">
        <BackButton />
        
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md">
            <div className="bg-gray-900 bg-opacity-80 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold text-center mb-2">Choose Your Username</h2>
              <p className="text-gray-400 text-center mb-8">Pick a unique username for your SyncSphere account</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-colors"
                    required
                    minLength="3"
                    maxLength="20"
                    pattern="[a-zA-Z0-9_]+"
                    title="Username can only contain letters, numbers, and underscores"
                  />
                  <p className="text-gray-500 text-sm mt-2">
                    Username must be 3-20 characters long and contain only letters, numbers, and underscores
                  </p>
                </div>
                
                {error && (
                  <div className="text-red-400 text-sm text-center">{error}</div>
                )}
                
                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="w-full bg-green-400 text-black py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Setting up...' : 'Complete Setup'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsernameSetupPage;