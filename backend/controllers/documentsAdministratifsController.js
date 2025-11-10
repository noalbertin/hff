// controllers/documentsAdministratifsController.js
import db from '../db.js'

// Récupérer tous les documents administratifs
export const getDocumentsAdministratifs = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        da.*,
        f.id_flotte,
        f.annee,
        m.designation,
        m.num_parc,
        m.parc_colas
      FROM documents_administratifs da
      LEFT JOIN flotte f ON da.flotte_id = f.id_flotte
      LEFT JOIN materiel m ON f.materiel_id = m.id
      ORDER BY da.id_document DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer un document administratif par ID
export const getDocumentAdministratifById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        da.*,
        f.id_flotte,
        f.annee,
        m.designation,
        m.num_parc,
        m.parc_colas
      FROM documents_administratifs da
      LEFT JOIN flotte f ON da.flotte_id = f.id_flotte
      LEFT JOIN materiel m ON f.materiel_id = m.id
      WHERE da.id_document = ?
    `,
      [id]
    )

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Document administratif non trouvé.' })
    }
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la récupération du document administratif.',
    })
  }
}

// Récupérer le document administratif par flotte_id
export const getDocumentByFlotteId = async (req, res) => {
  const { flotte_id } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        da.*,
        f.id_flotte,
        f.annee,
        m.designation,
        m.num_parc,
        m.parc_colas
      FROM documents_administratifs da
      LEFT JOIN flotte f ON da.flotte_id = f.id_flotte
      LEFT JOIN materiel m ON f.materiel_id = m.id
      WHERE da.flotte_id = ?
    `,
      [flotte_id]
    )

    if (rows.length === 0) {
      return res.json(null)
    }
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la récupération du document administratif.',
    })
  }
}

// Créer un document administratif
export const createDocumentAdministratif = async (req, res) => {
  const {
    flotte_id,
    date_ips,
    date_derniere_vt,
    date_prochaine_vt,
    date_expiration_carte_grise,
    date_expiration_assurance,
  } = req.body

  try {
    const [result] = await db.query(
      `INSERT INTO documents_administratifs 
       (flotte_id, date_ips, date_derniere_vt, date_prochaine_vt, 
        date_expiration_carte_grise, date_expiration_assurance) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        flotte_id,
        date_ips || null,
        date_derniere_vt || null,
        date_prochaine_vt || null,
        date_expiration_carte_grise || null,
        date_expiration_assurance || null,
      ]
    )

    res.status(201).json({
      id_document: result.insertId,
      flotte_id,
      date_ips,
      date_derniere_vt,
      date_prochaine_vt,
      date_expiration_carte_grise,
      date_expiration_assurance,
    })
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res
      .status(500)
      .json({ error: 'Erreur lors de la création du document administratif.' })
  }
}

// Modifier un document administratif
export const updateDocumentAdministratif = async (req, res) => {
  const { id } = req.params
  const {
    flotte_id,
    date_ips,
    date_derniere_vt,
    date_prochaine_vt,
    date_expiration_carte_grise,
    date_expiration_assurance,
  } = req.body

  try {
    const [result] = await db.query(
      `UPDATE documents_administratifs 
       SET flotte_id=?, date_ips=?, date_derniere_vt=?, date_prochaine_vt=?, 
           date_expiration_carte_grise=?, date_expiration_assurance=? 
       WHERE id_document=?`,
      [
        flotte_id,
        date_ips || null,
        date_derniere_vt || null,
        date_prochaine_vt || null,
        date_expiration_carte_grise || null,
        date_expiration_assurance || null,
        id,
      ]
    )

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Document administratif non trouvé.' })
    }

    res.json({
      id_document: id,
      flotte_id,
      date_ips,
      date_derniere_vt,
      date_prochaine_vt,
      date_expiration_carte_grise,
      date_expiration_assurance,
    })
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du document administratif.',
    })
  }
}

// Supprimer un document administratif
export const deleteDocumentAdministratif = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.query(
      'DELETE FROM documents_administratifs WHERE id_document = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Document administratif non trouvé.' })
    }

    res.json({ message: 'Document administratif supprimé avec succès.' })
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({
      error: 'Erreur lors de la suppression du document administratif.',
    })
  }
}
