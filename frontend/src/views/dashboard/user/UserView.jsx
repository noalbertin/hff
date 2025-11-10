// src/views/dashboard/user/UserView.jsx
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
import UserEdit from './UserEdit'
import api from '../../../utils/axios'
import dayjs from 'dayjs'

const UserView = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const { role: userRole, id_user: currentUserId } = useAuthStore(selectUser)

  // Charger les utilisateurs depuis le backend
  const fetchUsers = async () => {
    try {
      const { data } = await api.get('users')
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      setSnackbarMessage('Erreur lors du chargement des utilisateurs')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  useEffect(() => {
    fetchUsers()
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
      setFilteredUsers(users)
    } else {
      const filtered = users.filter((user) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          user.nom_user?.toLowerCase().includes(searchLower) ||
          user.role?.toLowerCase().includes(searchLower) ||
          user.id_user?.toString().includes(searchLower)
        )
      })
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  // Colonnes du tableau
  const columns = [
    { id: 'id_user', label: 'ID' },
    {
      id: 'nom_user',
      label: "Nom d'utilisateur",
      render: (row) => row.nom_user || 'N/A',
    },
    {
      id: 'role',
      label: 'Rôle',
      render: (row) => (
        <span
          className={row.role === 'admin' ? 'text-primary' : 'text-secondary'}
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
            backgroundColor:
              row.role === 'admin'
                ? 'rgba(33, 150, 243, 0.1)'
                : 'rgba(158, 158, 158, 0.1)',
          }}
        >
          {row.role === 'admin' ? 'Admin' : 'Visiteur'}
        </span>
      ),
    },
    {
      id: 'created_at',
      label: 'Date de création',
      render: (row) => dayjs(row.created_at).format('DD/MM/YYYY'),
    },
  ]

  // Ouvre le modal d'édition
  const handleEdit = (row) => {
    setSelectedUser(row)
    setOpenEditModal(true)
  }

  // Gère l'enregistrement des modifications
  const handleSaveEdit = async (updatedUser) => {
    try {
      const dataToSend = {
        nom_user: updatedUser.nom_user,
        role: updatedUser.role,
      }

      // Ajouter le mot de passe seulement s'il est fourni
      if (updatedUser.password && updatedUser.password.trim() !== '') {
        dataToSend.password = updatedUser.password
      }

      const { data } = await api.put(`users/${updatedUser.id_user}`, dataToSend)
      console.log('Edited:', data)
      await fetchUsers()
      setOpenEditModal(false)
      setSnackbarMessage('Utilisateur modifié avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error("Erreur lors de la modification de l'utilisateur :", error)
      setSnackbarMessage(
        error.response?.data?.error || "Impossible de modifier l'utilisateur"
      )
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Ouvre le dialogue de confirmation pour la suppression
  const handleDelete = (row) => {
    // Empêcher la suppression de son propre compte
    if (row.id_user === currentUserId) {
      setSnackbarMessage('Vous ne pouvez pas supprimer votre propre compte')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }
    setUserToDelete(row)
    setOpenDialog(true)
  }

  // Confirme la suppression
  const confirmDelete = async () => {
    try {
      await api.delete(`users/${userToDelete.id_user}`)
      console.log('Deleted:', userToDelete)
      await fetchUsers()
      setOpenDialog(false)
      setSnackbarMessage('Utilisateur supprimé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error)
      setOpenDialog(false)
      setSnackbarMessage(
        error.response?.data?.error || "Impossible de supprimer l'utilisateur"
      )
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  return (
    <>
      <Breadcrumb
        mainText="Gestion des utilisateurs"
        subText="Administration"
        showCreateButton={false}
      />

      {/* Barre de recherche */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par nom d'utilisateur, rôle ou ID..."
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

      {/* Tableau principal affichant les utilisateurs */}
      <Box className="card">
        <TableView
          data={filteredUsers}
          columns={columns}
          rowsPerPage={10}
          onEdit={handleEdit}
          onDelete={handleDelete}
          userRole={userRole}
          showCheckboxes={false}
          showActions={true}
          showEditIcon={true}
          showDeleteIcon={true}
          showViewIcon={false}
        />
      </Box>

      <UserEdit
        isOpen={openEditModal}
        user={selectedUser}
        onChange={(updatedUser) => setSelectedUser(updatedUser)}
        onSave={handleSaveEdit}
        onClose={() => setOpenEditModal(false)}
      />

      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmDelete}
        title="Suppression"
        content={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userToDelete?.nom_user}" ?`}
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

export default UserView
