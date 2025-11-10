// import db from '../db.js'

// // Obtenir toutes les notifications
// export const getNotifications = async (req, res) => {
//   try {
//     const { lu, type, priorite, limit = 50 } = req.query

//     let query = `
//       SELECT
//         n.id_notification,
//         n.type,
//         n.materiel_id,
//         n.titre,
//         n.message,
//         n.priorite,
//         n.lu,
//         n.date_creation,
//         n.data,
//         m.designation,
//         m.num_parc
//       FROM notifications n
//       LEFT JOIN materiel m ON n.materiel_id = m.id
//       WHERE 1=1
//     `

//     const params = []

//     if (lu !== undefined) {
//       query += ' AND n.lu = ?'
//       params.push(lu === 'true' ? 1 : 0)
//     }

//     if (type) {
//       query += ' AND n.type = ?'
//       params.push(type)
//     }

//     if (priorite) {
//       query += ' AND n.priorite = ?'
//       params.push(priorite)
//     }

//     query += ' ORDER BY n.priorite DESC, n.date_creation DESC LIMIT ?'
//     params.push(parseInt(limit))

//     const [notifications] = await db.query(query, params)

//     // Parser le JSON data
//     const notificationsFormatted = notifications.map((n) => ({
//       ...n,
//       data: n.data ? JSON.parse(n.data) : null,
//     }))

//     res.json({
//       success: true,
//       count: notificationsFormatted.length,
//       data: notificationsFormatted,
//     })
//   } catch (error) {
//     console.error('Erreur getNotifications:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la récupération des notifications',
//     })
//   }
// }

// // Marquer une notification comme lue
// export const markAsRead = async (req, res) => {
//   try {
//     const { id } = req.params

//     await db.query(
//       'UPDATE notifications SET lu = TRUE, date_lu = NOW() WHERE id_notification = ?',
//       [id]
//     )

//     res.json({
//       success: true,
//       message: 'Notification marquée comme lue',
//     })
//   } catch (error) {
//     console.error('Erreur markAsRead:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la mise à jour',
//     })
//   }
// }

// // Marquer toutes les notifications comme lues
// export const markAllAsRead = async (req, res) => {
//   try {
//     await db.query(
//       'UPDATE notifications SET lu = TRUE, date_lu = NOW() WHERE lu = FALSE'
//     )

//     res.json({
//       success: true,
//       message: 'Toutes les notifications marquées comme lues',
//     })
//   } catch (error) {
//     console.error('Erreur markAllAsRead:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la mise à jour',
//     })
//   }
// }

// // Supprimer une notification
// export const deleteNotification = async (req, res) => {
//   try {
//     const { id } = req.params

//     await db.query('DELETE FROM notifications WHERE id_notification = ?', [id])

//     res.json({
//       success: true,
//       message: 'Notification supprimée',
//     })
//   } catch (error) {
//     console.error('Erreur deleteNotification:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la suppression',
//     })
//   }
// }

// // Obtenir le compteur de notifications non lues
// export const getUnreadCount = async (req, res) => {
//   try {
//     const [result] = await db.query(
//       `SELECT
//         COUNT(*) as total,
//         SUM(CASE WHEN priorite = 'Urgent' THEN 1 ELSE 0 END) as urgent,
//         SUM(CASE WHEN priorite = 'Attention' THEN 1 ELSE 0 END) as attention,
//         SUM(CASE WHEN priorite = 'Info' THEN 1 ELSE 0 END) as info
//       FROM notifications
//       WHERE lu = FALSE`
//     )

//     res.json({
//       success: true,
//       data: result[0],
//     })
//   } catch (error) {
//     console.error('Erreur getUnreadCount:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors du comptage',
//     })
//   }
// }

// // Générer manuellement les notifications
// export const generateNotifications = async (req, res) => {
//   try {
//     await db.query('CALL generer_notifications()')

//     res.json({
//       success: true,
//       message: 'Notifications générées avec succès',
//     })
//   } catch (error) {
//     console.error('Erreur generateNotifications:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la génération des notifications',
//     })
//   }
// }

