import express from 'express'
import * as notificationsController from '../controllers/notificationController.js'

const router = express.Router()

// GET /api/notifications - Liste des notifications
router.get('/', notificationsController.getNotifications)

// GET /api/notifications/count - Compteur non lues
router.get('/count', notificationsController.getUnreadCount)

// GET /api/notifications/statistics - Statistiques
router.get('/statistics', notificationsController.getStatistics)

// POST /api/notifications/generate - Générer manuellement
router.post('/generate', notificationsController.generateNotifications)

// PUT /api/notifications/:id/read - Marquer comme lue
router.put('/:id/read', notificationsController.markAsRead)

// PUT /api/notifications/read-all - Tout marquer comme lu
router.put('/read-all', notificationsController.markAllAsRead)

// DELETE /api/notifications/:id - Supprimer
router.delete('/:id', notificationsController.deleteNotification)

export default router
