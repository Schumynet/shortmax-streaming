import express from 'express'
import axios from 'axios'
import { config } from 'dotenv'

config()

const app = express()

const API_URL = process.env.API_URL || 'https://captain.sapimu.au/shortmax/api/v1'
const TOKEN = process.env.AUTH_TOKEN

const ALLOWED_PATHS = ['/languages', '/foryou', '/home', '/detail/', '/play/', '/search', '/feed/']

app.use('/api', async (req, res) => {
  const path = req.path
  
  if (!ALLOWED_PATHS.some(p => path.startsWith(p))) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const response = await axios.get(`${API_URL}${path}`, {
      params: req.query,
      headers: { Authorization: `Bearer ${TOKEN}` }
    })
    
    // Protect play endpoint for episodes >= 30
    if (path.startsWith('/play/')) {
      const episode = parseInt(req.query.ep || '0')
      
      if (episode >= 30) {
        return res.status(403).json({ 
          success: false, 
          error: 'Episode locked',
          message: 'For full API access, check Telegram @sapitokenbot'
        })
      }
    }
    
    res.json(response.data)
  } catch (err) {
    res.status(err.response?.status || 500).json({ 
      error: 'For full API access, check Telegram @sapitokenbot' 
    })
  }
})

// Video proxy
app.get('/video', async (req, res) => {
  const videoUrl = req.query.url
  if (!videoUrl) return res.status(400).send('Missing url')
  
  const fullUrl = `https://${videoUrl}`
  
  try {
    // If m3u8, rewrite URLs
    if (videoUrl.includes('.m3u8')) {
      const response = await axios.get(fullUrl)
      let text = response.data
      const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('/') + 1)
      
      text = text.replace(/^(?!#)(.+\.ts.*)$/gm, (match) => {
        if (match.startsWith('http')) {
          return `/video?url=${encodeURIComponent(match.replace('https://', ''))}`
        }
        return `/video?url=${encodeURIComponent(baseUrl + match)}`
      })
      
      res.set('Content-Type', 'application/vnd.apple.mpegurl')
      res.set('Access-Control-Allow-Origin', '*')
      return res.send(text)
    }
    
    const response = await axios.get(fullUrl, { responseType: 'stream' })
    res.set('Content-Type', response.headers['content-type'])
    res.set('Access-Control-Allow-Origin', '*')
    response.data.pipe(res)
  } catch (err) {
    res.status(500).send('Video proxy error')
  }
})

app.use(express.static('dist'))
app.get('/{*path}', (req, res) => res.sendFile('index.html', { root: 'dist' }))

app.listen(3001, () => console.log('ShortMax server running on port 3001'))
