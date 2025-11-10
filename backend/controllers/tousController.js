// controllers/tousController.js
import db from '../db.js'

// Récupérer tous les matériels avec toutes les informations
export const getTousMateriels = async (req, res) => {
  try {
    const query = `
      SELECT 
        -- Materiel
        m.id,
        m.num_parc,
        m.parc_colas,
        m.designation,
        m.modele,
        m.serie,
        m.cst,
        
        -- Flotte
        f.annee,
        f.suivi,
        f.casier,
        f.numero_chassis,
        f.date_dernier_pm,
        f.heure_dernier_pm,
        f.km_dernier_pm,
        f.heure_prochain_pm,
        f.km_prochain_pm,
        f.type_pm,
        f.num_pm,
        
        -- Dernier attachement
        a.lot,
        a.heure_fin,
        a.km_fin,
        a.facture,
        a.observation,
        a.statut,
        a.date_utilise,
        
        -- Documents administratifs
        da.date_ips,
        da.date_derniere_vt,
        da.date_prochaine_vt,
        da.date_expiration_carte_grise,
        da.date_expiration_assurance,
        
        -- Calcul des retards
        DATEDIFF(da.date_prochaine_vt, CURDATE()) AS jours_avant_vt,
        DATEDIFF(da.date_expiration_carte_grise, CURDATE()) AS jours_avant_carte_grise,
        DATEDIFF(da.date_expiration_assurance, CURDATE()) AS jours_avant_assurance,
        
        -- Opérateurs
        o.matricule AS matricule_operateur,
        o.nom AS nom_operateur,
        o.telephone AS telephone_operateur,
        o.nom_suppleant,
        o.telephone_suppleant,
        o.matricule_suppleant

      FROM materiel m
      
      LEFT JOIN flotte f ON m.id = f.materiel_id
      
      LEFT JOIN (
        SELECT 
          a1.*
        FROM attachement a1
        INNER JOIN (
          SELECT materiel_id, MAX(date_utilise) AS max_date
          FROM attachement
          GROUP BY materiel_id
        ) a2 ON a1.materiel_id = a2.materiel_id 
            AND a1.date_utilise = a2.max_date
      ) a ON m.id = a.materiel_id
      
      LEFT JOIN documents_administratifs da ON f.id_flotte = da.flotte_id
      
      LEFT JOIN operateurs o ON f.id_flotte = o.flotte_id
      
      ORDER BY m.id DESC
    `

    const [rows] = await db.query(query)
    res.json(rows)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer un matériel par ID avec toutes ses informations
export const getTousMaterielById = async (req, res) => {
  try {
    const { id } = req.params

    const query = `
      SELECT 
        -- Materiel
        m.id,
        m.num_parc,
        m.parc_colas,
        m.designation,
        m.modele,
        m.serie,
        m.cst,
        
        -- Flotte
        f.annee,
        f.suivi,
        f.casier,
        f.numero_chassis,
        f.date_dernier_pm,
        f.heure_dernier_pm,
        f.km_dernier_pm,
        f.heure_prochain_pm,
        f.km_prochain_pm,
        f.type_pm,
        f.num_pm,
        
        -- Dernier attachement
        a.lot,
        a.heure_fin,
        a.km_fin,
        a.facture,
        a.observation,
        a.statut,
        a.date_utilise,
        
        -- Documents administratifs
        da.date_ips,
        da.date_derniere_vt,
        da.date_prochaine_vt,
        da.date_expiration_carte_grise,
        da.date_expiration_assurance,
        
        -- Calcul des retards
        DATEDIFF(da.date_prochaine_vt, CURDATE()) AS jours_avant_vt,
        DATEDIFF(da.date_expiration_carte_grise, CURDATE()) AS jours_avant_carte_grise,
        DATEDIFF(da.date_expiration_assurance, CURDATE()) AS jours_avant_assurance,
        
        -- Opérateurs
        o.matricule AS matricule_operateur,
        o.nom AS nom_operateur,
        o.telephone AS telephone_operateur,
        o.nom_suppleant,
        o.telephone_suppleant,
        o.matricule_suppleant

      FROM materiel m
      
      LEFT JOIN flotte f ON m.id = f.materiel_id
      
      LEFT JOIN (
        SELECT 
          a1.*
        FROM attachement a1
        INNER JOIN (
          SELECT materiel_id, MAX(date_utilise) AS max_date
          FROM attachement
          GROUP BY materiel_id
        ) a2 ON a1.materiel_id = a2.materiel_id 
            AND a1.date_utilise = a2.max_date
      ) a ON m.id = a.materiel_id
      
      LEFT JOIN documents_administratifs da ON f.id_flotte = da.flotte_id
      
      LEFT JOIN operateurs o ON f.id_flotte = o.flotte_id
      
      WHERE m.id = ?
    `

    const [rows] = await db.query(query, [id])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Matériel non trouvé' })
    }

    // Récupérer les maintenances préventives du matériel
    const maintenancePreventiveQuery = `
      SELECT 
        id_maintenance_preventive,
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
        created_at,
        updated_at
      FROM maintenance_preventive
      WHERE materiel_id = ?
      ORDER BY date_planifiee DESC
    `

    // Récupérer les maintenances curatives du matériel
    const maintenanceCurativeQuery = `
      SELECT 
        id_maintenance_curative,
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
        created_at,
        updated_at
      FROM maintenance_curative
      WHERE materiel_id = ?
      ORDER BY date_signalement DESC
    `

    const [maintenancesPreventives] = await db.query(
      maintenancePreventiveQuery,
      [id]
    )
    const [maintenancesCuratives] = await db.query(maintenanceCurativeQuery, [
      id,
    ])

    // Ajouter les maintenances au résultat
    const result = {
      ...rows[0],
      maintenances_preventives: maintenancesPreventives,
      maintenances_curatives: maintenancesCuratives,
    }

    res.json(result)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}

// Récupérer le dernier attachement d'un matériel
export const getLastAttachementMateriel = async (req, res) => {
  try {
    const { id } = req.params
    const query = `
      SELECT * FROM attachement 
      WHERE materiel_id = ? 
      ORDER BY date_utilise DESC 
      LIMIT 1
    `
    const [rows] = await db.query(query, [id])
    res.json(rows[0] || null)
  } catch (err) {
    console.error('Erreur MySQL:', err.message)
    res.status(500).json({ error: err.message })
  }
}
