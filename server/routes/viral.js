import { Router } from 'express';
import { query } from '../db/index.js';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

// ─── Genre Viral DNA Patterns ───────────────────────────────────────────────

const GENRE_DNA = {
  pop: {
    hook_pattern: 'melodic-repetition-earworm',
    rhythm_pattern: 'four-on-the-floor-steady',
    drop_pattern: 'chorus-lift-with-synth-swell',
    bridge_pattern: 'stripped-back-vocal-build',
    typical_bpm: { min: 100, max: 130 },
    typical_key: 'C major / G major',
    viral_elements: [
      'instant singalong chorus',
      'relatable one-liner hook',
      'TikTok-ready 15-second moment',
      'key change in final chorus'
    ],
    cultural_notes: 'Mainstream pop thrives on universal emotion, polished production, and hooks that land within 5 seconds. Prioritize simplicity and emotional clarity.'
  },

  hip_hop: {
    hook_pattern: 'rhythmic-phrase-repetition',
    rhythm_pattern: 'trap-hi-hat-rolls-808',
    drop_pattern: 'bass-drop-with-vocal-ad-lib',
    bridge_pattern: 'flow-switch-double-time',
    typical_bpm: { min: 70, max: 95 },
    typical_key: 'minor keys / F# minor',
    viral_elements: [
      'quotable punchlines',
      'ad-lib catchphrases',
      'beat switch moment',
      'meme-worthy bars'
    ],
    cultural_notes: 'Hip-hop virality comes from quotable lyrics, distinctive flows, and hard-hitting 808 patterns. Ad-libs and producer tags are essential for brand identity.'
  },

  edm: {
    hook_pattern: 'synth-lead-melody-loop',
    rhythm_pattern: 'four-on-the-floor-build-release',
    drop_pattern: 'massive-bass-drop-after-buildup',
    bridge_pattern: 'breakdown-filter-sweep',
    typical_bpm: { min: 124, max: 150 },
    typical_key: 'A minor / E minor',
    viral_elements: [
      'euphoric drop moment',
      'crowd singalong vocal chop',
      'build-up tension and release',
      'festival-ready anthem feel'
    ],
    cultural_notes: 'EDM virality relies on the tension-release cycle. The buildup must create anticipation and the drop must deliver catharsis. Vocal chops and risers are signature tools.'
  },

  rock: {
    hook_pattern: 'guitar-riff-driven-hook',
    rhythm_pattern: 'driving-drums-power-chords',
    drop_pattern: 'chorus-explosion-distortion',
    bridge_pattern: 'guitar-solo-or-stripped-vocal',
    typical_bpm: { min: 110, max: 145 },
    typical_key: 'E minor / A minor / D major',
    viral_elements: [
      'iconic guitar riff',
      'anthemic chorus with gang vocals',
      'dynamic quiet-loud shifts',
      'raw emotional delivery'
    ],
    cultural_notes: 'Rock virality comes from raw energy, memorable riffs, and authentic emotion. The quiet-loud dynamic and sing-along choruses drive festival and streaming engagement.'
  },

  r_and_b: {
    hook_pattern: 'smooth-vocal-melody-run',
    rhythm_pattern: 'syncopated-groove-swing',
    drop_pattern: 'vocal-climax-over-minimal-beat',
    bridge_pattern: 'key-change-vocal-ad-lib-run',
    typical_bpm: { min: 65, max: 100 },
    typical_key: 'Eb major / Ab major / D minor',
    viral_elements: [
      'butter-smooth vocal runs',
      'late-night vibe atmosphere',
      'relatable love/heartbreak lyrics',
      'TikTok slow-jam challenge potential'
    ],
    cultural_notes: 'R&B thrives on vocal prowess, emotional intimacy, and groove. Modern R&B blends trap production with classic soul warmth. Vulnerability is the currency.'
  },

  afrobeats: {
    hook_pattern: 'afro-melodic-chant-repeat',
    rhythm_pattern: 'clave-pattern-log-drum-groove',
    drop_pattern: 'percussion-breakdown-dance-drop',
    bridge_pattern: 'call-and-response-vocal',
    typical_bpm: { min: 100, max: 125 },
    typical_key: 'major keys / G major / Bb major',
    viral_elements: [
      'irresistible dance groove',
      'multilingual hook (English + Yoruba/Pidgin)',
      'log drum + shaker polyrhythm',
      'global dance challenge potential'
    ],
    cultural_notes: 'Afrobeats virality comes from groove-first production, multilingual hooks, and dance-driven energy. The interplay of percussion layers creates an addictive feel that crosses borders.'
  },

  latin: {
    hook_pattern: 'reggaeton-dembow-vocal-hook',
    rhythm_pattern: 'dembow-riddim-tresillo',
    drop_pattern: 'perreo-bass-drop-breakdown',
    bridge_pattern: 'romantic-melodic-shift',
    typical_bpm: { min: 88, max: 100 },
    typical_key: 'minor keys / A minor / D minor',
    viral_elements: [
      'dembow rhythm lock',
      'bilingual hook (Spanish + English)',
      'perreo dance moment',
      'romantic/fiesta duality'
    ],
    cultural_notes: 'Latin music virality is rooted in the dembow rhythm and bilingual appeal. The genre bridges reggaeton, bachata, and cumbia influences with modern trap production for global reach.'
  },

  // ─── Caribbean Genres ──────────────────────────────────────────────────────

  soca: {
    hook_pattern: 'call-and-response-crowd-chant',
    rhythm_pattern: 'soca-engine-room-iron-rhythm',
    drop_pattern: 'brass-synth-swell-drop-into-jump',
    bridge_pattern: 'breakdown-crowd-call-tempo-build',
    typical_bpm: { min: 140, max: 165 },
    typical_key: 'major keys / F major / Bb major',
    viral_elements: [
      'carnival road march energy',
      'call-and-response crowd participation hooks',
      'brass section and synth stabs',
      'wining/jumping choreography moment',
      'festival anthem repeatability'
    ],
    cultural_notes: 'Soca is the heartbeat of Caribbean Carnival. Virality comes from irresistible energy that makes people jump and wave. Production centers on the engine room (iron/steel percussion rhythm section), brass stabs, and driving synth bass. Lyrics are party-forward with call-and-response hooks designed for massive crowd participation. Think Machel Montano, Bunji Garlin, Voice.'
  },

  dancehall: {
    hook_pattern: 'riddim-chant-patois-catchphrase',
    rhythm_pattern: 'one-drop-kick-snare-dancehall-riddim',
    drop_pattern: 'heavy-bass-drop-with-airhorn',
    bridge_pattern: 'deejay-flow-switch-or-singjay-melody',
    typical_bpm: { min: 90, max: 110 },
    typical_key: 'minor keys / C minor / G minor',
    viral_elements: [
      'riddim-based production (multiple artists on same beat)',
      'patois catchphrases that become slang',
      'heavy 808 sub-bass with dancehall kick pattern',
      'dance move creation (e.g. dutty wine, skanking)',
      'airhorn and gunshot ad-libs'
    ],
    cultural_notes: 'Dancehall virality is rooted in Jamaican patois, riddim culture, and dance. The genre lives on distinctive rhythms where multiple artists voice the same riddim. Lyrics blend boasting, romance, and social commentary in Jamaican Creole. Bass must be physical. Production references: Shabba Ranks, Vybz Kartel, Shenseea, Skeng. Always respect the cultural roots.'
  },

  reggae: {
    hook_pattern: 'conscious-melodic-chant-refrain',
    rhythm_pattern: 'one-drop-offbeat-skank-guitar',
    drop_pattern: 'dub-bass-drop-with-echo-delay',
    bridge_pattern: 'dub-breakdown-reverb-delay-instrumental',
    typical_bpm: { min: 60, max: 90 },
    typical_key: 'major keys / G major / C major / A minor for roots',
    viral_elements: [
      'offbeat skank guitar pattern',
      'conscious/spiritual lyrical message',
      'dub bassline with weight',
      'one-drop drum pattern (kick on beat 3)',
      'echo/delay dub FX moments'
    ],
    cultural_notes: 'Reggae virality comes from timeless messages of love, unity, resistance, and spirituality delivered over the iconic one-drop rhythm. The offbeat skank guitar is the genre\'s DNA. Dub influences (heavy reverb, delay throws, bass emphasis) add depth. Production should feel warm, analog, and rooted. References: Bob Marley, Chronixx, Protoje, Koffee. Conscious lyrics and cultural authenticity are paramount.'
  }
};

