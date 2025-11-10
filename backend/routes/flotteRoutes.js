//flotteRoutes.js

import express from 'express'
import {
  getFlotte,
  getFlotteById,
  getNumPM,
  getFlotteSansDocument,
  getFlotteSansOperateur,
  createFlotte,
  updateFlotte,
  deleteFlotte,
  getFlotteComplete,
  getAlertesFlotte,
} from '../controllers/flotteController.js'

const router = express.Router()

router.get('/', getFlotte)
router.get('/complete', getFlotteComplete)
router.get('/alertes', getAlertesFlotte)
router.get('/numPM', getNumPM)
router.get('/sans-document', getFlotteSansDocument)
router.get('/sans-operateur', getFlotteSansOperateur)
router.get('/:id', getFlotteById)
router.post('/', createFlotte)
router.put('/:id', updateFlotte)
router.delete('/:id', deleteFlotte)

export default router
