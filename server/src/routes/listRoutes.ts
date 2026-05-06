import { Router } from 'express'
import {
  createList,
  updateList,
  deleteList,
  updateListPosition,
} from '../controllers/listController'

const router = Router()

router.post('/', createList)
router.put('/:id', updateList)
router.delete('/:id', deleteList)
router.put('/:id/position', updateListPosition)

export default router
