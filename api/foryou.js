const API_URL = process.env.API_URL || 'https://captain.sapimu.au/shortmax/api/v1';
const TOKEN = process.env.AUTH_TOKEN;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!TOKEN) return res.status(500).json({ error: 'AUTH_TOKEN not configured' });

  const { lang = 'en', page = '1' } = req.query;
  
  try {
    const response = await fetch(`${API_URL}/foryou?page=${page}&lang=${lang}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
