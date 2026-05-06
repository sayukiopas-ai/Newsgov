'use client'

import { useState } from 'react'
import { useBoardStore } from '@/store/boardStore'

interface Props {
  listId: string
  onClose: () => void
}

export default function CreateCardModal({ listId, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const { createCard } = useBoardStore()

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!title.trim()) return; await createCard(listId, title, description); onClose() }

  return (
    <div className="bg-white rounded shadow p-3">
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Card title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded mb-2" autoFocus />
        <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded mb-2 text-sm" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded text-sm">Cancel</button>
          <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">Add</button>
        </div>
      </form>
    </div>
  )
}