const express = require('express');
const cors = require('cors');
const QBittorrentClient = require('./qbittorrent-client');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize qBittorrent client
const qbtClient = new QBittorrentClient({
  baseURL: 'http://qbittorrent:8080',
  username: 'kevin',
  password: 'kevinkevin'
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Serve static HTML for root path
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>DeathStar NAS Portal</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
            margin-bottom: 20px;
          }
          .status {
            margin-bottom: 20px;
            padding: 10px;
            border-radius: 4px;
          }
          .status.connected {
            background-color: #e6ffe6;
            border: 1px solid #00cc00;
          }
          .status.error {
            background-color: #ffe6e6;
            border: 1px solid #cc0000;
          }
          .torrents {
            margin-top: 20px;
          }
          .torrent-item {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
          .torrent-item:last-child {
            border-bottom: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>DeathStar NAS Portal</h1>
          <div id="status" class="status">Checking connection...</div>
          <div id="torrents" class="torrents">
            <h2>Active Torrents</h2>
            <div id="torrentList"></div>
          </div>
        </div>
        <script>
          // Function to update status
          async function updateStatus() {
            try {
              const response = await fetch('/api/status');
              const data = await response.json();
              const statusDiv = document.getElementById('status');
              if (data.status === 'connected') {
                statusDiv.className = 'status connected';
                statusDiv.textContent = 'Connected to qBittorrent (v' + data.version + ')';
              } else {
                throw new Error('Not connected');
              }
            } catch (error) {
              const statusDiv = document.getElementById('status');
              statusDiv.className = 'status error';
              statusDiv.textContent = 'Failed to connect to qBittorrent';
            }
          }

          // Function to update torrents
          async function updateTorrents() {
            try {
              const response = await fetch('/api/torrents');
              const torrents = await response.json();
              const torrentList = document.getElementById('torrentList');
              if (torrents.length) {
                torrentList.innerHTML = torrents.map(function(t) {
                  return '<div class="torrent-item">' +
                    '<strong>' + t.name + '</strong><br>' +
                    'Progress: ' + (t.progress * 100).toFixed(1) + '%<br>' +
                    'Download Speed: ' + (t.dlspeed / 1024 / 1024).toFixed(2) + ' MB/s' +
                    '</div>';
                }).join('');
              } else {
                torrentList.innerHTML = '<div class="torrent-item">No active torrents</div>';
              }
            } catch (error) {
              const torrentList = document.getElementById('torrentList');
              torrentList.innerHTML = '<div class="torrent-item">Failed to load torrents</div>';
            }
          }

          // Update status and torrents on load
          updateStatus();
          updateTorrents();

          // Update every 5 seconds
          setInterval(function() {
            updateStatus();
            updateTorrents();
          }, 5000);
        </script>
      </body>
    </html>
  `);
});

// API Routes
app.get('/api/status', async (req, res) => {
  try {
    console.log('Checking qBittorrent status...');
    const version = await qbtClient.getVersion();
    console.log('Version response:', version);
    res.json({ status: 'connected', version });
  } catch (error) {
    console.error('Status error:', error.message);
    res.status(500).json({ error: 'Failed to connect to qBittorrent' });
  }
});

app.get('/api/torrents', async (req, res) => {
  try {
    console.log('Fetching torrents...');
    const torrents = await qbtClient.getTorrents();
    console.log('Found', torrents.length, 'torrents');
    res.json(torrents);
  } catch (error) {
    console.error('Torrents error:', error.message);
    res.status(500).json({ error: 'Failed to fetch torrents' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Web portal running on port ${port}`);
}); 