'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { verifyPassword } from '@/lib/api';

interface PasswordGateProps {
  onSuccess: (token: string) => void;
}

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await verifyPassword(password);
      if (data.success && data.token) {
        sessionStorage.setItem('journey_token', data.token);
        onSuccess(data.token);
      }
    } catch (err) {
      setError('Incorrect answer. Try again! 💔');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center"
          >
            <div className="text-6xl">💕</div>
          </motion.div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-800">
              Our Journey
            </h1>
            <p className="text-gray-600">
              Answer this question to unlock our memories
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                When is our anniversary? 🌟
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring focus:ring-pink-200 transition-all outline-none"
                placeholder="Type your answer..."
                disabled={loading}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-pink-500 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? 'Checking...' : 'Unlock Memories 💖'}
            </button>
          </form>

          <p className="text-xs text-center text-gray-500">
            Hint: Think about that special time when it all began 🌹
          </p>
        </div>
      </motion.div>
    </div>
  );
}