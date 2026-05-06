'use client'

import { useEffect, useState } from 'react'
import { useBoardStore } from '@/store/boardStore'
import BoardList from '@/components/BoardList'
import TrelloLoader from '@/components/TrelloLoader'

export default function Home() {
  const { fetchBoards } = useBoardStore()
  const loading = useBoardStore((s) => s.loading)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchBoards()
  }, [fetchBoards])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <TrelloLoader label="Loading boards" />
      </div>
    )
  }

  return <BoardList />
}
