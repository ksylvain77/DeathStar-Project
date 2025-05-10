const express = require('express');
const cors = require('cors');
const qbittorrent = require('qbittorrent-api');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// qBittorrent client configuration
const qbt = qbittorrent({
  host: 'qbittorrent',
  port: 8080,
  username: 'kevin',
  password: 'kevin'
});

// Routes
app.get('/api/status', async (req, res) => {
  try {
    const status = await qbt.getAppVersion();
    res.json({ status: 'connected', version: status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to qBittorrent' });
  }
});

app.get('/api/torrents', async (req, res) => {
  try {
    const torrents = await qbt.getTorrents();
    res.json(torrents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch torrents' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Web portal running on port ${port}`);
}); 