-- ========================================
-- SYSTÈME DE NOTIFICATIONS AUTOMATIQUE
-- Sans appel manuel de generer_notifications()
-- ========================================

--
-- Structure de la table `attachement`
--

CREATE TABLE `attachement` (
  `id` int(11) NOT NULL,
  `materiel_id` int(11) NOT NULL,
  `lot` enum('Lot 1','Lot 2','Lot 3','Cerc','HFF') NOT NULL,
  `heure_debut` int(11) DEFAULT NULL,
  `heure_fin` int(11) DEFAULT NULL,
  `km_debut` int(11) DEFAULT NULL,
  `km_fin` int(11) DEFAULT NULL,
  `facture` tinyint(1) DEFAULT 0,
  `observation` text DEFAULT NULL,
  `date_utilise` date NOT NULL,
  `statut` enum('En location','Attente Travail','En panne') DEFAULT 'Attente Travail',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Structure de la table `documents_administratifs`
--

CREATE TABLE `documents_administratifs` (
  `id_document` int(11) NOT NULL,
  `flotte_id` int(11) NOT NULL,
  `date_ips` date DEFAULT NULL,
  `date_derniere_vt` date DEFAULT NULL,
  `date_prochaine_vt` date DEFAULT NULL,
  `date_expiration_carte_grise` date DEFAULT NULL,
  `date_expiration_assurance` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Structure de la table `flotte`
--

CREATE TABLE `flotte` (
  `id_flotte` int(11) NOT NULL,
  `materiel_id` int(11) NOT NULL,
  `annee` year(4) NOT NULL,
  `suivi` tinyint(1) DEFAULT 1,
  `casier` varchar(25) DEFAULT NULL,
  `numero_chassis` varchar(50) DEFAULT NULL,
  `date_dernier_pm` date DEFAULT NULL,
  `heure_dernier_pm` int(11) DEFAULT NULL,
  `km_dernier_pm` int(11) DEFAULT NULL,
  `heure_prochain_pm` int(11) DEFAULT NULL,
  `km_prochain_pm` int(11) DEFAULT NULL,
  `type_pm` varchar(10) DEFAULT NULL,
  `num_pm` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Structure de la table `maintenance_curative`
--

CREATE TABLE `maintenance_curative` (
  `id_maintenance_curative` int(11) NOT NULL,
  `materiel_id` int(11) NOT NULL,
  `date_signalement` date NOT NULL,
  `description_signalement` text NOT NULL,
  `categorie` enum('Immédiate','Différée') NOT NULL DEFAULT 'Immédiate',
  `statut` enum('En attente','En cours','Terminée') NOT NULL DEFAULT 'En attente',
  `date_debut_intervention` date DEFAULT NULL,
  `date_fin_intervention` date DEFAULT NULL,
  `pieces_remplacees` text DEFAULT NULL,
  `pieces_reparees` text DEFAULT NULL,
  `cout_pieces` decimal(10,2) DEFAULT NULL,
  `notes_reparation` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Structure de la table `maintenance_preventive`
--

CREATE TABLE `maintenance_preventive` (
  `id_maintenance_preventive` int(11) NOT NULL,
  `materiel_id` int(11) NOT NULL,
  `nom_operation` varchar(255) NOT NULL,
  `date_planifiee` date NOT NULL,
  `heures_fonctionnement_cible` int(11) DEFAULT NULL,
  `km_fonctionnement_cible` int(11) DEFAULT NULL,
  `priorite` enum('Basse','Moyenne','Haute') NOT NULL DEFAULT 'Moyenne',
  `statut` enum('Planifiée','En cours','Terminée') NOT NULL DEFAULT 'Planifiée',
  `date_debut_intervention` date DEFAULT NULL,
  `date_fin_intervention` date DEFAULT NULL,
  `notes_intervention` text DEFAULT NULL,
  `cout_pieces` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Structure de la table `materiel`
--

CREATE TABLE `materiel` (
  `id` int(11) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `modele` varchar(100) NOT NULL,
  `serie` varchar(18) NOT NULL,
  `cst` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `num_parc` varchar(10) NOT NULL,
  `immatriculation` varchar(10) NOT NULL,
  `parc_colas` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id_notification` int(11) NOT NULL,
  `type` enum('document','maintenance_preventive','maintenance_curative','location') NOT NULL,
  `materiel_id` int(11) DEFAULT NULL,
  `titre` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `priorite` enum('Info','Attention','Urgent') DEFAULT 'Info',
  `lu` tinyint(1) DEFAULT 0,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_lu` timestamp NULL DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `operateurs`
--

CREATE TABLE `operateurs` (
  `id_operateur` int(11) NOT NULL,
  `flotte_id` int(11) DEFAULT NULL,
  `matricule` varchar(20) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `telephone` varchar(15) DEFAULT NULL,
  `nom_suppleant` varchar(50) DEFAULT NULL,
  `telephone_suppleant` varchar(15) DEFAULT NULL,
  `matricule_suppleant` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `nom_user` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','visiteur') DEFAULT 'visiteur',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Index pour les tables déchargées
--

--
-- Index pour la table `attachement`
--
ALTER TABLE `attachement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_attachement_materiel` (`materiel_id`);

--
-- Index pour la table `documents_administratifs`
--
ALTER TABLE `documents_administratifs`
  ADD PRIMARY KEY (`id_document`),
  ADD KEY `fk_documents_flotte` (`flotte_id`),
  ADD KEY `idx_date_prochaine_vt` (`date_prochaine_vt`),
  ADD KEY `idx_date_expiration_carte_grise` (`date_expiration_carte_grise`),
  ADD KEY `idx_date_expiration_assurance` (`date_expiration_assurance`);

--
-- Index pour la table `flotte`
--
ALTER TABLE `flotte`
  ADD PRIMARY KEY (`id_flotte`),
  ADD UNIQUE KEY `uk_materiel_annee` (`materiel_id`,`annee`),
  ADD KEY `idx_heure_prochain_pm` (`heure_prochain_pm`),
  ADD KEY `idx_km_prochain_pm` (`km_prochain_pm`);

--
-- Index pour la table `maintenance_curative`
--
ALTER TABLE `maintenance_curative`
  ADD PRIMARY KEY (`id_maintenance_curative`),
  ADD KEY `fk_mc_materiel` (`materiel_id`),
  ADD KEY `idx_date_signalement` (`date_signalement`),
  ADD KEY `idx_statut_mc` (`statut`),
  ADD KEY `idx_categorie` (`categorie`);

--
-- Index pour la table `maintenance_preventive`
--
ALTER TABLE `maintenance_preventive`
  ADD PRIMARY KEY (`id_maintenance_preventive`),
  ADD KEY `fk_mp_materiel` (`materiel_id`),
  ADD KEY `idx_date_planifiee` (`date_planifiee`),
  ADD KEY `idx_statut_mp` (`statut`);

--
-- Index pour la table `materiel`
--
ALTER TABLE `materiel`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id_notification`),
  ADD KEY `fk_notification_materiel` (`materiel_id`),
  ADD KEY `idx_lu` (`lu`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_priorite` (`priorite`),
  ADD KEY `idx_date_creation` (`date_creation`);

--
-- Index pour la table `operateurs`
--
ALTER TABLE `operateurs`
  ADD PRIMARY KEY (`id_operateur`),
  ADD UNIQUE KEY `matricule` (`matricule`),
  ADD UNIQUE KEY `flotte_id` (`flotte_id`),
  ADD KEY `idx_matricule` (`matricule`),
  ADD KEY `idx_flotte` (`flotte_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `nom_user` (`nom_user`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `attachement`
--
ALTER TABLE `attachement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `documents_administratifs`
--
ALTER TABLE `documents_administratifs`
  MODIFY `id_document` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `flotte`
--
ALTER TABLE `flotte`
  MODIFY `id_flotte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `maintenance_curative`
--
ALTER TABLE `maintenance_curative`
  MODIFY `id_maintenance_curative` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `maintenance_preventive`
--
ALTER TABLE `maintenance_preventive`
  MODIFY `id_maintenance_preventive` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `materiel`
--
ALTER TABLE `materiel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id_notification` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT pour la table `operateurs`
--
ALTER TABLE `operateurs`
  MODIFY `id_operateur` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `attachement`
--
ALTER TABLE `attachement`
  ADD CONSTRAINT `fk_attachement_materiel` FOREIGN KEY (`materiel_id`) REFERENCES `materiel` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `documents_administratifs`
--
ALTER TABLE `documents_administratifs`
  ADD CONSTRAINT `fk_documents_flotte` FOREIGN KEY (`flotte_id`) REFERENCES `flotte` (`id_flotte`) ON DELETE CASCADE;

--
-- Contraintes pour la table `flotte`
--
ALTER TABLE `flotte`
  ADD CONSTRAINT `fk_flotte_materiel` FOREIGN KEY (`materiel_id`) REFERENCES `materiel` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `maintenance_curative`
--
ALTER TABLE `maintenance_curative`
  ADD CONSTRAINT `fk_mc_materiel` FOREIGN KEY (`materiel_id`) REFERENCES `materiel` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `maintenance_preventive`
--
ALTER TABLE `maintenance_preventive`
  ADD CONSTRAINT `fk_mp_materiel` FOREIGN KEY (`materiel_id`) REFERENCES `materiel` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_materiel` FOREIGN KEY (`materiel_id`) REFERENCES `materiel` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `operateurs`
--
ALTER TABLE `operateurs`
  ADD CONSTRAINT `fk_operateur_flotte` FOREIGN KEY (`flotte_id`) REFERENCES `flotte` (`id_flotte`) ON DELETE SET NULL;



-- ========================================
-- 1. PROCÉDURE STOCKÉE (pour événement quotidien uniquement)
-- ========================================
DROP PROCEDURE IF EXISTS generer_notifications;

DELIMITER $$
CREATE PROCEDURE `generer_notifications`()
BEGIN
  -- Nettoyer les anciennes notifications lues (> 30 jours)
  DELETE FROM notifications 
  WHERE lu = TRUE 
    AND date_lu < DATE_SUB(CURDATE(), INTERVAL 30 DAY);
  
  -- ========================================
  -- NOTIFICATIONS DOCUMENTS - ASSURANCE
  -- ========================================
  INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
  SELECT 
    'document',
    materiel_id,
    CONCAT('Assurance - ', designation),
    CONCAT('L\'assurance expire le ', DATE_FORMAT(date_expiration_assurance, '%d/%m/%Y')),
    priorite_assurance,
    JSON_OBJECT(
      'type_document', 'assurance',
      'date_expiration', date_expiration_assurance,
      'jours_restants', DATEDIFF(date_expiration_assurance, CURDATE())
    )
  FROM vue_notifications_documents
  WHERE date_expiration_assurance <= DATE_ADD(CURDATE(), INTERVAL 60 DAY)
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.materiel_id = vue_notifications_documents.materiel_id
        AND n.type = 'document'
        AND n.lu = FALSE
        AND JSON_EXTRACT(n.data, '$.type_document') = 'assurance'
    );
  
  -- ========================================
  -- NOTIFICATIONS DOCUMENTS - CARTE GRISE
  -- ========================================
  INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
  SELECT 
    'document',
    materiel_id,
    CONCAT('Carte Grise - ', designation),
    CONCAT('La carte grise expire le ', DATE_FORMAT(date_expiration_carte_grise, '%d/%m/%Y')),
    priorite_carte_grise,
    JSON_OBJECT(
      'type_document', 'carte_grise',
      'date_expiration', date_expiration_carte_grise,
      'jours_restants', DATEDIFF(date_expiration_carte_grise, CURDATE())
    )
  FROM vue_notifications_documents
  WHERE date_expiration_carte_grise <= DATE_ADD(CURDATE(), INTERVAL 60 DAY)
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.materiel_id = vue_notifications_documents.materiel_id
        AND n.type = 'document'
        AND n.lu = FALSE
        AND JSON_EXTRACT(n.data, '$.type_document') = 'carte_grise'
    );
  
  -- ========================================
  -- NOTIFICATIONS MAINTENANCE PRÉVENTIVE
  -- ========================================
  -- Maintenance préventive planifiée (à venir dans les 30 jours)
  INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
  SELECT 
    'maintenance_preventive',
    mp.materiel_id,
    CONCAT('Maintenance préventive - ', m.designation),
    CONCAT('Opération "', mp.nom_operation, '" planifiée le ', DATE_FORMAT(mp.date_planifiee, '%d/%m/%Y')),
    CASE 
      WHEN mp.priorite = 'Haute' THEN 'Attention'
      WHEN mp.priorite = 'Moyenne' THEN 'Info'
      ELSE 'Info'
    END,
    JSON_OBJECT(
      'id_maintenance_preventive', mp.id_maintenance_preventive,
      'nom_operation', mp.nom_operation,
      'date_planifiee', mp.date_planifiee,
      'priorite', mp.priorite,
      'statut', mp.statut,
      'jours_restants', DATEDIFF(mp.date_planifiee, CURDATE())
    )
  FROM maintenance_preventive mp
  JOIN materiel m ON mp.materiel_id = m.id
  WHERE mp.statut = 'Planifiée'
    AND mp.date_planifiee <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    AND mp.date_planifiee >= CURDATE()
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.materiel_id = mp.materiel_id
        AND n.type = 'maintenance_preventive'
        AND n.lu = FALSE
        AND JSON_EXTRACT(n.data, '$.id_maintenance_preventive') = mp.id_maintenance_preventive
    );
  
  -- Maintenance préventive en retard
  INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
  SELECT 
    'maintenance_preventive',
    mp.materiel_id,
    CONCAT('Maintenance préventive en retard - ', m.designation),
    CONCAT('Opération "', mp.nom_operation, '" devait être réalisée le ', DATE_FORMAT(mp.date_planifiee, '%d/%m/%Y')),
    'Urgent',
    JSON_OBJECT(
      'id_maintenance_preventive', mp.id_maintenance_preventive,
      'nom_operation', mp.nom_operation,
      'date_planifiee', mp.date_planifiee,
      'priorite', mp.priorite,
      'statut', mp.statut,
      'jours_retard', DATEDIFF(CURDATE(), mp.date_planifiee)
    )
  FROM maintenance_preventive mp
  JOIN materiel m ON mp.materiel_id = m.id
  WHERE mp.statut = 'Planifiée'
    AND mp.date_planifiee < CURDATE()
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.materiel_id = mp.materiel_id
        AND n.type = 'maintenance_preventive'
        AND n.lu = FALSE
        AND JSON_EXTRACT(n.data, '$.id_maintenance_preventive') = mp.id_maintenance_preventive
    );
  
  -- ========================================
  -- NOTIFICATIONS MAINTENANCE CURATIVE
  -- ========================================
  -- Maintenance curative immédiate en attente
  INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
  SELECT 
    'maintenance_curative',
    mc.materiel_id,
    CONCAT('Panne immédiate - ', m.designation),
    CONCAT('Panne signalée le ', DATE_FORMAT(mc.date_signalement, '%d/%m/%Y'), ' : ', LEFT(mc.description_signalement, 100)),
    CASE 
      WHEN DATEDIFF(CURDATE(), mc.date_signalement) > 3 THEN 'Urgent'
      WHEN DATEDIFF(CURDATE(), mc.date_signalement) > 1 THEN 'Attention'
      ELSE 'Urgent'
    END,
    JSON_OBJECT(
      'id_maintenance_curative', mc.id_maintenance_curative,
      'categorie', mc.categorie,
      'statut', mc.statut,
      'date_signalement', mc.date_signalement,
      'jours_attente', DATEDIFF(CURDATE(), mc.date_signalement),
      'description', mc.description_signalement
    )
  FROM maintenance_curative mc
  JOIN materiel m ON mc.materiel_id = m.id
  WHERE mc.categorie = 'Immédiate'
    AND mc.statut IN ('En attente', 'En cours')
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.materiel_id = mc.materiel_id
        AND n.type = 'maintenance_curative'
        AND n.lu = FALSE
        AND JSON_EXTRACT(n.data, '$.id_maintenance_curative') = mc.id_maintenance_curative
    );
  
  -- Maintenance curative différée en attente longue
  INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
  SELECT 
    'maintenance_curative',
    mc.materiel_id,
    CONCAT('Maintenance différée - ', m.designation),
    CONCAT('Panne signalée le ', DATE_FORMAT(mc.date_signalement, '%d/%m/%Y'), ' (', DATEDIFF(CURDATE(), mc.date_signalement), ' jours d\'attente)'),
    CASE 
      WHEN DATEDIFF(CURDATE(), mc.date_signalement) > 14 THEN 'Attention'
      ELSE 'Info'
    END,
    JSON_OBJECT(
      'id_maintenance_curative', mc.id_maintenance_curative,
      'categorie', mc.categorie,
      'statut', mc.statut,
      'date_signalement', mc.date_signalement,
      'jours_attente', DATEDIFF(CURDATE(), mc.date_signalement),
      'description', mc.description_signalement
    )
  FROM maintenance_curative mc
  JOIN materiel m ON mc.materiel_id = m.id
  WHERE mc.categorie = 'Différée'
    AND mc.statut IN ('En attente', 'En cours')
    AND DATEDIFF(CURDATE(), mc.date_signalement) > 7
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.materiel_id = mc.materiel_id
        AND n.type = 'maintenance_curative'
        AND n.lu = FALSE
        AND JSON_EXTRACT(n.data, '$.id_maintenance_curative') = mc.id_maintenance_curative
    );
  
  -- ========================================
  -- NOTIFICATIONS LOCATION NON FACTURÉE
  -- ========================================
  INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
  SELECT 
    'location',
    m.id,
    CONCAT('Location non facturée - ', m.designation),
    CONCAT('Location du ', DATE_FORMAT(a.date_utilise, '%d/%m/%Y'), ' (', a.lot, ') non facturée'),
    CASE 
      WHEN DATEDIFF(CURDATE(), a.date_utilise) > 15 THEN 'Urgent'
      WHEN DATEDIFF(CURDATE(), a.date_utilise) > 7 THEN 'Attention'
      ELSE 'Info'
    END,
    JSON_OBJECT(
      'id_attachement', a.id,
      'lot', a.lot,
      'date_utilise', a.date_utilise,
      'jours_non_factures', DATEDIFF(CURDATE(), a.date_utilise)
    )
  FROM attachement a
  JOIN materiel m ON a.materiel_id = m.id
  WHERE a.facture = FALSE 
    AND a.date_utilise < CURDATE()
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.materiel_id = m.id
        AND n.type = 'location'
        AND n.lu = FALSE
        AND JSON_EXTRACT(n.data, '$.id_attachement') = a.id
    );
END$$
DELIMITER ;

-- ========================================
-- 2. TRIGGERS POUR ATTACHEMENT
-- ========================================

-- Trigger INSERT attachement
DROP TRIGGER IF EXISTS after_insert_attachement;
DELIMITER $$
CREATE TRIGGER `after_insert_attachement` AFTER INSERT ON `attachement` FOR EACH ROW 
BEGIN
  DECLARE mat_designation VARCHAR(255);
  DECLARE jours_diff INT;
  
  SELECT designation INTO mat_designation 
  FROM materiel 
  WHERE id = NEW.materiel_id;
  
  SET jours_diff = DATEDIFF(CURDATE(), NEW.date_utilise);
  
  -- Créer notification si non facturé et date passée
  IF NEW.facture = FALSE AND NEW.date_utilise < CURDATE() THEN
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    VALUES (
      'location',
      NEW.materiel_id,
      CONCAT('Location non facturée - ', mat_designation),
      CONCAT('Location du ', DATE_FORMAT(NEW.date_utilise, '%d/%m/%Y'), ' (', NEW.lot, ') non facturée'),
      CASE 
        WHEN jours_diff > 15 THEN 'Urgent'
        WHEN jours_diff > 7 THEN 'Attention'
        ELSE 'Info'
      END,
      JSON_OBJECT(
        'id_attachement', NEW.id,
        'lot', NEW.lot,
        'date_utilise', NEW.date_utilise,
        'jours_non_factures', jours_diff
      )
    );
  END IF;
END$$
DELIMITER ;

-- Trigger UPDATE attachement (pour facturation)
DROP TRIGGER IF EXISTS after_update_attachement;
DELIMITER $$
CREATE TRIGGER `after_update_attachement` AFTER UPDATE ON `attachement` FOR EACH ROW 
BEGIN
  -- Supprimer la notification si l'attachement est facturé
  IF NEW.facture = TRUE AND OLD.facture = FALSE THEN
    DELETE FROM notifications 
    WHERE type = 'location'
      AND materiel_id = NEW.materiel_id
      AND JSON_EXTRACT(data, '$.id_attachement') = NEW.id
      AND lu = FALSE;
  END IF;
END$$
DELIMITER ;

-- Trigger INSERT attachement pour seuils
DROP TRIGGER IF EXISTS after_insert_attachement_seuils;
DELIMITER $$
CREATE TRIGGER `after_insert_attachement_seuils` AFTER INSERT ON `attachement` FOR EACH ROW 
BEGIN
  DECLARE mat_designation VARCHAR(255);
  DECLARE total_heures INT DEFAULT 0;
  DECLARE total_km INT DEFAULT 0;
  
  SELECT designation INTO mat_designation 
  FROM materiel 
  WHERE id = NEW.materiel_id;
  
  -- Calculer le total des heures si heure_fin est renseignée
  IF NEW.heure_fin IS NOT NULL AND NEW.heure_debut IS NOT NULL THEN
    SELECT COALESCE(SUM(heure_fin - heure_debut), 0) INTO total_heures
    FROM attachement
    WHERE materiel_id = NEW.materiel_id
      AND heure_debut IS NOT NULL
      AND heure_fin IS NOT NULL;
    
    -- Vérifier les maintenances préventives planifiées avec seuils d'heures
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    SELECT 
      'seuil_maintenance',
      NEW.materiel_id,
      CONCAT('⚠️ Seuil d''heures atteint - ', mat_designation),
      CONCAT('Maintenance "', mp.nom_operation, '" : ', total_heures, 'h atteintes sur ', mp.heures_fonctionnement_cible, 'h cible (', ROUND((total_heures / mp.heures_fonctionnement_cible) * 100, 0), '%)'),
      CASE 
        WHEN total_heures >= mp.heures_fonctionnement_cible * 1.2 THEN 'Urgent'
        WHEN total_heures >= mp.heures_fonctionnement_cible * 1.1 THEN 'Urgent'
        WHEN total_heures >= mp.heures_fonctionnement_cible THEN 'Attention'
        ELSE 'Info'
      END,
      JSON_OBJECT(
        'id_maintenance_preventive', mp.id_maintenance_preventive,
        'nom_operation', mp.nom_operation,
        'type_seuil', 'heures',
        'valeur_actuelle', total_heures,
        'valeur_cible', mp.heures_fonctionnement_cible,
        'pourcentage', ROUND((total_heures / mp.heures_fonctionnement_cible) * 100, 1),
        'depassement', total_heures - mp.heures_fonctionnement_cible,
        'date_planifiee', mp.date_planifiee,
        'priorite_maintenance', mp.priorite
      )
    FROM maintenance_preventive mp
    WHERE mp.materiel_id = NEW.materiel_id
      AND mp.statut = 'Planifiée'
      AND mp.heures_fonctionnement_cible IS NOT NULL
      AND total_heures >= mp.heures_fonctionnement_cible
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.type = 'seuil_maintenance'
          AND n.materiel_id = NEW.materiel_id
          AND JSON_EXTRACT(n.data, '$.id_maintenance_preventive') = mp.id_maintenance_preventive
          AND JSON_EXTRACT(n.data, '$.type_seuil') = 'heures'
          AND n.lu = FALSE
      );
  END IF;
  
  -- Calculer le total des km si km_fin est renseigné
  IF NEW.km_fin IS NOT NULL AND NEW.km_debut IS NOT NULL THEN
    SELECT COALESCE(SUM(km_fin - km_debut), 0) INTO total_km
    FROM attachement
    WHERE materiel_id = NEW.materiel_id
      AND km_debut IS NOT NULL
      AND km_fin IS NOT NULL;
    
    -- Vérifier les maintenances préventives planifiées avec seuils de km
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    SELECT 
      'seuil_maintenance',
      NEW.materiel_id,
      CONCAT('⚠️ Seuil de km atteint - ', mat_designation),
      CONCAT('Maintenance "', mp.nom_operation, '" : ', total_km, 'km atteints sur ', mp.km_fonctionnement_cible, 'km cible (', ROUND((total_km / mp.km_fonctionnement_cible) * 100, 0), '%)'),
      CASE 
        WHEN total_km >= mp.km_fonctionnement_cible * 1.2 THEN 'Urgent'
        WHEN total_km >= mp.km_fonctionnement_cible * 1.1 THEN 'Urgent'
        WHEN total_km >= mp.km_fonctionnement_cible THEN 'Attention'
        ELSE 'Info'
      END,
      JSON_OBJECT(
        'id_maintenance_preventive', mp.id_maintenance_preventive,
        'nom_operation', mp.nom_operation,
        'type_seuil', 'kilometres',
        'valeur_actuelle', total_km,
        'valeur_cible', mp.km_fonctionnement_cible,
        'pourcentage', ROUND((total_km / mp.km_fonctionnement_cible) * 100, 1),
        'depassement', total_km - mp.km_fonctionnement_cible,
        'date_planifiee', mp.date_planifiee,
        'priorite_maintenance', mp.priorite
      )
    FROM maintenance_preventive mp
    WHERE mp.materiel_id = NEW.materiel_id
      AND mp.statut = 'Planifiée'
      AND mp.km_fonctionnement_cible IS NOT NULL
      AND total_km >= mp.km_fonctionnement_cible
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.type = 'seuil_maintenance'
          AND n.materiel_id = NEW.materiel_id
          AND JSON_EXTRACT(n.data, '$.id_maintenance_preventive') = mp.id_maintenance_preventive
          AND JSON_EXTRACT(n.data, '$.type_seuil') = 'kilometres'
          AND n.lu = FALSE
      );
  END IF;
