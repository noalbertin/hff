// controllers/depotController.js
import db from '../db.js'

// Récupérer tous les dépôts
export const getDepots = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM depot ORDER BY id ASC')
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer un dépôt par ID
export const getDepotById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query('SELECT * FROM depot WHERE id = ?', [id])
    if (rows.length === 0)
      return res.status(404).json({ message: 'Dépôt non trouvé.' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du dépôt.' })
  }
}

// Récupérer les statistiques d'un dépôt
export const getDepotStats = async (req, res) => {
  const { id } = req.params
  try {
    // Nombre total d'articles en stock
    const [totalArticles] = await db.query(
      `SELECT COUNT(DISTINCT materiel_id) as total 
       FROM stock 
       WHERE depot_id = ?`,
      [id]
    )

    // Quantité totale en stock
    const [totalQuantite] = await db.query(
      `SELECT SUM(quantite) as total 
       FROM stock 
       WHERE depot_id = ?`,
      [id]
    )

    // Articles en rupture de stock
    const [articlesRupture] = await db.query(
      `SELECT COUNT(*) as total 
       FROM stock 
       WHERE depot_id = ? AND quantite <= quantite_minimum`,
      [id]
    )

    // Mouvements du jour
    const [mouvementsJour] = await db.query(
      `SELECT COUNT(*) as total 
       FROM mouvement 
       WHERE (depot_source_id = ? OR depot_destination_id = ?) 
       AND DATE(date_mouvement) = CURDATE()`,
      [id, id]
    )

    res.json({
      total_articles: totalArticles[0].total || 0,
      total_quantite: totalQuantite[0].total || 0,
      articles_rupture: articlesRupture[0].total || 0,
      mouvements_jour: mouvementsJour[0].total || 0,
    })
  } catch (err) {
    console.error(
      'Erreur lors de la récupération des statistiques:',
      err.message
    )
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// Récupérer le stock d'un dépôt
export const getDepotStock = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query(
      `SELECT 
        s.*,
        m.designation,
        m.num_parc,
        m.parc_colas,
        m.serie,
        m.modele,
        m.cst
      FROM stock s
      LEFT JOIN materiel m ON s.materiel_id = m.id
      WHERE s.depot_id = ?
      ORDER BY m.designation`,
      [id]
    )
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer les articles en rupture d'un dépôt
export const getDepotStockRupture = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query(
      `SELECT 
        s.*,
        m.designation,
        m.num_parc,
        m.parc_colas
      FROM stock s
      LEFT JOIN materiel m ON s.materiel_id = m.id
      WHERE s.depot_id = ? AND s.quantite <= s.quantite_minimum
      ORDER BY s.quantite ASC`,
      [id]
    )
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Créer un dépôt
export const createDepot = async (req, res) => {
  const { nom, responsable, adresse, contact } = req.body

  try {
    // Vérifier si le nom existe déjà
    const [existing] = await db.query('SELECT id FROM depot WHERE nom = ?', [
      nom,
    ])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ce dépôt existe déjà.' })
    }

    const [result] = await db.query(
      'INSERT INTO depot (nom, responsable, adresse, contact) VALUES (?, ?, ?, ?)',
      [nom, responsable, adresse, contact]
    )

    res.status(201).json({
      id: result.insertId,
      nom,
      responsable,
      adresse,
      contact,
    })
  } catch (err) {
    console.error('Erreur lors de la création du dépôt:', err.message)
    res.status(500).json({ error: 'Erreur lors de la création du dépôt.' })
  }
}

// Modifier un dépôt
export const updateDepot = async (req, res) => {
  const { id } = req.params
  const { nom, responsable, adresse, contact } = req.body

  try {
    // Vérifier si le dépôt existe
    const [existing] = await db.query('SELECT id FROM depot WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Dépôt non trouvé.' })
    }

    // Vérifier si le nouveau nom existe déjà (sauf pour le dépôt actuel)
    const [duplicate] = await db.query(
      'SELECT id FROM depot WHERE nom = ? AND id != ?',
      [nom, id]
    )
    if (duplicate.length > 0) {
      return res.status(400).json({ error: 'Ce nom de dépôt existe déjà.' })
    }

    const [result] = await db.query(
      'UPDATE depot SET nom=?, responsable=?, adresse=?, contact=? WHERE id=?',
      [nom, responsable, adresse, contact, id]
    )

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Dépôt non trouvé.' })

    res.json({
      id,
      nom,
      responsable,
      adresse,
      contact,
    })
  } catch (err) {
    console.error('Erreur lors de la mise à jour du dépôt:', err.message)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du dépôt.' })
  }
}

// Supprimer un dépôt
export const deleteDepot = async (req, res) => {
  const { id } = req.params
  try {
    // Vérifier s'il y a des stocks dans ce dépôt
    const [stocks] = await db.query(
      'SELECT COUNT(*) as count FROM stock WHERE depot_id = ?',
      [id]
    )

    if (stocks[0].count > 0) {
      return res.status(400).json({
        error: 'Impossible de supprimer ce dépôt car il contient des stocks.',
      })
    }

    const [result] = await db.query('DELETE FROM depot WHERE id = ?', [id])
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Dépôt non trouvé.' })

    res.json({ message: 'Dépôt supprimé avec succès.' })
  } catch (err) {
    console.error('Erreur lors de la suppression du dépôt:', err.message)
    res.status(500).json({ error: 'Erreur lors de la suppression du dépôt.' })
  }
}
