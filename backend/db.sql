Database: colass;

CREATE TABLE users (
  id_user INT AUTO_INCREMENT PRIMARY KEY,
  nom_user VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'visiteur') DEFAULT 'visiteur',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE materiel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  designation VARCHAR(100) NOT NULL,
  num_parc VARCHAR(10) NOT NULL,
  parc_colas VARCHAR(20) NOT NULL,
  serie VARCHAR(100) NOT NULL,
  modele VARCHAR(100) NOT NULL,
  cst VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attachement (
  id INT AUTO_INCREMENT PRIMARY KEY,
  materiel_id INT NOT NULL,
  lot ENUM('Lot 1', 'Lot 2', 'Lot 3', 'Cerc', 'HFF') NOT NULL,
  heure_debut INT,
  heure_fin INT,
  km_debut INT,
  km_fin INT,
  facture BOOLEAN DEFAULT FALSE,
  observation TEXT,
  date_utilise DATE NOT NULL,
  statut ENUM('En location', 'Attente Travail', 'En panne') DEFAULT 'Attente Travail',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Relation avec la table materiel
  CONSTRAINT fk_attachement_materiel
    FOREIGN KEY (materiel_id)
    REFERENCES materiel(id)
    ON DELETE CASCADE
);

-- ============================================
-- TABLE PRINCIPALE : FLOTTE (avec maintenance préventive intégrée)
-- ============================================
CREATE TABLE flotte (
  id_flotte INT AUTO_INCREMENT PRIMARY KEY,
  materiel_id INT NOT NULL,
  annee YEAR NOT NULL,
  
  -- Statut et identification
  suivi BOOLEAN DEFAULT TRUE,
  casier VARCHAR(25),
  numero_chassis VARCHAR(50),
  
  -- Maintenance Préventive - Dernier PM effectué
  date_dernier_pm DATE,
  heure_dernier_pm INT,
  km_dernier_pm INT,
  
  -- Maintenance Préventive - Prochain PM planifié
  heure_prochain_pm INT,
  km_prochain_pm INT,
  
  -- Type de maintenance
  type_pm VARCHAR(10),
  num_pm VARCHAR(10),
  
  -- Métadonnées
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Contraintes
  CONSTRAINT fk_flotte_materiel
    FOREIGN KEY (materiel_id)
    REFERENCES materiel(id)
    ON DELETE CASCADE,
  
  -- Un matériel ne peut avoir qu'un enregistrement actif par année
  UNIQUE KEY uk_materiel_annee (materiel_id, annee),
  
  -- Index pour optimiser les requêtes
  INDEX idx_heure_prochain_pm (heure_prochain_pm),
  INDEX idx_km_prochain_pm (km_prochain_pm)
);

-- ============================================
-- TABLE : DOCUMENTS_ADMINISTRATIFS
-- ============================================
CREATE TABLE documents_administratifs (
  id_document INT AUTO_INCREMENT PRIMARY KEY,
  flotte_id INT NOT NULL,
  
  -- Dates des documents
  date_ips DATE,
  date_derniere_vt DATE,
  date_prochaine_vt DATE,
  date_expiration_carte_grise DATE,
  date_expiration_assurance DATE,
  
  -- Métadonnées
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Contraintes
  CONSTRAINT fk_documents_flotte
    FOREIGN KEY (flotte_id)
    REFERENCES flotte(id_flotte)
    ON DELETE CASCADE,
  
  -- Index pour les alertes d'expiration
  INDEX idx_date_prochaine_vt (date_prochaine_vt),
  INDEX idx_date_expiration_carte_grise (date_expiration_carte_grise),
  INDEX idx_date_expiration_assurance (date_expiration_assurance)
);

-- ============================================
-- TABLE : OPERATEURS (Table de référence)
-- ============================================
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


