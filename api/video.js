export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  try {
    const response = await fetch(`https://${url}`);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: 'Video proxy error' });
  }
}
