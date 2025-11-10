// routes/maintenanceRoutes.js
import express from 'express'
import {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from '../controllers/maintenanceController.js'

const router = express.Router()

// Routes pour la maintenance
router.get('/', getAllMaintenance)
router.post('/', createMaintenance)
router.get('/:id', getMaintenanceById)
router.put('/:id', updateMaintenance)
router.delete('/:id', deleteMaintenance)

export default router
