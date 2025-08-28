export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({ 
      status: 'running',
      timestamp: new Date().toISOString(),
      platform: 'vercel',
      environment: process.env.NODE_ENV || 'production',
      uptime: process.uptime(),
      note: 'Serverless function running on Vercel'
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ 
      error: 'Failed to get status',
      timestamp: new Date().toISOString()
    });
  }
}
