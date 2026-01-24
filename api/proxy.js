const API_URL = process.env.API_URL || 'https://captain.sapimu.au/shortmax/api/v1';
const TOKEN = process.env.AUTH_TOKEN;

const ALLOWED_PATHS = ['/languages', '/foryou', '/home', '/detail/', '/play/', '/search', '/feed/'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.url.replace('/api', '');
  const [pathname, queryString] = path.split('?');
  
  if (!ALLOWED_PATHS.some(p => pathname.startsWith(p))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!TOKEN) {
    return res.status(500).json({ error: 'AUTH_TOKEN not configured' });
  }

  try {
    const url = `${API_URL}${pathname}${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const data = await response.json();
    
    // Protect play endpoint for episodes >= 30
    if (pathname.startsWith('/play/')) {
      const params = new URLSearchParams(queryString);
      if (parseInt(params.get('ep') || '0') >= 30) {
        return res.status(403).json({ error: 'Episode locked' });
      }
    }
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
