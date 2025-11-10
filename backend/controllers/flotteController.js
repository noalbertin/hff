//controllers/flotteController.js
import db from '../db.js'

// Récupérer toute la flotte
export const getFlotte = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        f.*,
        m.id as materiel_db_id,
        m.designation as materiel_designation,
        m.num_parc as materiel_num_parc,
        m.parc_colas as materiel_parc_colas
      FROM flotte f
      LEFT JOIN materiel m ON f.materiel_id = m.id
      ORDER BY f.id_flotte DESC
    `)

    // Transformer les données pour créer un objet materiel imbriqué
    const formattedRows = rows.map((row) => {
      const {
        materiel_db_id,
        materiel_designation,
        materiel_num_parc,
        materiel_parc_colas,
        ...flotteData
      } = row

      return {
        ...flotteData,
        // GARDER materiel_id de la table flotte (f.materiel_id)
        materiel: materiel_db_id
          ? {
              id: materiel_db_id,
              designation: materiel_designation,
              num_parc: materiel_num_parc,
              parc_colas: materiel_parc_colas,
            }
          : null,
      }
    })

    res.json(formattedRows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer une flotte par ID
export const getFlotteById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await db.query(
      `
      SELECT 
        f.*,
        m.designation as materiel_designation,
        m.num_parc,
        m.immatriculation
      FROM flotte f
      LEFT JOIN materiel m ON f.materiel_id = m.id
      WHERE f.id_flotte = ?
    `,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Flotte non trouvée.' })
    }
    res.json(rows[0])
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération de la flotte.' })
  }
}

// Créer une nouvelle flotte
export const createFlotte = async (req, res) => {
  const {
    materiel_id,
    annee,
    suivi,
    casier,
    numero_chassis,
    date_dernier_pm,
    heure_dernier_pm,
    km_dernier_pm,
    heure_prochain_pm,
    km_prochain_pm,
    type_pm,
    num_pm,
  } = req.body

  // Validation des champs obligatoires
  if (!materiel_id || !annee) {
    return res.status(400).json({
      error: 'Les champs materiel_id et annee sont obligatoires',
    })
  }

  try {
    const [result] = await db.query(
      `
      INSERT INTO flotte (
        materiel_id,
        annee,
        suivi,
        casier,
        numero_chassis,
        date_dernier_pm,
        heure_dernier_pm,
        km_dernier_pm,
        heure_prochain_pm,
        km_prochain_pm,
        type_pm,
        num_pm
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        materiel_id,
        annee,
        suivi !== undefined ? suivi : true, // Valeur par défaut true
        casier || null,
        numero_chassis || null,
        date_dernier_pm || null,
        heure_dernier_pm || null,
        km_dernier_pm || null,
        heure_prochain_pm || null,
        km_prochain_pm || null,
        type_pm || null,
        num_pm || null,
      ]
    )

    res.status(201).json({
      id_flotte: result.insertId,
      message: 'Flotte créée avec succès',
    })
  } catch (err) {
    console.error('Erreur MySQL:', err.message)

    // Gestion de l'erreur de duplication (materiel_id + annee unique)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Une flotte existe déjà pour ce matériel et cette année',
      })
    }

    // Gestion de l'erreur de clé étrangère
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        error: "Le matériel spécifié n'existe pas",
      })
    }

    res.status(500).json({ error: 'Erreur lors de la création de la flotte' })
  }
}

