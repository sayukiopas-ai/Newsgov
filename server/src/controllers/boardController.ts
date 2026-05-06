import { Request, Response } from 'express'
import Board from '../models/Board'
import List from '../models/List'
import Card from '../models/Card'

export const getBoards = async (_req: Request, res: Response) => {
  try {
    const boards = await Board.find().sort({ createdAt: -1 })
    res.json(boards)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch boards' })
  }
}

export const getBoard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const board = await Board.findById(id)
    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }

    const lists = await List.find({ boardId: id }).sort({ position: 1 })
    const listIds = lists.map((l) => l._id)

    const cards = await Card.find({ listId: { $in: listIds } }).sort({ position: 1 })

    const listsWithCards = lists.map((list) => ({
      ...list.toObject(),
      cards: cards.filter((card) => card.listId.toString() === list._id.toString()),
    }))

    res.json({ ...board.toObject(), lists: listsWithCards })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board' })
  }
}

export const createBoard = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body
    const board = new Board({ title, description })
    await board.save()
    res.status(201).json(board)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create board' })
  }
}

export const updateBoard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, description } = req.body
    const board = await Board.findByIdAndUpdate(id, { title, description }, { new: true })
    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }
    res.json(board)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update board' })
  }
}

export const deleteBoard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const lists = await List.find({ boardId: id })
    const listIds = lists.map((l) => l._id)
    await Card.deleteMany({ listId: { $in: listIds } })
    await List.deleteMany({ boardId: id })
    await Board.findByIdAndDelete(id)
    res.json({ message: 'Board deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete board' })
  }
}
