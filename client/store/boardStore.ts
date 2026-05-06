import { create } from 'zustand'
import { IBoard, IList, ICard, ILabel } from '@/types'
import { boardApi, listApi, cardApi } from '@/lib/api'

interface BoardStore {
  boards: IBoard[]
  currentBoard: IBoard | null
  loading: boolean
  error: string | null

  fetchBoards: () => Promise<void>
  fetchBoard: (id: string) => Promise<void>
  refreshBoard: (id: string) => Promise<void>
  createBoard: (title: string, description?: string) => Promise<void>
  updateBoard: (id: string, data: { title?: string; description?: string }) => Promise<void>
  deleteBoard: (id: string) => Promise<void>

  createList: (boardId: string, title: string) => Promise<void>
  updateList: (id: string, title: string) => Promise<void>
  deleteList: (id: string) => Promise<void>
  reorderLists: (lists: IList[]) => Promise<void>

  createCard: (listId: string, title: string, description?: string) => Promise<void>
  updateCard: (
    id: string,
    data: { title?: string; description?: string; labels?: ILabel[]; startDate?: string; dueDate?: string; reminder?: string; completed?: boolean }
  ) => Promise<void>
  deleteCard: (id: string) => Promise<void>
  moveCard: (cardId: string, toListId: string, toPosition: number) => Promise<void>
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,

  fetchBoards: async () => {
    set({ loading: true, error: null })
    try {
      const boards = await boardApi.getAll()
      set({ boards, loading: false })
    } catch {
      set({ error: 'Failed to fetch boards', loading: false })
    }
  },

  fetchBoard: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const board = await boardApi.getById(id)
      set({ currentBoard: board, loading: false })
    } catch {
      set({ error: 'Failed to fetch board', loading: false })
    }
  },

  refreshBoard: async (id: string) => {
    // Like fetchBoard, but does not flip global loading state (prevents UI flicker / modal unmount).
    try {
      const board = await boardApi.getById(id)
      set({ currentBoard: board })
    } catch {
      set({ error: 'Failed to refresh board' })
    }
  },

  createBoard: async (title: string, description?: string) => {
    try {
      const board = await boardApi.create({ title, description })
      set((state) => ({ boards: [board, ...state.boards] }))
    } catch {
      set({ error: 'Failed to create board' })
    }
  },

  updateBoard: async (id: string, data) => {
    try {
      const updated = await boardApi.update(id, data)
      set((state) => ({
        boards: state.boards.map((b) => (b._id === id ? updated : b)),
        currentBoard: state.currentBoard?._id === id ? { ...state.currentBoard, ...updated } : state.currentBoard,
      }))
    } catch {
      set({ error: 'Failed to update board' })
    }
  },

  deleteBoard: async (id: string) => {
    try {
      await boardApi.delete(id)
      set((state) => ({
        boards: state.boards.filter((b) => b._id !== id),
        currentBoard: state.currentBoard?._id === id ? null : state.currentBoard,
      }))
    } catch {
      set({ error: 'Failed to delete board' })
    }
  },

  createList: async (boardId: string, title: string) => {
    try {
      const list = await listApi.create({ boardId, title })
      set((state) => {
        if (!state.currentBoard) return state
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: [...state.currentBoard.lists, { ...list, cards: [] }],
          },
        }
      })
    } catch {
      set({ error: 'Failed to create list' })
    }
  },

  updateList: async (id: string, title: string) => {
    try {
      await listApi.update(id, { title })
      set((state) => {
        if (!state.currentBoard) return state
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: state.currentBoard.lists.map((l) =>
              l._id === id ? { ...l, title } : l
            ),
          },
        }
      })
    } catch {
      set({ error: 'Failed to update list' })
    }
  },

  deleteList: async (id: string) => {
    try {
      await listApi.delete(id)
      set((state) => {
        if (!state.currentBoard) return state
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: state.currentBoard.lists.filter((l) => l._id !== id),
          },
        }
      })
    } catch {
      set({ error: 'Failed to delete list' })
    }
  },

  reorderLists: async (lists: IList[]) => {
    const prevLists = get().currentBoard?.lists
    set((state) => {
      if (!state.currentBoard) return state
      return {
        currentBoard: { ...state.currentBoard, lists },
      }
    })
    try {
      await Promise.all(
        lists.map((list, index) => listApi.updatePosition(list._id, index))
      )
    } catch {
      set((state) => {
        if (!state.currentBoard) return state
        return { currentBoard: { ...state.currentBoard, lists: prevLists || [] } }
      })
    }
  },

  createCard: async (listId: string, title: string, description?: string) => {
    try {
      const card = await cardApi.create({ listId, title, description })
      set((state) => {
        if (!state.currentBoard) return state
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: state.currentBoard.lists.map((l) =>
              l._id === listId ? { ...l, cards: [...l.cards, card] } : l
            ),
          },
        }
      })
    } catch {
      set({ error: 'Failed to create card' })
    }
  },

  updateCard: async (id: string, data) => {
    try {
      const updated = await cardApi.update(id, data)
      set((state) => {
        if (!state.currentBoard) return state
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: state.currentBoard.lists.map((l) => ({
              ...l,
              cards: l.cards.map((c) => (c._id === id ? updated : c)),
            })),
          },
        }
      })
    } catch {
      set({ error: 'Failed to update card' })
    }
  },

  deleteCard: async (id: string) => {
    try {
      await cardApi.delete(id)
      set((state) => {
        if (!state.currentBoard) return state
        return {
          currentBoard: {
            ...state.currentBoard,
            lists: state.currentBoard.lists.map((l) => ({
              ...l,
              cards: l.cards.filter((c) => c._id !== id),
            })),
          },
        }
      })
    } catch {
      set({ error: 'Failed to delete card' })
    }
  },

  moveCard: async (cardId: string, toListId: string, toPosition: number) => {
    const prevBoard = get().currentBoard
    set((state) => {
      if (!state.currentBoard) return state
      let cardToMove: ICard | undefined

      const listsWithoutCard = state.currentBoard.lists.map((l) => {
        const card = l.cards.find((c) => c._id === cardId)
        if (card) {
          cardToMove = { ...card, listId: toListId }
          return { ...l, cards: l.cards.filter((c) => c._id !== cardId) }
        }
        return l
      })

      if (!cardToMove) return state

      const listsWithCard = listsWithoutCard.map((l) => {
        if (l._id === toListId) {
          const newCards = [...l.cards]
          newCards.splice(toPosition, 0, cardToMove!)
          return { ...l, cards: newCards }
        }
        return l
      })

      return { currentBoard: { ...state.currentBoard, lists: listsWithCard } }
    })

    try {
      await cardApi.updatePosition(cardId, toPosition, toListId)
    } catch {
      set({ currentBoard: prevBoard })
    }
  },
}))
