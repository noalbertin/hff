// controllers/mouvementStockController.js
import db from '../db.js'

// Récupérer tous les mouvements avec les infos du matériel et dépôt
export const getMouvements = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ms.*,
        m.designation,
        m.num_parc,
        m.parc_colas,
        d.nom as depot_nom,
        d.responsable as depot_responsable,
        dd.nom as depot_destination_nom
      FROM mouvement_stock ms
      LEFT JOIN materiel m ON ms.materiel_id = m.id
      LEFT JOIN depot d ON ms.depot_id = d.id
      LEFT JOIN depot dd ON ms.depot_destination_id = dd.id
      ORDER BY ms.created_at DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer un mouvement par ID
export const getMouvementById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        ms.*,
        m.designation,
        m.num_parc,
        d.nom as depot_nom,
        dd.nom as depot_destination_nom
      FROM mouvement_stock ms
      LEFT JOIN materiel m ON ms.materiel_id = m.id
      LEFT JOIN depot d ON ms.depot_id = d.id
      LEFT JOIN depot dd ON ms.depot_destination_id = dd.id
      WHERE ms.id = ?
    `,
      [id]
    )

    if (rows.length === 0)
      return res.status(404).json({ message: 'Mouvement non trouvé.' })
    res.json(rows[0])
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération du mouvement.' })
  }
}

// Récupérer les mouvements d'un matériel spécifique
export const getMouvementsByMateriel = async (req, res) => {
  const { materielId } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        ms.*,
        d.nom as depot_nom,
        dd.nom as depot_destination_nom
      FROM mouvement_stock ms
      LEFT JOIN depot d ON ms.depot_id = d.id
      LEFT JOIN depot dd ON ms.depot_destination_id = dd.id
      WHERE ms.materiel_id = ?
      ORDER BY ms.created_at DESC
    `,
      [materielId]
    )

    res.json(rows)
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des mouvements.' })
  }
}

// Récupérer les mouvements d'un dépôt spécifique
export const getMouvementsByDepot = async (req, res) => {
  const { depotId } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        ms.*,
        m.designation,
        m.num_parc,
        m.parc_colas,
        d.nom as depot_nom,
        dd.nom as depot_destination_nom
      FROM mouvement_stock ms
      LEFT JOIN materiel m ON ms.materiel_id = m.id
      LEFT JOIN depot d ON ms.depot_id = d.id
      LEFT JOIN depot dd ON ms.depot_destination_id = dd.id
      WHERE ms.depot_id = ? OR ms.depot_destination_id = ?
      ORDER BY ms.created_at DESC
    `,
      [depotId, depotId]
    )

    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des mouvements.' })
  }
}

// Récupérer les mouvements par type (ENTREE ou SORTIE)
export const getMouvementsByType = async (req, res) => {
  const { type } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        ms.*,
        m.designation,
        m.num_parc,
        d.nom as depot_nom,
        dd.nom as depot_destination_nom
      FROM mouvement_stock ms
      LEFT JOIN materiel m ON ms.materiel_id = m.id
      LEFT JOIN depot d ON ms.depot_id = d.id
      LEFT JOIN depot dd ON ms.depot_destination_id = dd.id
      WHERE ms.type_mouvement = ?
      ORDER BY ms.created_at DESC
    `,
      [type.toUpperCase()]
    )

    res.json(rows)
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des mouvements.' })
  }
}

