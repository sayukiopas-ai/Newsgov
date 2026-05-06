import { Router } from 'express'
import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
} from '../controllers/boardController'

const router = Router()

router.get('/', getBoards)
router.get('/:id', getBoard)
router.post('/', createBoard)
router.put('/:id', updateBoard)
router.delete('/:id', deleteBoard)

export default router
