// controllers/stockController.js
import db from '../db.js'

// Récupérer tous les stocks avec les infos du matériel et dépôt
export const getStocks = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        m.designation,
        m.num_parc,
        m.parc_colas,
        m.serie,
        m.modele,
        d.nom as depot_nom,
        d.responsable as depot_responsable,
        d.adresse as depot_adresse
      FROM stock s
      LEFT JOIN materiel m ON s.materiel_id = m.id
      LEFT JOIN depot d ON s.depot_id = d.id
      ORDER BY s.id DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer un stock par ID
export const getStockById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        m.designation,
        m.num_parc,
        d.nom as depot_nom
      FROM stock s
      LEFT JOIN materiel m ON s.materiel_id = m.id
      LEFT JOIN depot d ON s.depot_id = d.id
      WHERE s.id = ?
    `, [id])
    
    if (rows.length === 0)
      return res.status(404).json({ message: 'Stock non trouvé.' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du stock.' })
  }
}

// Récupérer le stock d'un matériel spécifique dans tous les dépôts
export const getStockByMateriel = async (req, res) => {
  const { materielId } = req.params
  try {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        d.nom as depot_nom,
        d.responsable as depot_responsable
      FROM stock s
      LEFT JOIN depot d ON s.depot_id = d.id
      WHERE s.materiel_id = ?
      ORDER BY d.nom
    `, [materielId])
    
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du stock.' })
  }
}

// Récupérer le stock d'un dépôt spécifique
export const getStockByDepot = async (req, res) => {
  const { depotId } = req.params
  try {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        m.designation,
        m.num_parc,
        m.parc_colas,
        m.serie,
        m.modele
      FROM stock s
      LEFT JOIN materiel m ON s.materiel_id = m.id
      WHERE s.depot_id = ?
      ORDER BY m.designation
    `, [depotId])
    
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du stock.' })
  }
}

// Récupérer les stocks en rupture (quantité <= quantité_minimum)
export const getStocksEnRupture = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.*,
        m.designation,
        m.num_parc,
        d.nom as depot_nom,
        d.responsable as depot_responsable
      FROM stock s
      LEFT JOIN materiel m ON s.materiel_id = m.id
      LEFT JOIN depot d ON s.depot_id = d.id
      WHERE s.quantite <= s.quantite_minimum
      ORDER BY s.quantite ASC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Créer un stock
export const createStock = async (req, res) => {
  const { materiel_id, depot_id, quantite, quantite_minimum } = req.body
  
  try {
    // Vérifier si le matériel existe
    const [materiel] = await db.query('SELECT id FROM materiel WHERE id = ?', [materiel_id])
    if (materiel.length === 0) {
      return res.status(404).json({ error: 'Matériel non trouvé.' })
    }

    // Vérifier si le dépôt existe
    const [depot] = await db.query('SELECT id FROM depot WHERE id = ?', [depot_id])
    if (depot.length === 0) {
      return res.status(404).json({ error: 'Dépôt non trouvé.' })
    }

    // Vérifier si le stock existe déjà
    const [existing] = await db.query(
      'SELECT id FROM stock WHERE materiel_id = ? AND depot_id = ?',
      [materiel_id, depot_id]
    )
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ce stock existe déjà pour ce matériel et ce dépôt.' })
    }

    const [result] = await db.query(
      'INSERT INTO stock (materiel_id, depot_id, quantite, quantite_minimum) VALUES (?, ?, ?, ?)',
      [materiel_id, depot_id, quantite || 0, quantite_minimum || 0]
    )
    
    res.status(201).json({
      id: result.insertId,
      materiel_id,
      depot_id,
      quantite: quantite || 0,
      quantite_minimum: quantite_minimum || 0,
    })
  } catch (err) {
    console.error('Erreur lors de la création du stock:', err.message)
    res.status(500).json({ error: 'Erreur lors de la création du stock.' })
  }
}

// Modifier un stock
export const updateStock = async (req, res) => {
  const { id } = req.params
  const { materiel_id, depot_id, quantite, quantite_minimum } = req.body
  
  try {
    // Vérifier si le stock existe
    const [existing] = await db.query('SELECT id FROM stock WHERE id = ?', [id])
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Stock non trouvé.' })
    }

    // Vérifier si la nouvelle combinaison materiel/depot existe déjà (sauf pour le stock actuel)
    const [duplicate] = await db.query(
      'SELECT id FROM stock WHERE materiel_id = ? AND depot_id = ? AND id != ?',
      [materiel_id, depot_id, id]
    )
    if (duplicate.length > 0) {
      return res.status(400).json({ error: 'Ce stock existe déjà pour ce matériel et ce dépôt.' })
    }

    const [result] = await db.query(
      'UPDATE stock SET materiel_id=?, depot_id=?, quantite=?, quantite_minimum=? WHERE id=?',
      [materiel_id, depot_id, quantite, quantite_minimum, id]
    )
    
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Stock non trouvé.' })
      
    res.json({
      id,
      materiel_id,
      depot_id,
      quantite,
      quantite_minimum,
    })
  } catch (err) {
    console.error('Erreur lors de la mise à jour du stock:', err.message)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du stock.' })
  }
}

// Ajuster la quantité d'un stock (ajouter ou retirer)
export const adjustStock = async (req, res) => {
  const { id } = req.params
  const { quantite_ajustement } = req.body // Positif pour ajouter, négatif pour retirer
  
  try {
    // Récupérer la quantité actuelle
    const [current] = await db.query('SELECT quantite FROM stock WHERE id = ?', [id])
    if (current.length === 0) {
      return res.status(404).json({ message: 'Stock non trouvé.' })
    }

    const nouvelle_quantite = current[0].quantite + quantite_ajustement

    if (nouvelle_quantite < 0) {
      return res.status(400).json({ error: 'La quantité ne peut pas être négative.' })
    }

    const [result] = await db.query(
      'UPDATE stock SET quantite = ? WHERE id = ?',
      [nouvelle_quantite, id]
    )
    
    res.json({
      id,
      ancienne_quantite: current[0].quantite,
      quantite_ajustement,
      nouvelle_quantite,
    })
  } catch (err) {
    console.error('Erreur lors de l\'ajustement du stock:', err.message)
    res.status(500).json({ error: 'Erreur lors de l\'ajustement du stock.' })
  }
}

// Supprimer un stock
export const deleteStock = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.query('DELETE FROM stock WHERE id = ?', [id])
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Stock non trouvé.' })
    res.json({ message: 'Stock supprimé avec succès.' })
  } catch (err) {
    console.error('Erreur lors de la suppression du stock:', err.message)
    res.status(500).json({ error: 'Erreur lors de la suppression du stock.' })
  }
}