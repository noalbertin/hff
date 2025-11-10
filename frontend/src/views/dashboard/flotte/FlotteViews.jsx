import { useState, useEffect } from 'react'
import { Box, TextField, InputAdornment, IconButton, Chip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import TableView from '../../../components/ui-table/TableView'
import Breadcrumb from '../../../components/ui/Breadcrumb'

import api from '../../../utils/axios'
import { useNavigate } from 'react-router-dom'

const MaterielsViews = () => {
  const [materiels, setMateriels] = useState([])
  const [filteredMateriels, setFilteredMateriels] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  // Charger les matériels depuis le backend
  const fetchMateriels = async () => {
    try {
      const { data } = await api.get('tous')
      setMateriels(data)
      setFilteredMateriels(data)
    } catch (error) {
      console.error('Erreur lors du chargement des matériels:', error)
      setSnackbarMessage('Erreur lors du chargement des matériels')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  useEffect(() => {
    fetchMateriels()
  }, [])

  // Gestion du changement de recherche
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  // Fonction pour réinitialiser le champ
  const handleClearSearch = () => {
    setSearchTerm('')
  }

  // Fonction de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMateriels(materiels)
    } else {
      const searchLower = searchTerm.toLowerCase()

      const filtered = materiels.filter((mat) => {
        return (
          // Recherche matériel
          mat.num_parc?.toLowerCase().includes(searchLower) ||
          mat.parc_colas?.toLowerCase().includes(searchLower) ||
          mat.designation?.toLowerCase().includes(searchLower) ||
          mat.modele?.toLowerCase().includes(searchLower) ||
          mat.serie?.toLowerCase().includes(searchLower) ||
          mat.cst?.toLowerCase().includes(searchLower) ||
          // Recherche flotte
          mat.numero_chassis?.toLowerCase().includes(searchLower) ||
          mat.casier?.toLowerCase().includes(searchLower) ||
          mat.type_pm?.toLowerCase().includes(searchLower) ||
          mat.num_pm?.toLowerCase().includes(searchLower) ||
          // Recherche attachement
          mat.lot?.toLowerCase().includes(searchLower) ||
          mat.statut?.toLowerCase().includes(searchLower) ||
          // Recherche opérateurs
          mat.nom_operateur?.toLowerCase().includes(searchLower) ||
          mat.matricule_operateur?.toLowerCase().includes(searchLower) ||
          mat.nom_suppleant?.toLowerCase().includes(searchLower)
        )
      })

      setFilteredMateriels(filtered)
    }
  }, [searchTerm, materiels])

  // Fonction pour formater les dates
  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  // Fonction pour calculer et afficher le retard
  const renderRetard = (jours) => {
    if (jours === null || jours === undefined) return '-'

    if (jours < 0) {
      return (
        <Chip
          label={`Retard: ${Math.abs(jours)}j`}
          color="error"
          size="small"
        />
      )
    } else if (jours <= 30) {
      return <Chip label={`${jours}j restants`} color="warning" size="small" />
    } else {
      return <Chip label={`${jours}j restants`} color="success" size="small" />
    }
  }

  const handleView = (materiel) => {
    navigate(`/materiel/${materiel.id}`)
  }

  // Colonnes du tableau
  const columns = [
    // MATERIEL
    {
      id: 'num_parc',
      label: 'N° Parc',
      render: (row) => row.num_parc || '-',
    },
    {
      id: 'parc_colas',
      label: 'Parc Colas',
      render: (row) => row.parc_colas || '-',
    },
    {
      id: 'designation',
      label: 'Désignation',
      render: (row) => row.designation || '-',
    },
    {
      id: 'modele',
      label: 'Modèle',
      render: (row) => row.modele || '-',
    },
    {
      id: 'serie',
      label: 'Série',
      render: (row) => row.serie || '-',
    },
    {
      id: 'cst',
      label: 'CST',
      render: (row) => row.cst || '-',
    },

    // FLOTTE
    {
      id: 'annee',
      label: 'Année',
      render: (row) => row.annee || '-',
    },
    {
      id: 'suivi',
      label: 'Suivi',
      render: (row) => (
        <div className="d-flex align-items-center">
          <span
            className={`me-2 rounded-circle`}
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: row.suivi ? '#28a745' : '#dc3545',
            }}
          />
          <span
            className={
              row.suivi ? 'text-success fw-semibold' : 'text-danger fw-semibold'
            }
          >
            {row.suivi ? 'Oui' : 'Non'}
          </span>
        </div>
      ),
    },
    {
      id: 'casier',
      label: 'Casier',
      render: (row) => row.casier || '-',
    },
    {
      id: 'numero_chassis',
      label: 'Id',
      render: (row) => row.numero_chassis || '-',
    },
    {
      id: 'date_dernier_pm',
      label: 'Dernier PM',
      render: (row) => formatDate(row.date_dernier_pm),
    },
    {
      id: 'heure_dernier_pm',
      label: 'Heure Dernier PM',
      render: (row) =>
        row.heure_dernier_pm ? `${row.heure_dernier_pm}h` : '-',
    },
    {
      id: 'km_dernier_pm',
      label: 'Km Dernier PM',
      render: (row) => (row.km_dernier_pm ? `${row.km_dernier_pm} km` : '-'),
    },
    {
      id: 'heure_prochain_pm',
      label: 'Heure Prochain PM',
      render: (row) =>
        row.heure_prochain_pm ? `${row.heure_prochain_pm}h` : '-',
    },
    {
      id: 'km_prochain_pm',
      label: 'Km Prochain PM',
      render: (row) => (row.km_prochain_pm ? `${row.km_prochain_pm} km` : '-'),
    },
    {
      id: 'type_pm',
      label: 'Type PM',
      render: (row) => row.type_pm || '-',
    },
    {
      id: 'num_pm',
      label: 'N° PM',
      render: (row) => row.num_pm || '-',
    },

    // ATTACHEMENT
    {
      id: 'lot',
      label: 'Lot',
      render: (row) => row.lot || '-',
    },
    {
      id: 'heure_fin',
      label: 'Heure Fin',
      render: (row) => (row.heure_fin ? `${row.heure_fin}h` : '-'),
    },
    {
      id: 'km_fin',
      label: 'Km Fin',
      render: (row) => (row.km_fin ? `${row.km_fin} km` : '-'),
    },
    {
      id: 'facture',
      label: 'Facturé',
      render: (row) => (
        <div className="d-flex align-items-center">
          <span
            className={`me-2 rounded-circle`}
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: row.facture ? '#28a745' : '#dc3545',
            }}
          />
          <span
            className={
              row.facture
                ? 'text-success fw-semibold'
                : 'text-danger fw-semibold'
            }
          >
            {row.facture ? 'Oui' : 'Non'}
          </span>
        </div>
      ),
    },
    {
      id: 'observation',
      label: 'Observation',
      render: (row) => (
        <div
          style={{
            maxWidth: '250px',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {row.observation || '-'}
        </div>
      ),
    },
    {
      id: 'statut',
      label: 'Statut',
      render: (row) => {
        if (!row.statut) return '-'

        const textClass =
          row.statut === 'En location'
            ? 'text-success'
            : row.statut === 'En panne'
            ? 'text-danger'
            : 'text-warning'

        return (
          <span
            className={textClass}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '700',
              textAlign: 'center',
              minWidth: '80px',
            }}
          >
            {row.statut}
          </span>
        )
      },
    },

    {
      id: 'date_utilise',
      label: 'Date Utilisé',
      render: (row) => formatDate(row.date_utilise),
    },

    // DOCUMENTS ADMINISTRATIFS
    {
      id: 'date_ips',
      label: 'Date IPS',
      render: (row) => formatDate(row.date_ips),
    },
    {
      id: 'date_derniere_vt',
      label: 'Dernière VT',
      render: (row) => formatDate(row.date_derniere_vt),
    },
    {
      id: 'date_prochaine_vt',
      label: 'Prochaine VT',
      render: (row) => (
        <Box>
          <div>{formatDate(row.date_prochaine_vt)}</div>
          {renderRetard(row.jours_avant_vt)}
        </Box>
      ),
    },
    {
      id: 'date_expiration_carte_grise',
      label: 'Exp. Carte Grise',
      render: (row) => (
        <Box>
          <div>{formatDate(row.date_expiration_carte_grise)}</div>
          {renderRetard(row.jours_avant_carte_grise)}
        </Box>
      ),
    },
    {
      id: 'date_expiration_assurance',
      label: 'Exp. Assurance',
      render: (row) => (
        <Box>
          <div>{formatDate(row.date_expiration_assurance)}</div>
          {renderRetard(row.jours_avant_assurance)}
        </Box>
      ),
    },

    // OPERATEURS
    {
      id: 'matricule_operateur',
      label: 'Matricule Opérateur',
      render: (row) => row.matricule_operateur || '-',
    },
    {
      id: 'nom_operateur',
      label: 'Opérateur',
      render: (row) => row.nom_operateur || '-',
    },
    {
      id: 'telephone_operateur',
      label: 'Tél. Opérateur',
      render: (row) => row.telephone_operateur || '-',
    },
    {
      id: 'nom_suppleant',
      label: 'Suppléant',
      render: (row) => row.nom_suppleant || '-',
    },
    {
      id: 'telephone_suppleant',
      label: 'Tél. Suppléant',
      render: (row) => row.telephone_suppleant || '-',
    },
    {
      id: 'matricule_suppleant',
      label: 'Matricule Suppléant',
      render: (row) => row.matricule_suppleant || '-',
    },
  ]

  return (
    <>
      <Breadcrumb
        mainText="Listes"
        subText="Matériels"
        showCreateButton={false}
      />

      {/* Barre de recherche */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par N° parc, désignation, modèle, opérateur..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Tableau principal affichant les matériels */}
      <Box className="card">
        <TableView
          data={filteredMateriels}
          columns={columns}
          rowsPerPage={10}
          showCheckboxes={false}
          showActions={true} // ✅ Affiche la colonne Actions
          showViewIcon={true} // ✅ Affiche l'icône Voir
          showEditIcon={false} // ✅ Masque l'icône Edit
          showDeleteIcon={false} // ✅ Masque l'icône Delete
          onView={handleView}
        />
      </Box>
    </>
  )
}

export default MaterielsViews
