'use client'

import { useState } from 'react'
import { useBoardStore } from '@/store/boardStore'

interface Props {
  boardId: string
  onClose: () => void
}

export default function CreateListModal({ boardId, onClose }: Props) {
  const [title, setTitle] = useState('')
  const { createList } = useBoardStore()

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!title.trim()) return; await createList(boardId, title); onClose() }

  return (
    <div className="bg-white rounded-lg shadow p-4 w-72 flex-shrink-0">
      <h3 className="font-semibold text-gray-700 mb-3">Add List</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="List title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded mb-3" autoFocus />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded text-sm">Cancel</button>
          <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Add</button>
        </div>
      </form>
    </div>
  )
}