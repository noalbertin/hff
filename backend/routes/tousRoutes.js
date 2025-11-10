// routes/TousRoutes.js
import express from 'express'
import {
  getTousMateriels,
  getTousMaterielById,
  getLastAttachementMateriel,
} from '../controllers/tousController.js'

const router = express.Router()

router.get('/', getTousMateriels)
router.get('/:id', getTousMaterielById)
router.get('/:id/last-attachement-materiel', getLastAttachementMateriel)

export default router