// Récupérer les mouvements récents (dernières 24h, 7 jours, 30 jours)
export const getMouvementsRecents = async (req, res) => {
  const { periode, limit } = req.query // '24h', '7d', '30d'

  // Validation de la période
  const periodesValides = ['24h', '7d', '30d', 'all']
  const periodeUtilisee = periodesValides.includes(periode) ? periode : 'all'

  let dateCondition = ''
  switch (periodeUtilisee) {
    case '24h':
      dateCondition = 'ms.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)'
      break
    case '7d':
      dateCondition = 'ms.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
      break
    case '30d':
      dateCondition = 'ms.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
      break
    default:
      dateCondition = '1=1' // Tous les mouvements
  }

  // Gestion de la limite
  const limiteQuery = limit && !isNaN(limit) ? `LIMIT ${parseInt(limit)}` : ''

  try {
    const [rows] = await db.query(`
      SELECT 
        ms.*,
        m.designation,
        m.modele,
        m.num_parc,
        m.parc_colas,
        m.serie
      FROM mouvement_stock ms
      LEFT JOIN materiel m ON ms.materiel_id = m.id
      LEFT JOIN depot d ON ms.depot_id = d.id
      WHERE ${dateCondition}
      ORDER BY ms.created_at DESC
      ${limiteQuery}
    `)

    // Formater les dates pour le frontend
    const mouvementsFormates = rows.map((mouvement) => ({
      ...mouvement,
      created_at: new Date(mouvement.created_at).toISOString(),
      date_formatee: new Date(mouvement.created_at).toLocaleDateString('fr-FR'),
      heure_formatee: new Date(mouvement.created_at).toLocaleTimeString(
        'fr-FR'
      ),
    }))

    res.json({
      success: true,
      data: mouvementsFormates,
      periode: periodeUtilisee,
      total: rows.length,
    })
  } catch (err) {
    console.error('Erreur getMouvementsRecents:', err)
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des mouvements récents.',
    })
  }
}

// Récupérer les mouvements récents par dépôt
export const getMouvementsByDepot24h = async (req, res) => {
  const { depotId } = req.params

  // Validation du depotId
  if (!depotId || isNaN(depotId)) {
    return res.status(400).json({ error: 'ID de dépôt invalide' })
  }

  try {
    const [rows] = await db.query(
      `
      SELECT 
        ms.id,
        ms.type_mouvement,
        ms.quantite,
        ms.created_at,
        m.designation,
        m.modele,
        m.num_parc
      FROM mouvement_stock ms
      LEFT JOIN materiel m ON ms.materiel_id = m.id
      WHERE (ms.depot_id = ? OR ms.depot_destination_id = ?)
        AND ms.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
      ORDER BY ms.created_at DESC
    `,
      [depotId, depotId]
    )

    res.json(rows)
  } catch (err) {
    console.error('Erreur getMouvementsByDepot24h:', err)
    res
      .status(500)
      .json({
        error: 'Erreur lors de la récupération des mouvements du dépôt.',
      })
  }
}

