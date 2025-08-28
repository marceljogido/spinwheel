export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Untuk Vercel, kita tidak bisa detect local IP
    // Tapi kita bisa return public IP atau fallback
    const clientIP = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     req.connection.socket?.remoteAddress;

    // Extract first IP if multiple (x-forwarded-for can have multiple)
    const localIP = clientIP ? clientIP.split(',')[0].trim() : '192.168.1.100';
    
    res.status(200).json({ 
      localIP,
      note: 'This is the detected client IP. For local network access, use your device\'s local IP address.',
      platform: 'vercel'
    });
  } catch (error) {
    console.error('Error getting IP:', error);
    res.status(500).json({ 
      error: 'Failed to get IP address',
      fallback: '192.168.1.100'
    });
  }
}
