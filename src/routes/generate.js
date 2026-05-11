const router = require('express').Router();
const { askAI } = require('../ai/claude');

router.post('/marketing', async (req, res) => {
  try {
    const { song_title, artist_name, genre, platform = 'instagram' } = req.body;
    const copy = await askAI(
      `Create viral ${platform} marketing copy for the song "${song_title}" by ${artist_name} (${genre}). Include: caption, 10 hashtags, 3 posting times. Make it engaging and authentic.`
    );
    res.json({ platform, content: copy, generated_at: new Date().toISOString() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/viral-analysis', async (req, res) => {
  try {
    const { genre = 'reggae' } = req.body;
    const analysis = await askAI(
      `Analyze the top 10 viral ${genre} songs of 2024-2025. What makes them hit? Identify: common BPM ranges, lyrical themes, production techniques, hook structures, and social media patterns. Output as JSON with actionable insights.`
    );
    res.json({ analysis, genre, generated_at: new Date().toISOString() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/press-release', async (req, res) => {
  try {
    const { artist_name, release_title, release_date, genre } = req.body;
    const pr = await askAI(
      `Write a professional press release for ${artist_name} releasing "${release_title}" on ${release_date}. Genre: ${genre}. Include: headline, dateline, 3 paragraphs, boilerplate, contact info placeholder.`
    );
    res.json({ press_release: pr, generated_at: new Date().toISOString() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
