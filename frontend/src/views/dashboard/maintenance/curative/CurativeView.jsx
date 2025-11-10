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
import TableView from '../../../../components/ui-table/TableView'
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog'
import Breadcrumb from '../../../../components/ui/Breadcrumb'

import MaintenanceCurativeEdit from './CurativeEdit'
import MaintenanceCurativeCreate from './CurativeCreate'
import api from '../../../../utils/axios'
import { useAuthStore, selectUser } from '../../../../store/auth'

const CurativeViews = () => {
  const [maintenances, setMaintenances] = useState([])
  const [filteredMaintenances, setFilteredMaintenances] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMaintenance, setSelectedMaintenance] = useState(null)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [maintenanceToDelete, setMaintenanceToDelete] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const { role: userRole } = useAuthStore(selectUser)

  // Charger les maintenances curatives depuis le backend
  const fetchMaintenances = async () => {
    try {
      const { data } = await api.get('curative')
      setMaintenances(data)
      setFilteredMaintenances(data)
    } catch (error) {
      console.error(
        'Erreur lors du chargement des maintenances curatives:',
        error
      )
      setSnackbarMessage('Erreur lors du chargement des maintenances curatives')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  useEffect(() => {
    fetchMaintenances()
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
      setFilteredMaintenances(maintenances)
    } else {
      const searchLower = searchTerm.toLowerCase()

      const filtered = maintenances.filter((maintenance) => {
        return (
          maintenance.designation?.toLowerCase().includes(searchLower) ||
          maintenance.num_parc?.toLowerCase().includes(searchLower) ||
          maintenance.parc_colas?.toLowerCase().includes(searchLower) ||
          maintenance.description_signalement
            ?.toLowerCase()
            .includes(searchLower) ||
          maintenance.categorie?.toLowerCase().includes(searchLower) ||
          maintenance.statut?.toLowerCase().includes(searchLower) ||
          maintenance.pieces_remplacees?.toLowerCase().includes(searchLower) ||
          maintenance.pieces_reparees?.toLowerCase().includes(searchLower) ||
          maintenance.notes_reparation?.toLowerCase().includes(searchLower) ||
          maintenance.id_maintenance_curative?.toString().includes(searchLower)
        )
      })

      setFilteredMaintenances(filtered)
    }
  }, [searchTerm, maintenances])

  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  }

  // Fonction pour afficher le badge de catégorie
  const getCategoryBadge = (categorie) => {
    const styles = {
      Immédiate: {
        color: '#dc2626', // rouge
      },
      Différée: {
        color: '#ca8a04', // jaune foncé
      },
    }

    const { color } = styles[categorie] || {
      color: '#374151', // gris foncé
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 12px',
          fontSize: '14px',
          fontWeight: 800,
          minWidth: '100px',
          textTransform: 'capitalize',
          color,
        }}
      >
        {categorie || 'N/A'}
      </span>
    )
  }

  // Fonction pour afficher le badge de statut
  const getStatusBadge = (statut) => {
    const styles = {
      'En attente': {
        color: '#ca8a04', // jaune
      },
      'En cours': {
        color: '#2563eb', // bleu
      },
      Terminée: {
        color: '#16a34a', // vert
      },
    }

    const { color } = styles[statut] || {
      color: '#374151',
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 12px',
          fontSize: '14px',
          fontWeight: 800,
          minWidth: '110px',
          textTransform: 'capitalize',
          color,
        }}
      >
        {statut || 'N/A'}
      </span>
    )
  }

  // Colonnes du tableau
  const columns = [
    {
      id: 'designation',
      label: 'Matériel',
      render: (row) => row.designation || 'N/A',
    },
    {
      id: 'num_parc',
      label: 'N°Parc',
      render: (row) => row.num_parc || 'N/A',
    },
    {
      id: 'parc_colas',
      label: 'Parc Colas',
      render: (row) => row.parc_colas || 'N/A',
    },
    {
      id: 'date_signalement',
      label: 'Date Signalement',
      render: (row) => formatDate(row.date_signalement),
    },
    {
      id: 'description_signalement',
      label: 'Description',
      render: (row) => (
        <div
          style={{
            maxWidth: '250px',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {row.description_signalement}
        </div>
      ),
    },
    {
      id: 'categorie',
      label: 'Catégorie',
      render: (row) => getCategoryBadge(row.categorie),
    },
    {
      id: 'statut',
      label: 'Statut',
      render: (row) => getStatusBadge(row.statut),
    },
    {
      id: 'date_debut_intervention',
      label: 'Début Intervention',
      render: (row) => formatDate(row.date_debut_intervention),
    },
    {
      id: 'date_fin_intervention',
      label: 'Fin Intervention',
      render: (row) => formatDate(row.date_fin_intervention),
    },
    {
      id: 'cout_pieces',
      label: 'Coût Pièces (Ar)',
      render: (row) =>
        row.cout_pieces
          ? parseFloat(row.cout_pieces).toLocaleString('fr-FR')
          : '-',
    },
    {
      id: 'pieces_remplacees',
      label: 'Pièces Remplacées',
      render: (row) => (
        <div
          style={{
            maxWidth: '250px',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {row.pieces_remplacees || '-'}
        </div>
      ),
    },
    {
      id: 'pieces_reparees',
      label: 'Pièces Réparées',
      render: (row) => (
        <div
          style={{
            maxWidth: '250px',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {row.pieces_reparees || '-'}
        </div>
      ),
    },
    {
      id: 'notes_reparation',
      label: 'Notes Réparation',
      render: (row) => (
        <div
          style={{
            maxWidth: '250px',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {row.notes_reparation || '-'}
        </div>
      ),
    },
  ]

  // Ouvre le modal de création
  const handleCreate = () => {
    setSelectedMaintenance(null)
    setOpenCreateModal(true)
  }

  // Ouvre le modal d'édition
  const handleEdit = (row) => {
    console.log('🔍 Données sélectionnées pour édition:', row)
    setSelectedMaintenance(row)
    setOpenEditModal(true)
  }

  // Ouvre le dialogue de confirmation pour la suppression
  const handleDelete = (row) => {
    setMaintenanceToDelete(row)
    setOpenDialog(true)
  }

  // Gère l'enregistrement d'une nouvelle maintenance curative
  const handleSaveCreate = async (maintenance) => {
    try {
      const { data } = await api.post('curative', maintenance)
      console.log('Created:', data)
      await fetchMaintenances()
      setOpenCreateModal(false)
      setSnackbarMessage('Maintenance curative créée avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error(
        'Erreur lors de la création de la maintenance curative:',
        error
      )

      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Impossible de créer la maintenance curative'

      setSnackbarMessage(errorMessage)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Gère l'enregistrement des modifications
  const handleSaveEdit = async (updatedMaintenance) => {
    console.log('💾 Données reçues pour mise à jour:', updatedMaintenance)

    try {
      const { data } = await api.put(
        `curative/${updatedMaintenance.id_maintenance_curative}`,
        updatedMaintenance
      )
      console.log('Edited:', data)
      await fetchMaintenances()
      setOpenEditModal(false)
      setSnackbarMessage('Maintenance curative modifiée avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error(
        'Erreur lors de la modification de la maintenance curative:',
        error
      )
      setSnackbarMessage('Impossible de modifier la maintenance curative')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Confirme la suppression
  const confirmDelete = async () => {
    try {
      await api.delete(
        `curative/${maintenanceToDelete.id_maintenance_curative}`
      )
      console.log('Deleted:', maintenanceToDelete)
      await fetchMaintenances()
      setOpenDialog(false)
      setSnackbarMessage('Maintenance curative supprimée avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error(
        'Erreur lors de la suppression de la maintenance curative:',
        error
      )
      setOpenDialog(false)
      setSnackbarMessage('Impossible de supprimer la maintenance curative')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  return (
    <>
      <Breadcrumb
        mainText="Listes"
        subText="Maintenance Curative"
        showCreateButton={true}
        onCreate={handleCreate}
      />

      {/* Barre de recherche */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par matériel, description, catégorie, statut..."
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

      {/* Tableau principal affichant les maintenances curatives */}
      <Box className="card">
        <TableView
          data={filteredMaintenances}
          columns={columns}
          rowsPerPage={10}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showCheckboxes={false}
          userRole={userRole}
          showActions={true}
          showEditIcon={true}
          showDeleteIcon={true}
          showViewIcon={false}
        />
      </Box>

      <MaintenanceCurativeCreate
        isOpen={openCreateModal}
        onSave={handleSaveCreate}
        onClose={() => setOpenCreateModal(false)}
      />

      <MaintenanceCurativeEdit
        isOpen={openEditModal}
        maintenanceData={selectedMaintenance}
        onSave={handleSaveEdit}
        onClose={() => setOpenEditModal(false)}
      />

      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmDelete}
        title="Suppression"
        content="Êtes-vous sûr de vouloir supprimer cette maintenance curative ?"
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

export default CurativeViews