-- ========================================
-- TABLE 1 : MAINTENANCE PRÉVENTIVE
-- ========================================
CREATE TABLE `maintenance_preventive` (
  `id_maintenance_preventive` int(11) NOT NULL AUTO_INCREMENT,
  `materiel_id` int(11) NOT NULL,
  
  -- Planification
  `nom_operation` varchar(255) NOT NULL,
  `date_planifiee` date NOT NULL,
  `heures_fonctionnement_cible` int(11) DEFAULT NULL,
  `km_fonctionnement_cible` int(11) DEFAULT NULL,
  
  -- Priorité et statut
  `priorite` enum('Basse', 'Moyenne', 'Haute') NOT NULL DEFAULT 'Moyenne',
  `statut` enum('Planifiée', 'En cours', 'Terminée') NOT NULL DEFAULT 'Planifiée',
  
  -- Exécution
  `date_debut_intervention` date DEFAULT NULL,
  `date_fin_intervention` date DEFAULT NULL,
  
  -- Détails de l'intervention
  `notes_intervention` text DEFAULT NULL,
  
  -- Coûts
  `cout_pieces` decimal(10,2) DEFAULT NULL,
  
  -- Traçabilité
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  
  PRIMARY KEY (`id_maintenance_preventive`),
  KEY `fk_mp_materiel` (`materiel_id`),
  KEY `idx_date_planifiee` (`date_planifiee`),
  KEY `idx_statut_mp` (`statut`),
  
  CONSTRAINT `fk_mp_materiel` FOREIGN KEY (`materiel_id`) REFERENCES `materiel` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ========================================
-- TABLE 2 : MAINTENANCE CURATIVE
-- ========================================
CREATE TABLE `maintenance_curative` (
  `id_maintenance_curative` int(11) NOT NULL AUTO_INCREMENT,
  `materiel_id` int(11) NOT NULL,
  
  -- Signalement de la panne
  `date_signalement` date NOT NULL,
  `description_signalement` text NOT NULL,
  
  -- Classification
  `categorie` enum('Immédiate', 'Différée') NOT NULL DEFAULT 'Immédiate',
  `statut` enum('En attente', 'En cours', 'Terminée') NOT NULL DEFAULT 'En attente',
  
  -- Intervention
  `date_debut_intervention` date DEFAULT NULL,
  `date_fin_intervention` date DEFAULT NULL,

  -- Diagnostic et réparation
  `pieces_remplacees` text DEFAULT NULL,
  `pieces_reparees` text DEFAULT NULL,
  
  -- Coûts
  `cout_pieces` decimal(10,2) DEFAULT NULL,
  
  -- Prévention future
  `notes_reparation` text DEFAULT NULL,
  
  -- Traçabilité
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  
  PRIMARY KEY (`id_maintenance_curative`),
  KEY `fk_mc_materiel` (`materiel_id`),
  KEY `idx_date_signalement` (`date_signalement`),
  KEY `idx_statut_mc` (`statut`),
  KEY `idx_categorie` (`categorie`),
  
  CONSTRAINT `fk_mc_materiel` FOREIGN KEY (`materiel_id`) REFERENCES `materiel` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- ========================================
-- TRIGGERS POUR NOTIFICATIONS AUTOMATIQUES
-- VERSION COMPLÈTE ET CORRIGÉE
-- ========================================

DELIMITER $$

-- ========================================
-- TRIGGER 1 : MAINTENANCE PRÉVENTIVE
-- ========================================
DROP TRIGGER IF EXISTS after_insert_maintenance_preventive$$
CREATE TRIGGER after_insert_maintenance_preventive
AFTER INSERT ON maintenance_preventive
FOR EACH ROW
BEGIN
  DECLARE mat_designation VARCHAR(255);
  
  -- Récupérer la désignation du matériel
  SELECT designation INTO mat_designation 
  FROM materiel 
  WHERE id = NEW.materiel_id;
  
  -- Créer notification si planifiée dans les 30 prochains jours
  IF NEW.statut = 'Planifiée' AND NEW.date_planifiee <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND NEW.date_planifiee >= CURDATE() THEN
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    VALUES (
      'maintenance_preventive',
      NEW.materiel_id,
      CONCAT('Maintenance préventive - ', mat_designation),
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
  
  -- Créer notification si en retard
  IF NEW.statut = 'Planifiée' AND NEW.date_planifiee < CURDATE() THEN
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    VALUES (
      'maintenance_preventive',
      NEW.materiel_id,
      CONCAT('Maintenance préventive en retard - ', mat_designation),
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
END$$

-- Trigger pour mise à jour maintenance préventive
DROP TRIGGER IF EXISTS after_update_maintenance_preventive$$
CREATE TRIGGER after_update_maintenance_preventive
AFTER UPDATE ON maintenance_preventive
FOR EACH ROW
BEGIN
  -- Supprimer les anciennes notifications si statut change à "Terminée"
  IF NEW.statut = 'Terminée' AND OLD.statut != 'Terminée' THEN
    DELETE FROM notifications 
    WHERE type = 'maintenance_preventive'
      AND materiel_id = NEW.materiel_id
      AND JSON_EXTRACT(data, '$.id_maintenance_preventive') = NEW.id_maintenance_preventive
      AND lu = FALSE;
  
  -- Recréer notification si date ou priorité change et statut = Planifiée
  ELSEIF NEW.statut = 'Planifiée' AND (OLD.date_planifiee != NEW.date_planifiee OR OLD.priorite != NEW.priorite) THEN
    -- Supprimer ancienne notification
    DELETE FROM notifications 
    WHERE type = 'maintenance_preventive'
      AND materiel_id = NEW.materiel_id
      AND JSON_EXTRACT(data, '$.id_maintenance_preventive') = NEW.id_maintenance_preventive
      AND lu = FALSE;
    
    -- Recréer avec nouvelles données
    CALL generer_notifications();
  END IF;
END$$

-- ========================================
-- TRIGGER 2 : MAINTENANCE CURATIVE
-- ========================================
DROP TRIGGER IF EXISTS after_insert_maintenance_curative$$
CREATE TRIGGER after_insert_maintenance_curative
AFTER INSERT ON maintenance_curative
FOR EACH ROW
BEGIN
  DECLARE mat_designation VARCHAR(255);
  DECLARE priorite_notif VARCHAR(20);
  
  SELECT designation INTO mat_designation 
  FROM materiel 
  WHERE id = NEW.materiel_id;
  
  -- Définir la priorité selon la catégorie
  IF NEW.categorie = 'Immédiate' THEN
    SET priorite_notif = 'Urgent';
  ELSE
    SET priorite_notif = 'Info';
  END IF;
  
  -- Créer notification immédiatement
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
END$$

-- Trigger pour mise à jour maintenance curative
DROP TRIGGER IF EXISTS after_update_maintenance_curative$$
CREATE TRIGGER after_update_maintenance_curative
AFTER UPDATE ON maintenance_curative
FOR EACH ROW
BEGIN
  -- Supprimer les notifications si statut change à "Terminée"
  IF NEW.statut = 'Terminée' AND OLD.statut != 'Terminée' THEN
    DELETE FROM notifications 
    WHERE type = 'maintenance_curative'
      AND materiel_id = NEW.materiel_id
      AND JSON_EXTRACT(data, '$.id_maintenance_curative') = NEW.id_maintenance_curative
      AND lu = FALSE;
  END IF;
END$$

-- ========================================
-- TRIGGER 3 : ATTACHEMENT (LOCATION)
-- ========================================
DROP TRIGGER IF EXISTS after_insert_attachement$$
CREATE TRIGGER after_insert_attachement
AFTER INSERT ON attachement
FOR EACH ROW
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

-- Trigger pour mise à jour attachement
DROP TRIGGER IF EXISTS after_update_attachement$$
CREATE TRIGGER after_update_attachement
AFTER UPDATE ON attachement
FOR EACH ROW
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

-- ========================================
-- TRIGGER 4 : DOCUMENTS ADMINISTRATIFS
-- ========================================
DROP TRIGGER IF EXISTS after_insert_documents_administratifs$$
CREATE TRIGGER after_insert_documents_administratifs
AFTER INSERT ON documents_administratifs
FOR EACH ROW
BEGIN
  DECLARE mat_designation VARCHAR(255);
  
  -- Récupérer la désignation via la table flotte
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
          CONCAT('L\'assurance expire le ', DATE_FORMAT(NEW.date_expiration_assurance, '%d/%m/%Y'))
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

-- Trigger pour mise à jour documents administratifs
DROP TRIGGER IF EXISTS after_update_documents_administratifs$$
CREATE TRIGGER after_update_documents_administratifs
AFTER UPDATE ON documents_administratifs
FOR EACH ROW
BEGIN
  -- Supprimer anciennes notifications de documents pour cette flotte
  DELETE FROM notifications 
  WHERE type = 'document'
    AND materiel_id IN (
      SELECT m.id 
      FROM materiel m 
      JOIN flotte f ON m.id = f.materiel_id 
      WHERE f.id_flotte = NEW.flotte_id
    )
    AND lu = FALSE
    AND JSON_EXTRACT(data, '$.id_document') = NEW.id_document;
  
  -- Recréer les notifications avec les nouvelles données
  -- Notification Assurance (avec gestion expiration)
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
          CONCAT('L\'assurance expire le ', DATE_FORMAT(NEW.date_expiration_assurance, '%d/%m/%Y'))
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
  
  -- Notification Carte Grise (avec gestion expiration)
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
  
  -- Notification Visite Technique (avec gestion retard)
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
  
  -- Notification IPS
  IF NEW.date_ips IS NOT NULL 
     AND NEW.date_ips <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)
     AND NEW.date_ips >= CURDATE() THEN
    INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
    SELECT 
      'document',
      m.id,
      CONCAT('IPS - ', m.designation),
      CONCAT('Date IPS prévue le ', DATE_FORMAT(NEW.date_ips, '%d/%m/%Y')),
      CASE 
        WHEN NEW.date_ips <= DATE_ADD(CURDATE(), INTERVAL 15 DAY) THEN 'Attention'
        ELSE 'Info'
      END,
      JSON_OBJECT(
        'type_document', 'ips',
        'date_expiration', NEW.date_ips,
        'jours_restants', DATEDIFF(NEW.date_ips, CURDATE()),
        'id_document', NEW.id_document
      )
    FROM materiel m
    JOIN flotte f ON m.id = f.materiel_id
    WHERE f.id_flotte = NEW.flotte_id;
  END IF;
END$

DELIMITER ;

-- ========================================
-- EVENT SCHEDULER : Génération quotidienne
-- ========================================
-- Activer l'event scheduler
SET GLOBAL event_scheduler = ON;

-- Créer un event pour régénérer les notifications chaque jour à 6h
DROP EVENT IF EXISTS generer_notifications_quotidien;

CREATE EVENT generer_notifications_quotidien
ON SCHEDULE EVERY 1 DAY
STARTS (CURDATE() + INTERVAL 1 DAY + INTERVAL 6 HOUR)
DO
  CALL generer_notifications();

