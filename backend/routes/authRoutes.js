// routes/authRoutes.js
import express from 'express'
import {
  register,
  login,
  refreshToken,
  getCurrentUser,
} from '../controllers/authController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/register/', register)
router.post('/token/', login)
router.post('/token/refresh/', refreshToken)
router.get('/user/', authenticateToken, getCurrentUser)

export default router
