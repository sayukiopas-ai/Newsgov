'use client'

import { useEffect, useRef } from 'react'
import { useBoardStore } from '@/store/boardStore'
import { boardApi } from '@/lib/api'

export function useRealtime(boardId: string | undefined) {
  const { fetchBoard } = useBoardStore()
  const lastUpdateRef = useRef<number>(0)

  useEffect(() => {
    if (!boardId) return

    const poll = async () => {
      try {
        const board = await boardApi.getById(boardId)
        // Find the most recent updatedAt across all cards
        let newestUpdate = 0
        board.lists.forEach((list: { cards: { updatedAt?: string }[] }) => {
          list.cards.forEach((card) => {
            if (card.updatedAt) {
              const cardTime = new Date(card.updatedAt).getTime()
              if (cardTime > newestUpdate) newestUpdate = cardTime
            }
          })
        })

        // If there's a newer update than what we have, refresh
        if (newestUpdate > lastUpdateRef.current) {
          lastUpdateRef.current = newestUpdate
          await fetchBoard(boardId)
        }
      } catch (e) {
        // ignore error
      }
    }

    // Poll every 2 seconds
    poll()
    const interval = setInterval(poll, 2000)

    return () => clearInterval(interval)
  }, [boardId, fetchBoard])
}
