import { Router } from 'express';
import { query } from '../db/index.js';
import { generateMarketingContent } from '../services/claude.js';

const router = Router();

// POST generate marketing content
router.post('/generate', async (req, res) => {
  try {
    const { type, artistId, context, releaseId } = req.body;

    if (!['tiktok', 'instagram', 'pitch', 'press', 'bio'].includes(type)) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    const artistResult = await query('SELECT * FROM artists WHERE id = $1', [artistId]);
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    const artist = artistResult.rows[0];
    console.log(`Generating ${type} content for ${artist.name}...`);

    const content = await generateMarketingContent({ type, artist, context });

    // Save to database
    const savedResult = await query(`
      INSERT INTO marketing_content (artist_id, release_id, content_type, title, content, ai_generated)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *
    `, [artistId, releaseId || null, type, content.title || `${type} content`, JSON.stringify(content)]);

    res.json({
      type,
      artist: { id: artist.id, name: artist.name },
      content,
      saved: savedResult.rows[0]
    });
  } catch (error) {
    console.error('Error generating marketing content:', error);
    res.status(500).json({ error: 'Failed to generate content: ' + error.message });
  }
});

// GET marketing content for artist
router.get('/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;
    const { type, limit = 20 } = req.query;

    let sql = 'SELECT * FROM marketing_content WHERE artist_id = $1';
    const params = [artistId];

    if (type) {
      sql += ' AND content_type = $2';
      params.push(type);
    }

    sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit));

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching marketing content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// DELETE marketing content
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM marketing_content WHERE id = $1', [id]);
    res.json({ message: 'Content deleted' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

export default router;
