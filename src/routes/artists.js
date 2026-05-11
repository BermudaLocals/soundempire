const router = require('express').Router();
const { pool } = require('../db');
const { askAI } = require('../ai/claude');
const { v4: uuid } = require('uuid');

// GET all artists
router.get('/', async (req, res) => {
  try {
    if (!pool) return res.json({ artists: getMockArtists() });
    const { rows } = await pool.query('SELECT * FROM artists ORDER BY created_at DESC');
    res.json({ artists: rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET single artist
router.get('/:id', async (req, res) => {
  try {
    if (!pool) return res.json(getMockArtists()[0]);
    const { rows } = await pool.query('SELECT * FROM artists WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create artist (AI-generated)
router.post('/', async (req, res) => {
  try {
    const { genre = 'reggae', style_notes = '' } = req.body;
    const bio = await askAI(
      `Create a compelling artist persona for a ${genre} artist. Include: stage name, origin story, unique style, and target audience. ${style_notes}

Respond as JSON: {"name": "", "bio": "", "style": "", "genre": ""}`
    );
    let parsed;
    try { parsed = JSON.parse(bio.match(/\{[\s\S]*\}/)?.[0] || bio); }
    catch { parsed = { name: `Artist_${Date.now()}`, bio, style: genre, genre }; }

    if (!pool) return res.json({ id: uuid(), ...parsed, streams: 0, revenue: 0 });
    const { rows } = await pool.query(
      'INSERT INTO artists (name,genre,bio,style) VALUES ($1,$2,$3,$4) RETURNING *',
      [parsed.name, parsed.genre || genre, parsed.bio, parsed.style]
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE artist
router.delete('/:id', async (req, res) => {
  try {
    if (!pool) return res.json({ deleted: true });
    await pool.query('DELETE FROM artists WHERE id=$1', [req.params.id]);
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

function getMockArtists() {
  return [{ id: '1', name: 'ITAL PHOENIX', genre: 'Reggae', bio: 'Rising star from Jamaica', style: 'Conscious reggae', streams: 142000, revenue: 4260 }];
}

module.exports = router;
