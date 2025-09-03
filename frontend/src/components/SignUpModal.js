import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUpModal = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Navigate to username setup page with email and password
    navigate('/setup-username', {
      state: {
        email: formData.email,
        password: formData.password
      }
    });
  };

  return (
    <div className="bg-gray-900 bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
      <h3 className="text-2xl font-bold mb-2">Join SyncSphere</h3>
      <p className="text-gray-400 mb-6">Start collaborating with your team today</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
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
            placeholder="Create a password"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-colors"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-colors"
            required
          />
        </div>
        
        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-400 text-black py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="text-center mt-6">
        <button
          onClick={() => navigate('/signup')}
          className="text-green-400 hover:underline text-sm"
        >
          Need more options? Full signup form ↗
        </button>
      </div>
    </div>
  );
};

export default SignUpModal;