const ALL_GENRES = Object.keys(GENRE_DNA);

// ─── Helper: Parse JSON from Claude ─────────────────────────────────────────

function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown code blocks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1].trim());
    }
    // Try finding first { to last }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error('Failed to parse AI response as JSON');
  }
}

// ─── GET / — Status + available genres ──────────────────────────────────────

router.get('/', (req, res) => {
  res.json({
    status: 'Viral Music Creator Online',
    version: '2.0.0',
    genres: ALL_GENRES,
    caribbean_genres: ['soca', 'dancehall', 'reggae'],
    endpoints: [
      'GET  /           — status + genres',
      'POST /analyze    — analyze audio for viral DNA',
      'POST /create     — generate viral song DNA + lyrics',
      'POST /remix      — create remix concept',
      'GET  /trending   — trending viral patterns by genre'
    ]
  });
});

// ─── POST /analyze — Viral DNA analysis ─────────────────────────────────────

router.post('/analyze', async (req, res) => {
  try {
    const { audio_url, genre } = req.body;

    if (!genre || !ALL_GENRES.includes(genre)) {
      return res.status(400).json({
        error: `Invalid genre. Must be one of: ${ALL_GENRES.join(', ')}`
      });
    }

    const genreDna = GENRE_DNA[genre];

    const systemPrompt = `You are a viral music analyst at Sound Empire, the world's first AGI-powered record label.
You specialize in deconstructing songs to identify what makes them go viral.
You understand the specific viral DNA patterns of every genre including Caribbean genres (soca, dancehall, reggae).

For the genre "${genre}", the known viral DNA pattern is:
- Hook pattern: ${genreDna.hook_pattern}
- Rhythm pattern: ${genreDna.rhythm_pattern}
- Drop pattern: ${genreDna.drop_pattern}
- Bridge pattern: ${genreDna.bridge_pattern}
- Typical BPM: ${genreDna.typical_bpm.min}-${genreDna.typical_bpm.max}
- Cultural context: ${genreDna.cultural_notes}`;

    const userPrompt = `Analyze this song for viral potential.
${audio_url ? `Audio URL: ${audio_url}` : 'No audio provided — analyze based on genre DNA patterns.'}
Genre: ${genre}

Respond ONLY with valid JSON:
{
  "viral_score": 0.0,
  "hook_potential": 0.0,
  "drop_potential": 0.0,
  "rhythm_complexity": 0.0,
  "pattern_match": {
    "hook_alignment": "how well the hook matches the genre's viral hook pattern",
    "rhythm_alignment": "how well the rhythm matches the genre's viral rhythm pattern",
    "drop_alignment": "how well the drop matches the genre's viral drop pattern"
  },
  "viral_elements_detected": ["list of viral elements found"],
  "missing_elements": ["elements that could boost virality"],
  "recommended_improvements": ["specific actionable improvements"],
  "tiktok_potential": "assessment of TikTok virality potential",
  "playlist_fit": ["3 Spotify playlists this would fit"]
}`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const analysis = parseJSON(response.content[0].text);

    res.json({
      genre,
      genre_dna: genreDna,
      analysis,
      audio_url: audio_url || null
    });
  } catch (error) {
    console.error('Error analyzing viral DNA:', error);
    res.status(500).json({ error: 'Failed to analyze viral DNA: ' + error.message });
  }
});

