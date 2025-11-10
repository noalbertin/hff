// routes/documentsAdministratifsRoutes.js
import express from 'express'
import {
  getDocumentsAdministratifs,
  getDocumentAdministratifById,
  getDocumentByFlotteId,
  createDocumentAdministratif,
  updateDocumentAdministratif,
  deleteDocumentAdministratif,
} from '../controllers/documentsAdministratifsController.js'

const router = express.Router()

router.get('/', getDocumentsAdministratifs)
router.get('/:id', getDocumentAdministratifById)
router.get('/flotte/:flotte_id', getDocumentByFlotteId)
router.post('/', createDocumentAdministratif)
router.put('/:id', updateDocumentAdministratif)
router.delete('/:id', deleteDocumentAdministratif)

export default router
