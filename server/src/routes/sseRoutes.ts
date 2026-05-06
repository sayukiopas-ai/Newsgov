import { Router } from 'express'
import { sseManager } from '../utils/sse'

const router = Router()

router.get('/subscribe', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  const clientId = Date.now().toString()
  sseManager.addClient(clientId, res)

  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n')
  }, 30000)

  req.on('close', () => {
    clearInterval(heartbeat)
    sseManager.removeClient(clientId)
  })
})

export default router
