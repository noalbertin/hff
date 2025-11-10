-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 08 nov. 2025 à 13:19
-- Version du serveur : 10.4.28-MariaDB
-- Version de PHP : 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `colass`
--

DELIMITER $$
--
-- Procédures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `generer_notifications` ()   BEGIN
  -- Nettoyer les anciennes notifications lues (> 30 jours)
  DELETE FROM notifications 
  WHERE lu = TRUE 
    AND date_lu < DATE_SUB(CURDATE(), INTERVAL 30 DAY);
  
  -- Notifications Documents - Assurance
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
  
  -- Notifications Documents - Carte Grise
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
  
  -- Notifications Maintenance
  INSERT INTO notifications (type, materiel_id, titre, message, priorite, data)
  SELECT 
    'maintenance',
    materiel_id,
    CONCAT('Maintenance ', priorite, ' - ', designation),
    CONCAT('Panne signalée il y a ', jours_attente, ' jours : ', LEFT(description_probleme, 100)),
    CASE 
      WHEN priorite = 'Urgente' THEN 'Urgent'
      WHEN priorite = 'Haute' THEN 'Attention'
      ELSE 'Info'
    END,
    JSON_OBJECT(
      'id_maintenance', id_maintenance,
      'priorite', priorite,
      'statut', statut,
      'jours_attente', jours_attente
    )
  FROM vue_notifications_maintenance
  WHERE NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.materiel_id = vue_notifications_maintenance.materiel_id
      AND n.type = 'maintenance'
      AND n.lu = FALSE
      AND JSON_EXTRACT(n.data, '$.id_maintenance') = vue_notifications_maintenance.id_maintenance
  );
  
  -- Notifications Location non facturée
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

-- --------------------------------------------------------

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


-- --------------------------------------------------------

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


-- --------------------------------------------------------

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


-- --------------------------------------------------------

--
-- Structure de la table `maintenance`
--

CREATE TABLE `maintenance` (
  `id_maintenance` int(11) NOT NULL,
  `materiel_id` int(11) NOT NULL,
  `date_signalement` date NOT NULL,
  `description_probleme` text NOT NULL,
  `priorite` enum('Basse','Moyenne','Haute','Urgente') NOT NULL DEFAULT 'Moyenne',
  `statut` enum('En attente','En cours','Terminé') NOT NULL DEFAULT 'En attente',
  `date_debut_reparation` date DEFAULT NULL,
  `date_fin_reparation` date DEFAULT NULL,
  `cout_reparation` decimal(10,2) DEFAULT NULL,
  `notes_reparation` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

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
  `type` enum('document','pm','maintenance','location') NOT NULL,
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


-- --------------------------------------------------------

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
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id_user`, `nom_user`, `password`, `role`, `created_at`) VALUES
(1, 'Sylvano Albertin', '$2b$10$Pu0l.YRbKugxb1Fh7qYnI.pg1moWrOlKgXroYzRrR0ubIl9J6p71e', 'admin', '2025-11-04 16:53:32'),

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_notifications_documents`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_notifications_documents` (
`materiel_id` int(11)
,`designation` varchar(100)
,`date_expiration_assurance` date
,`date_expiration_carte_grise` date
,`date_prochaine_vt` date
,`priorite_assurance` varchar(9)
,`priorite_carte_grise` varchar(9)
,`priorite_vt` varchar(9)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_notifications_maintenance`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_notifications_maintenance` (
`materiel_id` int(11)
,`designation` varchar(100)
,`id_maintenance` int(11)
,`description_probleme` text
,`priorite` enum('Basse','Moyenne','Haute','Urgente')
,`statut` enum('En attente','En cours','Terminé')
,`date_signalement` date
,`jours_attente` int(7)
);

-- --------------------------------------------------------

--
-- Structure de la vue `vue_notifications_documents`
--
DROP TABLE IF EXISTS `vue_notifications_documents`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_notifications_documents`  AS SELECT `m`.`id` AS `materiel_id`, `m`.`designation` AS `designation`, `d`.`date_expiration_assurance` AS `date_expiration_assurance`, `d`.`date_expiration_carte_grise` AS `date_expiration_carte_grise`, `d`.`date_prochaine_vt` AS `date_prochaine_vt`, CASE WHEN `d`.`date_expiration_assurance` <= curdate() + interval 7 day THEN 'Urgent' WHEN `d`.`date_expiration_assurance` <= curdate() + interval 30 day THEN 'Attention' ELSE 'Info' END AS `priorite_assurance`, CASE WHEN `d`.`date_expiration_carte_grise` <= curdate() + interval 7 day THEN 'Urgent' WHEN `d`.`date_expiration_carte_grise` <= curdate() + interval 30 day THEN 'Attention' ELSE 'Info' END AS `priorite_carte_grise`, CASE WHEN `d`.`date_prochaine_vt` <= curdate() + interval 7 day THEN 'Urgent' WHEN `d`.`date_prochaine_vt` <= curdate() + interval 15 day THEN 'Attention' ELSE 'Info' END AS `priorite_vt` FROM ((`materiel` `m` join `flotte` `f` on(`m`.`id` = `f`.`materiel_id`)) join `documents_administratifs` `d` on(`f`.`id_flotte` = `d`.`flotte_id`)) WHERE `d`.`date_expiration_assurance` <= curdate() + interval 60 day OR `d`.`date_expiration_carte_grise` <= curdate() + interval 60 day OR `d`.`date_prochaine_vt` <= curdate() + interval 30 day ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_notifications_maintenance`
--
DROP TABLE IF EXISTS `vue_notifications_maintenance`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_notifications_maintenance`  AS SELECT `m`.`id` AS `materiel_id`, `m`.`designation` AS `designation`, `ma`.`id_maintenance` AS `id_maintenance`, `ma`.`description_probleme` AS `description_probleme`, `ma`.`priorite` AS `priorite`, `ma`.`statut` AS `statut`, `ma`.`date_signalement` AS `date_signalement`, to_days(curdate()) - to_days(`ma`.`date_signalement`) AS `jours_attente` FROM (`materiel` `m` join `maintenance` `ma` on(`m`.`id` = `ma`.`materiel_id`)) WHERE `ma`.`statut` in ('En attente','En cours') AND (`ma`.`priorite` in ('Urgente','Haute') OR to_days(curdate()) - to_days(`ma`.`date_signalement`) > 7) ;

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
-- Index pour la table `maintenance`
--
ALTER TABLE `maintenance`
  ADD PRIMARY KEY (`id_maintenance`),
  ADD KEY `fk_maintenance_materiel` (`materiel_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
-- AUTO_INCREMENT pour la table `maintenance`
--
ALTER TABLE `maintenance`
  MODIFY `id_maintenance` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `materiel`
--
ALTER TABLE `materiel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id_notification` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `operateurs`
--
ALTER TABLE `operateurs`
  MODIFY `id_operateur` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
-- Contraintes pour la table `maintenance`
--
ALTER TABLE `maintenance`
  ADD CONSTRAINT `fk_maintenance_materiel` FOREIGN KEY (`materiel_id`) REFERENCES `materiel` (`id`) ON DELETE CASCADE;

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

DELIMITER $$
--
-- Évènements
--
CREATE DEFINER=`root`@`localhost` EVENT `evt_generer_notifications` ON SCHEDULE EVERY 1 HOUR STARTS '2025-11-06 10:21:19' ON COMPLETION NOT PRESERVE ENABLE DO CALL generer_notifications()$$

DELIMITER ;
COMMIT;

