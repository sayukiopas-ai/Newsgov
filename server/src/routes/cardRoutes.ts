import { Router } from 'express'
import {
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  updateCardPosition,
} from '../controllers/cardController'

const router = Router()

router.get('/:id', getCardById)
router.post('/', createCard)
router.put('/:id', updateCard)
router.delete('/:id', deleteCard)
router.put('/:id/position', updateCardPosition)

export default router
