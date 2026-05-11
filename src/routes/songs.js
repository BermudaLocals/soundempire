const router = require('express').Router();
const { pool } = require('../db');
const { askAI } = require('../ai/claude');
const { v4: uuid } = require('uuid');

router.get('/', async (req, res) => {
  try {
    if (!pool) return res.json({ songs: getMockSongs() });
    const { rows } = await pool.query('SELECT s.*, a.name as artist_name FROM songs s LEFT JOIN artists a ON s.artist_id=a.id ORDER BY s.created_at DESC');
    res.json({ songs: rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    if (!pool) return res.json(getMockSongs()[0]);
    const { rows } = await pool.query('SELECT s.*, a.name as artist_name FROM songs s LEFT JOIN artists a ON s.artist_id=a.id WHERE s.id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { artist_id, genre = 'reggae', theme = 'resilience', title } = req.body;
    const songData = await askAI(
      `Write a complete ${genre} song about ${theme}. Include a catchy title, full lyrics with verses/chorus/bridge, and a Suno.ai prompt.

JSON: {"title":"","lyrics":"","suno_prompt":"","genre":""}`
    );
    let parsed;
    try { parsed = JSON.parse(songData.match(/\{[\s\S]*\}/)?.[0] || songData); }
    catch { parsed = { title: title || `Track_${Date.now()}`, lyrics: songData, suno_prompt: `${genre} song about ${theme}`, genre }; }

    if (!pool) return res.json({ id: uuid(), artist_id, ...parsed, streams: 0, status: 'draft' });
    const { rows } = await pool.query(
      'INSERT INTO songs (artist_id,title,lyrics,genre,suno_prompt,status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [artist_id, parsed.title, parsed.lyrics, parsed.genre || genre, parsed.suno_prompt, 'draft']
    );
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!pool) return res.json({ deleted: true });
    await pool.query('DELETE FROM songs WHERE id=$1', [req.params.id]);
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

function getMockSongs() {
  return [{ id: '1', title: 'Phoenix Rise', genre: 'Reggae', artist_name: 'ITAL PHOENIX', streams: 89000, status: 'released' }];
}

module.exports = router;
