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
import WarningIcon from '@mui/icons-material/Warning'
import TableView from '../../../../components/ui-table/TableView'
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog'
import Breadcrumb from '../../../../components/ui/Breadcrumb'
import { useAuthStore, selectUser } from '../../../../store/auth'
import StockEdit from './StockEdit'
import StockCreate from './StockCreate'
import api from '../../../../utils/axios'
import dayjs from 'dayjs'
import { useOutletContext } from 'react-router-dom'

const StockView = () => {
  const context = useOutletContext()
  const depotId = context?.depotId

  const [stocks, setStocks] = useState([])
  const [filteredStocks, setFilteredStocks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStock, setSelectedStock] = useState(null)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [stockToDelete, setStockToDelete] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const { role: userRole } = useAuthStore(selectUser)

  // Charger les stocks
  const fetchStocks = async () => {
    try {
      const endpoint = depotId ? `stocks/depot/${depotId}` : 'stocks'
      const { data } = await api.get(endpoint)
      setStocks(data)
      setFilteredStocks(data)
    } catch (error) {
      console.error('Erreur lors du chargement des stocks:', error)
      setSnackbarMessage('Erreur lors du chargement des stocks')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  useEffect(() => {
    fetchStocks()
  }, [depotId])

  // Gestion de la recherche
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  // Filtrage
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredStocks(stocks)
    } else {
      const filtered = stocks.filter((stock) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          stock.designation?.toLowerCase().includes(searchLower) ||
          stock.num_parc?.toLowerCase().includes(searchLower) ||
          stock.parc_colas?.toLowerCase().includes(searchLower) ||
          stock.depot_nom?.toLowerCase().includes(searchLower) ||
          stock.id?.toString().includes(searchLower)
        )
      })
      setFilteredStocks(filtered)
    }
  }, [searchTerm, stocks])

  // Colonnes du tableau
  const columns = [
    {
      id: 'designation',
      label: 'Matériel',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.designation}</div>
          <div style={{ fontSize: '0.85rem', color: '#637381' }}>
            {row.serie} - {row.modele}
          </div>
        </div>
      ),
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
    ...(depotId
      ? []
      : [
          {
            id: 'depot_nom',
            label: 'Dépôt',
            render: (row) => (
              <div>
                <div style={{ fontWeight: 600 }}>{row.depot_nom}</div>
                <div style={{ fontSize: '0.85rem', color: '#637381' }}>
                  {row.depot_responsable}
                </div>
              </div>
            ),
          },
        ]),
    {
      id: 'quantite',
      label: 'Quantité',
      render: (row) => (
        <Chip
          label={row.quantite}
          color={row.quantite <= row.quantite_minimum ? 'error' : 'success'}
          size="small"
          sx={{ fontWeight: 600, minWidth: 60 }}
        />
      ),
    },
    {
      id: 'quantite_minimum',
      label: 'Seuil Min.',
      render: (row) => row.quantite_minimum,
    },
    {
      id: 'statut',
      label: 'Statut',
      render: (row) => {
        const enRupture = row.quantite <= row.quantite_minimum
        return (
          <Chip
            icon={enRupture ? <WarningIcon /> : undefined}
            label={enRupture ? 'Rupture' : 'Disponible'}
            color={enRupture ? 'error' : 'success'}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        )
      },
    },
    {
      id: 'updated_at',
      label: 'Dernière MAJ',
      render: (row) => dayjs(row.updated_at).format('DD/MM/YYYY HH:mm'),
    },
  ]

  // Créer un stock
  const handleCreate = () => {
    setSelectedStock(null)
    setOpenCreateModal(true)
  }

  const handleSaveCreate = async (stock) => {
    try {
      const { data } = await api.post('stocks', stock)
      console.log('Created:', data)
      await fetchStocks()
      setOpenCreateModal(false)
      setSnackbarMessage('Stock créé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la création du stock:', error)
      const errorMessage =
        error.response?.data?.error || 'Impossible de créer le stock'
      setSnackbarMessage(errorMessage)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Modifier un stock
  const handleEdit = (row) => {
    setSelectedStock(row)
    setOpenEditModal(true)
  }

  const handleSaveEdit = async (updatedStock) => {
    try {
      const dataToSend = {
        ...updatedStock,
        materiel_id: parseInt(updatedStock.materiel_id, 10),
        depot_id: parseInt(updatedStock.depot_id, 10),
        quantite: parseInt(updatedStock.quantite, 10),
        quantite_minimum: parseInt(updatedStock.quantite_minimum, 10),
      }

      const { data } = await api.put(`stocks/${updatedStock.id}`, dataToSend)
      console.log('Edited:', data)
      await fetchStocks()
      setOpenEditModal(false)
      setSnackbarMessage('Stock modifié avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la modification du stock:', error)
      const errorMessage =
        error.response?.data?.error || 'Impossible de modifier le stock'
      setSnackbarMessage(errorMessage)
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Supprimer un stock
  const handleDelete = (row) => {
    setStockToDelete(row)
    setOpenDialog(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`stocks/${stockToDelete.id}`)
      console.log('Deleted:', stockToDelete)
      await fetchStocks()
      setOpenDialog(false)
      setSnackbarMessage('Stock supprimé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la suppression du stock:', error)
      setOpenDialog(false)
      setSnackbarMessage('Impossible de supprimer le stock')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  return (
    <>
      <Breadcrumb
        mainText="Gestion"
        showCreateButton={true}
        onCreate={handleCreate}
      />

      {/* Barre de recherche */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par matériel, dépôt, N° parc..."
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
      <Box className="card">
        <TableView
          data={filteredStocks}
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

      <StockCreate
        isOpen={openCreateModal}
        onSave={handleSaveCreate}
        onClose={() => setOpenCreateModal(false)}
        depotId={depotId}
      />

      <StockEdit
        isOpen={openEditModal}
        stock={selectedStock}
        onChange={(updatedStock) => setSelectedStock(updatedStock)}
        onSave={handleSaveEdit}
        onClose={() => setOpenEditModal(false)}
      />

      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmDelete}
        title="Suppression"
        content="Êtes-vous sûr de vouloir supprimer ce stock ?"
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

export default StockView
