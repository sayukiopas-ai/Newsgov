export interface ILabel {
  text: string
  color: string
}

export interface ICard {
  _id: string
  listId: string
  title: string
  description?: string
  position: number
  labels?: ILabel[]
  startDate?: string
  dueDate?: string
  reminder?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface IList {
  _id: string
  boardId: string
  title: string
  position: number
  cards: ICard[]
  createdAt: string
  updatedAt: string
}

export interface IBoard {
  _id: string
  title: string
  description?: string
  lists: IList[]
  createdAt: string
  updatedAt: string
}