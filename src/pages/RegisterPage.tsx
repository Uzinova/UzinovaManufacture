import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Mail, Lock, ArrowLeft, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      await register(email, password);
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Failed to create an account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="bg-accent/95 fixed w-full z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-6 w-6 mr-2" />
            Geri
          </button>
          <div className="flex items-center">
            <Rocket className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold">Uzinovas</span>
          </div>
        </div>
      </header>

      {/* Register Form */}
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="bg-accent rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Create Account</h1>
            <p className="text-gray-400">Join the Uzinovas community</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded p-3 mb-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background w-full pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background w-full pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background w-full pl-10 pr-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
