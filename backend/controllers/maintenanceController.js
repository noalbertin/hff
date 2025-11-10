// controllers/maintenanceController.js
import db from '../db.js'

// Get all maintenance records
export const getAllMaintenance = async (req, res) => {
  try {
    const [maintenance] = await db.query(`
      SELECT 
        m.*,
        mat.designation as nom_materiel,
        mat.num_parc as num_parc,
        mat.parc_colas as parc_colas
      FROM maintenance m
      LEFT JOIN materiel mat ON m.materiel_id = mat.id
      ORDER BY m.created_at DESC
    `)
    res.json(maintenance)
  } catch (err) {
    console.error('Erreur complète:', err)
    res.status(500).json({
      error: 'Erreur serveur',
      ...(process.env.NODE_ENV === 'development' && {
        message: err.message,
      }),
    })
  }
}

// Get maintenance by ID
export const getMaintenanceById = async (req, res) => {
  try {
    const { id } = req.params

    const [maintenance] = await db.query(
      `
      SELECT 
        m.*,
        mat.designation as nom_materiel,
        mat.serie,
        mat.modele,
        mat.num_parc,
        mat.parc_colas,
        mat.cst
      FROM maintenance m
      LEFT JOIN materiel mat ON m.materiel_id = mat.id
      WHERE m.id_maintenance = ?
    `,
      [id]
    )

    if (maintenance.length === 0) {
      return res.status(404).json({ error: 'Maintenance non trouvée' })
    }

    res.json(maintenance[0])
  } catch (err) {
    console.error('Erreur lors de la récupération de la maintenance:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// Create maintenance record
export const createMaintenance = async (req, res) => {
  try {
    const {
      materiel_id,
      date_signalement,
      description_probleme,
      priorite,
      statut,
      date_debut_reparation,
      date_fin_reparation,
      cout_reparation,
      notes_reparation,
    } = req.body

    // Validation
    if (!materiel_id || !date_signalement || !description_probleme) {
      return res.status(400).json({
        error:
          'Matériel, date de signalement et description du problème requis',
      })
    }

    // Vérifier si le matériel existe
    const [materiel] = await db.query('SELECT * FROM materiel WHERE id = ?', [
      materiel_id,
    ])

    if (materiel.length === 0) {
      return res.status(404).json({ error: 'Matériel non trouvé' })
    }

    // Insérer la maintenance
    const [result] = await db.query(
      `INSERT INTO maintenance (
        materiel_id,
        date_signalement,
        description_probleme,
        priorite,
        statut,
        date_debut_reparation,
        date_fin_reparation,
        cout_reparation,
        notes_reparation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        materiel_id,
        date_signalement,
        description_probleme,
        priorite || 'Moyenne',
        statut || 'En attente',
        date_debut_reparation || null,
        date_fin_reparation || null,
        cout_reparation || null,
        notes_reparation || null,
      ]
    )

    res.status(201).json({
      message: 'Maintenance créée avec succès',
      id_maintenance: result.insertId,
    })
  } catch (err) {
    console.error('Erreur lors de la création de la maintenance:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// Update maintenance record
export const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params
    const {
      materiel_id,
      date_signalement,
      description_probleme,
      priorite,
      statut,
      date_debut_reparation,
      date_fin_reparation,
      cout_reparation,
      notes_reparation,
    } = req.body

    // Vérifier si la maintenance existe
    const [existingMaintenance] = await db.query(
      'SELECT * FROM maintenance WHERE id_maintenance = ?',
      [id]
    )

    if (existingMaintenance.length === 0) {
      return res.status(404).json({ error: 'Maintenance non trouvée' })
    }

    // Si materiel_id est fourni, vérifier qu'il existe
    if (materiel_id) {
      const [materiel] = await db.query('SELECT * FROM materiel WHERE id = ?', [
        materiel_id,
      ])

      if (materiel.length === 0) {
        return res.status(404).json({ error: 'Matériel non trouvé' })
      }
    }

    // Construire la requête de mise à jour
    let updateQuery = 'UPDATE maintenance SET '
    const updateValues = []
    const updateFields = []

    if (materiel_id !== undefined) {
      updateFields.push('materiel_id = ?')
      updateValues.push(materiel_id)
    }

    if (date_signalement) {
      updateFields.push('date_signalement = ?')
      updateValues.push(date_signalement)
    }

    if (description_probleme) {
      updateFields.push('description_probleme = ?')
      updateValues.push(description_probleme)
    }

    if (priorite) {
      updateFields.push('priorite = ?')
      updateValues.push(priorite)
    }

    if (statut) {
      updateFields.push('statut = ?')
      updateValues.push(statut)
    }

    if (date_debut_reparation !== undefined) {
      updateFields.push('date_debut_reparation = ?')
      updateValues.push(date_debut_reparation)
    }

    if (date_fin_reparation !== undefined) {
      updateFields.push('date_fin_reparation = ?')
      updateValues.push(date_fin_reparation)
    }

    if (cout_reparation !== undefined) {
      updateFields.push('cout_reparation = ?')
      updateValues.push(cout_reparation)
    }

    if (notes_reparation !== undefined) {
      updateFields.push('notes_reparation = ?')
      updateValues.push(notes_reparation)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' })
    }

    updateQuery += updateFields.join(', ') + ' WHERE id_maintenance = ?'
    updateValues.push(id)

    await db.query(updateQuery, updateValues)

    // Récupérer la maintenance mise à jour
    const [updatedMaintenance] = await db.query(
      `
      SELECT 
        m.*,
        mat.designation as nom_materiel,
        mat.serie,
        mat.modele,
        mat.num_parc,
        mat.parc_colas,
        mat.cst
      FROM maintenance m
      LEFT JOIN materiel mat ON m.materiel_id = mat.id
      WHERE m.id_maintenance = ?
    `,
      [id]
    )

    res.json({
      message: 'Maintenance mise à jour avec succès',
      maintenance: updatedMaintenance[0],
    })
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la maintenance:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// Delete maintenance record
export const deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params

    // Vérifier si la maintenance existe
    const [existingMaintenance] = await db.query(
      'SELECT * FROM maintenance WHERE id_maintenance = ?',
      [id]
    )

    if (existingMaintenance.length === 0) {
      return res.status(404).json({ error: 'Maintenance non trouvée' })
    }

    // Supprimer la maintenance
    await db.query('DELETE FROM maintenance WHERE id_maintenance = ?', [id])

    res.json({ message: 'Maintenance supprimée avec succès' })
  } catch (err) {
    console.error('Erreur lors de la suppression de la maintenance:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
