# Sound Empire
## 🎵 AGI-Powered Record Label — 99.99% Autonomous

Sound Empire is a fully AI-driven record label platform where Claude (via OpenRouter) powers every creative decision — from artist persona generation to songwriting, marketing copy, and release strategy. Built for the Dollar Double Empire.

---

## ✨ What It Does

| Section | Capability |
|---------|------------|
| **Dashboard** | Live metrics across all AI artists, streams, revenue, monthly listeners |
| **Artist Factory** | Generate complete artist personas with Claude — name, bio, aesthetic, voice style, TikTok strategy |
| **AI Studio** | Create full songs (verse/chorus/bridge), viral hooks, or strategic release concepts with Suno AI prompts |
| **Marketing Suite** | Generate TikTok captions, Instagram posts, playlist pitches, press releases, and bio variants |
| **Catalog Manager** | Full release schedule tracking, stream counts, revenue per track, status management |

---

## 🏗 Architecture

```
soundempire/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # 5 main sections
│   │   ├── services/api.js # API client
│   │   ├── styles/         # Dark luxury CSS
│   │   └── App.jsx         # Main shell
│   └── vite.config.js      # Dev proxy to backend
│
├── server/                 # Node/Express backend
│   ├── routes/             # REST API endpoints
│   ├── services/claude.js  # OpenRouter Claude integration
│   ├── db/                 # PostgreSQL via Neon
│   └── scheduler.js        # Cron for releases + analytics
│
└── package.json            # Root workspace config
```

---

## 🚀 Deployment (Railway)

### 1. Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection (Neon recommended) |
| `OPENROUTER_API_KEY` | Claude API access |
| `PORT` | 3001 (backend) |

### 2. Deploy Steps

```bash
# From project root
cd soundempire

# Install dependencies
npm install

# Build client
cd client && npm install && npm run build && cd ..

# Start server
npm start
```

### 3. Railway Configuration

Create `railway.yaml`:
```yaml
build:
  builder: DOCKERFILE
  dockerfilePath: Dockerfile

deploy:
  startCommand: npm start
  healthcheckPath: /api/health
  healthcheckPort: 3001
```

Or use Nixpacks with `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

---

## 🎨 Design System

**Dark Luxury Theme:**
- Background: `#07070f`
- Surface cards: `#0d0d1a`
- Borders: `#1a1a2e`
- Gold accent: `#e8b84b`
- Cyan accent: `#00d4ff`
- Green accent: `#00ff88`
- Purple accent: `#a855f7`

**Fonts:**
- Display: Bebas Neue
- Body: DM Sans
- Mono: JetBrains Mono

---

## 🔌 API Endpoints

### Artists
- `GET /api/artists` — List all artists
- `POST /api/artists` — Create (with AI generation)
- `POST /api/artists/:id/regenerate` — Regenerate persona

### Studio
- `POST /api/studio/generate` — Generate song/hook/concept
- `GET /api/studio/songs/:artistId`
- `POST /api/studio/video-concept`

### Marketing
- `POST /api/marketing/generate` — Generate content
- `GET /api/marketing/:artistId`

### Releases
- `GET /api/releases` — All releases
- `POST /api/releases` — Schedule release

### Analytics
- `GET /api/analytics/dashboard` — Summary stats
- `GET /api/analytics/catalog` — Full catalog data

---

## 🧠 AI Integration

All creative work flows through OpenRouter → Claude:

**Artist Factory Prompt:**
```
Generate a music artist persona with these specifications:
- Genre: {genre}
- Influences: {influences}
- Vibe: {vibe}
- Target: {audience}

Return JSON with: name, genre, subgenre, bio, uniqueHook, 
aesthetic, voiceStyle, tiktokAngle, brandColor (hex)
```

**Studio Prompt (Full Song):**
```
Write a complete song for {artist} in {genre} style.
Vibe: {vibe}

Return JSON with:
- title, bpm, key, mood, productionNotes
- verse1, prechorus, chorus, verse2, bridge
- promptForSuno (copy-paste ready)
```

---

## 📊 Database Schema

Three core tables:
- `artists` — AI personas, brand colors, social stats
- `songs` — Generated lyrics, Suno prompts, audio links
- `releases` — Scheduled/live tracks with stream/revenue data

Plus analytics + marketing content tables.

---

## 🎯 Revenue Model (Empire Integration)

Sound Empire feeds into the broader Dollar Double Empire:

- **AI Influencer Studio** → Promotes AI artists, avatar generation
- **GlowX** → Superfan subscriptions, premium content
- **SwiftPay** → Artist payouts, sync licensing revenue
- **All Railway-deployed** → Unified infrastructure

---

## 🛠 Development

```bash
# Dev mode (concurrently runs client + server)
npm run dev

# Client only
cd client && npm run dev

# Server only
cd server && npm run dev
```

---

**Built for the Empire.**
*99.99% AGI Powered — Dollar Double*
