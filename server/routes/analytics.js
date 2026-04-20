import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

// GET dashboard overview stats
router.get('/dashboard', async (req, res) => {
  try {
    const [
      artistsResult,
      releasesResult,
      songsResult,
      streamsResult,
      revenueResult
    ] = await Promise.all([
      query("SELECT COUNT(*) FROM artists WHERE status = 'active'"),
      query("SELECT COUNT(*) FROM releases"),
      query("SELECT COUNT(*) FROM songs"),
      query("SELECT COALESCE(SUM(streams), 0) as total FROM releases"),
      query("SELECT COALESCE(SUM(revenue), 0) as total FROM releases")
    ]);

    // Top artists by streams
    const topArtistsResult = await query(`
      SELECT id, name, genre, brand_color, monthly_listeners, total_streams, revenue
      FROM artists WHERE status = 'active'
      ORDER BY total_streams DESC LIMIT 5
    `);

    // Recent releases
    const recentReleasesResult = await query(`
      SELECT r.*, a.name as artist_name, a.brand_color
      FROM releases r JOIN artists a ON r.artist_id = a.id
      ORDER BY r.release_date DESC LIMIT 6
    `);

    res.json({
      overview: {
        totalArtists: parseInt(artistsResult.rows[0].count),
        totalReleases: parseInt(releasesResult.rows[0].count),
        totalSongs: parseInt(songsResult.rows[0].count),
        totalStreams: parseInt(streamsResult.rows[0].total),
        totalRevenue: parseInt(revenueResult.rows[0].total)
      },
      topArtists: topArtistsResult.rows,
      recentReleases: recentReleasesResult.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET catalog stats
router.get('/catalog', async (req, res) => {
  try {
    const genreResult = await query(`
      SELECT genre, COUNT(*) as count, SUM(total_streams) as streams
      FROM artists WHERE status = 'active' GROUP BY genre ORDER BY count DESC
    `);

    const monthlyResult = await query(`
      SELECT DATE_TRUNC('month', release_date) as month,
             COUNT(*) as releases,
             SUM(streams) as streams
      FROM releases
      WHERE release_date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', release_date)
      ORDER BY month DESC
    `);

    res.json({
      byGenre: genreResult.rows,
      monthlyTrend: monthlyResult.rows
    });
  } catch (error) {
    console.error('Error fetching catalog stats:', error);
    res.status(500).json({ error: 'Failed to fetch catalog stats' });
  }
});

export default router;
