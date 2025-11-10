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