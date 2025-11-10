// routes/maintenancePreventiveRoutes.js
import express from 'express'
import {
  getMaintenancesPreventives,
  getMaintenancePreventiveById,
  getMaintenancesByMaterielId,
  getMaintenancesByStatut,
  createMaintenancePreventive,
  updateMaintenancePreventive,
  deleteMaintenancePreventive,
} from '../controllers/preventiveController.js'

const router = express.Router()

router.get('/', getMaintenancesPreventives)
router.get('/:id', getMaintenancePreventiveById)
router.get('/materiel/:materiel_id', getMaintenancesByMaterielId)
router.get('/statut/:statut', getMaintenancesByStatut)
router.post('/', createMaintenancePreventive)
router.put('/:id', updateMaintenancePreventive)
router.delete('/:id', deleteMaintenancePreventive)

export default router
