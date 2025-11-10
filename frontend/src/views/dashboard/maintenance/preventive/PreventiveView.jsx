import { useState, useEffect } from 'react'
import {
  Box,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import TableView from '../../../../components/ui-table/TableView'
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog'
import Breadcrumb from '../../../../components/ui/Breadcrumb'
import MaintenancePreventiveCreate from './PreventiveCreate'
import MaintenancePreventiveEdit from './PreventiveEdit'
import api from '../../../../utils/axios'
import { useAuthStore, selectUser } from '../../../../store/auth'

const PreventiveView = () => {
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

  // Colonnes du tableau - Ajoutez ces colonnes après 'parc_colas'
  // Colonnes du tableau - Version avec calculs de reste
  const columns = [
    {
      id: 'materiel',
      label: 'Matériel',
      render: (row) => row.materiel?.designation || row.designation || 'N/A',
    },
    {
      id: 'num_parc',
      label: 'N° Parc',
      render: (row) => row.materiel?.num_parc || row.num_parc || 'N/A',
    },
    {
      id: 'parc_colas',
      label: 'Parc Colas',
      render: (row) => row.materiel?.parc_colas || row.parc_colas || 'N/A',
    },
    {
      id: 'derniere_date_utilise',
      label: 'Dernière utilisation',
      render: (row) =>
        row.derniere_date_utilise
          ? new Date(row.derniere_date_utilise).toLocaleDateString('fr-FR')
          : '-',
    },
    {
      id: 'nom_operation',
      label: 'Opération',
      render: (row) => (
        <div
          style={{
            maxWidth: '250px',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {row.nom_operation || '-'}
        </div>
      ),
    },
    {
      id: 'date_planifiee',
      label: 'Date planifiée',
      render: (row) =>
        row.date_planifiee
          ? new Date(row.date_planifiee).toLocaleDateString('fr-FR')
          : 'N/A',
    },
    {
      id: 'priorite',
      label: 'Priorité',
      render: (row) => {
        const textColors = {
          Basse: '#2563eb',
          Moyenne: '#ca8a04',
          Haute: '#ff0000',
        }
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 12px',
              fontSize: '14px',
              fontWeight: '700',
              textAlign: 'center',
              minWidth: '90px',
              color: textColors[row.priorite] || '#374151',
              textTransform: 'capitalize',
            }}
          >
            {row.priorite || 'N/A'}
          </span>
        )
      },
    },
    {
      id: 'statut',
      label: 'Statut',
      render: (row) => {
        const textColors = {
          Planifiée: '#2563eb',
          'En cours': '#ca8a04',
          Terminée: '#16a34a',
        }

        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 12px',
              fontSize: '14px',
              fontWeight: '700',
              textAlign: 'center',
              minWidth: '90px',
              color: textColors[row.statut] || '#374151',
              textTransform: 'capitalize',
            }}
          >
            {row.statut || 'N/A'}
          </span>
        )
      },
    },
    {
      id: 'derniere_heure',
      label: 'Dernières heures',
      render: (row) => {
        if (row.derniere_heure !== null && row.derniere_heure !== undefined) {
          return `${parseInt(row.derniere_heure).toLocaleString('fr-FR')}h`
        }
        return '-'
      },
    },
    {
      id: 'heures_fonctionnement_cible',
      label: 'Heures cible',
      render: (row) => {
        if (
          row.heures_fonctionnement_cible != null &&
          row.derniere_heure != null
        ) {
          const reste = row.heures_fonctionnement_cible - row.derniere_heure

          let statut = 'En cours'
          let color = '#16a34a' // vert
          if (reste < 0) {
            statut = 'Dépassé'
            color = '#dc2626' // rouge
          } else if (reste < 100) {
            statut = 'Bientôt'
            color = '#ca8a04' // jaune
          }

          return (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700 }}>
                {row.heures_fonctionnement_cible.toLocaleString('fr-FR')}h
              </div>
              <div style={{ color, fontSize: '13px', fontWeight: 600 }}>
                {statut} ({reste > 0 ? '+' : ''}
                {reste.toLocaleString('fr-FR')}h)
              </div>
            </div>
          )
        }
        return '-'
      },
    },
    {
      id: 'dernier_km',
      label: 'Dernier KM',
      render: (row) => {
        if (row.dernier_km !== null && row.dernier_km !== undefined) {
          return `${parseInt(row.dernier_km).toLocaleString('fr-FR')} km`
        }
        return '-'
      },
    },
    {
      id: 'km_fonctionnement_cible',
      label: 'KM cible',
      render: (row) => {
        if (row.km_fonctionnement_cible != null && row.dernier_km != null) {
          const reste = row.km_fonctionnement_cible - row.dernier_km

          let statut = 'En cours'
          let color = '#16a34a' // vert
          if (reste < 0) {
            statut = 'Dépassé'
            color = '#dc2626' // rouge
          } else if (reste < 500) {
            statut = 'Bientôt'
            color = '#ca8a04' // jaune
          }

          return (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700 }}>
                {row.km_fonctionnement_cible.toLocaleString('fr-FR')} km
              </div>
              <div style={{ color, fontSize: '13px', fontWeight: 600 }}>
                {statut} ({reste > 0 ? '+' : ''}
                {reste.toLocaleString('fr-FR')} km)
              </div>
            </div>
          )
        }
        return '-'
      },
    },

    {
      id: 'date_intervention',
      label: 'Date Intervention',
      render: (row) => {
        if (row.date_debut_intervention && row.date_fin_intervention) {
          return `${new Date(row.date_debut_intervention).toLocaleDateString(
            'fr-FR'
          )} - ${new Date(row.date_fin_intervention).toLocaleDateString(
            'fr-FR'
          )}`
        } else if (row.date_debut_intervention) {
          return new Date(row.date_debut_intervention).toLocaleDateString(
            'fr-FR'
          )
        }
        return '-'
      },
    },
    {
      id: 'cout_pieces',
      label: 'Coût pièces',
      render: (row) =>
        row.cout_pieces
          ? `${parseFloat(row.cout_pieces).toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
            })} Ar`
          : '-',
    },
    {
      id: 'notes_intervention',
      label: 'Note',
      render: (row) => (
        <div
          style={{
            maxWidth: '250px',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {row.notes_intervention || '-'}
        </div>
      ),
    },
  ]

  // Récupérer toutes les maintenances préventives
  const fetchMaintenances = async () => {
    try {
      const response = await api.get('/preventive')
      console.log('Maintenances préventives récupérées :', response.data)
      setMaintenances(response.data)
      setFilteredMaintenances(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des maintenances:', error)
      setSnackbarMessage(
        'Erreur lors de la récupération des maintenances préventives'
      )
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Charger les maintenances au montage
  useEffect(() => {
    fetchMaintenances()
  }, [])

  // Filtrer les maintenances selon le terme de recherche
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredMaintenances(maintenances)
    } else {
      const filtered = maintenances.filter(
        (m) =>
          m.materiel?.designation
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          m.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.materiel?.num_parc
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          m.num_parc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.nom_operation?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMaintenances(filtered)
    }
  }, [searchTerm, maintenances])

  // Ouvrir le modal de création
  const handleCreate = () => {
    setSelectedMaintenance(null)
    setOpenCreateModal(true)
  }

  // Sauvegarder une nouvelle maintenance
  const handleSaveCreate = async (maintenance) => {
    try {
      const response = await api.post('/preventive', maintenance)
      console.log('Maintenance créée:', response.data)
      await fetchMaintenances()
      setOpenCreateModal(false)
      setSnackbarMessage('Maintenance préventive créée avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      setSnackbarMessage('Impossible de créer la maintenance préventive')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Ouvrir le modal d'édition
  const handleEdit = (maintenance) => {
    setSelectedMaintenance(maintenance)
    setOpenEditModal(true)
  }

  // Sauvegarder les modifications
  const handleSaveEdit = async (maintenance) => {
    try {
      const response = await api.put(
        `/preventive/${maintenance.id_maintenance_preventive}`,
        maintenance
      )
      console.log('Maintenance modifiée:', response.data)
      await fetchMaintenances()
      setOpenEditModal(false)
      setSnackbarMessage('Maintenance préventive modifiée avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      setSnackbarMessage('Impossible de modifier la maintenance préventive')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Ouvrir le dialogue de confirmation de suppression
  const handleDelete = (maintenance) => {
    setMaintenanceToDelete(maintenance)
    setOpenDialog(true)
  }

  // Confirmer et effectuer la suppression
  const confirmDelete = async () => {
    try {
      await api.delete(
        `/preventive/${maintenanceToDelete.id_maintenance_preventive}`
      )
      console.log(
        'Maintenance supprimée:',
        maintenanceToDelete.id_maintenance_preventive
      )
      await fetchMaintenances()
      setOpenDialog(false)
      setMaintenanceToDelete(null)
      setSnackbarMessage('Maintenance préventive supprimée avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setSnackbarMessage('Impossible de supprimer la maintenance préventive')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      setOpenDialog(false)
    }
  }

  // Gérer le changement de recherche
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  // Effacer la recherche
  const handleClearSearch = () => {
    setSearchTerm('')
  }

  return (
    <div>
      <Breadcrumb
        mainText="Maintenance"
        subText="Préventive"
        showCreateButton={true}
        onCreate={handleCreate}
      />

      {/* Barre de recherche */}
      <Box sx={{ mb: 3, mt: 2 }}>
        <TextField
          fullWidth
          placeholder="Rechercher par matériel, N° Parc ou opération..."
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

      {/* Tableau */}
      <TableView
        columns={columns}
        data={filteredMaintenances}
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

      {/* Modal de création */}
      <MaintenancePreventiveCreate
        isOpen={openCreateModal}
        onSave={handleSaveCreate}
        onClose={() => setOpenCreateModal(false)}
      />

      {/* Modal d'édition */}
      <MaintenancePreventiveEdit
        isOpen={openEditModal}
        maintenance={selectedMaintenance}
        onSave={handleSaveEdit}
        onClose={() => setOpenEditModal(false)}
      />

      {/* Dialogue de confirmation de suppression */}
      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmDelete}
        title="Suppression"
        content="Êtes-vous sûr de vouloir supprimer cette maintenance préventive ?"
      />

      {/* Snackbar pour les notifications */}
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
    </div>
  )
}

export default PreventiveView
