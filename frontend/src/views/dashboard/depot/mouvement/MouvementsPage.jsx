import { useState, useEffect } from 'react'
import {
  Box,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import TableView from '../../../../components/ui-table/TableView'
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog'
import Breadcrumb from '../../../../components/ui/Breadcrumb'
import { useAuthStore, selectUser } from '../../../../store/auth'
import MouvementCreate from './MouvementCreate'
import MouvementEdit from './MouvementEdit'
import api from '../../../../utils/axios'
import dayjs from 'dayjs'
import { useOutletContext } from 'react-router-dom'

const MouvementView = () => {
  const context = useOutletContext()
  const depotId = context?.depotId

  const [mouvements, setMouvements] = useState([])
  const [filteredMouvements, setFilteredMouvements] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [selectedMouvement, setSelectedMouvement] = useState(null)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [mouvementToCancel, setMouvementToCancel] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const { role: userRole } = useAuthStore(selectUser)

  // Charger les mouvements
  const fetchMouvements = async () => {
    try {
      const endpoint = depotId ? `mouvements/depot/${depotId}` : 'mouvements'
      const { data } = await api.get(endpoint)

      // ⭐ TRI PAR DATE DÉCROISSANTE (plus récent en haut)
      const sortedData = data.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at)
      })

      setMouvements(sortedData)
      setFilteredMouvements(sortedData)
    } catch (error) {
      console.error('Erreur lors du chargement des mouvements:', error)
      setSnackbarMessage('Erreur lors du chargement des mouvements')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  useEffect(() => {
    fetchMouvements()
  }, [depotId])

  // Gestion de la recherche
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  // Gestion du filtre par type
  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilterType(newFilter)
    }
  }

  // Filtrage
  useEffect(() => {
    let filtered = mouvements

    // Filtre par type
    if (filterType !== 'ALL') {
      filtered = filtered.filter((mv) => mv.type_mouvement === filterType)
    }

    // Filtre par recherche
    if (searchTerm !== '') {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((mv) => {
        return (
          mv.designation?.toLowerCase().includes(searchLower) ||
          mv.num_parc?.toLowerCase().includes(searchLower) ||
          mv.depot_nom?.toLowerCase().includes(searchLower) ||
          mv.depot_destination_nom?.toLowerCase().includes(searchLower) ||
          mv.reference_document?.toLowerCase().includes(searchLower) ||
          mv.utilisateur?.toLowerCase().includes(searchLower) ||
          mv.id?.toString().includes(searchLower)
        )
      })
    }

    // ⭐ MAINTENIR LE TRI PAR DATE après le filtrage
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    setFilteredMouvements(filtered)
  }, [searchTerm, filterType, mouvements])

  // Colonnes du tableau
  const columns = [
    {
      id: 'created_at',
      label: 'Date',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {dayjs(row.created_at).format('DD/MM/YYYY')}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#637381' }}>
            {dayjs(row.created_at).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      id: 'type_mouvement',
      label: 'Type',
      render: (row) => {
        const isEntree = row.type_mouvement === 'ENTREE'
        const isTransfert =
          row.type_mouvement === 'SORTIE' && row.depot_destination_id

        return (
          <Chip
            icon={
              isTransfert ? (
                <SwapHorizIcon />
              ) : isEntree ? (
                <ArrowDownwardIcon />
              ) : (
                <ArrowUpwardIcon />
              )
            }
            label={isTransfert ? 'Transfert' : row.type_mouvement}
            color={isEntree ? 'success' : 'error'}
            size="small"
            sx={{ fontWeight: 600, minWidth: 100 }}
          />
        )
      },
    },
    {
      id: 'designation',
      label: 'Matériel',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.designation}</div>
          <div style={{ fontSize: '0.85rem', color: '#637381' }}>
            N° Parc: {row.num_parc}
          </div>
        </div>
      ),
    },
    {
      id: 'quantite',
      label: 'Quantité',
      render: (row) => (
        <Chip
          label={row.quantite}
          color="primary"
          size="small"
          sx={{ fontWeight: 600, minWidth: 50 }}
        />
      ),
    },
    {
      id: 'reference_document',
      label: 'Référence',
      render: (row) => row.reference_document || '-',
    },
    {
      id: 'utilisateur',
      label: 'Utilisateur',
      render: (row) => row.utilisateur || '-',
    },
    {
      id: 'commentaire',
      label: 'Commentaire',
      render: (row) => (
        <div
          style={{
            maxWidth: '250px',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {row.commentaire || '-'}
        </div>
      ),
    },
  ]

  // Créer un mouvement
  const handleCreate = () => {
    setSelectedMouvement(null)
    setOpenCreateModal(true)
  }

  const handleSaveCreate = async (mouvement) => {
    try {
      const { data } = await api.post('mouvements', mouvement)
      console.log('Created:', data)
      await fetchMouvements()
      setOpenCreateModal(false)
      setSnackbarMessage('Mouvement enregistré avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la création du mouvement:', error)
      const errorMessage =
        error.response?.data?.error || 'Impossible de créer le mouvement'
      setSnackbarMessage(errorMessage)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Modifier un mouvement
  const handleEdit = (row) => {
    setSelectedMouvement(row)
    setOpenEditModal(true)
  }

  const handleSaveEdit = async (updatedMouvement) => {
    try {
      const dataToSend = {
        reference_document: updatedMouvement.reference_document,
        commentaire: updatedMouvement.commentaire,
        utilisateur: updatedMouvement.utilisateur,
      }

      const { data } = await api.put(
        `mouvements/${updatedMouvement.id}`,
        dataToSend
      )
      console.log('Edited:', data)
      await fetchMouvements()
      setOpenEditModal(false)
      setSnackbarMessage('Mouvement modifié avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la modification du mouvement:', error)
      const errorMessage =
        error.response?.data?.error || 'Impossible de modifier le mouvement'
      setSnackbarMessage(errorMessage)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Annuler un mouvement (inverse le stock)
  const handleDelete = (row) => {
    setMouvementToCancel(row)
    setOpenDialog(true)
  }

  const confirmCancel = async () => {
    try {
      await api.patch(`mouvements/${mouvementToCancel.id}/cancel`)
      console.log('Cancelled:', mouvementToCancel)
      await fetchMouvements()
      setOpenDialog(false)
      setSnackbarMessage('Mouvement annulé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error("Erreur lors de l'annulation du mouvement:", error)
      const errorMessage =
        error.response?.data?.error || "Impossible d'annuler le mouvement"
      setOpenDialog(false)
      setSnackbarMessage(errorMessage)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  return (
    <>
      <Breadcrumb
        mainText="Mouvements de Stock"
        showCreateButton={true}
        onCreate={handleCreate}
      />

      {/* Filtres */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Filtre par type */}
        <ToggleButtonGroup
          value={filterType}
          exclusive
          onChange={handleFilterChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
            },
          }}
        >
          <ToggleButton value="ALL">Tous</ToggleButton>
          <ToggleButton value="ENTREE">
            <ArrowDownwardIcon sx={{ mr: 0.5, fontSize: 18 }} />
            Entrées
          </ToggleButton>
          <ToggleButton value="SORTIE">
            <ArrowUpwardIcon sx={{ mr: 0.5, fontSize: 18 }} />
            Sorties
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Barre de recherche */}
        <TextField
          sx={{ flexGrow: 1 }}
          variant="outlined"
          size="small"
          placeholder="Rechercher par matériel, référence, utilisateur..."
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
                <IconButton onClick={handleClearSearch} edge="end" size="small">
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Tableau */}
      <Box className="card">
        <TableView
          data={filteredMouvements}
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

      <MouvementCreate
        isOpen={openCreateModal}
        onSave={handleSaveCreate}
        onClose={() => setOpenCreateModal(false)}
        depotId={depotId}
      />

      <MouvementEdit
        isOpen={openEditModal}
        mouvement={selectedMouvement}
        onChange={(updated) => setSelectedMouvement(updated)}
        onSave={handleSaveEdit}
        onClose={() => setOpenEditModal(false)}
      />

      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmCancel}
        title="Annuler le mouvement"
        content="Êtes-vous sûr de vouloir annuler ce mouvement ? Cette action inversera l'impact sur le stock."
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

export default MouvementView
