// controllers/materielController.js
import db from '../db.js'

// Récupérer tous les camions avec leur dépôt
export const getMateriels = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.*,
        d.id as depot_id,
        d.nom as depot_nom,
        d.responsable as depot_responsable,
        s.quantite
      FROM materiel m
      LEFT JOIN stock s ON m.id = s.materiel_id
      LEFT JOIN depot d ON s.depot_id = d.id
      ORDER BY m.id DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer un camion par ID
export const getMaterielById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query('SELECT * FROM materiel WHERE id = ?', [id])
    if (rows.length === 0)
      return res.status(404).json({ message: 'Camion non trouvé.' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du camion.' })
  }
}

// Récupérer les matériels qui n'ont PAS encore de flotte
export const getMaterielsWithoutFlotte = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*
      FROM materiel m
      LEFT JOIN flotte f ON m.id = f.materiel_id
      WHERE f.materiel_id IS NULL
      ORDER BY m.id DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

export const getMaterielsWithoutMaintenance = async (req, res) => {
  try {
    const [materiels] = await db.query(`
      SELECT m.* 
      FROM materiel m
      LEFT JOIN maintenance ma ON m.id = ma.materiel_id
      WHERE ma.materiel_id IS NULL
      ORDER BY m.designation
    `)
    res.json(materiels)
  } catch (err) {
    console.error('Erreur lors de la récupération des matériels:', err.message)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

//Récupérer les matériels qui n'ont PAS encore de stock dans aucun dépôt
export const getMaterielsWithoutStock = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*
      FROM materiel m
      LEFT JOIN stock s ON m.id = s.materiel_id
      WHERE s.materiel_id IS NULL
      ORDER BY m.designation
    `)
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

//  Récupérer les matériels qui n'ont PAS de stock dans un dépôt spécifique
export const getMaterielsWithoutStockInDepot = async (req, res) => {
  const { depotId } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT m.*
      FROM materiel m
      WHERE m.id NOT IN (
        SELECT materiel_id 
        FROM stock 
        WHERE depot_id = ?
      )
      ORDER BY m.designation
    `,
      [depotId]
    )
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer le dernier attachement d'un matériel
export const getLastAttachement = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query(
      `SELECT heure_fin, km_fin, date_utilise, lot , statut
       FROM attachement 
       WHERE materiel_id = ? 
       ORDER BY date_utilise DESC, id DESC 
       LIMIT 1`,
      [id]
    )
    if (rows.length === 0) {
      return res.json({
        heure_fin: null,
        km_fin: null,
        lot: null,
        statut: null,
      })
    }
    res.json(rows[0])
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération du dernier attachement.' })
  }
}

// Créer un camion
export const createMateriel = async (req, res) => {
  const {
    designation,
    num_parc,
    parc_colas,
    serie,
    modele,
    cst,
    immatriculation,
  } = req.body
  try {
    const [result] = await db.query(
      'INSERT INTO materiel (designation, num_parc, parc_colas, serie, modele, cst, immatriculation) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [designation, num_parc, parc_colas, serie, modele, cst, immatriculation]
    )
    res.status(201).json({
      id: result.insertId,
      designation,
      num_parc,
      parc_colas,
      serie,
      modele,
      cst,
      immatriculation,
    })
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la création du camion.' })
  }
}

// Modifier un camion
export const updateMateriel = async (req, res) => {
  const { id } = req.params
  const {
    designation,
    num_parc,
    parc_colas,
    serie,
    modele,
    cst,
    immatriculation,
  } = req.body
  try {
    const [result] = await db.query(
      'UPDATE materiel SET designation=?, num_parc=?, parc_colas=?, serie=?, modele=?, cst=?, immatriculation=? WHERE id=?',
      [
        designation,
        num_parc,
        parc_colas,
        serie,
        modele,
        cst,
        immatriculation,
        id,
      ]
    )
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Camion non trouvé.' })
    res.json({
      id,
      designation,
      num_parc,
      parc_colas,
      serie,
      modele,
      cst,
      immatriculation,
    })
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du camion.' })
  }
}

// Supprimer un camion
export const deleteMateriel = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.query('DELETE FROM materiel WHERE id = ?', [id])
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Camion non trouvé.' })
    res.json({ message: 'Camion supprimé avec succès.' })
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du camion.' })
  }
}
