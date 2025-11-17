// routes/materielRoutes.js
import express from 'express'
import {
  getMateriels,
  getMaterielById,
  getLastAttachement,
  getMaterielsWithoutFlotte,
  getMaterielsWithoutStock,
  getMaterielsWithoutStockInDepot,
  createMateriel,
  updateMateriel,
  deleteMateriel,
  getMaterielsWithoutMaintenance,
} from '../controllers/materielController.js'

const router = express.Router()

router.get('/', getMateriels)
router.get('/sans-flotte', getMaterielsWithoutFlotte)
router.get('/sans-maintenance', getMaterielsWithoutMaintenance)
router.get('/sans-stock', getMaterielsWithoutStock)
router.get('/sans-stock/:depotId', getMaterielsWithoutStockInDepot)
router.get('/:id', getMaterielById)
router.get('/:id/last-attachement', getLastAttachement)
router.post('/', createMateriel)
router.put('/:id', updateMateriel)
router.delete('/:id', deleteMateriel)

export default router
