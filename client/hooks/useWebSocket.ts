'use client'

import { useEffect, useRef } from 'react'
import { useBoardStore } from '@/store/boardStore'

export function useWebSocket(boardId: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null)
  const { refreshBoard } = useBoardStore()

  useEffect(() => {
    if (!boardId) return

    const connect = () => {
      // Connect directly to backend WebSocket server
      const wsUrl = `ws://localhost:5001`

      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log('📡 WS received:', message.event)
          if (message.event === 'card-created' ||
              message.event === 'card-updated' ||
              message.event === 'card-deleted') {
            refreshBoard(boardId)
          }
        } catch (e) {
          // ignore parse error
        }
      }

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...')
        setTimeout(connect, 3000)
      }

      wsRef.current.onerror = () => {
        wsRef.current?.close()
      }
    }

    connect()

    return () => {
      wsRef.current?.close()
    }
  }, [boardId, refreshBoard])
}
