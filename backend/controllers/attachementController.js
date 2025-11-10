// controllers/attachementController.js
import db from '../db.js'

// Récupérer tous les attachements avec les informations du matériel
export const getAttachements = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.*,
        m.designation as materiel_designation,
        m.modele as materiel_modele,
        m.serie as materiel_serie,
        m.cst as materiel_cst,
        m.num_parc as materiel_num_parc,
        m.parc_colas as materiel_parc_colas
      FROM attachement a
      LEFT JOIN materiel m ON a.materiel_id = m.id
      ORDER BY a.id DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des attachements.' })
  }
}

// Récupérer un attachement par ID
export const getAttachementById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        a.*,
        m.designation as materiel_designation,
        m.modele as materiel_modele,
        m.serie as materiel_serie,
        m.cst as materiel_cst
      FROM attachement a
      LEFT JOIN materiel m ON a.materiel_id = m.id
      WHERE a.id = ?
    `,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Attachement non trouvé.' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de l'attachement." })
  }
}

// Créer un attachement
export const createAttachement = async (req, res) => {
  const {
    materiel_id,
    lot,
    heure_debut,
    heure_fin,
    km_debut,
    km_fin,
    facture,
    observation,
    date_utilise,
    statut,
  } = req.body

  // Validation des champs requis
  if (!materiel_id || !lot || !date_utilise) {
    return res.status(400).json({
      error: 'Les champs materiel_id, lot et date_utilise sont obligatoires.',
    })
  }

  try {
    const [result] = await db.query(
      `INSERT INTO attachement 
       (materiel_id, lot, heure_debut, heure_fin, km_debut, km_fin, facture, observation, date_utilise, statut) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        materiel_id,
        lot,
        heure_debut ?? null,
        heure_fin ?? null,
        km_debut ?? null,
        km_fin ?? null,
        facture ?? false,
        observation ?? null,
        date_utilise,
        statut || 'Attente Travail',
      ]
    )

    // Récupérer l'attachement créé avec les infos du matériel
    const [created] = await db.query(
      `
      SELECT 
        a.*,
        m.designation as materiel_designation
      FROM attachement a
      LEFT JOIN materiel m ON a.materiel_id = m.id
      WHERE a.id = ?
    `,
      [result.insertId]
    )

    res.status(201).json(created[0])
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: "Erreur lors de la création de l'attachement." })
  }
}

// Modifier un attachement
export const updateAttachement = async (req, res) => {
  const { id } = req.params
  const {
    materiel_id,
    lot,
    heure_debut,
    heure_fin,
    km_debut,
    km_fin,
    facture,
    observation,
    date_utilise,
    statut,
  } = req.body

  // Validation des champs requis
  if (!materiel_id || !lot || !date_utilise) {
    return res.status(400).json({
      error: 'Les champs materiel_id, lot et date_utilise sont obligatoires.',
    })
  }

  try {
    const [result] = await db.query(
      `UPDATE attachement 
       SET materiel_id=?, lot=?, heure_debut=?, heure_fin=?, km_debut=?, km_fin=?, 
           facture=?, observation=?, date_utilise=?, statut=?
       WHERE id=?`,
      [
        materiel_id,
        lot,
        heure_debut ?? null,
        heure_fin ?? null,
        km_debut ?? null,
        km_fin ?? null,
        facture ?? false,
        observation ?? null,
        date_utilise,
        statut || 'Attente Travail',
        id,
      ]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Attachement non trouvé.' })
    }

    // Récupérer l'attachement modifié avec les infos du matériel
    const [updated] = await db.query(
      `
      SELECT 
        a.*,
        m.designation as materiel_designation
      FROM attachement a
      LEFT JOIN materiel m ON a.materiel_id = m.id
      WHERE a.id = ?
    `,
      [id]
    )

    res.json(updated[0])
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de l'attachement." })
  }
}

// Supprimer un attachement
export const deleteAttachement = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.query('DELETE FROM attachement WHERE id = ?', [
      id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Attachement non trouvé.' })
    }

    res.json({ message: 'Attachement supprimé avec succès.' })
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de l'attachement." })
  }
}

// Récupérer les attachements par matériel
export const getAttachementsByMateriel = async (req, res) => {
  const { materiel_id } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        a.*,
        m.designation as materiel_designation,
        m.modele as materiel_modele
      FROM attachement a
      LEFT JOIN materiel m ON a.materiel_id = m.id
      WHERE a.materiel_id = ?
      ORDER BY a.date_utilise DESC
    `,
      [materiel_id]
    )

    res.json(rows)
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des attachements.' })
  }
}

// Récupérer les attachements par lot
export const getAttachementsByLot = async (req, res) => {
  const { lot } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        a.*,
        m.designation as materiel_designation,
        m.modele as materiel_modele
      FROM attachement a
      LEFT JOIN materiel m ON a.materiel_id = m.id
      WHERE a.lot = ?
      ORDER BY a.date_utilise DESC
    `,
      [lot]
    )

    res.json(rows)
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des attachements.' })
  }
}

// Récupérer les attachements par statut
export const getAttachementsByStatut = async (req, res) => {
  const { statut } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        a.*,
        m.designation as materiel_designation,
        m.modele as materiel_modele
      FROM attachement a
      LEFT JOIN materiel m ON a.materiel_id = m.id
      WHERE a.statut = ?
      ORDER BY a.date_utilise DESC
    `,
      [statut]
    )

    res.json(rows)
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des attachements.' })
  }
}

// Récupérer les attachements par date
export const getAttachementsByDate = async (req, res) => {
  const { date_debut, date_fin } = req.query

  if (!date_debut || !date_fin) {
    return res.status(400).json({
      error: 'Les paramètres date_debut et date_fin sont requis.',
    })
  }

  try {
    const [rows] = await db.query(
      `
      SELECT 
        a.*,
        m.designation as materiel_designation,
        m.modele as materiel_modele
      FROM attachement a
      LEFT JOIN materiel m ON a.materiel_id = m.id
      WHERE a.date_utilise BETWEEN ? AND ?
      ORDER BY a.date_utilise DESC
    `,
      [date_debut, date_fin]
    )

    res.json(rows)
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des attachements.' })
  }
}

// Obtenir des statistiques sur les attachements
export const getAttachementsStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN statut = 'En location' THEN 1 END) as en_location,
        COUNT(CASE WHEN statut = 'Attente Travail' THEN 1 END) as attente_travail,
        COUNT(CASE WHEN statut = 'En panne' THEN 1 END) as en_panne,
        COUNT(CASE WHEN facture = true THEN 1 END) as factures,
        COUNT(CASE WHEN facture = false THEN 1 END) as non_factures
      FROM attachement
    `)

    res.json(stats[0])
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des statistiques.' })
  }
}
