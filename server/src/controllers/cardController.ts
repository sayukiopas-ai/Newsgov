import { Request, Response } from 'express'
import Card from '../models/Card'
import { wsManager } from '../utils/websocket'

export const getCardById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const card = await Card.findById(id)
    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }
    res.json(card)
  } catch (error) {
    res.status(500).json({ error: 'Failed to get card' })
  }
}

export const createCard = async (req: Request, res: Response) => {
  try {
    const { listId, title, description } = req.body
    const maxPosition = await Card.findOne({ listId }).sort({ position: -1 })
    const position = maxPosition ? maxPosition.position + 1 : 0

    const card = new Card({ listId, title, description, position, completed: false })
    await card.save()
    wsManager.broadcast('card-created', card)
    res.status(201).json(card)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create card' })
  }
}

export const updateCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, description, labels, startDate, dueDate, reminder, completed } = req.body
    const card = await Card.findByIdAndUpdate(
      id,
      { title, description, labels, startDate, dueDate, reminder, completed },
      { new: true }
    )
    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }
    console.log('📡 Broadcasting card-updated:', id)
    wsManager.broadcast('card-updated', card)
    res.json(card)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update card' })
  }
}

export const deleteCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await Card.findByIdAndDelete(id)
    wsManager.broadcast('card-deleted', { id })
    res.json({ message: 'Card deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete card' })
  }
}

export const updateCardPosition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { position, listId } = req.body
    const updateFields: Record<string, unknown> = { position }
    if (listId !== undefined) updateFields.listId = listId

    const card = await Card.findByIdAndUpdate(id, updateFields, { new: true })
    if (!card) {
      return res.status(404).json({ error: 'Card not found' })
    }
    wsManager.broadcast('card-updated', card)
    res.json(card)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update card position' })
  }
}
