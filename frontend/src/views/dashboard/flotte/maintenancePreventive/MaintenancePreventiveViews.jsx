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
import MaintenancePreventiveEdit from './MaintenancePreventiveEdit'
import MaintenancePreventiveCreate from './MaintenancePreventiveCreate'
import api from '../../../../utils/axios'
import dayjs from 'dayjs'
import { useAuthStore, selectUser } from '../../../../store/auth'

const MaintenancePreventiveViews = () => {
  const [flotte, setFlotte] = useState([])
  const [filteredFlotte, setFilteredFlotte] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFlotte, setSelectedFlotte] = useState(null)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [flotteToDelete, setFlotteToDelete] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const [flotteList, setFlotteList] = useState([])
  const { role: userRole } = useAuthStore(selectUser)

  // Charger les données de la flotte depuis le backend
  const fetchFlotte = async () => {
    try {
      const { data } = await api.get('flotte')
      setFlotte(data)
      setFilteredFlotte(data)
    } catch (error) {
      console.error('Erreur lors du chargement de la flotte:', error)
      setSnackbarMessage('Erreur lors du chargement de la flotte')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Charger la liste des flottes pour le dropdown
  const fetchFlotteList = async () => {
    try {
      const { data } = await api.get('materiel/sans-flotte') // Changez l'endpoint
      const options = data.map((item) => ({
        value: item.id, // L'ID du matériel
        label: `${item.designation || 'N/A'} - N°Parc: ${
          item.num_parc || 'N/A'
        } (Parc Colas: ${item.parc_colas || 'N/A'})  `,
      }))
      setFlotteList(options)
    } catch (error) {
      console.error('Erreur lors du chargement de la liste:', error)
    }
  }

  useEffect(() => {
    fetchFlotte()
    fetchFlotteList()
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
      setFilteredFlotte(flotte)
    } else {
      const searchLower = searchTerm.toLowerCase()
      const filtered = flotte.filter((item) => {
        return (
          item.numero_chassis?.toLowerCase().includes(searchLower) ||
          item.type_pm?.toLowerCase().includes(searchLower) ||
          item.heure_dernier_pm?.toString().includes(searchLower) ||
          item.km_dernier_pm?.toString().includes(searchLower) ||
          item.num_pm?.toLowerCase().includes(searchLower) ||
          item.materiel?.designation?.toLowerCase().includes(searchLower) ||
          item.materiel?.num_parc?.toLowerCase().includes(searchLower) ||
          item.materiel?.parc_colas?.toLowerCase().includes(searchLower) ||
          item.casier?.toLowerCase().includes(searchLower) ||
          item.id_flotte?.toString().includes(searchLower)
        )
      })
      setFilteredFlotte(filtered)
    }
  }, [searchTerm, flotte, setFilteredFlotte])

  // Colonnes du tableau
  const columns = [
    //  {/* id: 'id_flotte', label: 'ID' */},
    {
      id: 'materiel',
      label: 'Matériel',
      render: (row) => row.materiel?.designation || 'N/A',
    },
    {
      id: 'num_parc',
      label: 'N°Parc',
      render: (row) => row.materiel?.num_parc || 'N/A',
    },
    {
      id: 'parc_colas',
      label: 'Parc Colas',
      render: (row) => row.materiel?.parc_colas || 'N/A',
    },
    {
      id: 'annee',
      label: 'Année',
      render: (row) => row.annee || '-',
    },
    {
      id: 'casier',
      label: 'Casier',
      render: (row) => row.casier || '-',
    },

    {
      id: 'date_dernier_pm',
      label: 'Date Dernière PM',
      render: (row) =>
        row.date_dernier_pm
          ? dayjs(row.date_dernier_pm).format('DD/MM/YYYY')
          : '-',
    },
    {
      id: 'heure_dernier_pm',
      label: 'Heures Dernière PM',
      render: (row) =>
        row.heure_dernier_pm ? `${row.heure_dernier_pm} h` : '-',
    },
    {
      id: 'km_dernier_pm',
      label: 'Km Dernière PM',
      render: (row) => (row.km_dernier_pm ? `${row.km_dernier_pm} km` : '-'),
    },
    {
      id: 'heure_prochain_pm',
      label: 'Heures prochaine PM',
      render: (row) =>
        row.heure_prochain_pm ? `${row.heure_prochain_pm} h` : '-',
    },
    {
      id: 'km_prochain_pm',
      label: 'Km prochaine PM',
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
    {
      id: 'numero_chassis',
      label: 'Id',
      render: (row) => row.numero_chassis || '-',
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
  ]

  // Ouvre le modal de création
  const handleCreate = () => {
    setSelectedFlotte(null)
    setOpenCreateModal(true)
  }

  // Ouvre le modal d'édition
  const handleEdit = (row) => {
    console.log('Données passées à Edit:', row)
    setSelectedFlotte(row)
    setOpenEditModal(true)
  }

  // Ouvre le dialogue de confirmation pour la suppression
  const handleDelete = (row) => {
    setFlotteToDelete(row)
    setOpenDialog(true)
  }

  const handleSaveCreate = async (maintenance) => {
    try {
      // Renommez flotte_id en materiel_id
      const dataToSave = {
        ...maintenance,
        materiel_id: maintenance.flotte_id, // Le materiel_id vient de flotte_id du formulaire
      }
      delete dataToSave.flotte_id // Supprimez l'ancien champ

      // Créez d'abord une nouvelle entrée dans la table flotte
      const { data } = await api.post('flotte', dataToSave)
      console.log('Created:', data)
      await fetchFlotte()
      setOpenCreateModal(false)
      setSnackbarMessage('Maintenance préventive enregistrée avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error)
      setSnackbarMessage("Impossible d'enregistrer la maintenance")
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Gère l'enregistrement des modifications
  const handleSaveEdit = async (updatedMaintenance) => {
    try {
      const { data } = await api.put(
        `flotte/${updatedMaintenance.id_flotte}`,
        updatedMaintenance
      )
      console.log('Edited:', data)
      await fetchFlotte()
      setOpenEditModal(false)
      setSnackbarMessage('Flotte modifiée avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      setSnackbarMessage('Impossible de modifier la maintenance')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Confirme la suppression (efface les données de maintenance)
  const confirmDelete = async () => {
    try {
      // CORRECTION : Utiliser id_flotte au lieu de id
      await api.delete(`flotte/${flotteToDelete.id_flotte}`)
      console.log('Flotte supprimée:', flotteToDelete)
      await fetchFlotte()
      setOpenDialog(false)
      setSnackbarMessage('Entrée de flotte supprimée avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setOpenDialog(false)
      setSnackbarMessage("Impossible de supprimer l'entrée")
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  return (
    <>
      <Breadcrumb
        mainText="Listes"
        subText="Flotte"
        showCreateButton={true}
        onCreate={handleCreate}
      />

      {/* Barre de recherche */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par matériel, N°Parc, Parc Colas, type PM ou N° PM..."
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

      {/* Tableau principal */}
      <Box className="card">
        <TableView
          data={filteredFlotte}
          columns={columns}
          rowsPerPage={10}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showCheckboxes={false}
          userRole={userRole}
          showActions={true} // Afficher la colonne Actions
          showEditIcon={true} // Afficher l'icône d'édition
          showDeleteIcon={true} // Afficher l'icône de suppression
          showViewIcon={false}
        />
      </Box>

      <MaintenancePreventiveCreate
        isOpen={openCreateModal}
        onSave={handleSaveCreate}
        onClose={() => setOpenCreateModal(false)}
        flotteList={flotteList}
      />

      <MaintenancePreventiveEdit
        isOpen={openEditModal}
        maintenance={selectedFlotte}
        onChange={(updated) => setSelectedFlotte(updated)}
        onSave={handleSaveEdit}
        onClose={() => setOpenEditModal(false)}
        flotteList={flotteList}
      />

      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmDelete}
        title="Suppression"
        content="Êtes-vous sûr de vouloir supprimer les données du flotte?"
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

export default MaintenancePreventiveViews
