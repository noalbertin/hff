// controllers/preventiveController.js
import db from '../db.js'

// Récupérer toutes les maintenances préventives
export const getMaintenancesPreventives = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        mp.*,
        m.designation,
        m.num_parc,
        m.parc_colas,
        m.serie,
        m.modele,
        f.id_flotte,
        f.annee,
        a.km_fin AS dernier_km,
        a.heure_fin AS derniere_heure,
        a.date_utilise AS derniere_date_utilise
      FROM maintenance_preventive mp
      INNER JOIN materiel m ON mp.materiel_id = m.id
      LEFT JOIN flotte f ON m.id = f.materiel_id
      LEFT JOIN (
        SELECT *
        FROM (
          SELECT 
            *,
            ROW_NUMBER() OVER (
              PARTITION BY materiel_id 
              ORDER BY date_utilise DESC, id DESC
            ) AS rn
          FROM attachement
        ) ranked
        WHERE rn = 1
      ) a ON m.id = a.materiel_id
      ORDER BY mp.date_planifiee ASC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

/// Récupérer une maintenance préventive par ID
export const getMaintenancePreventiveById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        mp.*,
        m.designation,
        m.num_parc,
        m.parc_colas,
        f.id_flotte,
        f.annee,
        a.km_fin AS dernier_km,
        a.heure_fin AS derniere_heure,
        a.date_utilise AS derniere_date_utilise
      FROM maintenance_preventive mp
      INNER JOIN materiel m ON mp.materiel_id = m.id
      LEFT JOIN flotte f ON m.id = f.materiel_id
      LEFT JOIN (
        SELECT *
        FROM (
          SELECT 
            *,
            ROW_NUMBER() OVER (
              PARTITION BY materiel_id 
              ORDER BY date_utilise DESC, id DESC
            ) AS rn
          FROM attachement
        ) ranked
        WHERE rn = 1
      ) a ON m.id = a.materiel_id
      WHERE mp.id_maintenance_preventive = ?
    `,
      [id]
    )

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Maintenance préventive non trouvée.' })
    }
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la récupération de la maintenance préventive.',
    })
  }
}

// Récupérer les maintenances préventives par materiel_id
export const getMaintenancesByMaterielId = async (req, res) => {
  const { materiel_id } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        mp.*,
        m.designation,
        m.num_parc,
        m.parc_colas,
        a.km_fin AS dernier_km,
        a.heure_fin AS derniere_heure,
        a.date_utilise AS derniere_date_utilise
      FROM maintenance_preventive mp
      INNER JOIN materiel m ON mp.materiel_id = m.id
      LEFT JOIN (
        SELECT *
        FROM (
          SELECT 
            *,
            ROW_NUMBER() OVER (
              PARTITION BY materiel_id 
              ORDER BY date_utilise DESC, id DESC
            ) AS rn
          FROM attachement
        ) ranked
        WHERE rn = 1
      ) a ON m.id = a.materiel_id
      WHERE mp.materiel_id = ?
      ORDER BY mp.date_planifiee DESC
    `,
      [materiel_id]
    )

    res.json(rows)
  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la récupération des maintenances préventives.',
    })
  }
}