END$$
DELIMITER ;

-- Trigger UPDATE attachement pour seuils
DROP TRIGGER IF EXISTS after_update_attachement_seuils;
DELIMITER $$
CREATE TRIGGER `after_update_attachement_seuils` AFTER UPDATE ON `attachement` FOR EACH ROW 
BEGIN
  DECLARE mat_designation VARCHAR(255);
  DECLARE total_heures INT DEFAULT 0;
  DECLARE total_km INT DEFAULT 0;
  DECLARE heures_changed BOOLEAN DEFAULT FALSE;
  DECLARE km_changed BOOLEAN DEFAULT FALSE;
  
  -- Détecter si les heures ont changé
  SET heures_changed = (
    (OLD.heure_fin IS NULL AND NEW.heure_fin IS NOT NULL) OR
    (OLD.heure_fin IS NOT NULL AND NEW.heure_fin IS NOT NULL AND OLD.heure_fin <> NEW.heure_fin) OR
    (OLD.heure_debut IS NOT NULL AND NEW.heure_debut IS NOT NULL AND OLD.heure_debut <> NEW.heure_debut)
  );
  
  -- Détecter si les km ont changé
  SET km_changed = (
    (OLD.km_fin IS NULL AND NEW.km_fin IS NOT NULL) OR
    (OLD.km_fin IS NOT NULL AND NEW.km_fin IS NOT NULL AND OLD.km_fin <> NEW.km_fin) OR
    (OLD.km_debut IS NOT NULL AND NEW.km_debut IS NOT NULL AND OLD.km_debut <> NEW.km_debut)
  );
  
  IF heures_changed OR km_changed THEN
    SELECT designation INTO mat_designation 
    FROM materiel 
    WHERE id = NEW.materiel_id;
    
    -- ===== GESTION DES HEURES =====
    IF heures_changed AND NEW.heure_fin IS NOT NULL AND NEW.heure_debut IS NOT NULL THEN
      SELECT COALESCE(SUM(heure_fin - heure_debut), 0) INTO total_heures
      FROM attachement
      WHERE materiel_id = NEW.materiel_id
        AND heure_debut IS NOT NULL
        AND heure_fin IS NOT NULL;
      
      DELETE FROM notifications 
      WHERE type = 'seuil_maintenance'
        AND materiel_id = NEW.materiel_id
        AND JSON_EXTRACT(data, '$.type_seuil') = 'heures'
        AND lu = FALSE;
      
      INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
      SELECT 
        'seuil_maintenance',
        NEW.materiel_id,
        CONCAT('⚠️ Seuil d''heures atteint - ', mat_designation),
        CONCAT('Maintenance "', mp.nom_operation, '" : ', total_heures, 'h atteintes sur ', mp.heures_fonctionnement_cible, 'h cible (', ROUND((total_heures / mp.heures_fonctionnement_cible) * 100, 0), '%)'),
        CASE 
          WHEN total_heures >= mp.heures_fonctionnement_cible * 1.2 THEN 'Urgent'
          WHEN total_heures >= mp.heures_fonctionnement_cible * 1.1 THEN 'Urgent'
          WHEN total_heures >= mp.heures_fonctionnement_cible THEN 'Attention'
          ELSE 'Info'
        END,
        JSON_OBJECT(
          'id_maintenance_preventive', mp.id_maintenance_preventive,
          'nom_operation', mp.nom_operation,
          'type_seuil', 'heures',
          'valeur_actuelle', total_heures,
          'valeur_cible', mp.heures_fonctionnement_cible,
          'pourcentage', ROUND((total_heures / mp.heures_fonctionnement_cible) * 100, 1),
          'depassement', total_heures - mp.heures_fonctionnement_cible,
          'date_planifiee', mp.date_planifiee,
          'priorite_maintenance', mp.priorite
        )
      FROM maintenance_preventive mp
      WHERE mp.materiel_id = NEW.materiel_id
        AND mp.statut = 'Planifiée'
        AND mp.heures_fonctionnement_cible IS NOT NULL
        AND total_heures >= mp.heures_fonctionnement_cible;
    END IF;
    
    -- ===== GESTION DES KILOMÈTRES =====
    IF km_changed AND NEW.km_fin IS NOT NULL AND NEW.km_debut IS NOT NULL THEN
      SELECT COALESCE(SUM(km_fin - km_debut), 0) INTO total_km
      FROM attachement
      WHERE materiel_id = NEW.materiel_id
        AND km_debut IS NOT NULL
        AND km_fin IS NOT NULL;
      
      DELETE FROM notifications 
      WHERE type = 'seuil_maintenance'
        AND materiel_id = NEW.materiel_id
        AND JSON_EXTRACT(data, '$.type_seuil') = 'kilometres'
        AND lu = FALSE;
      
      INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
      SELECT 
        'seuil_maintenance',
        NEW.materiel_id,
        CONCAT('⚠️ Seuil de km atteint - ', mat_designation),
        CONCAT('Maintenance "', mp.nom_operation, '" : ', total_km, 'km atteints sur ', mp.km_fonctionnement_cible, 'km cible (', ROUND((total_km / mp.km_fonctionnement_cible) * 100, 0), '%)'),
        CASE 
          WHEN total_km >= mp.km_fonctionnement_cible * 1.2 THEN 'Urgent'
          WHEN total_km >= mp.km_fonctionnement_cible * 1.1 THEN 'Urgent'
          WHEN total_km >= mp.km_fonctionnement_cible THEN 'Attention'
          ELSE 'Info'
        END,
        JSON_OBJECT(
          'id_maintenance_preventive', mp.id_maintenance_preventive,
          'nom_operation', mp.nom_operation,
          'type_seuil', 'kilometres',
          'valeur_actuelle', total_km,
          'valeur_cible', mp.km_fonctionnement_cible,
          'pourcentage', ROUND((total_km / mp.km_fonctionnement_cible) * 100, 1),
          'depassement', total_km - mp.km_fonctionnement_cible,
          'date_planifiee', mp.date_planifiee,
          'priorite_maintenance', mp.priorite
        )
      FROM maintenance_preventive mp
      WHERE mp.materiel_id = NEW.materiel_id
        AND mp.statut = 'Planifiée'
        AND mp.km_fonctionnement_cible IS NOT NULL
        AND total_km >= mp.km_fonctionnement_cible;
    END IF;
  END IF;
