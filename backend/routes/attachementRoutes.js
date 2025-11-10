// routes/attachementRoutes.js
import express from 'express'
import {
  getAttachements,
  getAttachementById,
  createAttachement,
  updateAttachement,
  deleteAttachement,
  getAttachementsByMateriel,
  getAttachementsByLot,
  getAttachementsByStatut,
  getAttachementsByDate,
  getAttachementsStats,
} from '../controllers/attachementController.js'

const router = express.Router()

// Routes CRUD de base
router.get('/', getAttachements)
router.get('/:id', getAttachementById)
router.post('/', createAttachement)
router.put('/:id', updateAttachement)
router.delete('/:id', deleteAttachement)

// Routes additionnelles pour les filtres
router.get('/materiel/:materiel_id', getAttachementsByMateriel)
router.get('/lot/:lot', getAttachementsByLot)
router.get('/statut/:statut', getAttachementsByStatut)
router.get('/date/range', getAttachementsByDate)
router.get('/stats/all', getAttachementsStats)

export default router
