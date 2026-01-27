const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false
  } : false
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.stack);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const SITE_PASSWORD = process.env.SITE_PASSWORD || "yourpassword";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Generate signed Cloudinary URL
function generateSignedUrl(publicId) {
  try {
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

// Middleware to verify admin
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization token' });
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = Buffer.from(token, 'base64').toString();
    const [password] = decoded.split(':');
    
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin token' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
}

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message
    });
  }
});

// Password verification (for users)
app.post('/api/verify-password', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }
  
  if (password === SITE_PASSWORD) {
    return res.json({ 
      success: true, 
      token: Buffer.from(`${password}:${Date.now()}`).toString('base64')
    });
  }
  
  return res.status(401).json({ success: false, error: 'Incorrect password' });
});

// ============== ADMIN ENDPOINTS ==============

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }
  
  if (password === ADMIN_PASSWORD) {
    return res.json({ 
      success: true, 
      token: Buffer.from(`${password}:${Date.now()}`).toString('base64')
    });
  }
  
  return res.status(401).json({ success: false, error: 'Incorrect admin password' });
});

// ADMIN: Get all journey steps
app.get('/api/admin/journey', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM journey_steps ORDER BY step_order ASC'
    );
    
    const dataWithUrls = result.rows.map(row => ({
      id: row.id,
      phase: row.phase,
      date: row.date,
      image_public_id: row.image_public_id,
      image_url: generateSignedUrl(row.image_public_id),
      caption: row.caption,
      theme: {
        background: row.theme_background,
        text: row.theme_text,
        accent: row.theme_accent
      },
      step_order: row.step_order,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    
    res.json(dataWithUrls);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch journey data' });
  }
});

// ADMIN: Upload image to Cloudinary
app.post('/api/admin/upload-image', verifyAdmin, async (req, res) => {
  const { image_data, public_id } = req.body;
  
  if (!image_data) {
    return res.status(400).json({ error: 'No image data provided' });
  }
  
  try {
    const result = await cloudinary.uploader.upload(image_data, {
      public_id: public_id || undefined,
      folder: 'journey',
      type: 'authenticated',
      resource_type: 'image',
      overwrite: false
    });
    
    res.json({ 
      success: true, 
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
});

// ADMIN: Create new journey step
app.post('/api/admin/journey', verifyAdmin, async (req, res) => {
  const { phase, date, image_public_id, caption, theme, step_order } = req.body;
  
  if (!phase || !date || !image_public_id || !caption || !theme || !step_order) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO journey_steps 
       (phase, date, image_public_id, caption, theme_background, theme_text, theme_accent, step_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [phase, date, image_public_id, caption, theme.background, theme.text, theme.accent, step_order]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create journey step', details: error.message });
  }
});

// ADMIN: Update journey step
app.put('/api/admin/journey/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { phase, date, image_public_id, caption, theme, step_order } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE journey_steps 
       SET phase = $1, date = $2, image_public_id = $3, caption = $4,
           theme_background = $5, theme_text = $6, theme_accent = $7, 
           step_order = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [phase, date, image_public_id, caption, theme.background, theme.text, theme.accent, step_order, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journey step not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update journey step' });
  }
});

// ADMIN: Delete journey step
app.delete('/api/admin/journey/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'DELETE FROM journey_steps WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journey step not found' });
    }
    
    res.json({ success: true, message: 'Journey step deleted' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete journey step' });
  }
});

// ============== USER ENDPOINTS ==============

// Get journey data (for users - with signed URLs)
app.get('/api/journey', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization token' });
  }
  
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
  
  try {
    const result = await pool.query(
      'SELECT * FROM journey_steps ORDER BY step_order ASC'
    );
    
    const dataWithSignedUrls = result.rows.map(row => ({
      id: row.id,
      phase: row.phase,
      date: row.date,
      image_public_id: row.image_public_id,
      image_url: generateSignedUrl(row.image_public_id),
      caption: row.caption,
      theme: {
        background: row.theme_background,
        text: row.theme_text,
        accent: row.theme_accent
      }
    }));
    
    res.json(dataWithSignedUrls);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch journey data' });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📸 Cloudinary configured: ${cloudinary.config().cloud_name}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🔐 Admin password: ${ADMIN_PASSWORD === 'admin123' ? '⚠️  USING DEFAULT - CHANGE THIS!' : '✅ Custom password set'}`);
});