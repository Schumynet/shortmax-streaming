const API_URL = process.env.API_URL || 'https://captain.sapimu.au/shortmax/api/v1';
const TOKEN = process.env.AUTH_TOKEN;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!TOKEN) return res.status(500).json({ error: 'AUTH_TOKEN not configured' });

  const { q, lang = 'en', page = '1' } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });
  
  try {
    const response = await fetch(`${API_URL}/search/${encodeURIComponent(q)}/${page}?lang=${lang}&pageSize=20`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
