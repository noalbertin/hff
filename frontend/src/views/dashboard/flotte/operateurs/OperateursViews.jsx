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

import OperateursEdit from './OperateursEdit'
import OperateursCreate from './OperateursCreate'
import api from '../../../../utils/axios'
import { useAuthStore, selectUser } from '../../../../store/auth'

const OperateursViews = () => {
  const [operateurs, setOperateurs] = useState([])
  const [filteredOperateurs, setFilteredOperateurs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOperateur, setSelectedOperateur] = useState(null)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [operateurToDelete, setOperateurToDelete] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const { role: userRole } = useAuthStore(selectUser)

  // Charger les opérateurs depuis le backend
  const fetchOperateurs = async () => {
    try {
      const { data } = await api.get('operateurs')
      setOperateurs(data)
      setFilteredOperateurs(data)
    } catch (error) {
      console.error('Erreur lors du chargement des opérateurs:', error)
      setSnackbarMessage('Erreur lors du chargement des opérateurs')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  useEffect(() => {
    fetchOperateurs()
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
      setFilteredOperateurs(operateurs)
    } else {
      const searchLower = searchTerm.toLowerCase()

      const filtered = operateurs.filter((op) => {
        return (
          // 🔹 Recherche opérateur
          op.matricule?.toLowerCase().includes(searchLower) ||
          op.nom?.toLowerCase().includes(searchLower) ||
          op.telephone?.toLowerCase().includes(searchLower) ||
          op.id_operateur?.toString().includes(searchLower) ||
          // 🔹 Recherche matériel
          op.designation?.toLowerCase().includes(searchLower) ||
          op.num_parc?.toLowerCase().includes(searchLower) ||
          op.parc_colas?.toLowerCase().includes(searchLower) ||
          // 🔹 Recherche suppléant
          op.nom_suppleant?.toLowerCase().includes(searchLower) ||
          op.matricule_suppleant?.toString().includes(searchLower) ||
          op.telephone_suppleant?.toLowerCase().includes(searchLower)
        )
      })

      setFilteredOperateurs(filtered)
    }
  }, [searchTerm, operateurs])

  // Colonnes du tableau
  const columns = [
    {
      id: 'designation',
      label: 'Désignation',
      render: (row) => row.designation || 'N/A',
    },
    {
      id: 'num_parc',
      label: 'N° Parc',
      render: (row) => row.num_parc || 'N/A',
    },
    {
      id: 'parc_colas',
      label: 'Parc Colas',
      render: (row) => row.parc_colas || 'N/A',
    },
    { id: 'nom', label: 'Opérateur', render: (row) => row.nom || '-' },
    {
      id: 'matricule',
      label: 'Matricule Opérateur',
      render: (row) => row.matricule || '-',
    },
    {
      id: 'telephone',
      label: 'Téléphone Opérateur',
      render: (row) => row.telephone || '-',
    },
    {
      id: 'nom_suppleant',
      label: 'Suppléant',
      render: (row) => row.nom_suppleant || '-',
    },
    {
      id: 'matricule_suppleant',
      label: 'Matricule Suppléant',
      render: (row) => row.matricule_suppleant || '-',
    },
    {
      id: 'telephone_suppleant',
      label: 'Téléphone Suppléant',
      render: (row) => row.telephone_suppleant || '-',
    },
  ]

  // Ouvre le modal de création d'opérateur
  const handleCreate = () => {
    setSelectedOperateur(null)
    setOpenCreateModal(true)
  }

  // Ouvre le modal d'édition
  const handleEdit = (row) => {
    console.log('🔍 Données sélectionnées pour édition:', row) // ✅ Debug
    setSelectedOperateur(row)
    setOpenEditModal(true)
  }

  // Ouvre le dialogue de confirmation pour la suppression
  const handleDelete = (row) => {
    setOperateurToDelete(row)
    setOpenDialog(true)
  }

  // Gère l'enregistrement d'un nouvel opérateur
  const handleSaveCreate = async (operateur) => {
    try {
      const { data } = await api.post('operateurs', operateur)
      console.log('Created:', data)
      await fetchOperateurs()
      setOpenCreateModal(false)
      setSnackbarMessage('Opérateur créé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error("Erreur lors de la création de l'opérateur:", error)

      // Extraire le message d'erreur du backend
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Impossible de créer l'opérateur"

      setSnackbarMessage(errorMessage)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Gère l'enregistrement des modifications
  const handleSaveEdit = async (updatedOperateur) => {
    console.log('💾 Données reçues pour mise à jour:', updatedOperateur) // ✅ Debug

    try {
      const { data } = await api.put(
        `operateurs/${updatedOperateur.id_operateur}`,
        updatedOperateur
      )
      console.log('Edited:', data)
      await fetchOperateurs()
      setOpenEditModal(false)
      setSnackbarMessage('Opérateur modifié avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error("Erreur lors de la modification de l'opérateur:", error)
      setSnackbarMessage("Impossible de modifier l'opérateur")
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Confirme la suppression
  const confirmDelete = async () => {
    try {
      await api.delete(`operateurs/${operateurToDelete.id_operateur}`)
      console.log('Deleted:', operateurToDelete)
      await fetchOperateurs()
      setOpenDialog(false)
      setSnackbarMessage('Opérateur supprimé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error("Erreur lors de la suppression de l'opérateur:", error)
      setOpenDialog(false)
      setSnackbarMessage("Impossible de supprimer l'opérateur")
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  return (
    <>
      <Breadcrumb
        mainText="Listes"
        subText="Opérateur"
        showCreateButton={true}
        onCreate={handleCreate}
      />

      {/* Barre de recherche */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par matricule, nom, téléphone ou ID..."
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

      {/* Tableau principal affichant les opérateurs */}
      <Box className="card">
        <TableView
          data={filteredOperateurs}
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

      <OperateursCreate
        isOpen={openCreateModal}
        onSave={handleSaveCreate}
        onClose={() => setOpenCreateModal(false)}
      />

      {/* ✅ CORRECTION ICI : operateurData au lieu de operateur */}
      <OperateursEdit
        isOpen={openEditModal}
        operateurData={selectedOperateur} // ✅ CORRIGÉ
        onSave={handleSaveEdit}
        onClose={() => setOpenEditModal(false)}
      />

      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmDelete}
        title="Suppression"
        content="Êtes-vous sûr de vouloir supprimer cet opérateur?"
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

export default OperateursViews
