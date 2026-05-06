'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { IList, ICard } from '@/types'
import { useBoardStore } from '@/store/boardStore'
import KanbanCard from './KanbanCard'
import CreateCardModal from './CreateCardModal'
import { useState } from 'react'

interface Props {
  list: IList
  theme?: { bg: string }
  onEditCard: (card: ICard) => void
}

export default function KanbanColumn({ list, theme, onEditCard }: Props) {
  const { updateList, deleteList } = useBoardStore()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [showAddCard, setShowAddCard] = useState(false)

  const { setNodeRef: setDroppableRef } = useDroppable({ id: list._id })
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: list._id })

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const handleSave = () => { updateList(list._id, title); setIsEditing(false) }
  const handleDelete = () => { if (confirm('Delete this list and all its cards?')) deleteList(list._id) }

  return (
    <div ref={setNodeRef} style={style} className="bg-gray-100/90 backdrop-blur rounded-lg w-64 sm:w-72 flex-shrink-0 flex flex-col max-h-full border border-gray-200 shadow-sm">
      <div className="p-3 flex items-center justify-between border-b border-gray-200">
        {isEditing ? (
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleSave} onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="px-2 py-1 border rounded flex-1 mr-2 text-sm" autoFocus />
        ) : (
          <h3 className="font-semibold text-gray-700 cursor-pointer flex-1 truncate text-sm sm:text-base" onClick={() => setIsEditing(true)} {...attributes} {...listeners}>
            {list.title}
            <span className="ml-1 text-gray-400 font-normal text-xs">({list.cards.length})</span>
          </h3>
        )}
        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => setShowAddCard(true)} className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors" title="Add card">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button onClick={handleDelete} className="p-1.5 hover:bg-red-100 rounded text-gray-400 hover:text-red-500 transition-colors" title="Delete list">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={setDroppableRef} className="flex-1 p-2 space-y-2 min-h-[80px] sm:min-h-[100px] overflow-y-auto">
        <SortableContext items={list.cards.map((c) => c._id)} strategy={verticalListSortingStrategy}>
          {(list.cards || []).map((card) => (
            <KanbanCard key={card._id} card={card} onEdit={onEditCard} />
          ))}
        </SortableContext>
      </div>

      <div className="p-2 border-t border-gray-200">
        {!showAddCard && (
          <button onClick={() => setShowAddCard(true)} className="w-full flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs sm:text-sm py-1.5 px-2 rounded hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a card
          </button>
        )}
      </div>

      {showAddCard && <CreateCardModal listId={list._id} onClose={() => setShowAddCard(false)} />}
    </div>
  )
}