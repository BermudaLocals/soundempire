const router = require('express').Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  try {
    if (!pool) return res.json(getMockStats());
    const [artists, songs, revenue] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM artists'),
      pool.query('SELECT COUNT(*) FROM songs'),
      pool.query('SELECT COALESCE(SUM(revenue),0) as total FROM artists')
    ]);
    res.json({
      artists: parseInt(artists.rows[0].count),
      songs: parseInt(songs.rows[0].count),
      total_revenue: parseFloat(revenue.rows[0].total),
      label: 'Sound Empire',
      status: 'ACTIVE'
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

function getMockStats() {
  return { artists: 3, songs: 10, total_revenue: 12840, total_streams: 842000, label: 'Sound Empire', status: 'ACTIVE' };
}

module.exports = router;