END$$
DELIMITER ;

-- ========================================
-- 3. TRIGGERS POUR DOCUMENTS ADMINISTRATIFS
-- ========================================

DROP TRIGGER IF EXISTS after_insert_documents_administratifs;
DELIMITER $$
CREATE TRIGGER `after_insert_documents_administratifs` AFTER INSERT ON `documents_administratifs` FOR EACH ROW 
BEGIN
  DECLARE mat_designation VARCHAR(255);
  
  SELECT m.designation INTO mat_designation 
  FROM materiel m
  JOIN flotte f ON m.id = f.materiel_id
  WHERE f.id_flotte = NEW.flotte_id;
  
  -- Notification pour assurance (si expire dans 60 jours OU déjà expirée)
  IF NEW.date_expiration_assurance IS NOT NULL 
     AND NEW.date_expiration_assurance <= DATE_ADD(CURDATE(), INTERVAL 60 DAY) THEN
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    SELECT 
      'document',
      m.id,
      CONCAT('Assurance - ', m.designation),
      CASE 
        WHEN NEW.date_expiration_assurance < CURDATE() THEN 
          CONCAT('⚠️ ASSURANCE EXPIRÉE depuis le ', DATE_FORMAT(NEW.date_expiration_assurance, '%d/%m/%Y'))
        ELSE 
          CONCAT('L''assurance expire le ', DATE_FORMAT(NEW.date_expiration_assurance, '%d/%m/%Y'))
      END,
      CASE 
        WHEN NEW.date_expiration_assurance < CURDATE() THEN 'Urgent'
        WHEN NEW.date_expiration_assurance <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Urgent'
        WHEN NEW.date_expiration_assurance <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Attention'
        ELSE 'Info'
      END,
      JSON_OBJECT(
        'type_document', 'assurance',
        'date_expiration', NEW.date_expiration_assurance,
        'jours_restants', DATEDIFF(NEW.date_expiration_assurance, CURDATE()),
        'est_expire', IF(NEW.date_expiration_assurance < CURDATE(), true, false),
        'jours_retard', IF(NEW.date_expiration_assurance < CURDATE(), DATEDIFF(CURDATE(), NEW.date_expiration_assurance), 0),
        'id_document', NEW.id_document
      )
    FROM materiel m
    JOIN flotte f ON m.id = f.materiel_id
    WHERE f.id_flotte = NEW.flotte_id;
  END IF;
  
  -- Notification pour carte grise (si expire dans 60 jours OU déjà expirée)
  IF NEW.date_expiration_carte_grise IS NOT NULL 
     AND NEW.date_expiration_carte_grise <= DATE_ADD(CURDATE(), INTERVAL 60 DAY) THEN
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    SELECT 
      'document',
      m.id,
      CONCAT('Carte Grise - ', m.designation),
      CASE 
        WHEN NEW.date_expiration_carte_grise < CURDATE() THEN 
          CONCAT('⚠️ CARTE GRISE EXPIRÉE depuis le ', DATE_FORMAT(NEW.date_expiration_carte_grise, '%d/%m/%Y'))
        ELSE 
          CONCAT('La carte grise expire le ', DATE_FORMAT(NEW.date_expiration_carte_grise, '%d/%m/%Y'))
      END,
      CASE 
        WHEN NEW.date_expiration_carte_grise < CURDATE() THEN 'Urgent'
        WHEN NEW.date_expiration_carte_grise <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Urgent'
        WHEN NEW.date_expiration_carte_grise <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Attention'
        ELSE 'Info'
      END,
      JSON_OBJECT(
        'type_document', 'carte_grise',
        'date_expiration', NEW.date_expiration_carte_grise,
        'jours_restants', DATEDIFF(NEW.date_expiration_carte_grise, CURDATE()),
        'est_expire', IF(NEW.date_expiration_carte_grise < CURDATE(), true, false),
        'jours_retard', IF(NEW.date_expiration_carte_grise < CURDATE(), DATEDIFF(CURDATE(), NEW.date_expiration_carte_grise), 0),
        'id_document', NEW.id_document
      )
    FROM materiel m
    JOIN flotte f ON m.id = f.materiel_id
    WHERE f.id_flotte = NEW.flotte_id;
  END IF;
  
  -- Notification pour visite technique (si dans 60 jours OU en retard)
  IF NEW.date_prochaine_vt IS NOT NULL 
     AND NEW.date_prochaine_vt <= DATE_ADD(CURDATE(), INTERVAL 60 DAY) THEN
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    SELECT 
      'document',
      m.id,
      CONCAT('Visite Technique - ', m.designation),
      CASE 
        WHEN NEW.date_prochaine_vt < CURDATE() THEN 
          CONCAT('⚠️ VISITE TECHNIQUE EN RETARD depuis le ', DATE_FORMAT(NEW.date_prochaine_vt, '%d/%m/%Y'))
        ELSE 
          CONCAT('La prochaine visite technique est prévue le ', DATE_FORMAT(NEW.date_prochaine_vt, '%d/%m/%Y'))
      END,
      CASE 
        WHEN NEW.date_prochaine_vt < CURDATE() THEN 'Urgent'
        WHEN NEW.date_prochaine_vt <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Urgent'
        WHEN NEW.date_prochaine_vt <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Attention'
        ELSE 'Info'
      END,
      JSON_OBJECT(
        'type_document', 'visite_technique',
        'date_expiration', NEW.date_prochaine_vt,
        'jours_restants', DATEDIFF(NEW.date_prochaine_vt, CURDATE()),
        'est_en_retard', IF(NEW.date_prochaine_vt < CURDATE(), true, false),
        'jours_retard', IF(NEW.date_prochaine_vt < CURDATE(), DATEDIFF(CURDATE(), NEW.date_prochaine_vt), 0),
        'id_document', NEW.id_document
      )
    FROM materiel m
    JOIN flotte f ON m.id = f.materiel_id
    WHERE f.id_flotte = NEW.flotte_id;
  END IF;
  
  -- Notification pour date IPS (avec gestion des dates passées)
  IF NEW.date_ips IS NOT NULL 
     AND NEW.date_ips <= DATE_ADD(CURDATE(), INTERVAL 90 DAY) THEN
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    SELECT 
      'document',
      m.id,
      CONCAT('IPS - ', m.designation),
      CASE 
        WHEN NEW.date_ips < CURDATE() THEN 
          CONCAT('⚠️ DATE IPS DÉPASSÉE depuis le ', DATE_FORMAT(NEW.date_ips, '%d/%m/%Y'))
        ELSE 
          CONCAT('Date IPS prévue le ', DATE_FORMAT(NEW.date_ips, '%d/%m/%Y'))
      END,
      CASE 
        WHEN NEW.date_ips < CURDATE() THEN 'Urgent'
        WHEN NEW.date_ips <= DATE_ADD(CURDATE(), INTERVAL 15 DAY) THEN 'Attention'
        ELSE 'Info'
      END,
      JSON_OBJECT(
        'type_document', 'ips',
        'date_expiration', NEW.date_ips,
        'jours_restants', DATEDIFF(NEW.date_ips, CURDATE()),
        'est_depassee', IF(NEW.date_ips < CURDATE(), true, false),
        'jours_retard', IF(NEW.date_ips < CURDATE(), DATEDIFF(CURDATE(), NEW.date_ips), 0),
        'id_document', NEW.id_document
      )
    FROM materiel m
    JOIN flotte f ON m.id = f.materiel_id
    WHERE f.id_flotte = NEW.flotte_id;
  END IF;
