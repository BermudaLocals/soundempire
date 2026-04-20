import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export async function generateArtistPersona({ genre, influences, vibe, audience }) {
  const systemPrompt = `You are an elite A&R executive at Sound Empire, the world's first 99.99% AGI-powered record label. 
You specialize in creating compelling AI artist personas that feel authentic and commercially viable.

Rules:
1. Create memorable, searchable stage names
2. Develop distinct visual aesthetics that work for TikTok/Instagram
3. Define clear genre positioning with viral potential
4. Include specific voice characteristics for ElevenLabs voice cloning
5. Create TikTok-first content strategies
6. Use hex colors that are dark/electric (not white/black), suitable for luxury branding`;

  const userPrompt = `Create a complete AI music artist persona for Sound Empire.

Genre: ${genre}
Influences: ${influences || 'unspecified'}
Aesthetic vibe: ${vibe || 'unspecified'}
Target audience: ${audience || 'Gen Z TikTok users'}

Respond ONLY with a valid JSON object, zero markdown, no explanation:
{
  "name": "memorable stage name that fits the genre",
  "genre": "primary genre (15 chars max)",
  "subgenre": "subgenre style tags",
  "aesthetic": "2-sentence visual/aesthetic description",
  "bio": "3-sentence artist bio in third person, compelling, with emotional depth",
  "uniqueHook": "the one thing that makes this artist unforgettable",
  "voiceStyle": "vocal style details for ElevenLabs: gender, age, accent, texture, tone",
  "tiktokAngle": "specific viral TikTok content strategy for this artist",
  "brandColor": "vibrant hex color for artist brand (dark/electric, NOT #ffffff or #000000)",
  "contentPillars": ["3 content themes for this artist's social media"],
  "targetPlaylists": ["5 specific Spotify playlist names to target"]
}`;

  const response = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return parseJSON(response.content[0].text);
}

export async function generateSong({ mode, artist, vibe, lyricsTheme }) {
  const systemPrompt = `You are an elite songwriter at Sound Empire, an AGI-powered record label.
You write commercially viable lyrics optimized for streaming, TikTok virality, and sync licensing.

Guidelines:
- Hooks must be instantly memorable
- Verses should establish emotional stakes
- Production notes must be specific and actionable
- Include BPM and key suggestions
- Optimize for streaming algorithm (short intros, quick hook arrival)`;

  const prompts = {
    full: `Write a complete song for AI artist ${artist.name} (${artist.genre}, aesthetic: ${artist.aesthetic}).
Track vibe/theme: "${vibe}"
${lyricsTheme ? `Specific theme: ${lyricsTheme}` : ''}

Respond ONLY with valid JSON:
{
  "title": "commercially viable track title",
  "bpm": 120,
  "key": "musical key",
  "mood": "single word mood descriptor",
  "productionNotes": "2-3 sentences on production style, instruments, and arrangement",
  "verse1": "verse 1 lyrics, 4-8 lines, conversational",
  "prechorus": "pre-chorus lyrics, 2-4 lines, building tension",
  "chorus": "chorus lyrics, 4-6 lines, extremely catchy, repeatable",
  "verse2": "verse 2 lyrics, 4-8 lines, advance the story",
  "bridge": "bridge lyrics, 2-4 lines, emotional peak",
  "outro": "outro lyrics, 1-2 lines",
  "promptForSuno": "optimized Suno AI generation prompt under 200 chars describing style and sound",
  "syncOpportunities": ["3 sync licensing opportunities (TV shows, ads, games)"],
  "viralMoment": "1-sentence description of the TikTok viral moment for this song"
}`,

    hook: `Write a viral hook for AI artist ${artist.name} (${artist.genre}).
Vibe: "${vibe}"

Respond ONLY with valid JSON:
{
  "title": "track title",
  "hook": "main hook/chorus, 4-6 lines, extremely catchy, singable after one listen",
  "hookExplanation": "why this hook goes viral - psychological hook explanation",
  "tiktokClip": "15-second TikTok clip concept including visual and sound",
  "trendPotential": "which trending sound/audio style this fits",
  "promptForSuno": "Suno AI prompt for this hook, under 200 chars",
  "choreography": "brief description of the viral dance/movement potential"
}`,

    concept: `Create a strategic track concept for AI artist ${artist.name} (${artist.genre}).
Vibe: "${vibe}"

Respond ONLY with valid JSON:
{
  "title": "track title",
  "concept": "2-3 sentence concept explaining the song's emotional core and narrative",
  "musicalDirection": "genre fusion, production style, key reference tracks",
  "targetPlaylist": "specific flagship Spotify playlist to target",
  "syncOpportunities": ["3 sync licensing opportunities with specific shows/ads/games"],
  "marketingAngle": "primary marketing angle for this release",
  "contentSeries": ["5 TikTok/Shorts content ideas to promote this track"],
  "promptForSuno": "Suno AI prompt for full generation, under 200 chars"
}`
  };

  const response = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompts[mode] }],
  });

  return parseJSON(response.content[0].text);
}