// ─── POST /create — Generate viral song DNA + lyrics ────────────────────────

router.post('/create', async (req, res) => {
  try {
    const { genre, description, artist_id, mood, bpm } = req.body;

    if (!genre || !ALL_GENRES.includes(genre)) {
      return res.status(400).json({
        error: `Invalid genre. Must be one of: ${ALL_GENRES.join(', ')}`
      });
    }

    const genreDna = GENRE_DNA[genre];
    const targetBpm = bpm || Math.floor(
      (genreDna.typical_bpm.min + genreDna.typical_bpm.max) / 2
    );

    // Look up artist if provided
    let artist = null;
    if (artist_id) {
      const artistResult = await query('SELECT * FROM artists WHERE id = $1', [artist_id]);
      if (artistResult.rows.length > 0) {
        artist = artistResult.rows[0];
      }
    }

    const systemPrompt = `You are an elite viral hit songwriter at Sound Empire, an AGI-powered record label.
You craft songs engineered for maximum virality within their genre.

Genre: ${genre}
Genre DNA:
- Hook pattern: ${genreDna.hook_pattern}
- Rhythm pattern: ${genreDna.rhythm_pattern}
- Drop pattern: ${genreDna.drop_pattern}
- Bridge pattern: ${genreDna.bridge_pattern}
- BPM range: ${genreDna.typical_bpm.min}-${genreDna.typical_bpm.max}
- Key: ${genreDna.typical_key}
- Viral elements: ${genreDna.viral_elements.join(', ')}
- Cultural context: ${genreDna.cultural_notes}

Rules:
1. Every element must serve the viral DNA pattern for this genre
2. Hooks must be instantly memorable and genre-authentic
3. Production notes must reference genre-specific instruments and techniques
4. Lyrics must match the cultural context (patois for dancehall, conscious themes for reggae, party energy for soca)
5. Include specific TikTok/social media viral moment`;

    const userPrompt = `Create a viral hit song.
Genre: ${genre}
Description: ${description || 'create something that defines this genre'}
Mood: ${mood || 'energetic'}
Target BPM: ${targetBpm}
${artist ? `Artist: ${artist.name} (${artist.genre}, aesthetic: ${artist.aesthetic})` : ''}

Respond ONLY with valid JSON:
{
  "title": "commercially viable track title",
  "bpm": ${targetBpm},
  "key": "musical key",
  "mood": "single word mood",
  "viral_score": 0.0,
  "viral_dna": {
    "hook_pattern_used": "specific hook pattern applied",
    "rhythm_pattern_used": "specific rhythm pattern applied",
    "drop_pattern_used": "specific drop pattern applied",
    "bridge_pattern_used": "specific bridge pattern applied"
  },
  "production_notes": "detailed production notes with genre-specific instruments, arrangement, and mixing approach",
  "verse1": "verse 1 lyrics (4-8 lines, genre-authentic language)",
  "prechorus": "pre-chorus lyrics (2-4 lines)",
  "chorus": "chorus lyrics (4-6 lines, maximum catchiness)",
  "verse2": "verse 2 lyrics (4-8 lines, advance the narrative)",
  "bridge": "bridge lyrics (2-4 lines, emotional peak)",
  "viral_moment": "the specific 15-second TikTok clip moment",
  "sync_opportunities": ["3 sync licensing fits"],
  "playlist_targets": ["5 Spotify playlists to target"]
}`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const songData = parseJSON(response.content[0].text);

    // Optionally call Mureka API for audio generation
    let murekaResult = null;
    if (process.env.MUREKA_API_KEY) {
      try {
        const fetch = (await import('node-fetch')).default;
        const murekaResponse = await fetch('https://api.mureka.ai/v1/song/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.MUREKA_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: `${genre} song, ${targetBpm} BPM, ${songData.mood} mood. ${songData.production_notes}`,
            lyrics: [songData.verse1, songData.prechorus, songData.chorus, songData.verse2, songData.bridge].filter(Boolean).join('\n\n'),
            title: songData.title
          })
        });
        if (murekaResponse.ok) {
          murekaResult = await murekaResponse.json();
        }
      } catch (murekaError) {
        console.error('Mureka API error (non-fatal):', murekaError.message);
      }
    }

    // Save viral DNA to database
    let savedDna = null;
    try {
      const dnaResult = await query(`
        INSERT INTO viral_dna (song_id, genre, dna_pattern, viral_score, hook_potential, rhythm_complexity)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        null, // no song_id yet unless we save the song
        genre,
        JSON.stringify(songData.viral_dna),
        songData.viral_score || 0,
        songData.viral_score || 0, // hook_potential approximated from viral_score
        targetBpm / 200 // rhythm_complexity normalized
      ]);
      savedDna = dnaResult.rows[0];
    } catch (dbError) {
      console.error('Error saving viral DNA (non-fatal):', dbError.message);
    }

    // If artist provided, save as draft song
    let savedSong = null;
    if (artist_id) {
      try {
        const songResult = await query(`
          INSERT INTO songs (
            artist_id, title, lyrics, verse1, prechorus, chorus, verse2, bridge,
            production_notes, mood, bpm, key, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'draft')
          RETURNING *
        `, [
          artist_id,
          songData.title,
          [songData.verse1, songData.prechorus, songData.chorus, songData.verse2, songData.bridge].filter(Boolean).join('\n\n'),
          songData.verse1,
          songData.prechorus,
          songData.chorus,
          songData.verse2,
          songData.bridge,
          songData.production_notes,
          songData.mood,
          songData.bpm,
          songData.key
        ]);
        savedSong = songResult.rows[0];

        // Update viral_dna with song_id
        if (savedDna && savedSong) {
          await query('UPDATE viral_dna SET song_id = $1 WHERE id = $2', [savedSong.id, savedDna.id]);
        }

        // Increment artist track count
        await query('UPDATE artists SET tracks_count = tracks_count + 1 WHERE id = $1', [artist_id]);
      } catch (songError) {
        console.error('Error saving song (non-fatal):', songError.message);
      }
    }

    res.json({
      genre,
      genre_dna: genreDna,
      song: songData,
      saved_song: savedSong,
      saved_dna: savedDna,
      mureka: murekaResult,
      artist: artist ? { id: artist.id, name: artist.name, genre: artist.genre } : null
    });
  } catch (error) {
    console.error('Error creating viral song:', error);
    res.status(500).json({ error: 'Failed to create viral song: ' + error.message });
  }
});

// ─── POST /remix — Create remix concept ─────────────────────────────────────

router.post('/remix', async (req, res) => {
  try {
    const { song_id, target_genre } = req.body;

    if (!song_id) {
      return res.status(400).json({ error: 'song_id is required' });
    }

    if (!target_genre || !ALL_GENRES.includes(target_genre)) {
      return res.status(400).json({
        error: `Invalid target_genre. Must be one of: ${ALL_GENRES.join(', ')}`
      });
    }

    // Get original song
    const songResult = await query(`
      SELECT s.*, a.name as artist_name, a.genre as artist_genre
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      WHERE s.id = $1
    `, [song_id]);

    if (songResult.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const originalSong = songResult.rows[0];
    const targetDna = GENRE_DNA[target_genre];
    const originalDna = GENRE_DNA[originalSong.artist_genre] || GENRE_DNA.pop;

    const systemPrompt = `You are a remix specialist at Sound Empire, an AGI-powered record label.
You transform songs between genres while preserving their viral hooks and emotional core.

Original genre DNA:
- Hook: ${originalDna.hook_pattern}
- Rhythm: ${originalDna.rhythm_pattern}
- BPM: ${originalSong.bpm || 'unknown'}

Target genre DNA:
- Hook: ${targetDna.hook_pattern}
- Rhythm: ${targetDna.rhythm_pattern}
- Drop: ${targetDna.drop_pattern}
- BPM range: ${targetDna.typical_bpm.min}-${targetDna.typical_bpm.max}
- Key: ${targetDna.typical_key}
- Cultural context: ${targetDna.cultural_notes}`;

    const userPrompt = `Create a remix concept transforming this song into ${target_genre}.

Original: "${originalSong.title}" by ${originalSong.artist_name}
Original genre: ${originalSong.artist_genre}
Original BPM: ${originalSong.bpm || 'unknown'}
Original mood: ${originalSong.mood || 'unknown'}
Original chorus: ${originalSong.chorus || 'not available'}

Respond ONLY with valid JSON:
{
  "remix_title": "remix title",
  "target_genre": "${target_genre}",
  "target_bpm": 0,
  "target_key": "musical key",
  "transformation_notes": "how the song transforms between genres",
  "production_changes": "specific production modifications for the target genre",
  "arrangement_changes": "structural changes to fit target genre conventions",
  "lyric_adaptations": "any lyric changes needed for cultural authenticity",
  "preserved_elements": ["elements kept from original"],
  "new_elements": ["elements added for target genre"],
  "viral_potential": "assessment of remix viral potential",
  "playlist_targets": ["3 playlists for the remix"]
}`;

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const remixConcept = parseJSON(response.content[0].text);

    res.json({
      original: {
        id: originalSong.id,
        title: originalSong.title,
        artist: originalSong.artist_name,
        genre: originalSong.artist_genre,
        bpm: originalSong.bpm
      },
      target_genre,
      target_dna: targetDna,
      remix: remixConcept
    });
  } catch (error) {
    console.error('Error creating remix concept:', error);
    res.status(500).json({ error: 'Failed to create remix concept: ' + error.message });
  }
});

// ─── GET /trending — Trending viral patterns by genre ───────────────────────

router.get('/trending', async (req, res) => {
  try {
    const { genre } = req.query;

    // If specific genre requested, return its DNA
    if (genre) {
      if (!ALL_GENRES.includes(genre)) {
        return res.status(400).json({
          error: `Invalid genre. Must be one of: ${ALL_GENRES.join(', ')}`
        });
      }

      // Get recent viral_dna entries for this genre
      let recentDna = [];
      try {
        const dnaResult = await query(`
          SELECT * FROM viral_dna
          WHERE genre = $1
          ORDER BY created_at DESC
          LIMIT 10
        `, [genre]);
        recentDna = dnaResult.rows;
      } catch {
        // Table might not exist yet
      }

      return res.json({
        genre,
        dna: GENRE_DNA[genre],
        recent_analyses: recentDna,
        trending_elements: GENRE_DNA[genre].viral_elements
      });
    }

    // Return all genres with trending summary
    const trending = ALL_GENRES.map(g => ({
      genre: g,
      typical_bpm: GENRE_DNA[g].typical_bpm,
      viral_elements: GENRE_DNA[g].viral_elements,
      hook_pattern: GENRE_DNA[g].hook_pattern,
      is_caribbean: ['soca', 'dancehall', 'reggae'].includes(g)
    }));

    res.json({
      total_genres: ALL_GENRES.length,
      caribbean_genres: ['soca', 'dancehall', 'reggae'],
      trending
    });
  } catch (error) {
    console.error('Error fetching trending patterns:', error);
    res.status(500).json({ error: 'Failed to fetch trending patterns: ' + error.message });
  }
});

export default router;