END$
DELIMITER ;

-- ========================================
-- 4. TRIGGERS POUR MAINTENANCE CURATIVE
-- ========================================

DROP TRIGGER IF EXISTS after_insert_maintenance_curative;
DELIMITER $
CREATE TRIGGER `after_insert_maintenance_curative` AFTER INSERT ON `maintenance_curative` FOR EACH ROW 
BEGIN
  DECLARE mat_designation VARCHAR(255);
  DECLARE priorite_notif VARCHAR(20);
  
  SELECT designation INTO mat_designation 
  FROM materiel 
  WHERE id = NEW.materiel_id;
  
  IF NEW.categorie = 'Immédiate' THEN
    SET priorite_notif = 'Urgent';
  ELSE
    SET priorite_notif = 'Info';
  END IF;
  
  INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
  VALUES (
    'maintenance_curative',
    NEW.materiel_id,
    CONCAT(
      CASE WHEN NEW.categorie = 'Immédiate' THEN 'Panne immédiate - ' ELSE 'Maintenance différée - ' END,
      mat_designation
    ),
    CONCAT('Panne signalée le ', DATE_FORMAT(NEW.date_signalement, '%d/%m/%Y'), ' : ', LEFT(NEW.description_signalement, 100)),
    priorite_notif,
    JSON_OBJECT(
      'id_maintenance_curative', NEW.id_maintenance_curative,
      'categorie', NEW.categorie,
      'statut', NEW.statut,
      'date_signalement', NEW.date_signalement,
      'jours_attente', 0,
      'description', NEW.description_signalement
    )
  );
