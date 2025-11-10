// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt'

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ detail: 'Token non fourni' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ detail: 'Token invalide' })
    }
    req.user = user
    next()
  })
}

// Middleware pour vérifier le rôle admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ detail: 'Accès refusé. Droits administrateur requis.' })
  }
  next()
}

// Middleware combiné : authentification + admin
export const authenticateAdmin = [authenticateToken, requireAdmin]
