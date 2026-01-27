'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface JourneyStep {
  id?: number;
  phase: string;
  date: string;
  image_public_id: string;
  image_url?: string;
  caption: string;
  theme: {
    background: string;
    text: string;
    accent: string;
  };
  step_order: number;
}

interface JourneyStepEditorProps {
  token: string;
  step: JourneyStep | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function JourneyStepEditor({ token, step, onSave, onCancel }: JourneyStepEditorProps) {
  const [formData, setFormData] = useState<JourneyStep>({
    phase: '',
    date: '',
    image_public_id: '',
    caption: '',
    theme: {
      background: '#FFF5F7',
      text: '#2d3436',
      accent: '#fab1a0'
    },
    step_order: 1
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (step) {
      setFormData(step);
    }
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const url = step
        ? `${API_URL}/api/admin/journey/${step.id}`
        : `${API_URL}/api/admin/journey`;
      
      const method = step ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(step ? 'Journey step updated!' : 'Journey step created!');
        onSave();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save journey step');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">
          {step ? '✏️ Edit Journey Step' : '➕ Add New Journey Step'}
        </h2>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition-all"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Phase and Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Phase Name *
            </label>
            <input
              type="text"
              value={formData.phase}
              onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-purple-400 focus:ring focus:ring-purple-300/50 transition-all outline-none text-white placeholder-gray-400"
              placeholder="e.g., The Spark"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Date *
            </label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-purple-400 focus:ring focus:ring-purple-300/50 transition-all outline-none text-white placeholder-gray-400"
              placeholder="e.g., November 1, 2025"
              required
            />
          </div>
        </div>

        {/* Row 2: Image Public ID and Step Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Image Public ID (Cloudinary) *
            </label>
            <input
              type="text"
              value={formData.image_public_id}
              onChange={(e) => setFormData({ ...formData, image_public_id: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-purple-400 focus:ring focus:ring-purple-300/50 transition-all outline-none text-white placeholder-gray-400"
              placeholder="e.g., journey/step_1"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Upload image first, then copy the public_id
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Step Order *
            </label>
            <input
              type="number"
              value={formData.step_order}
              onChange={(e) => setFormData({ ...formData, step_order: parseInt(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-purple-400 focus:ring focus:ring-purple-300/50 transition-all outline-none text-white placeholder-gray-400"
              min="1"
              required
            />
          </div>
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Caption *
          </label>
          <textarea
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-purple-400 focus:ring focus:ring-purple-300/50 transition-all outline-none text-white placeholder-gray-400 min-h-[120px]"
            placeholder="Write a romantic caption..."
            required
          />
        </div>

        {/* Theme Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Theme Colors
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.theme.background}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    theme: { ...formData.theme, background: e.target.value }
                  })}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.theme.background}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    theme: { ...formData.theme, background: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Text</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.theme.text}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    theme: { ...formData.theme, text: e.target.value }
                  })}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.theme.text}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    theme: { ...formData.theme, text: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Accent</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.theme.accent}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    theme: { ...formData.theme, accent: e.target.value }
                  })}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.theme.accent}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    theme: { ...formData.theme, accent: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300"
          >
            {error}
          </motion.div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 shadow-lg"
          >
            {saving ? 'Saving...' : step ? 'Update Journey Step' : 'Create Journey Step'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}