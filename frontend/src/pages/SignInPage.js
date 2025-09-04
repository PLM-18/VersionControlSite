import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton.js';

const SignInPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        localStorage.setItem('token', (await response.json()).token);
        navigate('/home');
      } else {
        const data = await response.json();
        setError(data.message || 'Login failed');
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
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
                  <span className="text-black font-bold text-2xl">S</span>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-center mb-2">Join SyncSphere</h2>
              <p className="text-gray-400 text-center mb-8">Sign in to your account</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Username or Email Address</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-colors"
                    required
                  />
                </div>
                
                {error && (
                  <div className="text-red-400 text-sm text-center">{error}</div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-400 text-black py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
              
              <div className="text-center mt-6">
                <span className="text-gray-400">Don't have an account? </span>
                <button
                  onClick={() => navigate('/signup')}
                  className="text-green-400 hover:underline"
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;