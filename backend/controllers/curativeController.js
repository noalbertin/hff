// controllers/curativeController.js
import db from '../db.js'

// Récupérer toutes les maintenances curatives
export const getMaintenancesCuratives = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        mc.*,
        m.designation,
        m.num_parc,
        m.parc_colas,
        m.modele
      FROM maintenance_curative mc
      LEFT JOIN materiel m ON mc.materiel_id = m.id
      ORDER BY mc.date_signalement DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer une maintenance curative par ID
export const getMaintenanceCurativeById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        mc.*,
        m.designation,
        m.num_parc,
        m.parc_colas,
        m.marque,
        m.modele
      FROM maintenance_curative mc
      LEFT JOIN materiel m ON mc.materiel_id = m.id
      WHERE mc.id_maintenance_curative = ?
    `,
      [id]
    )

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Maintenance curative non trouvée.' })
    }
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la récupération de la maintenance curative.',
    })
  }
}

// Récupérer les maintenances curatives par materiel_id
export const getMaintenancesByMaterielId = async (req, res) => {
  const { materiel_id } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        mc.*,
        m.designation,
        m.num_parc,
        m.parc_colas,
        m.marque,
        m.modele
      FROM maintenance_curative mc
      LEFT JOIN materiel m ON mc.materiel_id = m.id
      WHERE mc.materiel_id = ?
      ORDER BY mc.date_signalement DESC
    `,
      [materiel_id]
    )

    res.json(rows)
  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la récupération des maintenances curatives.',
    })
  }
}

// Créer une maintenance curative
export const createMaintenanceCurative = async (req, res) => {
  const {
    materiel_id,
    date_signalement,
    description_signalement,
    categorie,
    statut,
    date_debut_intervention,
    date_fin_intervention,
    pieces_remplacees,
    pieces_reparees,
    cout_pieces,
    notes_reparation,
  } = req.body

  try {
    const [result] = await db.query(
      `INSERT INTO maintenance_curative 
       (materiel_id, date_signalement, description_signalement, categorie, statut,
        date_debut_intervention, date_fin_intervention, pieces_remplacees, 
        pieces_reparees, cout_pieces, notes_reparation) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        materiel_id,
        date_signalement,
        description_signalement,
        categorie || 'Immédiate',
        statut || 'En attente',
        date_debut_intervention || null,
        date_fin_intervention || null,
        pieces_remplacees || null,
        pieces_reparees || null,
        cout_pieces || null,
        notes_reparation || null,
      ]
    )

    res.status(201).json({
      id_maintenance_curative: result.insertId,
      materiel_id,
      date_signalement,
      description_signalement,
      categorie,
      statut,
      date_debut_intervention,
      date_fin_intervention,
      pieces_remplacees,
      pieces_reparees,
      cout_pieces,
      notes_reparation,
    })
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res
      .status(500)
      .json({ error: 'Erreur lors de la création de la maintenance curative.' })
  }
}

// Modifier une maintenance curative
export const updateMaintenanceCurative = async (req, res) => {
  const { id } = req.params
  const {
    materiel_id,
    date_signalement,
    description_signalement,
    categorie,
    statut,
    date_debut_intervention,
    date_fin_intervention,
    pieces_remplacees,
    pieces_reparees,
    cout_pieces,
    notes_reparation,
  } = req.body

  try {
    const [result] = await db.query(
      `UPDATE maintenance_curative 
       SET materiel_id=?, date_signalement=?, description_signalement=?, 
           categorie=?, statut=?, date_debut_intervention=?, date_fin_intervention=?,
           pieces_remplacees=?, pieces_reparees=?, cout_pieces=?, notes_reparation=?
       WHERE id_maintenance_curative=?`,
      [
        materiel_id,
        date_signalement,
        description_signalement,
        categorie,
        statut,
        date_debut_intervention || null,
        date_fin_intervention || null,
        pieces_remplacees || null,
        pieces_reparees || null,
        cout_pieces || null,
        notes_reparation || null,
        id,
      ]
    )

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Maintenance curative non trouvée.' })
    }

    res.json({
      id_maintenance_curative: id,
      materiel_id,
      date_signalement,
      description_signalement,
      categorie,
      statut,
      date_debut_intervention,
      date_fin_intervention,
      pieces_remplacees,
      pieces_reparees,
      cout_pieces,
      notes_reparation,
    })
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de la maintenance curative.',
    })
  }
}

// Supprimer une maintenance curative
export const deleteMaintenanceCurative = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.query(
      'DELETE FROM maintenance_curative WHERE id_maintenance_curative = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Maintenance curative non trouvée.' })
    }

    res.json({ message: 'Maintenance curative supprimée avec succès.' })
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({
      error: 'Erreur lors de la suppression de la maintenance curative.',
    })
  }
}
