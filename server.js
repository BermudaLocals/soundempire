require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const { initDB } = require('./src/db');

app.use('/api/artists', require('./src/routes/artists'));
app.use('/api/songs', require('./src/routes/songs'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/generate', require('./src/routes/generate'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'SoundEmpire', ts: new Date().toISOString() }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎵 SoundEmpire running on port ${PORT}`);
  });
}).catch(err => {
  console.error('DB init failed (degraded mode):', err.message);
  app.listen(PORT, '0.0.0.0', () => console.log(`🎵 SoundEmpire (degraded) on port ${PORT}`));
});
