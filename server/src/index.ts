import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import http from 'http'
import dotenv from 'dotenv'
import boardRoutes from './routes/boardRoutes'
import listRoutes from './routes/listRoutes'
import cardRoutes from './routes/cardRoutes'
import { setupWebSocket } from './utils/websocket'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trello'

app.use(cors())
app.use(express.json())

app.use('/api/boards', boardRoutes)
app.use('/api/lists', listRoutes)
app.use('/api/cards', cardRoutes)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB')
    const server = http.createServer(app)
    setupWebSocket(server)
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error)
  })