END$
DELIMITER ;

DROP TRIGGER IF EXISTS after_update_maintenance_curative;
DELIMITER $
CREATE TRIGGER `after_update_maintenance_curative` AFTER UPDATE ON `maintenance_curative` FOR EACH ROW 
BEGIN
  IF NEW.statut = 'Terminée' AND OLD.statut != 'Terminée' THEN
    DELETE FROM notifications 
    WHERE type = 'maintenance_curative'
      AND materiel_id = NEW.materiel_id
      AND JSON_EXTRACT(data, '$.id_maintenance_curative') = NEW.id_maintenance_curative
      AND lu = FALSE;
  END IF;
END$
DELIMITER ;

-- ========================================
-- 5. TRIGGERS POUR MAINTENANCE PRÉVENTIVE
-- ========================================

DROP TRIGGER IF EXISTS after_maintenance_preventive_insert;
DELIMITER $
CREATE TRIGGER `after_maintenance_preventive_insert` AFTER INSERT ON `maintenance_preventive` FOR EACH ROW 
BEGIN
  DECLARE designation_materiel VARCHAR(255);
  
  SELECT designation INTO designation_materiel
  FROM materiel
  WHERE id = NEW.materiel_id;
  
  -- Si la maintenance est planifiée dans les 30 jours
  IF NEW.statut = 'Planifiée' AND NEW.date_planifiee <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND NEW.date_planifiee >= CURDATE() THEN
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    VALUES (
      'maintenance_preventive',
      NEW.materiel_id,
      CONCAT('Maintenance préventive - ', designation_materiel),
      CONCAT('Opération "', NEW.nom_operation, '" planifiée le ', DATE_FORMAT(NEW.date_planifiee, '%d/%m/%Y')),
      CASE 
        WHEN NEW.priorite = 'Haute' THEN 'Attention'
        WHEN NEW.priorite = 'Moyenne' THEN 'Info'
        ELSE 'Info'
      END,
      JSON_OBJECT(
        'id_maintenance_preventive', NEW.id_maintenance_preventive,
        'nom_operation', NEW.nom_operation,
        'date_planifiee', NEW.date_planifiee,
        'priorite', NEW.priorite,
        'statut', NEW.statut,
        'jours_restants', DATEDIFF(NEW.date_planifiee, CURDATE())
      )
    );
  END IF;
  
  -- Si la maintenance est déjà en retard
  IF NEW.statut = 'Planifiée' AND NEW.date_planifiee < CURDATE() THEN
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    VALUES (
      'maintenance_preventive',
      NEW.materiel_id,
      CONCAT('Maintenance préventive en retard - ', designation_materiel),
      CONCAT('Opération "', NEW.nom_operation, '" devait être réalisée le ', DATE_FORMAT(NEW.date_planifiee, '%d/%m/%Y')),
      'Urgent',
      JSON_OBJECT(
        'id_maintenance_preventive', NEW.id_maintenance_preventive,
        'nom_operation', NEW.nom_operation,
        'date_planifiee', NEW.date_planifiee,
        'priorite', NEW.priorite,
        'statut', NEW.statut,
        'jours_retard', DATEDIFF(CURDATE(), NEW.date_planifiee)
      )
    );
  END IF;
