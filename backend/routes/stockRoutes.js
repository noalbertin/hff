// routes/stockRoutes.js
import express from 'express'
import {
  getStocks,
  getStockById,
  getStockByMateriel,
  getStockByDepot,
  getStocksEnRupture,
  createStock,
  updateStock,
  adjustStock,
  deleteStock,
} from '../controllers/stockController.js'

const router = express.Router()

// Routes de consultation
router.get('/', getStocks)
router.get('/rupture', getStocksEnRupture)
router.get('/materiel/:materielId', getStockByMateriel)
router.get('/depot/:depotId', getStockByDepot)
router.get('/:id', getStockById)

// Routes de modification
router.post('/', createStock)
router.put('/:id', updateStock)
router.patch('/:id/adjust', adjustStock) // Route spéciale pour ajuster la quantité
router.delete('/:id', deleteStock)

export default router
