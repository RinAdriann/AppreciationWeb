'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JourneyStepEditor from './JourneyStepEditor';
import ImageUploader from './ImageUploader';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface JourneyStep {
  id: number;
  phase: string;
  date: string;
  image_public_id: string;
  image_url: string;
  caption: string;
  theme: {
    background: string;
    text: string;
    accent: string;
  };
  step_order: number;
  created_at: string;
  updated_at: string;
}

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

export default function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'upload'>('list');
  const [editingStep, setEditingStep] = useState<JourneyStep | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    fetchJourneySteps();
  }, []);

  const fetchJourneySteps = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/journey`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJourneySteps(data);
      } else {
        console.error('Failed to fetch journey steps');
      }
    } catch (error) {
      console.error('Error fetching journey steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this journey step?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/journey/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setJourneySteps(journeySteps.filter(step => step.id !== id));
        alert('Journey step deleted successfully!');
      } else {
        alert('Failed to delete journey step');
      }
    } catch (error) {
      console.error('Error deleting journey step:', error);
      alert('Error deleting journey step');
    }
  };

  const handleEdit = (step: JourneyStep) => {
    setEditingStep(step);
    setShowEditor(true);
  };

  const handleAddNew = () => {
    setEditingStep(null);
    setShowEditor(true);
  };

  const handleSave = async () => {
    await fetchJourneySteps();
    setShowEditor(false);
    setEditingStep(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage Your Journey Timeline</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'list'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            📋 All Steps ({journeySteps.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('add');
              handleAddNew();
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'add'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            ➕ Add New Step
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            📤 Upload Image
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'list' && !showEditor && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {journeySteps.map((step) => (
                <JourneyStepCard
                  key={step.id}
                  step={step}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ImageUploader token={token} />
            </motion.div>
          )}

          {showEditor && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <JourneyStepEditor
                token={token}
                step={editingStep}
                onSave={handleSave}
                onCancel={() => {
                  setShowEditor(false);
                  setEditingStep(null);
                  setActiveTab('list');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Journey Step Card Component
function JourneyStepCard({
  step,
  onEdit,
  onDelete
}: {
  step: JourneyStep;
  onEdit: (step: JourneyStep) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <motion.div
      layout
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all"
    >
      <div className="flex gap-6">
        {/* Image Preview */}
        <div className="flex-shrink-0">
          <div className="w-32 h-40 rounded-lg overflow-hidden bg-gray-800">
            <img
              src={step.image_url}
              alt={step.phase}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">#{step.step_order}</span>
                <h3 className="text-2xl font-bold text-white">{step.phase}</h3>
              </div>
              <p className="text-purple-300 text-sm mt-1">{step.date}</p>
            </div>
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: step.theme.accent }}
            />
          </div>

          <p className="text-gray-300 line-clamp-2">{step.caption}</p>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Image: {step.image_public_id}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onEdit(step)}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all text-sm font-semibold"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDelete(step.id)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all text-sm font-semibold"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}