// routes/depotRoutes.js
import express from 'express'
import {
  getDepots,
  getDepotById,
  getDepotStats,
  getDepotStock,
  getDepotStockRupture,
  createDepot,
  updateDepot,
  deleteDepot,
} from '../controllers/depotController.js'

const router = express.Router()

// Routes de consultation
router.get('/', getDepots)
router.get('/:id', getDepotById)
router.get('/:id/stats', getDepotStats)
router.get('/:id/stock', getDepotStock)
router.get('/:id/stock-rupture', getDepotStockRupture)

// Routes de modification
router.post('/', createDepot)
router.put('/:id', updateDepot)
router.delete('/:id', deleteDepot)

export default router
