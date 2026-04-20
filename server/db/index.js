import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/soundempire',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Events
pool.on('connect', () => {
  console.log('🔌 Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Database error:', err);
});

// Query helper
export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query:', { text: text.substring(0, 50) + '...', duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Transaction helper
export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Setup database tables
export async function setupDatabase() {
  const schema = `
    -- Artists table
    CREATE TABLE IF NOT EXISTS artists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      genre VARCHAR(100) NOT NULL,
      subgenre VARCHAR(100),
      aesthetic TEXT,
      bio TEXT,
      unique_hook TEXT,
      voice_style TEXT,
      tiktok_angle TEXT,
      brand_color VARCHAR(7) DEFAULT '#00d4ff',
      followers_spotify INTEGER DEFAULT 0,
      followers_tiktok INTEGER DEFAULT 0,
      followers_instagram INTEGER DEFAULT 0,
      followers_youtube INTEGER DEFAULT 0,
      monthly_listeners INTEGER DEFAULT 0,
      total_streams INTEGER DEFAULT 0,
      revenue INTEGER DEFAULT 0,
      tracks_count INTEGER DEFAULT 0,
      is_ai_generated BOOLEAN DEFAULT true,
      status VARCHAR(20) DEFAULT 'active',
      avatar_url TEXT,
      voice_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Releases table
    CREATE TABLE IF NOT EXISTS releases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('Single', 'EP', 'Album', 'Remix')),
      release_date DATE NOT NULL,
      status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'live', 'archived')),
      streams INTEGER DEFAULT 0,
      revenue INTEGER DEFAULT 0,
      bpm INTEGER,
      key VARCHAR(20),
      duration_seconds INTEGER,
      artwork_url TEXT,
      spotify_url TEXT,
      apple_music_url TEXT,
      youtube_url TEXT,
      tiktok_url TEXT,
      lyrics TEXT,
      suno_prompt TEXT,
      ai_generated BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Songs table (individual tracks)
    CREATE TABLE IF NOT EXISTS songs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
      artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      track_number INTEGER,
      duration_seconds INTEGER,
      lyrics TEXT,
      verse1 TEXT,
      prechorus TEXT,
      chorus TEXT,
      verse2 TEXT,
      bridge TEXT,
      production_notes TEXT,
      mood VARCHAR(100),
      bpm INTEGER,
      key VARCHAR(20),
      audio_url TEXT,
      audio_file_path TEXT,
      suno_id VARCHAR(255),
      suno_url TEXT,
      eleventlabs_voice_url TEXT,
      status VARCHAR(20) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Marketing content table
    CREATE TABLE IF NOT EXISTS marketing_content (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
      release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
      content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('tiktok', 'instagram', 'pitch', 'press', 'bio', 'email', 'ad')),
      title VARCHAR(255),
      content JSONB NOT NULL,
      raw_text TEXT,
      platforms TEXT[],
      scheduled_for TIMESTAMP,
      posted_at TIMESTAMP,
      performance_metrics JSONB,
      ai_generated BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Video content table
    CREATE TABLE IF NOT EXISTS videos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
      release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
      song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL CHECK (type IN ('music_video', 'lyric_video', 'teaser', 'behind_the_scenes', 'tiktok')),
      video_url TEXT,
      thumbnail_url TEXT,
      duration_seconds INTEGER,
      kling_id VARCHAR(255),
      runway_id VARCHAR(255),
      replicate_id VARCHAR(255),
      status VARCHAR(20) DEFAULT 'generating',
      prompt TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Voice clones table
    CREATE TABLE IF NOT EXISTS voices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
      name VARCHAR(255),
      elevenlabs_voice_id VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      sample_urls TEXT[],
      gender VARCHAR(20),
      age VARCHAR(20),
      accent VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Analytics snapshot table
    CREATE TABLE IF NOT EXISTS analytics_snapshots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      streams INTEGER DEFAULT 0,
      listeners INTEGER DEFAULT 0,
      followers INTEGER DEFAULT 0,
      revenue INTEGER DEFAULT 0,
      platform_breakdown JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_artists_status ON artists(status);
    CREATE INDEX IF NOT EXISTS idx_releases_artist ON releases(artist_id);
    CREATE INDEX IF NOT EXISTS idx_releases_date ON releases(release_date);
    CREATE INDEX IF NOT EXISTS idx_songs_release ON songs(release_id);
    CREATE INDEX IF NOT EXISTS idx_marketing_artist ON marketing_content(artist_id);
    CREATE INDEX IF NOT EXISTS idx_videos_artist ON videos(artist_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_artist_date ON analytics_snapshots(artist_id, date);

    -- Update timestamps trigger
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop triggers if they exist
    DROP TRIGGER IF EXISTS update_artists_updated_at ON artists;
    DROP TRIGGER IF EXISTS update_releases_updated_at ON releases;
    DROP TRIGGER IF EXISTS update_songs_updated_at ON songs;
    DROP TRIGGER IF EXISTS update_marketing_updated_at ON marketing_content;

    -- Create triggers
    CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON releases
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    CREATE TRIGGER update_marketing_updated_at BEFORE UPDATE ON marketing_content
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  `;

  try {
    await query(schema);
    console.log('✅ Database tables created');
  } catch (error) {
    console.error('Failed to setup database:', error);
    throw error;
  }
}

export { pool };
export default { query, transaction, setupDatabase, pool };
