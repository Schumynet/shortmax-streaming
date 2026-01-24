export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  try {
    const fullUrl = `https://${url}`;
    const response = await fetch(fullUrl);
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // If m3u8, rewrite URLs to go through proxy
    if (url.includes('.m3u8')) {
      let text = await response.text();
      const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
      
      // Rewrite relative URLs to absolute proxy URLs
      text = text.replace(/^(?!#)(.+\.ts.*)$/gm, (match) => {
        if (match.startsWith('http')) {
          return `/video?url=${encodeURIComponent(match.replace('https://', ''))}`;
        }
        return `/video?url=${encodeURIComponent(baseUrl + match)}`;
      });
      
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      return res.send(text);
    }
    
    res.setHeader('Content-Type', contentType);
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({ error: 'Video proxy error' });
  }
}
