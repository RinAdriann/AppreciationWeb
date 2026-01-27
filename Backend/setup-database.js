const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🗄️  Creating database tables...');
    
    // Journey steps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS journey_steps (
        id SERIAL PRIMARY KEY,
        phase VARCHAR(255) NOT NULL,
        date VARCHAR(100) NOT NULL,
        image_public_id VARCHAR(500) NOT NULL,
        caption TEXT NOT NULL,
        theme_background VARCHAR(50) NOT NULL,
        theme_text VARCHAR(50) NOT NULL,
        theme_accent VARCHAR(50) NOT NULL,
        step_order INTEGER NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Admin users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_step_order ON journey_steps(step_order);
    `);
    
    console.log('✅ Tables created successfully!');
    
    // Insert initial data if empty
    const checkData = await client.query('SELECT COUNT(*) FROM journey_steps');
    
    if (checkData.rows[0].count === '0') {
      console.log('📝 Inserting initial journey data...');
      
      await client.query(`
        INSERT INTO journey_steps (phase, date, image_public_id, caption, theme_background, theme_text, theme_accent, step_order)
        VALUES 
          ('The Spark', 'November 1, 2025', 'journey/step_1', 'The day we met...', '#FFF5F7', '#2d3436', '#fab1a0', 1),
          ('Getting Closer', 'November 15, 2025', 'journey/step_2', 'Late night conversations that made my heart race...', '#FFF0F5', '#2d3436', '#fd79a8', 2),
          ('The Crush', 'December 1, 2025', 'journey/step_3', 'I couldn''t stop thinking about you...', '#FFE6F0', '#2d3436', '#e84393', 3),
          ('First Date', 'December 15, 2025', 'journey/step_4', 'The moment everything changed...', '#F3E5F5', '#2d3436', '#a29bfe', 4),
          ('Together', 'January 1, 2026', 'journey/step_5', 'You said yes, and my world became complete...', '#E8F5E9', '#2d3436', '#55efc4', 5);
      `);
      
      console.log('✅ Initial data inserted!');
    }
    
    console.log('\n🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();