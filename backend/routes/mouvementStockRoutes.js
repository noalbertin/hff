// routes/mouvementStockRoutes.js
import express from 'express'
import {
  getMouvements,
  getMouvementById,
  getMouvementsByMateriel,
  getMouvementsByDepot,
  getMouvementsByType,
  getMouvementsRecents,
  createMouvement,
  updateMouvement,
  cancelMouvement,
  deleteMouvement,
  getStatsMouvements,
} from '../controllers/mouvementStockController.js'

const router = express.Router()

// Routes de consultation
router.get('/', getMouvements)
router.get('/stats', getStatsMouvements)
router.get('/recents', getMouvementsRecents) // ?periode=24h|7d|30d
router.get('/type/:type', getMouvementsByType) // /type/ENTREE ou /type/SORTIE
router.get('/materiel/:materielId', getMouvementsByMateriel)
router.get('/depot/:depotId', getMouvementsByDepot)
router.get('/:id', getMouvementById)

// Routes de modification
router.post('/', createMouvement)
router.put('/:id', updateMouvement) // Modification limitée (ref, commentaire, utilisateur)
router.patch('/:id/cancel', cancelMouvement) // Annuler et inverser le stock
router.delete('/:id', deleteMouvement) // Suppression sans inverser (déconseillé)

export default router