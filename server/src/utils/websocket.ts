import { WebSocketServer, WebSocket } from 'ws'

interface WSClient {
  id: string
  ws: WebSocket
}

class WebSocketManager {
  private clients: Map<string, WSClient> = new Map()

  addClient(id: string, ws: WebSocket) {
    this.clients.set(id, { id, ws })
  }

  removeClient(id: string) {
    this.clients.delete(id)
  }

  broadcast(event: string, data: unknown) {
    const message = JSON.stringify({ event, data })
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message)
      }
    })
  }
}

export const wsManager = new WebSocketManager()

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    console.log('🔌 WebSocket client connected')
    const clientId = Date.now().toString()
    wsManager.addClient(clientId, ws)

    ws.on('close', () => {
      console.log('🔌 WebSocket client disconnected')
      wsManager.removeClient(clientId)
    })

    ws.on('error', () => {
      wsManager.removeClient(clientId)
    })
  })

  console.log('📡 WebSocket server initialized')
}