END$
DELIMITER ;

DROP TRIGGER IF EXISTS after_maintenance_preventive_update;
DELIMITER $
CREATE TRIGGER `after_maintenance_preventive_update` AFTER UPDATE ON `maintenance_preventive` FOR EACH ROW 
BEGIN
  DECLARE designation_materiel VARCHAR(255);
  
  SELECT designation INTO designation_materiel
  FROM materiel
  WHERE id = NEW.materiel_id;
  
  -- Marquer les anciennes notifications comme lues si le statut change
  IF OLD.statut != NEW.statut AND NEW.statut IN ('En cours', 'Terminée') THEN
    UPDATE notifications
    SET lu = TRUE, date_lu = NOW()
    WHERE materiel_id = NEW.materiel_id
      AND type = 'maintenance_preventive'
      AND lu = FALSE
      AND JSON_EXTRACT(data, '$.id_maintenance_preventive') = NEW.id_maintenance_preventive;
  END IF;
  
  -- Si la date planifiée change et devient dans les 30 jours
  IF (OLD.date_planifiee != NEW.date_planifiee OR OLD.statut != NEW.statut) 
     AND NEW.statut = 'Planifiée' 
     AND NEW.date_planifiee <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
     AND NEW.date_planifiee >= CURDATE() THEN
    
    DELETE FROM notifications
    WHERE materiel_id = NEW.materiel_id
      AND type = 'maintenance_preventive'
      AND lu = FALSE
      AND JSON_EXTRACT(data, '$.id_maintenance_preventive') = NEW.id_maintenance_preventive;
    
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    VALUES (
      'maintenance_preventive',
      NEW.materiel_id,
      CONCAT('Maintenance préventive - ', designation_materiel),
      CONCAT('Opération "', NEW.nom_operation, '" planifiée le ', DATE_FORMAT(NEW.date_planifiee, '%d/%m/%Y')),
      CASE 
        WHEN NEW.priorite = 'Haute' THEN 'Attention'
        WHEN NEW.priorite = 'Moyenne' THEN 'Info'
        ELSE 'Info'
      END,
      JSON_OBJECT(
        'id_maintenance_preventive', NEW.id_maintenance_preventive,
        'nom_operation', NEW.nom_operation,
        'date_planifiee', NEW.date_planifiee,
        'priorite', NEW.priorite,
        'statut', NEW.statut,
        'jours_restants', DATEDIFF(NEW.date_planifiee, CURDATE())
      )
    );
  END IF;
  
  -- Si la maintenance devient en retard
  IF (OLD.date_planifiee != NEW.date_planifiee OR OLD.statut != NEW.statut)
     AND NEW.statut = 'Planifiée' 
     AND NEW.date_planifiee < CURDATE() THEN
    
    DELETE FROM notifications
    WHERE materiel_id = NEW.materiel_id
      AND type = 'maintenance_preventive'
      AND lu = FALSE
      AND JSON_EXTRACT(data, '$.id_maintenance_preventive') = NEW.id_maintenance_preventive;
    
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    VALUES (
      'maintenance_preventive',
      NEW.materiel_id,
      CONCAT('Maintenance préventive en retard - ', designation_materiel),
      CONCAT('Opération "', NEW.nom_operation, '" devait être réalisée le ', DATE_FORMAT(NEW.date_planifiee, '%d/%m/%Y')),
      'Urgent',
      JSON_OBJECT(
        'id_maintenance_preventive', NEW.id_maintenance_preventive,
        'nom_operation', NEW.nom_operation,
        'date_planifiee', NEW.date_planifiee,
        'priorite', NEW.priorite,
        'statut', NEW.statut,
        'jours_retard', DATEDIFF(CURDATE(), NEW.date_planifiee)
      )
    );
  END IF;
