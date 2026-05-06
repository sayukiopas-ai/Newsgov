import { Request, Response } from 'express'
import List from '../models/List'
import Card from '../models/Card'

export const createList = async (req: Request, res: Response) => {
  try {
    const { boardId, title } = req.body
    const maxPosition = await List.findOne({ boardId }).sort({ position: -1 })
    const position = maxPosition ? maxPosition.position + 1 : 0

    const list = new List({ boardId, title, position })
    await list.save()
    res.status(201).json(list)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create list' })
  }
}

export const updateList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title } = req.body
    const list = await List.findByIdAndUpdate(id, { title }, { new: true })
    if (!list) {
      return res.status(404).json({ error: 'List not found' })
    }
    res.json(list)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update list' })
  }
}

export const deleteList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await Card.deleteMany({ listId: id })
    await List.findByIdAndDelete(id)
    res.json({ message: 'List deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete list' })
  }
}

export const updateListPosition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { position } = req.body
    const list = await List.findByIdAndUpdate(id, { position }, { new: true })
    if (!list) {
      return res.status(404).json({ error: 'List not found' })
    }
    res.json(list)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update list position' })
  }
}
