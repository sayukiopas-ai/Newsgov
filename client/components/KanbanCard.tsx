'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ICard } from '@/types'
import { useBoardStore } from '@/store/boardStore'

interface Props {
  card: ICard
  onEdit: (card: ICard) => void
}

const LABEL_COLORS: Record<string, string> = {
  'red-600': 'bg-red-600',
  'red-400': 'bg-red-400',
  'orange-600': 'bg-orange-600',
  'orange-400': 'bg-orange-400',
  'yellow-600': 'bg-yellow-600',
  'yellow-400': 'bg-yellow-400',
  'green-600': 'bg-green-600',
  'green-400': 'bg-green-400',
  'teal-600': 'bg-teal-600',
  'teal-400': 'bg-teal-400',
  'blue-600': 'bg-blue-600',
  'blue-400': 'bg-blue-400',
  'cyan-600': 'bg-cyan-600',
  'cyan-400': 'bg-cyan-400',
  'indigo-600': 'bg-indigo-600',
  'indigo-400': 'bg-indigo-400',
  'purple-600': 'bg-purple-600',
  'purple-400': 'bg-purple-400',
  'fuchsia-600': 'bg-fuchsia-600',
  'fuchsia-400': 'bg-fuchsia-400',
  'pink-600': 'bg-pink-600',
  'pink-400': 'bg-pink-400',
  'rose-600': 'bg-rose-600',
  'rose-400': 'bg-rose-400',
  'gray-600': 'bg-gray-600',
  'gray-400': 'bg-gray-400',
  'slate-600': 'bg-slate-600',
  'slate-400': 'bg-slate-400',
  'stone-600': 'bg-stone-600',
  'stone-400': 'bg-stone-400',
  'neutral-600': 'bg-neutral-600',
  'neutral-400': 'bg-neutral-400',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function stripMarkdown(text: string): string {
  // Card preview should be plain text (no markdown rendering).
  return text
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1') // italic
    .trim()
}

export default function KanbanCard({ card, onEdit }: Props) {
  const { deleteCard, updateCard } = useBoardStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card._id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const handleToggleComplete = (e: React.MouseEvent) => { e.stopPropagation(); updateCard(card._id, { completed: !card.completed }) }
  const handleDelete = (e: React.MouseEvent) => { e.stopPropagation(); if (confirm('จะลบแน่นะ?')) deleteCard(card._id) }

  const hasDates = card.startDate || card.dueDate || card.reminder
  const wasEdited = card.updatedAt && card.createdAt && card.updatedAt !== card.createdAt
  const displayDate = wasEdited ? card.updatedAt : card.createdAt

  return (
    <div ref={setNodeRef} style={style} onClick={() => onEdit(card)}
      className={`group bg-white rounded shadow-sm hover:shadow-md transition-all p-3 cursor-pointer border border-transparent hover:border-gray-200 ${card.completed ? 'opacity-70' : ''}`}
      {...attributes} {...listeners}>

      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((label, i) => (
            <span key={i} className={`px-2 py-0.5 ${LABEL_COLORS[label.color] || 'bg-blue-500'} text-white text-xs rounded-sm`}>{label.text}</span>
          ))}
          {hasDates && (
            <span className="flex items-center gap-1 text-gray-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {card.startDate && <span className="text-green-500 text-xs">S</span>}
              {card.dueDate && <span className="text-orange-500 text-xs">D</span>}
              {card.reminder && <span className="text-purple-500 text-xs">R</span>}
            </span>
          )}
        </div>
      )}

      <div className="flex items-start gap-2">
        <button onClick={handleToggleComplete}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${card.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'}`}>
          {card.completed && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
        </button>
        <p className={`text-sm flex-1 leading-relaxed ${card.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{card.title}</p>
        <button onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
          title="Delete card">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {card.description && (
        <p className="text-gray-400 text-xs mt-2 ml-7 truncate">
          {stripMarkdown(card.description)}
        </p>
      )}

      {/* Date info */}
      <p className="text-gray-300 text-xs mt-2 ml-7 flex items-center gap-1">
        {wasEdited && <span className="text-gray-400">(edited)</span>}
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {formatDate(displayDate)}
      </p>
    </div>
  )
}