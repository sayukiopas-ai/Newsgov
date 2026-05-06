'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useBoardStore } from '@/store/boardStore'
import CreateBoardModal from './CreateBoardModal'
import EditBoardModal from './EditBoardModal'

const THEMES = {
  blue: { name: 'Blue', bg: 'bg-blue-500', header: 'bg-blue-600', page: 'bg-blue-50' },
  green: { name: 'Green', bg: 'bg-green-500', header: 'bg-green-600', page: 'bg-green-50' },
  purple: { name: 'Purple', bg: 'bg-purple-500', header: 'bg-purple-600', page: 'bg-purple-50' },
  red: { name: 'Red', bg: 'bg-red-500', header: 'bg-red-600', page: 'bg-red-50' },
  orange: { name: 'Orange', bg: 'bg-orange-500', header: 'bg-orange-600', page: 'bg-orange-50' },
  teal: { name: 'Teal', bg: 'bg-teal-500', header: 'bg-teal-600', page: 'bg-teal-50' },
  pink: { name: 'Pink', bg: 'bg-pink-500', header: 'bg-pink-600', page: 'bg-pink-50' },
  gray: { name: 'Gray', bg: 'bg-gray-500', header: 'bg-gray-600', page: 'bg-gray-100' },
}

export default function BoardList() {
  const { boards, loading, deleteBoard } = useBoardStore()
  const [showCreate, setShowCreate] = useState(false)
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null)
  const [showTheme, setShowTheme] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('blue')

  const theme = THEMES[currentTheme as keyof typeof THEMES]
  const editingBoard = editingBoardId ? boards.find((b) => b._id === editingBoardId) : null

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className={`min-h-screen ${theme.page} transition-colors duration-300`}>
      {/* Header / Navbar */}
      <header className={`${theme.header} shadow-md transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">My Boards</h1>
              <p className="text-white/70 text-sm hidden sm:block mt-1">Manage your projects with ease</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowTheme(!showTheme)}
                className="p-2.5 sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2 transition-all backdrop-blur-sm border border-white/20"
                title="Theme Settings"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span className="hidden sm:inline text-sm font-medium">Theme</span>
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2.5 sm:px-5 sm:py-2.5 bg-white hover:bg-gray-100 text-gray-800 rounded-lg shadow flex items-center gap-2 transition-all font-medium text-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Board</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Theme Settings Panel */}
        {showTheme && (
          <div className="bg-white rounded-xl shadow-lg p-5 md:p-6 mb-6 md:mb-8 border border-gray-200 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Theme Settings</h3>
            <p className="text-gray-500 text-sm mb-4">Choose a color theme for this page:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {Object.entries(THEMES).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setCurrentTheme(key)}
                  className={`flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl border-2 transition-all ${
                    currentTheme === key
                      ? 'border-gray-400 shadow-md bg-gray-50'
                      : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-12 h-12 ${value.bg} rounded-full shadow-sm`} />
                  <span className="text-sm font-medium text-gray-700">{value.name}</span>
                  {currentTheme === key && (
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Board Grid */}
        {boards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {boards.map((board) => (
              <div
                key={board._id}
                className="group bg-white rounded-xl shadow hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200"
              >
                <Link href={`/board/${board._id}`} className="block p-5 md:p-6">
                  {/* Title Container */}
                  <div className="mb-4">
                    <div className={`h-2 w-20 md:w-24 ${theme.bg} rounded mb-4`} />
                    <h2 className="text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors truncate">
                      {board.title}
                    </h2>
                  </div>
                  {board.description && (
                    <p className="text-gray-500 text-sm line-clamp-2">{board.description}</p>
                  )}
                </Link>
                <div className="px-5 md:px-6 pb-4 md:pb-5 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
                  <span className="text-xs text-gray-400">
                    {new Date(board.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setEditingBoardId(board._id)
                      }}
                      className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                      title="Edit board"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        if (confirm('จะลบแน่นะ?')) deleteBoard(board._id)
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete board"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-20">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200">
              <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">No boards yet</h2>
            <p className="text-gray-500 mb-6 text-sm md:text-base">Create your first board to start organizing your tasks</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow inline-flex items-center gap-2 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Board
            </button>
          </div>
        )}
      </div>

      {showCreate && <CreateBoardModal onClose={() => setShowCreate(false)} />}
      {editingBoard && <EditBoardModal board={editingBoard} onClose={() => setEditingBoardId(null)} />}
    </div>
  )
}