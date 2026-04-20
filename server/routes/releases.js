import { Router } from 'express';
import { query } from '../db/index.js';

const router = Router();

// GET all releases
router.get('/', async (req, res) => {
  try {
    const { artistId, status, limit = 50 } = req.query;
    let sql = `SELECT r.*, a.name as artist_name, a.brand_color FROM releases r JOIN artists a ON r.artist_id = a.id`;
    const params = [];

    if (artistId) {
      sql += ' WHERE r.artist_id = $1';
      params.push(artistId);
    }

    if (status) {
      sql += params.length ? ' AND r.status = $' + (params.length + 1) : ' WHERE r.status = $1';
      params.push(status);
    }

    sql += ' ORDER BY r.release_date DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit));

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching releases:', error);
    res.status(500).json({ error: 'Failed to fetch releases' });
  }
});

// GET single release with songs
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const releaseResult = await query('SELECT * FROM releases WHERE id = $1', [id]);
    if (releaseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Release not found' });
    }

    const songsResult = await query('SELECT * FROM songs WHERE release_id = $1 ORDER BY track_number', [id]);

    res.json({
      ...releaseResult.rows[0],
      songs: songsResult.rows
    });
  } catch (error) {
    console.error('Error fetching release:', error);
    res.status(500).json({ error: 'Failed to fetch release' });
  }
});

// POST create release
router.post('/', async (req, res) => {
  try {
    const { artistId, title, type, releaseDate, status = 'scheduled' } = req.body;

    const artistResult = await query('SELECT name FROM artists WHERE id = $1', [artistId]);
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    const result = await query(`
      INSERT INTO releases (artist_id, title, type, release_date, status, artist_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [artistId, title, type, releaseDate, status, artistResult.rows[0].name]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating release:', error);
    res.status(500).json({ error: 'Failed to create release' });
  }
});

// PUT update release
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = ['title', 'type', 'release_date', 'status', 'artwork_url', 'spotify_url', 'streams', 'revenue'];

    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, val] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(val);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    const sql = `UPDATE releases SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Release not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating release:', error);
    res.status(500).json({ error: 'Failed to update release' });
  }
});

// DELETE release
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM releases WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Release not found' });
    }

    res.json({ message: 'Release deleted', release: result.rows[0] });
  } catch (error) {
    console.error('Error deleting release:', error);
    res.status(500).json({ error: 'Failed to delete release' });
  }
});

// GET dashboard stats
router.get('/stats/dashboard', async (req, res) => {
  try {
    const artistsResult = await query('SELECT COUNT(*) FROM artists WHERE status = \'active\'');
    const releasesResult = await query('SELECT COUNT(*) FROM releases');
    const streamsResult = await query('SELECT COALESCE(SUM(streams), 0) as total FROM releases');
    const revenueResult = await query('SELECT COALESCE(SUM(revenue), 0) as total FROM releases');

    res.json({
      totalArtists: parseInt(artistsResult.rows[0].count),
      totalReleases: parseInt(releasesResult.rows[0].count),
      totalStreams: parseInt(streamsResult.rows[0].total),
      totalRevenue: parseInt(revenueResult.rows[0].total)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