export const getNumPM = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT num_pm 
      FROM flotte 
      WHERE num_pm IS NOT NULL 
      ORDER BY num_pm ASC
    `)

    const options = rows.map((r) => ({
      value: r.num_pm,
      label: r.num_pm,
    }))

    res.json(options)
  } catch (error) {
    console.error('Erreur récupération num_pm:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

// Modifier une flotte
export const updateFlotte = async (req, res) => {
  const { id } = req.params
  const {
    materiel_id,
    annee,
    suivi,
    casier,
    numero_chassis,
    date_dernier_pm,
    heure_dernier_pm,
    km_dernier_pm,
    heure_prochain_pm,
    km_prochain_pm,
    type_pm,
    num_pm,
  } = req.body

  // Validation des champs obligatoires
  if (!materiel_id || !annee) {
    return res.status(400).json({
      error: 'Les champs materiel_id et annee sont obligatoires',
    })
  }

  try {
    const [result] = await db.query(
      `UPDATE flotte SET 
        materiel_id = ?,
        annee = ?,
        suivi = ?,
        casier = ?,
        numero_chassis = ?,
        date_dernier_pm = ?,
        heure_dernier_pm = ?,
        km_dernier_pm = ?,
        heure_prochain_pm = ?,
        km_prochain_pm = ?,
        type_pm = ?,
        num_pm = ?
      WHERE id_flotte = ?`,
      [
        materiel_id,
        annee,
        suivi !== undefined ? suivi : true,
        casier || null,
        numero_chassis || null,
        date_dernier_pm || null,
        heure_dernier_pm || null,
        km_dernier_pm || null,
        heure_prochain_pm || null,
        km_prochain_pm || null,
        type_pm || null,
        num_pm || null,
        id,
      ]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Flotte non trouvée' })
    }

    res.json({
      id_flotte: id,
      materiel_id,
      annee,
      suivi,
      casier,
      numero_chassis,
      date_dernier_pm,
      heure_dernier_pm,
      km_dernier_pm,
      heure_prochain_pm,
      km_prochain_pm,
      type_pm,
      num_pm,
      message: 'Flotte mise à jour avec succès',
    })
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la flotte:', err.message)

    // Gestion de l'erreur de duplication
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Une flotte existe déjà pour ce matériel et cette année',
      })
    }

    // Gestion de l'erreur de clé étrangère
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        error: "Le matériel spécifié n'existe pas",
      })
    }

    res
      .status(500)
      .json({ error: 'Erreur lors de la mise à jour de la flotte' })
  }
}

// Récupérer les flottes par matériel
export const getFlottesByMateriel = async (req, res) => {
  const { materiel_id } = req.params

  try {
    const [rows] = await db.query(
      `
      SELECT * FROM flotte 
      WHERE materiel_id = ?
      ORDER BY annee DESC
    `,
      [materiel_id]
    )

    res.json(rows)
  } catch (err) {
    console.error('Erreur lors de la récupération des flottes:', err.message)
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des flottes' })
  }
}

// Supprimer une flotte
export const deleteFlotte = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await db.query('DELETE FROM flotte WHERE id_flotte = ?', [
      id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Flotte non trouvée.' })
    }

    res.json({ message: 'Flotte supprimée avec succès.' })
  } catch (err) {
    console.error('Erreur lors de la suppression de la flotte:', err.message)
    res
      .status(500)
      .json({ error: 'Erreur lors de la suppression de la flotte.' })
  }
}

// Récupérer la liste des flottes qui n'ont PAS encore de document administratif
export const getFlotteSansDocument = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        f.*,
        m.id as materiel_db_id,
        m.designation as materiel_designation,
        m.num_parc as materiel_num_parc,
        m.parc_colas as materiel_parc_colas
      FROM flotte f
      LEFT JOIN materiel m ON f.materiel_id = m.id
      LEFT JOIN documents_administratifs da ON f.id_flotte = da.flotte_id
      WHERE da.flotte_id IS NULL
      ORDER BY f.id_flotte DESC
    `)

    // Transformer les données pour créer un objet materiel imbriqué
    const formattedRows = rows.map((row) => {
      const {
        materiel_db_id,
        materiel_designation,
        materiel_num_parc,
        materiel_parc_colas,
        ...flotteData
      } = row

      return {
        ...flotteData,
        materiel: materiel_db_id
          ? {
              id: materiel_db_id,
              designation: materiel_designation,
              num_parc: materiel_num_parc,
              parc_colas: materiel_parc_colas,
            }
          : null,
      }
    })

    res.json(formattedRows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer la liste des flottes qui n'ont PAS encore d'opérateur
export const getFlotteSansOperateur = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        f.*,
        m.id as materiel_db_id,
        m.designation as materiel_designation,
        m.num_parc as materiel_num_parc,
        m.parc_colas as materiel_parc_colas
      FROM flotte f
      LEFT JOIN materiel m ON f.materiel_id = m.id
      LEFT JOIN operateurs o ON f.id_flotte = o.flotte_id
      WHERE o.id_operateur IS NULL
      ORDER BY f.id_flotte DESC
    `)

    // Transformer les données pour créer un objet materiel imbriqué
    const formattedRows = rows.map((row) => {
      const {
        materiel_db_id,
        materiel_designation,
        materiel_num_parc,
        materiel_parc_colas,
        ...flotteData
      } = row

      return {
        ...flotteData,
        materiel: materiel_db_id
          ? {
              id: materiel_db_id,
              designation: materiel_designation,
              num_parc: materiel_num_parc,
              parc_colas: materiel_parc_colas,
            }
          : null,
      }
    })

    res.json(formattedRows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer la vue complète de la flotte (avec tous les détails)
export const getFlotteComplete = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        f.id_flotte,
        f.materiel_id,
        f.annee,
        f.suivi,
        f.casier,
        f.numero_chassis,
        
        -- Maintenance
        f.date_dernier_pm,
        f.heure_dernier_pm,
        f.km_dernier_pm,
        f.heure_prochain_pm,
        f.km_prochain_pm,
        f.type_pm,
        f.num_pm,
        
        -- Documents
        da.date_ips,
        da.date_derniere_vt,
        da.date_prochaine_vt,
        da.date_expiration_carte_grise,
        da.date_expiration_assurance,
        
        -- Opérateurs
        o.nom AS operateur,
        o.telephone,
        o.matricule AS matricule_operateur,
        s.nom AS suppleant,
        s.matricule AS matricule_suppleant,
        
        -- Matériel
        m.designation as materiel_designation,
        m.num_parc,
        m.immatriculation,
        
        f.created_at,
        f.updated_at
      FROM flotte f
      LEFT JOIN documents_administratifs da ON f.id_flotte = da.flotte_id
      LEFT JOIN affectation_operateurs ao ON f.id_flotte = ao.flotte_id AND ao.actif = TRUE
      LEFT JOIN operateurs o ON ao.operateur_id = o.id_operateur
      LEFT JOIN operateurs s ON ao.suppleant_id = s.id_operateur
      LEFT JOIN materiel m ON f.materiel_id = m.id
      ORDER BY f.id_flotte DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer les alertes de la flotte
export const getAlertesFlotte = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        f.id_flotte,
        f.materiel_id,
        f.numero_chassis,
        
        -- Alertes maintenance
        f.heure_prochain_pm,
        f.km_prochain_pm,
        
        -- Alertes documents
        da.date_prochaine_vt,
        da.date_expiration_carte_grise,
        da.date_expiration_assurance,
        
        -- Calcul des jours restants
        DATEDIFF(da.date_prochaine_vt, CURDATE()) AS jours_avant_vt,
        DATEDIFF(da.date_expiration_carte_grise, CURDATE()) AS jours_avant_carte_grise,
        DATEDIFF(da.date_expiration_assurance, CURDATE()) AS jours_avant_assurance,
        
        -- Matériel
        m.designation as materiel_designation,
        m.num_parc
      FROM flotte f
      LEFT JOIN documents_administratifs da ON f.id_flotte = da.flotte_id
      LEFT JOIN materiel m ON f.materiel_id = m.id
      WHERE f.suivi = TRUE
      ORDER BY 
        CASE 
          WHEN DATEDIFF(da.date_prochaine_vt, CURDATE()) < 30 THEN 1
          WHEN DATEDIFF(da.date_expiration_carte_grise, CURDATE()) < 30 THEN 1
          WHEN DATEDIFF(da.date_expiration_assurance, CURDATE()) < 30 THEN 1
          ELSE 2
        END,
        f.id_flotte DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}
