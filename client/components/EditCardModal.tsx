'use client'

import { useState, useEffect, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TurndownService from 'turndown'
import { marked } from 'marked'
import { useBoardStore } from '@/store/boardStore'
import { ILabel } from '@/types'

marked.setOptions({
  gfm: true,
  breaks: true, // show single newlines as <br>
})

interface Props {
  cardId: string
  onClose: () => void
}

// Simple markdown to HTML converter for headings and bold/italic
function parseMarkdown(text: string): string {
  if (!text) return ''
  try {
    let html = text
    // Headings (must be first to avoid double processing)
    html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>')
    html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Line breaks
    html = html.replace(/\n/g, '<br>')
    return html
  } catch (e) {
    console.error('Markdown parse error:', e)
    return text
  }
}

const LABEL_COLORS = [
  { name: 'red-600', class: 'bg-red-600' },
  { name: 'red-400', class: 'bg-red-400' },
  { name: 'orange-600', class: 'bg-orange-600' },
  { name: 'orange-400', class: 'bg-orange-400' },
  { name: 'yellow-600', class: 'bg-yellow-600' },
  { name: 'yellow-400', class: 'bg-yellow-400' },
  { name: 'green-600', class: 'bg-green-600' },
  { name: 'green-400', class: 'bg-green-400' },
  { name: 'teal-600', class: 'bg-teal-600' },
  { name: 'teal-400', class: 'bg-teal-400' },
  { name: 'blue-600', class: 'bg-blue-600' },
  { name: 'blue-400', class: 'bg-blue-400' },
  { name: 'cyan-600', class: 'bg-cyan-600' },
  { name: 'cyan-400', class: 'bg-cyan-400' },
  { name: 'indigo-600', class: 'bg-indigo-600' },
  { name: 'indigo-400', class: 'bg-indigo-400' },
  { name: 'purple-600', class: 'bg-purple-600' },
  { name: 'purple-400', class: 'bg-purple-400' },
  { name: 'fuchsia-600', class: 'bg-fuchsia-600' },
  { name: 'fuchsia-400', class: 'bg-fuchsia-400' },
  { name: 'pink-600', class: 'bg-pink-600' },
  { name: 'pink-400', class: 'bg-pink-400' },
  { name: 'rose-600', class: 'bg-rose-600' },
  { name: 'rose-400', class: 'bg-rose-400' },
  { name: 'gray-600', class: 'bg-gray-600' },
  { name: 'gray-400', class: 'bg-gray-400' },
  { name: 'slate-600', class: 'bg-slate-600' },
  { name: 'slate-400', class: 'bg-slate-400' },
  { name: 'stone-600', class: 'bg-stone-600' },
  { name: 'stone-400', class: 'bg-stone-400' },
  { name: 'neutral-600', class: 'bg-neutral-600' },
  { name: 'neutral-400', class: 'bg-neutral-400' },
]

export default function EditCardModal({ cardId, onClose }: Props) {
  const currentBoard = useBoardStore((state) => state.currentBoard)
  const { updateCard } = useBoardStore()

  // Get the latest card data from store - this will update when store changes
  const card = currentBoard?.lists.flatMap((l) => l.cards).find((c) => c._id === cardId)

  // Local editing state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [labels, setLabels] = useState<ILabel[]>([])
  const [labelText, setLabelText] = useState('')
  const [labelColor, setLabelColor] = useState('blue')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [editingLabelIndex, setEditingLabelIndex] = useState<number | null>(null)
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [reminder, setReminder] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const initializedCardIdRef = useRef<string | null>(null)
  const lastSyncedDescriptionRef = useRef<string>('')
  const descriptionBeforeEditRef = useRef<string>('')
  const draftDescriptionRef = useRef<string>('')
  const turndownRef = useRef<TurndownService | null>(null)

  if (!turndownRef.current) {
    const td = new TurndownService({
      headingStyle: 'atx',
      emDelimiter: '*',
      strongDelimiter: '**',
    })
    // Preserve line breaks
    td.addRule('lineBreaks', {
      filter: ['br'],
      replacement: () => '\n',
    })
    turndownRef.current = td
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Placeholder.configure({
        placeholder: 'Write description…',
      }),
    ],
    content: description ? marked.parse(description) as string : '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const md = turndownRef.current ? turndownRef.current.turndown(html) : ''
      // Do not set React state on every keystroke/transaction to avoid scroll jank.
      draftDescriptionRef.current = md
    },
    editorProps: {
      attributes: {
        class:
          'w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] text-sm sm:text-base prose prose-sm max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:text-base [&_h4]:font-semibold [&_h5]:text-sm [&_h5]:font-semibold [&_h6]:text-sm [&_h6]:font-semibold',
      },
    },
  })

  const displayEditor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
    ],
    content: description ? (marked.parse(description) as string) : '',
    editorProps: {
      attributes: {
        class:
          'w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg min-h-[80px] text-sm sm:text-base cursor-text prose prose-sm max-w-none hover:bg-gray-50 whitespace-pre-wrap break-words [overflow-wrap:anywhere] [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:text-base [&_h4]:font-semibold [&_h5]:text-sm [&_h5]:font-semibold [&_h6]:text-sm [&_h6]:font-semibold',
      },
    },
  })

  const enterDescriptionEditMode = () => {
    descriptionBeforeEditRef.current = description
    draftDescriptionRef.current = description
    setIsEditingDescription(true)
    // selection sync happens after render via effect + focus events
  }

  const cancelDescriptionEdit = () => {
    const original = descriptionBeforeEditRef.current
    setDescription(original)
    lastSyncedDescriptionRef.current = original
    draftDescriptionRef.current = original
    setIsEditingDescription(false)
    if (editor) editor.commands.setContent(original ? marked.parse(original) : '', { emitUpdate: false })
  }

  const saveDescriptionEdit = async () => {
    const html = editor?.getHTML() ?? (description ? (marked.parse(description) as string) : '')
    const latestDescription =
      turndownRef.current ? turndownRef.current.turndown(html) : draftDescriptionRef.current || description
    setDescription(latestDescription)
    lastSyncedDescriptionRef.current = latestDescription
    draftDescriptionRef.current = latestDescription
    await updateCard(cardId, { description: latestDescription })
    setIsEditingDescription(false)
  }

  // Initialize state from card data only once when card changes
  useEffect(() => {
    if (card && initializedCardIdRef.current !== card._id) {
      initializedCardIdRef.current = card._id
      setTitle(card.title || '')
      setDescription(card.description || '')
      lastSyncedDescriptionRef.current = card.description || ''
      setLabels(card.labels || [])
      setStartDate(card.startDate ? String(card.startDate).split('T')[0] : '')
      setDueDate(card.dueDate ? String(card.dueDate).split('T')[0] : '')
      setReminder(card.reminder ? String(card.reminder).split('T')[0] : '')
      setIsCompleted(card.completed || false)
    }
  }, [card?._id])

  // Focus editor when entering edit mode
  useEffect(() => {
    if (isEditingDescription && editor) {
      const raf = requestAnimationFrame(() => {
        // Always load latest markdown into editor when entering edit mode.
        // This avoids occasional blank content due to editor init/hydration timing.
        editor.commands.setContent(description ? (marked.parse(description) as string) : '', { emitUpdate: false })
        editor.commands.focus('end')
        draftDescriptionRef.current = description
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [isEditingDescription, editor])

  // Keep read-only renderer in sync with latest markdown
  useEffect(() => {
    if (!displayEditor) return
    displayEditor.commands.setContent(description ? (marked.parse(description) as string) : '', { emitUpdate: false })
  }, [description, displayEditor])

  const handleCancel = () => {
    onClose()
  }

  const handleToggleComplete = () => {
    const newValue = !isCompleted
    setIsCompleted(newValue)
    updateCard(cardId, { completed: newValue })
  }

  const addLabel = () => {
    if (!labelText.trim()) return
    const newLabels = [...labels, { text: labelText.trim(), color: labelColor }]
    setLabels(newLabels)
    updateCard(cardId, { labels: newLabels })
    setLabelText('')
  }

  const removeLabel = (i: number) => {
    const newLabels = labels.filter((_, idx) => idx !== i)
    setLabels(newLabels)
    updateCard(cardId, { labels: newLabels })
  }

  const updateLabelColor = (i: number, color: string) => {
    const newLabels = labels.map((l, idx) => idx === i ? { ...l, color } : l)
    setLabels(newLabels)
    updateCard(cardId, { labels: newLabels })
    setEditingLabelIndex(null)
  }

  const clearDate = (setter: React.Dispatch<React.SetStateAction<string>>, field: 'startDate' | 'dueDate' | 'reminder') => {
    setter('')
    updateCard(cardId, { [field]: undefined })
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={() => {
        // Close modal WITHOUT saving description; user must press Save in textarea editor.
        if (isEditingDescription) cancelDescriptionEdit()
        onClose()
      }}
    >
      <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-md shadow-lg max-h-[calc(100vh-80px)] overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] [contain:layout_paint]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Card</h2>
          <button
            type="button"
            onClick={() => {
              if (isEditingDescription) cancelDescriptionEdit()
              onClose()
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Checkbox + Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleComplete}
              className={`w-6 h-6 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {isCompleted && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title !== (card?.title || '') && updateCard(cardId, { title })}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Card title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            {isEditingDescription ? (
              <>
                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded-lg border border-gray-200 flex-wrap">
                  {/* Heading Dropdown - Markdown style with size preview */}
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      // Placeholder option -> do nothing
                      if (e.target.value === '') return
                      const level = parseInt(e.target.value, 10) as 1 | 2 | 3 | 4 | 5 | 6 | 0
                      if (!editor) return
                      if (level === 0) editor.chain().focus().setParagraph().run()
                      else editor.chain().focus().toggleHeading({ level }).run()
                      // Reset dropdown to placeholder for next use
                      e.currentTarget.selectedIndex = 0
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-200 cursor-pointer bg-white font-medium shadow-sm"
                  >
                    <option value="" disabled style={{ fontSize: '14px', fontWeight: 500 }}>
                      Text style…
                    </option>
                    <option value="0" style={{ fontSize: '14px', fontWeight: 400 }}>
                      Normal
                    </option>
                    <option value="1" style={{ fontSize: '22px', fontWeight: 700 }}>
                      # Heading 1
                    </option>
                    <option value="2" style={{ fontSize: '20px', fontWeight: 700 }}>
                      ## Heading 2
                    </option>
                    <option value="3" style={{ fontSize: '18px', fontWeight: 700 }}>
                      ### Heading 3
                    </option>
                    <option value="4" style={{ fontSize: '16px', fontWeight: 700 }}>
                      #### Heading 4
                    </option>
                    <option value="5" style={{ fontSize: '15px', fontWeight: 700 }}>
                      ##### Heading 5
                    </option>
                    <option value="6" style={{ fontSize: '14px', fontWeight: 700 }}>
                      ###### Heading 6
                    </option>
                  </select>

                  {/* Bold Button - Markdown **text** */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor) return
                      editor.chain().focus().toggleBold().run()
                    }}
                    className="px-3 py-1.5 text-sm font-bold border border-gray-300 rounded-md hover:bg-gray-200 bg-white shadow-sm"
                    title="Bold (**text**)"
                  >
                    B
                  </button>

                  {/* Italic Button - Markdown *text* */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor) return
                      editor.chain().focus().toggleItalic().run()
                    }}
                    className="px-3 py-1.5 text-sm italic font-medium border border-gray-300 rounded-md hover:bg-gray-200 bg-white shadow-sm"
                    title="Italic (*text*)"
                  >
                    I
                  </button>

                  {/* Save and Cancel buttons */}
                </div>
                <EditorContent editor={editor} />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={cancelDescriptionEdit}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md border border-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveDescriptionEdit}
                    className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm"
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div onClick={enterDescriptionEditMode} className="w-full">
                {description ? (
                  <EditorContent editor={displayEditor} />
                ) : (
                  <div className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg min-h-[80px] text-sm sm:text-base cursor-text hover:bg-gray-50 text-gray-400">
                    Click to add description...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dates Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600">Dates</label>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm w-20">Start:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  updateCard(cardId, { startDate: e.target.value || undefined })
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {startDate && (
                <button type="button" onClick={() => clearDate(setStartDate, 'startDate')} className="text-gray-400 hover:text-red-500 text-sm">×</button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm w-20">Due:</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value)
                  updateCard(cardId, { dueDate: e.target.value || undefined })
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {dueDate && (
                <button type="button" onClick={() => clearDate(setDueDate, 'dueDate')} className="text-gray-400 hover:text-red-500 text-sm">×</button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm w-20">Reminder:</span>
              <input
                type="date"
                value={reminder}
                onChange={(e) => {
                  setReminder(e.target.value)
                  updateCard(cardId, { reminder: e.target.value || undefined })
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {reminder && (
                <button type="button" onClick={() => clearDate(setReminder, 'reminder')} className="text-gray-400 hover:text-red-500 text-sm">×</button>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {labels.map((label, i) => (
                <div key={i} className="group flex items-center gap-1 relative">
                  <span className={`px-2 py-0.5 text-white text-sm rounded ${LABEL_COLORS.find((c) => c.name === label.color)?.class || 'bg-blue-500'}`}>
                    {label.text}
                    <button
                      onClick={() => removeLabel(i)}
                      className="ml-1 text-white/70 hover:text-white font-bold"
                    >
                      ×
                    </button>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingLabelIndex(editingLabelIndex === i ? null : i)}
                    className="text-white/70 hover:text-white text-xs"
                  >
                    ▾
                  </button>
                  {editingLabelIndex === i && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg p-5 pl-6 pr-8 grid grid-cols-5 gap-7 z-20 border">
                      {LABEL_COLORS.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => updateLabelColor(i, c.name)}
                          className={`w-5 h-5 rounded ${c.class} hover:scale-110 transition-transform`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                placeholder="New label..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className={`w-8 h-8 rounded ${LABEL_COLORS.find((c) => c.name === labelColor)?.class || 'bg-blue-500'} flex items-center justify-center text-white text-xs`}
                >
                  ▾
                </button>
                {showColorPicker && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg p-5 pl-6 pr-8 grid grid-cols-5 gap-7 z-20 border">
                    {LABEL_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => { setLabelColor(c.name); setShowColorPicker(false) }}
                        className={`w-5 h-5 rounded ${c.class} hover:scale-110 transition-transform ${labelColor === c.name ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={addLabel} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Add</button>
            </div>
          </div>

          {/* Done Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                if (isEditingDescription) cancelDescriptionEdit()
                onClose()
              }}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
