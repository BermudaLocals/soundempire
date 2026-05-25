import { Router } from 'express';
import { query } from '../db/index.js';
import { generateSong, generateMusicVideoConcept } from '../services/claude.js';

const router = Router();

// ─── Caribbean Genre Context for Song Generation ────────────────────────────

const CARIBBEAN_GENRE_CONTEXT = {
  soca: {
    lyrical_style: 'Party-forward, high-energy carnival lyrics. Use call-and-response hooks ("Put your hands up!", "Jump and wave!"). Celebrate Caribbean culture, feting, and good vibes. Lyrics should feel like a road march anthem.',
    production_notes: 'Engine room rhythm section (iron/steel percussion), brass stabs, driving synth bass, soca kick pattern. High energy throughout with minimal drops in intensity. Add crowd chant sections.',
    bpm_range: '140-165 BPM',
    references: 'Machel Montano, Bunji Garlin, Voice, Kes, Nailah Blackman'
  },
  dancehall: {
    lyrical_style: 'Jamaican patois/Creole lyrics. Blend boasting, romance, or social commentary. Use dancehall slang and catchphrases naturally. Riddim-ready: lyrics should work over multiple beats.',
    production_notes: 'One-drop kick-snare dancehall riddim pattern, heavy 808 sub-bass, dancehall hi-hat rolls. Add airhorn and gunshot ad-libs. Bass must be physical and prominent. Consider singjay (singing + deejay) vocal approach.',
    bpm_range: '90-110 BPM',
    references: 'Vybz Kartel, Shenseea, Skeng, Sean Paul, Popcaan, Shabba Ranks'
  },
  reggae: {
    lyrical_style: 'Conscious, spiritual, and uplifting themes. Messages of love, unity, resistance, and cultural pride. Lyrics should feel timeless and meaningful. Rastafarian influences welcome but not required.',
    production_notes: 'One-drop drum pattern (kick on beat 3), offbeat skank guitar (the genre\'s signature), deep dub bassline, organ bubbling. Add dub FX: heavy reverb throws, tape delay on snare, echo on vocals. Production should feel warm and analog.',
    bpm_range: '60-90 BPM',
    references: 'Bob Marley, Chronixx, Protoje, Koffee, Damian Marley, Burning Spear'
  }
};

const CARIBBEAN_GENRES = Object.keys(CARIBBEAN_GENRE_CONTEXT);

// POST generate song (full, hook, or concept)
router.post('/generate', async (req, res) => {
  try {
    const { mode, artistId, vibe, lyricsTheme, saveToCatalog } = req.body;

    if (!['full', 'hook', 'concept'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid mode. Use full, hook, or concept' });
    }

    // Get artist details
    const artistResult = await query('SELECT * FROM artists WHERE id = $1', [artistId]);
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    const artist = artistResult.rows[0];
    console.log(`Generating ${mode} song for ${artist.name}...`);

    // Enrich with Caribbean genre context if applicable
    const artistGenreKey = artist.genre?.toLowerCase().replace(/[\s-]+/g, '_');
    let enrichedLyricsTheme = lyricsTheme || '';
    if (CARIBBEAN_GENRES.includes(artistGenreKey)) {
      const ctx = CARIBBEAN_GENRE_CONTEXT[artistGenreKey];
      enrichedLyricsTheme = [
        enrichedLyricsTheme,
        `\n[GENRE CONTEXT — ${artistGenreKey.toUpperCase()}]`,
        `Lyrical style: ${ctx.lyrical_style}`,
        `Production: ${ctx.production_notes}`,
        `BPM range: ${ctx.bpm_range}`,
        `Reference artists: ${ctx.references}`
      ].filter(Boolean).join('\n');
    }

    const songData = await generateSong({ mode, artist, vibe, lyricsTheme: enrichedLyricsTheme });

    // Save to database if requested
    let savedSong = null;
    if (saveToCatalog) {
      const songResult = await query(`
        INSERT INTO songs (
          artist_id, title, lyrics, verse1, prechorus, chorus, verse2, bridge,
          production_notes, mood, bpm, key, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'draft')
        RETURNING *
      `, [
        artistId,
        songData.title,
        [songData.verse1, songData.prechorus, songData.chorus, songData.verse2, songData.bridge].filter(Boolean).join('\n\n'),
        songData.verse1,
        songData.prechorus,
        songData.chorus,
        songData.verse2,
        songData.bridge,
        songData.productionNotes,
        songData.mood,
        songData.bpm,
        songData.key
      ]);
      savedSong = songResult.rows[0];

      // Update artist track count
      await query(`
        UPDATE artists SET tracks_count = tracks_count + 1 WHERE id = $1
      `, [artistId]);
    }

    res.json({
      mode,
      artist: { id: artist.id, name: artist.name, genre: artist.genre },
      song: songData,
      saved: savedSong
    });
  } catch (error) {
    console.error('Error generating song:', error);
    res.status(500).json({ error: 'Failed to generate song: ' + error.message });
  }
});

// POST generate music video concept
router.post('/video-concept', async (req, res) => {
  try {
    const { artistId, songTitle, songMood, lyricsTheme } = req.body;

    const artistResult = await query('SELECT * FROM artists WHERE id = $1', [artistId]);
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    const artist = artistResult.rows[0];
    const concept = await generateMusicVideoConcept({ artist, songTitle, songMood, lyricsTheme });

    res.json({
      artist: { id: artist.id, name: artist.name },
      songTitle,
      concept
    });
  } catch (error) {
    console.error('Error generating video concept:', error);
    res.status(500).json({ error: 'Failed to generate video concept: ' + error.message });
  }
});

// GET all songs for an artist
router.get('/songs/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;
    const { status } = req.query;

    let sql = 'SELECT * FROM songs WHERE artist_id = $1';
    const params = [artistId];

    if (status) {
      sql += ' AND status = $2';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// GET single song
router.get('/songs/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT s.*, a.name as artist_name, a.genre as artist_genre, a.brand_color
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ error: 'Failed to fetch song' });
  }
});

// PUT update song
router.put('/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = [
      'title', 'lyrics', 'verse1', 'prechorus', 'chorus', 'verse2', 'bridge',
      'outro', 'production_notes', 'mood', 'bpm', 'key', 'status', 'audio_url'
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
    const sql = `UPDATE songs SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await query(sql, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// DELETE song
router.delete('/songs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get artist_id for track count update
    const songResult = await query('SELECT artist_id FROM songs WHERE id = $1', [id]);
    if (songResult.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const artistId = songResult.rows[0].artist_id;

    await query('DELETE FROM songs WHERE id = $1', [id]);

    // Decrement artist track count
    await query('UPDATE artists SET tracks_count = GREATEST(0, tracks_count - 1) WHERE id = $1', [artistId]);

    res.json({ message: 'Song deleted' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

export default router;
