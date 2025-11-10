// controllers/operateurController.js
import db from '../db.js'

// Récupérer tous les opérateurs
export const getOperateurs = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        o.*,
        f.id_flotte,
        m.designation,
        m.num_parc,
        m.parc_colas
      FROM operateurs o
      LEFT JOIN flotte f ON o.flotte_id = f.id_flotte
      LEFT JOIN materiel m ON f.materiel_id = m.id
      ORDER BY o.id_operateur DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({
      error: 'Erreur lors du chargement des opérateurs',
      details: err.message,
    })
  }
}

// Récupérer un opérateur par ID
export const getOperateurById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        o.*,
        f.id_flotte,
        m.designation,
        m.num_parc,
        m.parc_colas
      FROM operateurs o
      LEFT JOIN flotte f ON o.flotte_id = f.id_flotte
      LEFT JOIN materiel m ON f.materiel_id = m.id_materiel
      WHERE o.id_operateur = ?
    `,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Opérateur non trouvé',
        details: `Aucun opérateur avec l'ID ${id}`,
      })
    }
    res.json(rows[0])
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({
      error: "Erreur lors de la récupération de l'opérateur",
      details: err.message,
    })
  }
}

// Créer un opérateur
export const createOperateur = async (req, res) => {
  const {
    flotte_id,
    matricule,
    nom,
    telephone,
    nom_suppleant,
    telephone_suppleant,
    matricule_suppleant,
  } = req.body

  // Validation des données obligatoires
  if (!nom) {
    return res.status(400).json({
      error: 'Validation échouée',
      details: 'Le nom est obligatoire',
    })
  }

  try {
    // Vérifier que la flotte n'a pas déjà un opérateur (si flotte_id fourni)
    if (flotte_id) {
      const [existing] = await db.query(
        'SELECT id_operateur FROM operateurs WHERE flotte_id = ?',
        [flotte_id]
      )

      if (existing.length > 0) {
        return res.status(409).json({
          error: 'Conflit de flotte',
          details: 'Cette flotte a déjà un opérateur affecté',
        })
      }
    }

    const [result] = await db.query(
      `INSERT INTO operateurs 
        (flotte_id, matricule, nom, telephone, nom_suppleant, telephone_suppleant, matricule_suppleant) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        flotte_id || null,
        matricule || null,
        nom,
        telephone || null,
        nom_suppleant || null,
        telephone_suppleant || null,
        matricule_suppleant || null,
      ]
    )

    res.status(201).json({
      id_operateur: result.insertId,
      flotte_id,
      matricule,
      nom,
      telephone,
      nom_suppleant,
      telephone_suppleant,
      matricule_suppleant,
    })
  } catch (err) {
    console.error('Erreur MySQL:', err.message)

    // Gérer les erreurs de contrainte UNIQUE
    if (err.code === 'ER_DUP_ENTRY') {
      const match = err.message.match(/Duplicate entry '(.+?)' for key '(.+?)'/)
      if (match) {
        const [, value, key] = match
        return res.status(409).json({
          error: 'Doublon détecté',
          details: `La valeur "${value}" existe déjà pour le champ "${key}"`,
        })
      }
      return res.status(409).json({
        error: 'Doublon détecté',
        details: 'Cette entrée existe déjà dans la base de données',
      })
    }

    res.status(500).json({
      error: "Erreur lors de la création de l'opérateur",
      details: err.message,
    })
  }
}

// Modifier un opérateur
export const updateOperateur = async (req, res) => {
  const { id } = req.params
  const {
    flotte_id,
    matricule,
    nom,
    telephone,
    nom_suppleant,
    telephone_suppleant,
    matricule_suppleant,
  } = req.body

  // Validation
  if (!nom) {
    return res.status(400).json({
      error: 'Validation échouée',
      details: 'Le nom est obligatoire',
    })
  }

  try {
    // Vérifier que la flotte n'est pas déjà affectée à un autre opérateur
    if (flotte_id) {
      const [existing] = await db.query(
        'SELECT id_operateur FROM operateurs WHERE flotte_id = ? AND id_operateur != ?',
        [flotte_id, id]
      )

      if (existing.length > 0) {
        return res.status(409).json({
          error: 'Conflit de flotte',
          details: 'Cette flotte est déjà affectée à un autre opérateur',
        })
      }
    }

    const [result] = await db.query(
      `UPDATE operateurs 
       SET flotte_id = ?, 
           matricule = ?, 
           nom = ?, 
           telephone = ?, 
           nom_suppleant = ?, 
           telephone_suppleant = ?,
           matricule_suppleant = ?
       WHERE id_operateur = ?`,
      [
        flotte_id || null,
        matricule || null,
        nom,
        telephone || null,
        nom_suppleant || null,
        telephone_suppleant || null,
        matricule_suppleant || null,
        id,
      ]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Opérateur non trouvé',
        details: `Aucun opérateur avec l'ID ${id}`,
      })
    }

    res.json({
      id_operateur: id,
      flotte_id,
      matricule,
      nom,
      telephone,
      nom_suppleant,
      telephone_suppleant,
      matricule_suppleant,
    })
  } catch (err) {
    console.error('Erreur MySQL:', err.message)

    // Gérer les erreurs de contrainte UNIQUE
    if (err.code === 'ER_DUP_ENTRY') {
      const match = err.message.match(/Duplicate entry '(.+?)' for key '(.+?)'/)
      if (match) {
        const [, value, key] = match
        return res.status(409).json({
          error: 'Doublon détecté',
          details: `La valeur "${value}" existe déjà pour le champ "${key}"`,
        })
      }
      return res.status(409).json({
        error: 'Doublon détecté',
        details: 'Cette entrée existe déjà dans la base de données',
      })
    }

    res.status(500).json({
      error: "Erreur lors de la mise à jour de l'opérateur",
      details: err.message,
    })
  }
}

// Supprimer un opérateur
export const deleteOperateur = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.query(
      'DELETE FROM operateurs WHERE id_operateur = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Opérateur non trouvé',
        details: `Aucun opérateur avec l'ID ${id}`,
      })
    }

    res.json({ message: 'Opérateur supprimé avec succès' })
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({
      error: "Erreur lors de la suppression de l'opérateur",
      details: err.message,
    })
  }
}
