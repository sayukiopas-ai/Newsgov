'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useBoardStore } from '@/store/boardStore'
import KanbanBoard from '@/components/KanbanBoard'
import TrelloLoader from '@/components/TrelloLoader'

export default function BoardPage() {
  const params = useParams()
  const boardId = params.id as string
  const { fetchBoard } = useBoardStore()
  const loading = useBoardStore((s) => s.loading)
  const currentBoard = useBoardStore((s) => s.currentBoard)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchBoard(boardId)
  }, [boardId, fetchBoard])

  if (!mounted || loading || !currentBoard || currentBoard._id !== boardId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TrelloLoader label="Loading board" />
      </div>
    )
  }

  return <KanbanBoard boardId={boardId} />
}
