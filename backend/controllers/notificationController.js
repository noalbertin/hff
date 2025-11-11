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

    query += ' ORDER BY n.date_creation DESC, n.priorite DESC LIMIT ?'
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
      error: error.message,
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
        SUM(CASE WHEN priorite = 'Info' THEN 1 ELSE 0 END) as info,
        SUM(CASE WHEN type = 'document' THEN 1 ELSE 0 END) as documents,
        SUM(CASE WHEN type = 'maintenance_preventive' THEN 1 ELSE 0 END) as maintenance_preventive,
        SUM(CASE WHEN type = 'maintenance_curative' THEN 1 ELSE 0 END) as maintenance_curative,
        SUM(CASE WHEN type = 'location' THEN 1 ELSE 0 END) as locations
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
    // Appeler la procédure de génération
    await db.query('CALL generer_notifications()')

    // Récupérer le nombre de nouvelles notifications créées
    const [countResult] = await db.query(`
      SELECT COUNT(*) as new_count 
      FROM notifications 
      WHERE date_creation >= DATE_SUB(NOW(), INTERVAL 5 SECOND)
    `)

    const newCount = countResult[0].new_count

    res.json({
      success: true,
      message: newCount > 0 
        ? `${newCount} nouvelle(s) notification(s) générée(s)` 
        : 'Aucune nouvelle notification à générer',
      count: newCount,
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
      ORDER BY type, priorite DESC
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

// NOUVELLES FONCTIONS POUR LA MAINTENANCE

// Obtenir les notifications de maintenance préventive
export const getPreventiveMaintenanceNotifications = async (req, res) => {
  try {
    const [notifications] = await db.query(`
      SELECT 
        n.*,
        m.designation,
        m.num_parc,
        mp.nom_operation,
        mp.date_planifiee,
        mp.statut as statut_maintenance
      FROM notifications n
      JOIN materiel m ON n.materiel_id = m.id
      JOIN maintenance_preventive mp ON JSON_EXTRACT(n.data, '$.id_maintenance_preventive') = mp.id_maintenance_preventive
      WHERE n.type = 'maintenance_preventive'
        AND n.lu = FALSE
      ORDER BY n.date_creation DESC, n.priorite DESC
    `)

    const notificationsFormatted = notifications.map((n) => ({
      ...n,
      data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data,
    }))

    res.json({
      success: true,
      count: notificationsFormatted.length,
      data: notificationsFormatted,
    })
  } catch (error) {
    console.error('Erreur getPreventiveMaintenanceNotifications:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications de maintenance préventive',
      error: error.message,
    })
  }
}

// Obtenir les notifications de maintenance curative
export const getCurativeMaintenanceNotifications = async (req, res) => {
  try {
    const { categorie } = req.query

    let query = `
      SELECT 
        n.*,
        m.designation,
        m.num_parc,
        mc.date_signalement,
        mc.categorie,
        mc.statut as statut_maintenance,
        mc.description_signalement
      FROM notifications n
      JOIN materiel m ON n.materiel_id = m.id
      JOIN maintenance_curative mc ON JSON_EXTRACT(n.data, '$.id_maintenance_curative') = mc.id_maintenance_curative
      WHERE n.type = 'maintenance_curative'
        AND n.lu = FALSE
    `

    const params = []

    if (categorie) {
      query += ' AND mc.categorie = ?'
      params.push(categorie)
    }

    query += ' ORDER BY n.date_creation DESC, n.priorite DESC'

    const [notifications] = await db.query(query, params)

    const notificationsFormatted = notifications.map((n) => ({
      ...n,
      data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data,
    }))

    res.json({
      success: true,
      count: notificationsFormatted.length,
      data: notificationsFormatted,
    })
  } catch (error) {
    console.error('Erreur getCurativeMaintenanceNotifications:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications de maintenance curative',
      error: error.message,
    })
  }
}