END$
DELIMITER ;

DROP TRIGGER IF EXISTS after_update_maintenance_preventive_seuils;
DELIMITER $
CREATE TRIGGER `after_update_maintenance_preventive_seuils` AFTER UPDATE ON `maintenance_preventive` FOR EACH ROW 
BEGIN
  IF NEW.statut = 'Terminée' AND OLD.statut != 'Terminée' THEN
    DELETE FROM notifications 
    WHERE type = 'seuil_maintenance'
      AND materiel_id = NEW.materiel_id
      AND JSON_EXTRACT(data, '$.id_maintenance_preventive') = NEW.id_maintenance_preventive
      AND lu = FALSE;
  END IF;
  
  IF NEW.statut = 'Planifiée' AND (
    (OLD.heures_fonctionnement_cible IS NULL AND NEW.heures_fonctionnement_cible IS NOT NULL)
    OR (OLD.heures_fonctionnement_cible IS NOT NULL AND NEW.heures_fonctionnement_cible IS NOT NULL 
        AND OLD.heures_fonctionnement_cible <> NEW.heures_fonctionnement_cible)
    OR (OLD.km_fonctionnement_cible IS NULL AND NEW.km_fonctionnement_cible IS NOT NULL)
    OR (OLD.km_fonctionnement_cible IS NOT NULL AND NEW.km_fonctionnement_cible IS NOT NULL 
        AND OLD.km_fonctionnement_cible <> NEW.km_fonctionnement_cible)
  ) THEN
    DELETE FROM notifications 
    WHERE type = 'seuil_maintenance'
      AND materiel_id = NEW.materiel_id
      AND JSON_EXTRACT(data, '$.id_maintenance_preventive') = NEW.id_maintenance_preventive
      AND lu = FALSE;
  END IF;
