'use client'

import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useBoardStore } from '@/store/boardStore'
import KanbanColumn from './KanbanColumn'
import CreateListModal from './CreateListModal'
import EditCardModal from './EditCardModal'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ICard } from '@/types'

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

interface Props {
  boardId: string
}

export default function KanbanBoard({ boardId }: Props) {
  const { currentBoard, loading, moveCard } = useBoardStore()
  const [showAddList, setShowAddList] = useState(false)
  const [activeCard, setActiveCard] = useState<ICard | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('blue')
  const [showTheme, setShowTheme] = useState(false)
  const [editingCard, setEditingCard] = useState<ICard | null>(null)

  const theme = THEMES[currentTheme as keyof typeof THEMES]

  useEffect(() => { setIsClient(true) }, [])

  // Connect to WebSocket for realtime updates
  useWebSocket(boardId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  if (!isClient) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="text-gray-500">Loading...</div></div>
  if (!currentBoard || loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="text-gray-500">Loading...</div></div>

  const findCardById = (id: string): ICard | undefined => {
    for (const list of currentBoard.lists) {
      const card = list.cards.find((c) => c._id === id)
      if (card) return card
    }
    return undefined
  }

  const handleDragStart = (event: DragStartEvent) => {
    const card = findCardById(event.active.id as string)
    setActiveCard(card || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null)
    const { active, over } = event
    if (!over) return
    if (active.id === over.id) return
    const destList = currentBoard.lists.find((l) => l._id === over.id)
    if (destList) moveCard(active.id as string, destList._id, destList.cards.length)
  }

  return (
    <div className={`min-h-screen ${theme.page} transition-colors duration-300`}>
      {/* Header / Navbar */}
      <header className={`${theme.header} shadow-md transition-colors duration-300`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="text-white/80 hover:text-white transition-colors flex items-center gap-1 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Boards</span>
            </Link>
            <div className="w-px h-5 sm:h-6 bg-white/30" />
            <h1 className="text-lg sm:text-2xl font-bold text-white truncate max-w-[150px] sm:max-w-none">{currentBoard.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTheme(!showTheme)}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm border border-white/20"
              title="Theme Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </button>
          </div>
        </div>

        {/* Theme Panel */}
        {showTheme && (
          <div className="border-t border-white/20 px-4 py-3 bg-black/10">
            <div className="max-w-full mx-auto flex items-center gap-2">
              <span className="text-white/70 text-sm">Theme:</span>
              <div className="flex gap-2">
                {Object.entries(THEMES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentTheme(key)}
                    className={`w-7 h-7 ${value.bg} rounded-full border-2 transition-all ${
                      currentTheme === key ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    title={value.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Board Content */}
      <div className="p-4 sm:p-6 overflow-x-auto">
        <div className="flex gap-3 sm:gap-4 items-start">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {(currentBoard.lists || []).map((list) => (
              <KanbanColumn key={list._id} list={list} theme={theme} onEditCard={setEditingCard} />
            ))}

            <DragOverlay>
              {activeCard && (
                <div className="bg-white rounded-lg shadow-xl p-3 sm:p-4 opacity-95 rotate-2">
                  <p className="text-gray-700 text-sm sm:text-base font-medium">{activeCard.title}</p>
                </div>
              )}
            </DragOverlay>
          </DndContext>

          {/* Add List Button - Fixed position */}
          {showAddList ? (
            <div className="w-64 sm:w-72 flex-shrink-0">
              <CreateListModal boardId={boardId} onClose={() => setShowAddList(false)} />
            </div>
          ) : (
            <button
              onClick={() => setShowAddList(true)}
              className="bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 px-4 sm:px-5 py-3 rounded-lg shadow-md flex items-center gap-2 transition-all flex-shrink-0 w-64 sm:w-72 border border-gray-200"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm sm:text-base font-medium">Add List</span>
            </button>
          )}
        </div>
      </div>

      {/* Edit Card Modal - Rendered at root level */}
      {editingCard && <EditCardModal cardId={editingCard._id} onClose={() => setEditingCard(null)} />}
    </div>
  )
}