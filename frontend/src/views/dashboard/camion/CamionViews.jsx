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

import CamionEdit from './CamionEdit'
import CamionCreate from './CamionCreate'
import api from '../../../utils/axios'
import { useNavigate } from 'react-router-dom'

const CamionViews = () => {
  const [camions, setCamions] = useState([])
  const [filteredCamions, setFilteredCamions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCamion, setSelectedCamion] = useState(null)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [camionToDelete, setCamionToDelete] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const navigate = useNavigate()
  const { role: userRole } = useAuthStore(selectUser)

  // Charger les camions depuis le backend
  const fetchCamions = async () => {
    try {
      const { data } = await api.get('materiel')
      setCamions(data)
      setFilteredCamions(data)
    } catch (error) {
      console.error('Erreur lors du chargement des camions:', error)
      setSnackbarMessage('Erreur lors du chargement des camions')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  useEffect(() => {
    fetchCamions()
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
      setFilteredCamions(camions)
    } else {
      const filtered = camions.filter((camion) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          camion.designation?.toLowerCase().includes(searchLower) ||
          camion.immatriculation?.toLowerCase().includes(searchLower) ||
          camion.modele?.toLowerCase().includes(searchLower) ||
          camion.serie?.toLowerCase().includes(searchLower) ||
          camion.cst?.toLowerCase().includes(searchLower) ||
          camion.num_parc?.toLowerCase().includes(searchLower) ||
          camion.parc_colas?.toLowerCase().includes(searchLower) ||
          camion.id?.toString().includes(searchLower)
        )
      })
      setFilteredCamions(filtered)
    }
  }, [searchTerm, camions])

  // Colonnes du tableau
  const columns = [
    {
      id: 'depot_nom',
      label: 'Dépôt',
      render: (row) => (
        <span
          className="badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 12px',
            fontSize: '14px',
            fontWeight: '700',
            textAlign: 'center',
            minWidth: '80px',
            borderRadius: '12px',
            color: 'white',
            backgroundColor:
              row.depot_nom === 'Depot 1'
                ? '#1d4ed8'
                : row.depot_nom === 'Depot 2'
                ? '#0369a1'
                : '#0d9488',
          }}
        >
          {row.depot_nom}
        </span>
      ),
    },
    {
      id: 'designation',
      label: 'Désignation',
      render: (row) => row.designation || '-',
    },
    { id: 'num_parc', label: 'Parc HFF', render: (row) => row.num_parc || '-' },
    {
      id: 'parc_colas',
      label: 'Parc Colas',
      render: (row) => row.parc_colas || '-',
    },
    { id: 'modele', label: 'Modèle', render: (row) => row.modele || '-' },
    { id: 'serie', label: 'N° Série', render: (row) => row.serie || '-' },
    { id: 'cst', label: 'CST', render: (row) => row.cst || '-' },
    {
      id: 'immatriculation',
      label: 'Immatriculation',
      render: (row) => row.immatriculation || '-',
    },
  ]

  // Ouvre le modal de création de camion
  const handleCreate = () => {
    setSelectedCamion(null)
    setOpenCreateModal(true)
  }

  // Ouvre le modal d'édition
  const handleEdit = (row) => {
    setSelectedCamion(row)
    setOpenEditModal(true)
  }

  // Ouvre le dialogue de confirmation pour la suppression
  const handleDelete = (row) => {
    setCamionToDelete(row)
    setOpenDialog(true)
  }

  // Gère l'enregistrement d'un nouveau camion
  const handleSaveCreate = async (camion) => {
    try {
      const { data } = await api.post('materiel', camion)
      console.log('Created:', data)
      await fetchCamions()
      setOpenCreateModal(false)
      setSnackbarMessage('Camion créé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la création du camion :', error)
      setSnackbarMessage('Impossible de créer le camion')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Gère l'enregistrement des modifications
  const handleSaveEdit = async (updatedCamion) => {
    try {
      const { data } = await api.put(
        `materiel/${updatedCamion.id}`,
        updatedCamion
      )
      console.log('Edited:', data)
      await fetchCamions()
      setOpenEditModal(false)
      setSnackbarMessage('Camion modifié avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la modification du camion :', error)
      setSnackbarMessage('Impossible de modifier le camion')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Confirme la suppression
  const confirmDelete = async () => {
    try {
      await api.delete(`materiel/${camionToDelete.id}`)
      console.log('Deleted:', camionToDelete)
      await fetchCamions()
      setOpenDialog(false)
      setSnackbarMessage('Camion supprimé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la suppression du camion :', error)
      setOpenDialog(false)
      setSnackbarMessage('Impossible de supprimer le camion')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }
  const handleView = (camion) => {
    navigate(`/materiel/${camion.id}`)
  }

  return (
    <>
      <Breadcrumb
        mainText="Listes"
        subText="Matériel"
        showCreateButton={true}
        onCreate={handleCreate}
      />

      {/* Barre de recherche */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par désignation, modèle, série, CST ou ID..."
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

      {/* Tableau principal affichant les camions */}
      <Box className="card">
        <TableView
          data={filteredCamions}
          columns={columns}
          rowsPerPage={10}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showCheckboxes={false}
          userRole={userRole}
          showActions={true} // Afficher la colonne Actions
          showEditIcon={true} // Afficher l'icône d'édition
          showDeleteIcon={true} // Afficher l'icône de suppression
          showViewIcon={true}
          onView={handleView}
        />
      </Box>

      <CamionCreate
        isOpen={openCreateModal}
        onSave={handleSaveCreate}
        onClose={() => setOpenCreateModal(false)}
      />

      <CamionEdit
        isOpen={openEditModal}
        camion={selectedCamion}
        onChange={(updatedCamion) => setSelectedCamion(updatedCamion)}
        onSave={handleSaveEdit}
        onClose={() => setOpenEditModal(false)}
      />

      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmDelete}
        title="Suppression"
        content="Êtes-vous sûr de vouloir supprimer ce camion?"
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

export default CamionViews