END$
DELIMITER ;

DROP TRIGGER IF EXISTS after_maintenance_preventive_delete;
DELIMITER $
CREATE TRIGGER `after_maintenance_preventive_delete` AFTER DELETE ON `maintenance_preventive` FOR EACH ROW 
BEGIN
  DELETE FROM notifications
  WHERE materiel_id = OLD.materiel_id
    AND type IN ('maintenance_preventive', 'seuil_maintenance')
    AND JSON_EXTRACT(data, '$.id_maintenance_preventive') = OLD.id_maintenance_preventive;
END$
DELIMITER ;

-- ========================================
-- 6. ÉVÉNEMENTS PLANIFIÉS
-- ========================================

-- Supprimer l'ancien événement horaire (redondant)
DROP EVENT IF EXISTS evt_generer_notifications;

-- Garder uniquement l'événement quotidien
DROP EVENT IF EXISTS generer_notifications_quotidien;

CREATE EVENT `generer_notifications_quotidien` 
ON SCHEDULE EVERY 1 DAY 
STARTS (CURDATE() + INTERVAL 1 DAY + INTERVAL 6 HOUR)
ON COMPLETION PRESERVE
ENABLE
COMMENT 'Génération quotidienne des notifications à 6h du matin'
DO CALL generer_notifications();

-- ========================================
-- 7. COMMANDES DE VÉRIFICATION
-- ========================================

-- Pour vérifier que tout est bien configuré :
-- SHOW TRIGGERS;
-- SHOW EVENTS;
-- SELECT * FROM notifications ORDER BY date_creation DESC LIMIT 10;