// // Obtenir les statistiques des notifications
// export const getStatistics = async (req, res) => {
//   try {
//     const [stats] = await db.query(`
//       SELECT
//         type,
//         priorite,
//         COUNT(*) as count
//       FROM notifications
//       WHERE lu = FALSE
//       GROUP BY type, priorite
//       ORDER BY priorite DESC, type
//     `)

//     res.json({
//       success: true,
//       data: stats,
//     })
//   } catch (error) {
//     console.error('Erreur getStatistics:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Erreur lors de la récupération des statistiques',
//     })
//   }
// }

import db from '../db.js'

// Obtenir toutes les notifications
export const getNotifications = async (req, res) => {
  try {
    const { lu, type, priorite, limit = 50 } = req.query

    let query = `
      SELECT 
        n.id_notification,
        n.type,
        n.materiel_id,
        n.titre,
        n.message,
        n.priorite,
        n.lu,
        n.date_creation,
        n.data,
        m.designation,
        m.num_parc
      FROM notifications n
      LEFT JOIN materiel m ON n.materiel_id = m.id
      WHERE 1=1
    `

    const params = []

    if (lu !== undefined) {
      query += ' AND n.lu = ?'
      params.push(lu === 'true' ? 1 : 0)
    }

    if (type) {
      query += ' AND n.type = ?'
      params.push(type)
    }

    if (priorite) {
      query += ' AND n.priorite = ?'
      params.push(priorite)
    }

    query += ' ORDER BY n.priorite DESC, n.date_creation DESC LIMIT ?'
    params.push(parseInt(limit))

    const [notifications] = await db.query(query, params)

    // MySQL retourne déjà le champ JSON parsé, pas besoin de JSON.parse()
    const notificationsFormatted = notifications.map((n) => ({
      ...n,
      // Si data est déjà un objet, le garder tel quel
      // Sinon (string), le parser
      data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data,
    }))

    res.json({
      success: true,
      count: notificationsFormatted.length,
      data: notificationsFormatted,
    })
  } catch (error) {
    console.error('Erreur getNotifications:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message, // Ajouter le message d'erreur pour déboguer
    })
  }
}

// Marquer une notification comme lue
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params

    await db.query(
      'UPDATE notifications SET lu = TRUE, date_lu = NOW() WHERE id_notification = ?',
      [id]
    )

    res.json({
      success: true,
      message: 'Notification marquée comme lue',
    })
  } catch (error) {
    console.error('Erreur markAsRead:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message,
    })
  }
}

// Marquer toutes les notifications comme lues
export const markAllAsRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET lu = TRUE, date_lu = NOW() WHERE lu = FALSE'
    )

    res.json({
      success: true,
      message: 'Toutes les notifications marquées comme lues',
    })
  } catch (error) {
    console.error('Erreur markAllAsRead:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message,
    })
  }
}

// Supprimer une notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params

    await db.query('DELETE FROM notifications WHERE id_notification = ?', [id])

    res.json({
      success: true,
      message: 'Notification supprimée',
    })
  } catch (error) {
    console.error('Erreur deleteNotification:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message,
    })
  }
}

// Obtenir le compteur de notifications non lues
export const getUnreadCount = async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN priorite = 'Urgent' THEN 1 ELSE 0 END) as urgent,
        SUM(CASE WHEN priorite = 'Attention' THEN 1 ELSE 0 END) as attention,
        SUM(CASE WHEN priorite = 'Info' THEN 1 ELSE 0 END) as info
      FROM notifications 
      WHERE lu = FALSE`
    )

    res.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error('Erreur getUnreadCount:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors du comptage',
      error: error.message,
    })
  }
}

// Générer manuellement les notifications
export const generateNotifications = async (req, res) => {
  try {
    await db.query('CALL generer_notifications()')

    res.json({
      success: true,
      message: 'Notifications générées avec succès',
    })
  } catch (error) {
    console.error('Erreur generateNotifications:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des notifications',
      error: error.message,
    })
  }
}

// Obtenir les statistiques des notifications
export const getStatistics = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        type,
        priorite,
        COUNT(*) as count
      FROM notifications
      WHERE lu = FALSE
      GROUP BY type, priorite
      ORDER BY priorite DESC, type
    `)

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Erreur getStatistics:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message,
    })
  }
}
