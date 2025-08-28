const express = require('express');
const path = require('path');
const os = require('os');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API endpoint untuk mendapatkan local IP
app.get('/api/network/local-ip', (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    let localIP = '192.168.1.100'; // fallback

    // Cari IP address yang bukan localhost dan bukan internal
    for (const name of Object.keys(interfaces)) {
      for (const interface of interfaces[name]) {
        if (interface.family === 'IPv4' && !interface.internal) {
          localIP = interface.address;
          break;
        }
      }
      if (localIP !== '192.168.1.100') break;
    }

    res.json({ localIP });
  } catch (error) {
    console.error('Error getting local IP:', error);
    res.status(500).json({ error: 'Failed to get local IP' });
  }
});

// API endpoint untuk status server
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'running', 
    timestamp: new Date().toISOString(),
    port: PORT,
    uptime: process.uptime()
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Local Network: http://${getLocalIP()}:${PORT}`);
  console.log(`🌐 Admin Panel: http://${getLocalIP()}:${PORT}/admin`);
  console.log(`📊 API Status: http://${getLocalIP()}:${PORT}/api/status`);
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}
