import express from 'express'
import axios from 'axios'
import { config } from 'dotenv'

config()

const app = express()

const API_URL = process.env.API_URL || 'https://captain.sapimu.au/shortmax/api/v1'
const TOKEN = process.env.AUTH_TOKEN

const ALLOWED_PATHS = ['/languages', '/foryou', '/home', '/detail/', '/play/', '/search']

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
app.use('/video', async (req, res) => {
  const videoUrl = req.path.slice(1) // remove leading /
  const fullUrl = `https://${videoUrl}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`
  
  try {
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