// Récupérer les maintenances préventives par statut
export const getMaintenancesByStatut = async (req, res) => {
  const { statut } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        mp.*,
        m.designation,
        m.num_parc,
        m.parc_colas,
        f.id_flotte,
        f.annee,
        (SELECT km_debut FROM attachement 
         WHERE materiel_id = m.id 
         ORDER BY date_utilise DESC LIMIT 1) AS dernier_km,
        (SELECT heure_fin FROM attachement 
         WHERE materiel_id = m.id 
         ORDER BY date_utilise DESC LIMIT 1) AS derniere_heure,
        (SELECT date_utilise FROM attachement 
         WHERE materiel_id = m.id 
         ORDER BY date_utilise DESC LIMIT 1) AS derniere_date_utilise
      FROM maintenance_preventive mp
      INNER JOIN materiel m ON mp.materiel_id = m.id
      LEFT JOIN flotte f ON m.id = f.materiel_id
      WHERE mp.statut = ?
      ORDER BY mp.date_planifiee DESC
    `,
      [statut]
    )

    res.json(rows)
  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la récupération des maintenances préventives.',
    })
  }
}

// Créer une maintenance préventive
export const createMaintenancePreventive = async (req, res) => {
  const {
    materiel_id,
    nom_operation,
    date_planifiee,
    heures_fonctionnement_cible,
    km_fonctionnement_cible,
    priorite,
    statut,
    date_debut_intervention,
    date_fin_intervention,
    notes_intervention,
    cout_pieces,
  } = req.body

  try {
    const [result] = await db.query(
      `INSERT INTO maintenance_preventive 
       (materiel_id, nom_operation, date_planifiee, heures_fonctionnement_cible, 
        km_fonctionnement_cible, priorite, statut, date_debut_intervention, 
        date_fin_intervention, notes_intervention, cout_pieces) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        materiel_id,
        nom_operation,
        date_planifiee,
        heures_fonctionnement_cible || null,
        km_fonctionnement_cible || null,
        priorite || 'Moyenne',
        statut || 'Planifiée',
        date_debut_intervention || null,
        date_fin_intervention || null,
        notes_intervention || null,
        cout_pieces || null,
      ]
    )

    res.status(201).json({
      id_maintenance_preventive: result.insertId,
      materiel_id,
      nom_operation,
      date_planifiee,
      heures_fonctionnement_cible,
      km_fonctionnement_cible,
      priorite: priorite || 'Moyenne',
      statut: statut || 'Planifiée',
      date_debut_intervention,
      date_fin_intervention,
      notes_intervention,
      cout_pieces,
    })
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({
      error: 'Erreur lors de la création de la maintenance préventive.',
    })
  }
}

// Modifier une maintenance préventive
export const updateMaintenancePreventive = async (req, res) => {
  const { id } = req.params
  const {
    materiel_id,
    nom_operation,
    date_planifiee,
    heures_fonctionnement_cible,
    km_fonctionnement_cible,
    priorite,
    statut,
    date_debut_intervention,
    date_fin_intervention,
    notes_intervention,
    cout_pieces,
  } = req.body

  try {
    const [result] = await db.query(
      `UPDATE maintenance_preventive 
       SET materiel_id=?, nom_operation=?, date_planifiee=?, 
           heures_fonctionnement_cible=?, km_fonctionnement_cible=?, 
           priorite=?, statut=?, date_debut_intervention=?, 
           date_fin_intervention=?, notes_intervention=?, cout_pieces=?
       WHERE id_maintenance_preventive=?`,
      [
        materiel_id,
        nom_operation,
        date_planifiee,
        heures_fonctionnement_cible || null,
        km_fonctionnement_cible || null,
        priorite,
        statut,
        date_debut_intervention || null,
        date_fin_intervention || null,
        notes_intervention || null,
        cout_pieces || null,
        id,
      ]
    )

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Maintenance préventive non trouvée.' })
    }

    res.json({
      id_maintenance_preventive: id,
      materiel_id,
      nom_operation,
      date_planifiee,
      heures_fonctionnement_cible,
      km_fonctionnement_cible,
      priorite,
      statut,
      date_debut_intervention,
      date_fin_intervention,
      notes_intervention,
      cout_pieces,
    })
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({
      error: 'Erreur lors de la mise à jour de la maintenance préventive.',
    })
  }
}

// Supprimer une maintenance préventive
export const deleteMaintenancePreventive = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.query(
      'DELETE FROM maintenance_preventive WHERE id_maintenance_preventive = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Maintenance préventive non trouvée.' })
    }

    res.json({ message: 'Maintenance préventive supprimée avec succès.' })
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({
      error: 'Erreur lors de la suppression de la maintenance préventive.',
    })
  }
}
