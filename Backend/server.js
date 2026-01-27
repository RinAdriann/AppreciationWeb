const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Story data (in production, move this to a database)
const journeyData = [
  {
    id: 1,
    phase: "The Spark",
    date: "September 2023",
    image_public_id: "folder/friends_pic_1",
    caption: "The day we met...",
    theme: { background: "#FFF5F7", text: "#2d3436", accent: "#fab1a0" }
  },
  {
    id: 2,
    phase: "Getting Closer",
    date: "October 2023",
    image_public_id: "folder/friends_pic_2",
    caption: "Late night conversations that made my heart race...",
    theme: { background: "#FFF0F5", text: "#2d3436", accent: "#fd79a8" }
  },
  {
    id: 3,
    phase: "The Crush",
    date: "November 2023",
    image_public_id: "folder/crush_pic_1",
    caption: "I couldn't stop thinking about you...",
    theme: { background: "#FFE6F0", text: "#2d3436", accent: "#e84393" }
  },
  {
    id: 4,
    phase: "First Date",
    date: "December 2023",
    image_public_id: "folder/dating_pic_1",
    caption: "The moment everything changed...",
    theme: { background: "#F3E5F5", text: "#2d3436", accent: "#a29bfe" }
  },
  {
    id: 5,
    phase: "Together",
    date: "January 2024",
    image_public_id: "folder/lovers_pic_1",
    caption: "You said yes, and my world became complete...",
    theme: { background: "#E8F5E9", text: "#2d3436", accent: "#55efc4" }
  }
];

// Password for authentication (use environment variable)
const SITE_PASSWORD = process.env.SITE_PASSWORD || "1November2025";

// Generate signed Cloudinary URL
function generateSignedUrl(publicId) {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const signedUrl = cloudinary.url(publicId, {
      sign_url: true,
      type: 'authenticated',
      secure: true,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1200, crop: 'limit' }
      ]
    });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Password verification endpoint
app.post('/api/verify-password', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }
  
  if (password === SITE_PASSWORD) {
    // In production, generate a JWT token here
    return res.json({ 
      success: true, 
      token: Buffer.from(`${password}:${Date.now()}`).toString('base64')
    });
  }
  
  return res.status(401).json({ success: false, error: 'Incorrect password' });
});

// Get journey data with signed URLs
app.get('/api/journey', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization token' });
  }
  
  // Simple token validation (in production, use JWT)
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = Buffer.from(token, 'base64').toString();
    const [password] = decoded.split(':');
    
    if (password !== SITE_PASSWORD) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
  
  // Generate signed URLs for all images
  const dataWithSignedUrls = journeyData.map(item => ({
    ...item,
    image_url: generateSignedUrl(item.image_public_id)
  }));
  
  res.json(dataWithSignedUrls);
});

// Get single journey step
app.get('/api/journey/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization token' });
  }
  
  const { id } = req.params;
  const item = journeyData.find(d => d.id === parseInt(id));
  
  if (!item) {
    return res.status(404).json({ error: 'Journey step not found' });
  }
  
  res.json({
    ...item,
    image_url: generateSignedUrl(item.image_public_id)
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📸 Cloudinary configured: ${cloudinary.config().cloud_name}`);
});