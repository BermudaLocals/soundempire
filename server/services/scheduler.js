import cron from 'node-cron';
import { query } from '../db/index.js';

// Scheduled tasks for the AGI record label
export function startScheduler() {
  // Daily analytics snapshot at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('📊 Running daily analytics snapshot...');
    try {
      const artists = await query('SELECT id FROM artists WHERE status = \'active\'');
      for (const artist of artists.rows) {
        await query(`
          INSERT INTO analytics_snapshots (artist_id, date, streams, listeners, revenue)
          SELECT 
            $1,
            NOW()::date,
            COALESCE(SUM(streams), 0),
            monthly_listeners,
            COALESCE(SUM(revenue), 0)
          FROM releases WHERE artist_id = $1
          GROUP BY artist_id, monthly_listeners
          ON CONFLICT (artist_id, date) DO UPDATE SET
            streams = EXCLUDED.streams,
            listeners = EXCLUDED.listeners,
            revenue = EXCLUDED.revenue
        `, [artist.id]);
      }
      console.log('✅ Analytics snapshot complete');
    } catch (error) {
      console.error('❌ Analytics snapshot failed:', error);
    }
  });

  // Check for scheduled releases every hour
  cron.schedule('0 * * * *', async () => {
    console.log('🚀 Checking for scheduled releases...');
    try {
      const releases = await query(`
        UPDATE releases 
        SET status = 'live'
        WHERE status = 'scheduled' AND release_date <= NOW()::date
        RETURNING title, artist_name
      `);
      for (const release of releases.rows) {
        console.log(`🎵 Release went live: ${release.title} by ${release.artist_name}`);
      }
    } catch (error) {
      console.error('❌ Release scheduling failed:', error);
    }
  });

  console.log('⏰ Scheduler initialized');
}

export default { startScheduler };
