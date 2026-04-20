import { Router } from 'express';
import { query, transaction } from '../db/index.js';
import { generateArtistPersona } from '../services/claude.js';
import { body, validationResult } from 'express-validator';

const router = Router();

// GET all artists
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let sql = 'SELECT * FROM artists';
    const params = [];
    
    if (status) {
      sql += ' WHERE status = $1';
      params.push(status);
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

// GET single artist with releases
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const artistResult = await query('SELECT * FROM artists WHERE id = $1', [id]);
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    
    const releasesResult = await query(
      'SELECT * FROM releases WHERE artist_id = $1 ORDER BY release_date DESC',
      [id]
    );
    
    res.json({
      ...artistResult.rows[0],
      releases: releasesResult.rows
    });
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

// POST create artist (manual or AI-generated)
router.post('/',
  body('name').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('genre').optional().isString().trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name, genre, subgenre, aesthetic, bio, uniqueHook, voiceStyle,
        tiktokAngle, brandColor, aiGenerate, influences, vibe, audience
      } = req.body;

      let artistData;

      // AI generate persona
      if (aiGenerate) {
        console.log('Generating AI artist persona...');
        const persona = await generateArtistPersona({ genre, influences, vibe, audience });
        
        artistData = {
          name: persona.name,
          genre: persona.genre,
          subgenre: persona.subgenre,
          aesthetic: persona.aesthetic,
          bio: persona.bio,
          uniqueHook: persona.uniqueHook,
          voiceStyle: persona.voiceStyle,
          tiktokAngle: persona.tiktokAngle,
          brandColor: persona.brandColor,
          isAiGenerated: true,
          contentPillars: persona.contentPillars,
          targetPlaylists: persona.targetPlaylists
        };
      } else {
        // Manual creation
        artistData = {
          name, genre, subgenre, aesthetic, bio, uniqueHook,
          voiceStyle, tiktokAngle, brandColor: brandColor || '#00d4ff',
          isAiGenerated: false
        };
      }

      const result = await query(`
        INSERT INTO artists (
          name, genre, subgenre, aesthetic, bio, unique_hook,
          voice_style, tiktok_angle, brand_color, is_ai_generated, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
        RETURNING *
      `, [
        artistData.name, artistData.genre, artistData.subgenre,
        artistData.aesthetic, artistData.bio, artistData.uniqueHook,
        artistData.voiceStyle, artistData.tiktokAngle, artistData.brandColor,
        artistData.isAiGenerated
      ]);

      res.status(201).json({
        artist: result.rows[0],
        generated: aiGenerate ? artistData : null
      });
    } catch (error) {
      console.error('Error creating artist:', error);
      res.status(500).json({ error: 'Failed to create artist: ' + error.message });
    }
  }
);

// PUT update artist
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const allowedFields = [
      'name', 'genre', 'subgenre', 'aesthetic', 'bio', 'unique_hook',
      'voice_style', 'tiktok_angle', 'brand_color', 'status', 'avatar_url'
    ];
    
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
    const sql = `UPDATE artists SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await query(sql, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating artist:', error);
    res.status(500).json({ error: 'Failed to update artist' });
  }
});

// DELETE artist
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM artists WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    
    res.json({ message: 'Artist deleted', artist: result.rows[0] });
  } catch (error) {
    console.error('Error deleting artist:', error);
    res.status(500).json({ error: 'Failed to delete artist' });
  }
});

// GET artist analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;
    
    const result = await query(`
      SELECT * FROM analytics_snapshots
      WHERE artist_id = $1 AND date >= NOW() - INTERVAL '${days} days'
      ORDER BY date DESC
    `, [id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// POST regenerate AI persona (refresh with new ideas)
router.post('/:id/regenerate', async (req, res) => {
  try {
    const { id } = req.params;
    
    const artistResult = await query('SELECT * FROM artists WHERE id = $1', [id]);
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    
    const artist = artistResult.rows[0];
    
    // Generate refreshed content
    const refreshed = await generateArtistPersona({
      genre: artist.genre,
      vibe: artist.aesthetic
    });
    
    res.json({
      original: artist,
      refreshedSuggestions: refreshed
    });
  } catch (error) {
    console.error('Error regenerating persona:', error);
    res.status(500).json({ error: 'Failed to regenerate persona' });
  }
});

export default router;
