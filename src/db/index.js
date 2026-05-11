const { Pool } = require('pg');

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
}) : null;

async function initDB() {
  if (!pool) { console.log('No DATABASE_URL - running without DB'); return; }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS artists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      genre TEXT,
      bio TEXT,
      style TEXT,
      image_url TEXT,
      streams BIGINT DEFAULT 0,
      revenue DECIMAL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS songs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      lyrics TEXT,
      genre TEXT,
      suno_prompt TEXT,
      audio_url TEXT,
      streams BIGINT DEFAULT 0,
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS marketing_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
      platform TEXT,
      content TEXT,
      posted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✅ Database tables ready');
}

module.exports = { pool, initDB };
