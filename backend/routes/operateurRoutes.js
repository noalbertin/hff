// routes/operateurRoutes.js
import express from 'express'
import {
  getOperateurs,
  getOperateurById,
  createOperateur,
  updateOperateur,
  deleteOperateur,
} from '../controllers/operateurController.js'

const router = express.Router()

router.get('/', getOperateurs)
router.get('/:id', getOperateurById)
router.post('/', createOperateur)
router.put('/:id', updateOperateur)
router.delete('/:id', deleteOperateur)

export default router
