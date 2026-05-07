import { Response } from 'express'

type SSEClient = {
  id: string
  res: Response
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map()

  addClient(id: string, res: Response) {
    this.clients.set(id, { id, res })
  }

  removeClient(id: string) {
    this.clients.delete(id)
  }

  broadcast(event: string, data: unknown) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    this.clients.forEach((client) => {
      client.res.write(message)
    })
  }
}

export const sseManager = new SSEManager()
