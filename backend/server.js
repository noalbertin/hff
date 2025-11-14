// server.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/authRoutes.js'
import materielRoutes from './routes/materielRoutes.js'
import attachementRoutes from './routes/attachementRoutes.js'
import flotteRoutes from './routes/flotteRoutes.js'
import documentsAdministratifsRoutes from './routes/documentsAdministratifsRoutes.js'
import operateurRoutes from './routes/operateurRoutes.js'
import tousRoutes from './routes/tousRoutes.js'
import userRoutes from './routes/userRoutes.js'
import maintenanceRoutes from './routes/maintenanceRoutes.js'
import notificationsRoutes from './routes/notificationRoutes.js'
import preventiveRoutes from './routes/preventiveRoutes.js'
import curativeRoutes from './routes/curativeRoutes.js'
import stockRoutes from './routes/stockRoutes.js'
import depotRoutes from './routes/depotRoutes.js'
import mouvementStockRoutes from './routes/mouvementStockRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', authRoutes)
app.use('/api/materiel', materielRoutes)
app.use('/api/attachement', attachementRoutes)
app.use('/api/flotte', flotteRoutes)
app.use('/api/documents-administratifs', documentsAdministratifsRoutes)
app.use('/api/operateurs', operateurRoutes)
app.use('/api/tous', tousRoutes)
app.use('/api/users', userRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/preventive', preventiveRoutes)
app.use('/api/curative', curativeRoutes)
app.use('/api/stocks', stockRoutes)
app.use('/api/depots', depotRoutes)
app.use('/api/mouvements', mouvementStockRoutes)


// Route de test
app.get('/', (req, res) => {
  res.json({
    message: '🚚 API Colass is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/register, /api/token, /api/token/refresh, /api/user',
      materiel: '/api/materiel',
      attachement: '/api/attachement',
      flotte: '/api/flotte',
      documents: '/api/documents-administratifs',
      operateurs: '/api/operateurs',
      tous: '/api/tous',
      users: '/api/users',
      maintenance: '/api/maintenance',
      notifications: '/api/notifications',
      preventive: '/api/preventive',
      stocks: '/api/stocks',
      mouvements: '/api/mouvements'
    },
  })
})

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
  })
})

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Une erreur est survenue!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

app.listen(PORT, () => {
  console.log(`🚚 Serveur lancé sur http://localhost:${PORT}`)
})
