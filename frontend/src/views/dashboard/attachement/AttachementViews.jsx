import { useState, useEffect } from 'react'
import {
  Box,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import TableView from '../../../components/ui-table/TableView'
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import { useAuthStore, selectUser } from '../../../store/auth'

import AttachementEdit from './AttachementEdit'
import AttachementCreate from './AttachementCreate'
import api from '../../../utils/axios'
import dayjs from 'dayjs'

const AttachementViews = () => {
  const [attachements, setAttachements] = useState([])
  const [filteredAttachements, setFilteredAttachements] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAttachement, setSelectedAttachement] = useState(null)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [attachementToDelete, setAttachementToDelete] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const { role: userRole } = useAuthStore(selectUser)

  // Charger les attachements depuis le backend
  const fetchAttachements = async () => {
    try {
      const { data } = await api.get('attachement')
      setAttachements(data)
      setFilteredAttachements(data)
    } catch (error) {
      console.error('Erreur lors du chargement des attachements:', error)
      setSnackbarMessage('Erreur lors du chargement des attachements')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  useEffect(() => {
    fetchAttachements()
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
    if (searchTerm === '') {
      setFilteredAttachements(attachements)
    } else {
      const filtered = attachements.filter((attachement) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          attachement.materiel_designation
            ?.toLowerCase()
            .includes(searchLower) ||
          attachement.lot?.toLowerCase().includes(searchLower) ||
          attachement.statut?.toLowerCase().includes(searchLower) ||
          attachement.observation?.toLowerCase().includes(searchLower) ||
          attachement.materiel_num_parc?.toLowerCase().includes(searchLower) ||
          attachement.materiel_parc_colas
            ?.toLowerCase()
            .includes(searchLower) ||
          attachement.id?.toString().includes(searchLower)
        )
      })
      setFilteredAttachements(filtered)
    }
  }, [searchTerm, attachements])

  // Colonnes du tableau
  const columns = [
    // {/* id: 'id', label: 'Id' */},
    {
      id: 'materiel_designation',
      label: 'Matériel',
      render: (row) => row.materiel_designation || 'N/A',
    },
    {
      id: 'num_parc',
      label: 'Parc HFF',
      render: (row) => row.materiel_num_parc || 'N/A',
    },
    {
      id: 'parc_colas',
      label: 'Parc Colas',
      render: (row) => row.materiel_parc_colas || 'N/A',
    },
    { id: 'lot', label: 'Lot', render: (row) => row.lot },
    {
      id: 'date_utilise',
      label: 'Date',
      render: (row) => dayjs(row.date_utilise).format('DD/MM/YYYY'),
    },
    {
      id: 'heures',
      label: 'Heures',
      render: (row) => {
        if (row.heure_debut != null && row.heure_fin != null) {
          return `${row.heure_debut} - ${row.heure_fin}`
        }
        return '-'
      },
    },
    {
      id: 'kilometres',
      label: 'Km',
      render: (row) => {
        if (row.km_debut != null && row.km_fin != null) {
          return `${row.km_debut} - ${row.km_fin}`
        }
        return '-'
      },
    },
    {
      id: 'statut',
      label: 'Statut',
      render: (row) => (
        <span
          className={
            row.statut === 'En location'
              ? 'text-success'
              : row.statut === 'En panne'
              ? 'text-danger'
              : 'text-warning'
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 12px',
            fontSize: '14px',
            fontWeight: '700',
            textAlign: 'center',
            minWidth: '80px',
          }}
        >
          {row.statut}
        </span>
      ),
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
  ]

  // Ouvre le modal de création d'attachement
  const handleCreate = () => {
    setSelectedAttachement(null)
    setOpenCreateModal(true)
  }

  // Gère l'enregistrement d'un nouvel attachement
  const handleSaveCreate = async (attachement) => {
    try {
      // Les données sont déjà formatées dans AttachementCreate.jsx
      // Pas besoin de reformater ici
      const { data } = await api.post('attachement', attachement)
      console.log('Created:', data)
      await fetchAttachements()
      setOpenCreateModal(false)
      setSnackbarMessage('Attachement créé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error("Erreur lors de la création de l'attachement :", error)
      setSnackbarMessage("Impossible de créer l'attachement")
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Ouvre le modal d'édition
  const handleEdit = (row) => {
    setSelectedAttachement(row)
    setOpenEditModal(true)
  }

  // Gère l'enregistrement des modifications
  const handleSaveEdit = async (updatedAttachement) => {
    try {
      // Fonction helper pour convertir les valeurs numériques
      const parseNumericValue = (value) => {
        if (value === '' || value === null || value === undefined) {
          return null
        }
        const numValue = parseInt(value, 10)
        return isNaN(numValue) ? null : numValue
      }

      const dataToSend = {
        ...updatedAttachement,
        // Vérifier si date_utilise est un objet dayjs ou une string
        date_utilise: dayjs.isDayjs(updatedAttachement.date_utilise)
          ? updatedAttachement.date_utilise.format('YYYY-MM-DD')
          : dayjs(updatedAttachement.date_utilise).format('YYYY-MM-DD'),
        // Convertir les valeurs avec la fonction helper qui gère le 0
        heure_debut: parseNumericValue(updatedAttachement.heure_debut),
        heure_fin: parseNumericValue(updatedAttachement.heure_fin),
        km_debut: parseNumericValue(updatedAttachement.km_debut),
        km_fin: parseNumericValue(updatedAttachement.km_fin),
      }
      const { data } = await api.put(
        `attachement/${updatedAttachement.id}`,
        dataToSend
      )
      console.log('Edited:', data)
      await fetchAttachements()
      setOpenEditModal(false)
      setSnackbarMessage('Attachement modifié avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error("Erreur lors de la modification de l'attachement :", error)
      setSnackbarMessage("Impossible de modifier l'attachement")
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Ouvre le dialogue de confirmation pour la suppression
  const handleDelete = (row) => {
    setAttachementToDelete(row)
    setOpenDialog(true)
  }

  // Confirme la suppression
  const confirmDelete = async () => {
    try {
      await api.delete(`attachement/${attachementToDelete.id}`)
      console.log('Deleted:', attachementToDelete)
      await fetchAttachements()
      setOpenDialog(false)
      setSnackbarMessage('Attachement supprimé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error("Erreur lors de la suppression de l'attachement :", error)
      setOpenDialog(false)
      setSnackbarMessage("Impossible de supprimer l'attachement")
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  return (
    <>
      <Breadcrumb
        mainText="Listes"
        subText="Attachement"
        showCreateButton={true}
        onCreate={handleCreate}
      />

      {/* Barre de recherche */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par matériel, lot, statut, observation ou ID..."
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

      {/* Tableau principal affichant les attachements */}
      <Box className="card">
        <TableView
          data={filteredAttachements}
          columns={columns}
          rowsPerPage={10}
          onEdit={handleEdit}
          onDelete={handleDelete}
          userRole={userRole}
          showCheckboxes={false} // Masquer les checkboxes
          showActions={true} // Afficher la colonne Actions
          showEditIcon={true} // Afficher l'icône d'édition
          showDeleteIcon={true} // Afficher l'icône de suppression
          showViewIcon={false}
        />
      </Box>

      <AttachementCreate
        isOpen={openCreateModal}
        onSave={handleSaveCreate}
        onClose={() => setOpenCreateModal(false)}
      />

      <AttachementEdit
        isOpen={openEditModal}
        attachement={selectedAttachement}
        onChange={(updatedAttachement) =>
          setSelectedAttachement(updatedAttachement)
        }
        onSave={handleSaveEdit}
        onClose={() => setOpenEditModal(false)}
      />

      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmDelete}
        title="Suppression"
        content="Êtes-vous sûr de vouloir supprimer cet attachement?"
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default AttachementViews
