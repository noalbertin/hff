// routes/curativeRoutes.js
import express from 'express'
import {
  getMaintenancesCuratives,
  getMaintenanceCurativeById,
  getMaintenancesByMaterielId,
  createMaintenanceCurative,
  updateMaintenanceCurative,
  deleteMaintenanceCurative,
} from '../controllers/curativeController.js'

const router = express.Router()

router.get('/', getMaintenancesCuratives)
router.get('/:id', getMaintenanceCurativeById)
router.get('/materiel/:materiel_id', getMaintenancesByMaterielId)
router.post('/', createMaintenanceCurative)
router.put('/:id', updateMaintenanceCurative)
router.delete('/:id', deleteMaintenanceCurative)

export default router
