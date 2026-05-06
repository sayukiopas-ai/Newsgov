'use client'

import { useState } from 'react'
import { useBoardStore } from '@/store/boardStore'

interface Props {
  onClose: () => void
}

export default function CreateBoardModal({ onClose }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const { createBoard } = useBoardStore()

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!title.trim()) return; await createBoard(title, description); onClose() }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Create New Board</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Board Title</label>
            <input type="text" placeholder="e.g., Project Roadmap" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description <span className="text-gray-400">(optional)</span></label>
            <textarea placeholder="What's this board about?" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm sm:text-base"
              rows={3} />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">Create</button>
          </div>
        </form>
      </div>
    </div>
  )
}