export async function generateMarketingContent({ type, artist, context, releaseTitle }) {
  const systemPrompt = `You are a viral marketing strategist at Sound Empire, an AGI record label.
You create platform-native content that drives engagement and conversion.

Tone varies by platform but is always authentic to the artist and culturally relevant.`;

  const prompts = {
    tiktok: `Write viral TikTok captions for AI artist ${artist.name} (${artist.genre}).
Context: ${context || 'new single release'}
Aesthetic: ${artist.aesthetic}
Bio: ${artist.bio}

Respond ONLY with valid JSON:
{
  "captions": ["option 1 with trending hashtags", "option 2 with different angle", "option 3 storytelling approach"],
  "bestHook": "most viral opening line to use as video text overlay",
  "soundAdvice": "TikTok sound/trend strategy - which sounds to use or create",
  "hashtagStrategy": "mix of trending and niche hashtags",
  "callToAction": "specific CTA for bio link or pre-save",
  "optimalPosting": "best time to post this"
}`,

    instagram: `Write an Instagram post for AI artist ${artist.name} (${artist.genre}).
Context: ${context || 'new release announcement'}
Aesthetic: ${artist.aesthetic}

Respond ONLY with valid JSON:
{
  "caption": "full caption with line breaks and 8-10 hashtags",
  "storyIdea": "Instagram Story concept with polls/questions/interactions",
  "reelIdea": "Reel concept - 15-30 seconds, hook in first 3 seconds",
  "carouselIdea": "carousel post concept if applicable",
  "cta": "clear call to action",
  "engagementPrompt": "question or prompt to drive comments"
}`,

    pitch: `Write a Spotify playlist pitch email for ${artist.name} (${artist.genre}).
Context: ${context || 'new single'}
Recent traction: ${artist.monthly_listeners || 'growing'} monthly listeners

Respond ONLY with valid JSON:
{
  "subject": "attention-grabbing email subject line under 60 chars",
  "body": "professional pitch email body, 150-200 words, highlights streaming potential",
  "targetPlaylists": ["playlist 1 name (general vibe)", "playlist 2 name (genre-specific)", "playlist 3 name (mood-based)"],
  "keySellingPoints": ["3 bullet points for why this song fits"],
  "followUpStrategy": "timeline for follow-up emails"
}`,

    press: `Write a press release for ${artist.name} (${artist.genre}).
Context: ${context || 'debut release'}

Respond ONLY with valid JSON:
{
  "headline": "press release headline, newsworthy angle",
  "subheadline": "supporting detail, 10-15 words",
  "dateline": "CITY, DATE – ",
  "lead": "first paragraph with who, what, when, where, why",
  "body": "2-3 paragraphs with quotes, context, and story",
  "quote": "compelling artist quote (in character for AI persona)",
  "boilerplate": "short label/artist bio for end",
  "contactInfo": "press contact details"
}`,

    bio: `Write artist bio variants for ${artist.name} (${artist.genre}).
Aesthetic: ${artist.aesthetic}
Bio notes: ${context || 'current bio refresh'}

Respond ONLY with valid JSON:
{
  "short": "1-sentence bio for social media headers",
  "medium": "3-4 sentence bio for Spotify/Apple Music",
  "long": "full bio 150-200 words for press kit and website",
  "epk": "electronic press kit version with achievements and press quotes placeholders",
  "socialVariants": {
    "spotify": "Spotify-specific bio, 150 chars max",
    "instagram": "Instagram bio, 150 chars max",
    "tiktok": "TikTok bio, 80 chars max, emoji-friendly"
  }
}`
  };

  const response = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompts[type] }],
  });

  return parseJSON(response.content[0].text);
}

export async function generateMusicVideoConcept({ artist, songTitle, songMood, lyricsTheme }) {
  const prompt = `Create a music video concept for ${artist.name}'s song "${songTitle}".
Artist aesthetic: ${artist.aesthetic}
Song mood: ${songMood}
Lyrics theme: ${lyricsTheme}

Respond ONLY with valid JSON:
{
  "treatment": "2-paragraph visual treatment describing the video",
  "colorPalette": ["4 hex colors for the video grade"],
  "shotList": ["8-10 specific shot descriptions for AI video generation"],
  "klingPrompts": ["3 detailed prompts optimized for Kling AI video generation"],
  "runwayPrompts": ["3 detailed prompts optimized for Runway Gen-3"],
  "thumbnailConcept": "YouTube thumbnail concept description",
  "tiktokExcerpt": "15-second excerpt to use for TikTok promotion",
  "estimatedCost": "estimated production cost tier (zero/low/medium/high)"
}`;

  const response = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  return parseJSON(response.content[0].text);
}

// Helper to parse JSON from Claude responses
function parseJSON(text) {
  try {
    // Remove markdown code blocks if present
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse JSON:', text);
    throw new Error('Invalid JSON from Claude: ' + error.message);
  }
}

export default {
  generateArtistPersona,
  generateSong,
  generateMarketingContent,
  generateMusicVideoConcept
};