// Créer un mouvement (ENTREE, SORTIE ou TRANSFERT)
export const createMouvement = async (req, res) => {
  const {
    materiel_id,
    depot_id,
    type_mouvement,
    quantite,
    depot_destination_id,
    reference_document,
    commentaire,
    utilisateur,
  } = req.body

  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()

    // Vérifier si le matériel existe
    const [materiel] = await connection.query(
      'SELECT id FROM materiel WHERE id = ?',
      [materiel_id]
    )
    if (materiel.length === 0) {
      await connection.rollback()
      return res.status(404).json({ error: 'Matériel non trouvé.' })
    }

    // Vérifier si le dépôt existe
    const [depot] = await connection.query(
      'SELECT id FROM depot WHERE id = ?',
      [depot_id]
    )
    if (depot.length === 0) {
      await connection.rollback()
      return res.status(404).json({ error: 'Dépôt non trouvé.' })
    }

    // Vérifier si le dépôt destination existe (pour les transferts)
    if (depot_destination_id) {
      const [depotDest] = await connection.query(
        'SELECT id FROM depot WHERE id = ?',
        [depot_destination_id]
      )
      if (depotDest.length === 0) {
        await connection.rollback()
        return res
          .status(404)
          .json({ error: 'Dépôt de destination non trouvé.' })
      }

      if (depot_id === depot_destination_id) {
        await connection.rollback()
        return res
          .status(400)
          .json({
            error: 'Le dépôt source et destination doivent être différents.',
          })
      }
    }

    // Vérifier ou créer le stock pour le dépôt source
    let [stockSource] = await connection.query(
      'SELECT * FROM stock WHERE materiel_id = ? AND depot_id = ?',
      [materiel_id, depot_id]
    )

    if (stockSource.length === 0) {
      await connection.query(
        'INSERT INTO stock (materiel_id, depot_id, quantite, quantite_minimum) VALUES (?, ?, 0, 0)',
        [materiel_id, depot_id]
      )
      stockSource = [{ quantite: 0 }]
    }

    // Gérer les mouvements selon le type
    if (type_mouvement === 'ENTREE') {
      // Ajouter au stock
      await connection.query(
        'UPDATE stock SET quantite = quantite + ? WHERE materiel_id = ? AND depot_id = ?',
        [quantite, materiel_id, depot_id]
      )
    } else if (type_mouvement === 'SORTIE') {
      // Vérifier si assez de stock
      if (stockSource[0].quantite < quantite) {
        await connection.rollback()
        return res.status(400).json({
          error: `Stock insuffisant. Disponible: ${stockSource[0].quantite}, Demandé: ${quantite}`,
        })
      }

      // Retirer du stock
      await connection.query(
        'UPDATE stock SET quantite = quantite - ? WHERE materiel_id = ? AND depot_id = ?',
        [quantite, materiel_id, depot_id]
      )

      // Si c'est un transfert, ajouter au dépôt de destination
      if (depot_destination_id) {
        // Vérifier ou créer le stock pour le dépôt destination
        const [stockDest] = await connection.query(
          'SELECT * FROM stock WHERE materiel_id = ? AND depot_id = ?',
          [materiel_id, depot_destination_id]
        )

        if (stockDest.length === 0) {
          await connection.query(
            'INSERT INTO stock (materiel_id, depot_id, quantite, quantite_minimum) VALUES (?, ?, ?, 0)',
            [materiel_id, depot_destination_id, quantite]
          )
        } else {
          await connection.query(
            'UPDATE stock SET quantite = quantite + ? WHERE materiel_id = ? AND depot_id = ?',
            [quantite, materiel_id, depot_destination_id]
          )
        }
      }
    }

    // Enregistrer le mouvement
    const [result] = await connection.query(
      `INSERT INTO mouvement_stock 
       (materiel_id, depot_id, type_mouvement, quantite, depot_destination_id, 
        reference_document, commentaire, utilisateur) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        materiel_id,
        depot_id,
        type_mouvement,
        quantite,
        depot_destination_id || null,
        reference_document || null,
        commentaire || null,
        utilisateur || null,
      ]
    )

    await connection.commit()

    res.status(201).json({
      id: result.insertId,
      materiel_id,
      depot_id,
      type_mouvement,
      quantite,
      depot_destination_id,
      reference_document,
      commentaire,
      utilisateur,
      message: 'Mouvement enregistré avec succès.',
    })
  } catch (err) {
    await connection.rollback()
    console.error('Erreur lors de la création du mouvement:', err.message)
    res.status(500).json({ error: 'Erreur lors de la création du mouvement.' })
  } finally {
    connection.release()
  }
}

// Modifier un mouvement (limité, car peut impacter le stock)
export const updateMouvement = async (req, res) => {
  const { id } = req.params
  const { reference_document, commentaire, utilisateur } = req.body

  try {
    // Vérifier si le mouvement existe
    const [existing] = await db.query(
      'SELECT id FROM mouvement_stock WHERE id = ?',
      [id]
    )
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Mouvement non trouvé.' })
    }

    // On ne modifie que les champs non critiques
    const [result] = await db.query(
      `UPDATE mouvement_stock 
       SET reference_document=?, commentaire=?, utilisateur=? 
       WHERE id=?`,
      [reference_document, commentaire, utilisateur, id]
    )

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Mouvement non trouvé.' })

    res.json({
      id,
      reference_document,
      commentaire,
      utilisateur,
      message: 'Mouvement mis à jour avec succès.',
    })
  } catch (err) {
    console.error('Erreur lors de la mise à jour du mouvement:', err.message)
    res
      .status(500)
      .json({ error: 'Erreur lors de la mise à jour du mouvement.' })
  }
}

// Annuler un mouvement (inverse l'opération dans le stock)
export const cancelMouvement = async (req, res) => {
  const { id } = req.params
  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()

    // Récupérer le mouvement
    const [mouvement] = await connection.query(
      'SELECT * FROM mouvement_stock WHERE id = ?',
      [id]
    )
    if (mouvement.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Mouvement non trouvé.' })
    }

    const mv = mouvement[0]

    // Inverser l'opération sur le stock
    if (mv.type_mouvement === 'ENTREE') {
      // Vérifier si on peut retirer
      const [stock] = await connection.query(
        'SELECT quantite FROM stock WHERE materiel_id = ? AND depot_id = ?',
        [mv.materiel_id, mv.depot_id]
      )

      if (stock.length === 0 || stock[0].quantite < mv.quantite) {
        await connection.rollback()
        return res.status(400).json({
          error: "Impossible d'annuler: stock insuffisant.",
        })
      }

      await connection.query(
        'UPDATE stock SET quantite = quantite - ? WHERE materiel_id = ? AND depot_id = ?',
        [mv.quantite, mv.materiel_id, mv.depot_id]
      )
    } else if (mv.type_mouvement === 'SORTIE') {
      // Remettre au stock source
      await connection.query(
        'UPDATE stock SET quantite = quantite + ? WHERE materiel_id = ? AND depot_id = ?',
        [mv.quantite, mv.materiel_id, mv.depot_id]
      )

      // Si transfert, retirer du dépôt destination
      if (mv.depot_destination_id) {
        const [stockDest] = await connection.query(
          'SELECT quantite FROM stock WHERE materiel_id = ? AND depot_id = ?',
          [mv.materiel_id, mv.depot_destination_id]
        )

        if (stockDest.length === 0 || stockDest[0].quantite < mv.quantite) {
          await connection.rollback()
          return res.status(400).json({
            error: "Impossible d'annuler: stock destination insuffisant.",
          })
        }

        await connection.query(
          'UPDATE stock SET quantite = quantite - ? WHERE materiel_id = ? AND depot_id = ?',
          [mv.quantite, mv.materiel_id, mv.depot_destination_id]
        )
      }
    }

    // Supprimer le mouvement
    await connection.query('DELETE FROM mouvement_stock WHERE id = ?', [id])

    await connection.commit()
    res.json({ message: 'Mouvement annulé avec succès.' })
  } catch (err) {
    await connection.rollback()
    console.error("Erreur lors de l'annulation du mouvement:", err.message)
    res.status(500).json({ error: "Erreur lors de l'annulation du mouvement." })
  } finally {
    connection.release()
  }
}

// Supprimer un mouvement (sans inverser le stock - déconseillé)
export const deleteMouvement = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.query(
      'DELETE FROM mouvement_stock WHERE id = ?',
      [id]
    )
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Mouvement non trouvé.' })
    res.json({ message: 'Mouvement supprimé avec succès.' })
  } catch (err) {
    console.error('Erreur lors de la suppression du mouvement:', err.message)
    res
      .status(500)
      .json({ error: 'Erreur lors de la suppression du mouvement.' })
  }
}

// Statistiques des mouvements
export const getStatsMouvements = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_mouvements,
        SUM(CASE WHEN type_mouvement = 'ENTREE' THEN 1 ELSE 0 END) as total_entrees,
        SUM(CASE WHEN type_mouvement = 'SORTIE' THEN 1 ELSE 0 END) as total_sorties,
        SUM(CASE WHEN type_mouvement = 'ENTREE' THEN quantite ELSE 0 END) as quantite_entrees,
        SUM(CASE WHEN type_mouvement = 'SORTIE' THEN quantite ELSE 0 END) as quantite_sorties,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as mouvements_aujourdhui
      FROM mouvement_stock
    `)

    res.json(stats[0])
  } catch (err) {
    console.error('Erreur lors du calcul des statistiques:', err.message)
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques.' })
  }
}
