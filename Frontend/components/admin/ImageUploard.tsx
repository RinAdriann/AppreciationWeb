'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ImageUploaderProps {
  token: string;
}

export default function ImageUploader({ token }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [publicId, setPublicId] = useState('');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-generate public_id from filename
    const filename = file.name.split('.')[0];
    setPublicId(`journey/${filename.toLowerCase().replace(/\s+/g, '_')}`);
  };

  const handleUpload = async () => {
    if (!preview) {
      alert('Please select an image first');
      return;
    }

    if (!publicId) {
      alert('Please enter a public ID');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/upload-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image_data: preview,
          public_id: publicId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data);
        alert('Image uploaded successfully!');
      } else {
        alert(`Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setPublicId('');
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <h2 className="text-3xl font-bold text-white mb-6">📤 Upload Image to Cloudinary</h2>

      <div className="space-y-6">
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Select Image (Max 10MB)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-300
              file:mr-4 file:py-3 file:px-6
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-500 file:text-white
              hover:file:bg-purple-600
              file:cursor-pointer cursor-pointer
              transition-all"
          />
        </div>

        {/* Preview */}
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">Preview (3:4 ratio):</p>
              <div className="aspect-[3/4] max-w-xs mx-auto rounded-lg overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Public ID Input */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Public ID (Cloudinary path)
              </label>
              <input
                type="text"
                value={publicId}
                onChange={(e) => setPublicId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-purple-400 focus:ring focus:ring-purple-300/50 transition-all outline-none text-white placeholder-gray-400"
                placeholder="journey/step_1"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use this public_id when creating a journey step
              </p>
            </div>

            {/* Upload Button */}
            <div className="flex gap-4">
              <button
                onClick={handleUpload}
                disabled={uploading || !publicId}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 shadow-lg"
              >
                {uploading ? 'Uploading...' : '📤 Upload to Cloudinary'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-xl transition-all font-semibold"
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 space-y-3"
          >
            <div className="flex items-center gap-2 text-green-300 font-semibold text-lg">
              <span>✅</span>
              <span>Upload Successful!</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-400 min-w-[100px]">Public ID:</span>
                <code className="text-green-300 bg-black/30 px-2 py-1 rounded flex-1">
                  {uploadResult.public_id}
                </code>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-400 min-w-[100px]">Dimensions:</span>
                <span className="text-white">
                  {uploadResult.width} × {uploadResult.height}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              💡 Copy the Public ID above and use it when creating a journey step
            </p>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 text-sm text-gray-300">
          <h3 className="font-semibold text-blue-300 mb-3">📖 Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Select an image from your computer (3:4 ratio recommended)</li>
            <li>Review the preview and edit the Public ID if needed</li>
            <li>Click "Upload to Cloudinary" to upload</li>
            <li>Copy the Public ID from the success message</li>
            <li>Use this Public ID when creating/editing a journey step</li>
          </ol>
        </div>
      </div>
    </div>
  );
}