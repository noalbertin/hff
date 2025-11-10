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
import DocumentsAdministratifsCreate from './DocumentsAdministratifsCreate'
import DocumentsAdministratifsEdit from './DocumentsAdministratifsEdit'
import api from '../../../../utils/axios'
import { useAuthStore, selectUser } from '../../../../store/auth'

const DocumentsAdministratifsViews = () => {
  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const { role: userRole } = useAuthStore(selectUser)

  // Fonction pour calculer le retard en jours
  const calculateDelay = (dateString) => {
    if (!dateString) return null

    const today = new Date()
    const targetDate = new Date(dateString)
    const diffTime = today - targetDate
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  // Fonction pour déterminer la couleur selon le retard
  const getDelayColor = (delay) => {
    if (delay === null) return '#6c757d' // Gris pour N/A
    if (delay < 0) return '#28a745' // Vert si pas encore expiré
    if (delay === 0) return '#ffc107' // Jaune si expire aujourd'hui
    if (delay <= 30) return '#fd7e14' // Orange si retard <= 30 jours
    return '#dc3545' // Rouge si retard > 30 jours
  }

  // Fonction pour formater l'affichage du retard
  const formatDelay = (delay) => {
    if (delay === null) return 'N/A'
    if (delay < 0) return `Dans ${Math.abs(delay)} jours`
    if (delay === 0) return "Aujourd'hui"
    return `${delay} jour${delay > 1 ? 's' : ''} de retard`
  }

  // Colonnes pour le tableau
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
    {
      id: 'date_ips',
      label: 'Date IPS',
      render: (row) =>
        row.date_ips
          ? new Date(row.date_ips).toLocaleDateString('fr-FR')
          : 'N/A',
    },
    {
      id: 'date_derniere_vt',
      label: 'Dernière VT',
      render: (row) =>
        row.date_derniere_vt
          ? new Date(row.date_derniere_vt).toLocaleDateString('fr-FR')
          : 'N/A',
    },
    {
      id: 'date_prochaine_vt',
      label: 'Prochaine VT',
      render: (row) =>
        row.date_prochaine_vt
          ? new Date(row.date_prochaine_vt).toLocaleDateString('fr-FR')
          : 'N/A',
    },
    {
      id: 'retard_vt',
      label: 'Retard VT',
      render: (row) => {
        const delay = calculateDelay(row.date_prochaine_vt)
        const color = getDelayColor(delay)

        return (
          <div className="d-flex align-items-center">
            <span style={{ color: color, fontWeight: '600' }}>
              {formatDelay(delay)}
            </span>
          </div>
        )
      },
    },
    {
      id: 'date_expiration_carte_grise',
      label: 'Exp. Carte Grise',
      render: (row) =>
        row.date_expiration_carte_grise
          ? new Date(row.date_expiration_carte_grise).toLocaleDateString(
              'fr-FR'
            )
          : 'N/A',
    },
    {
      id: 'retard_carte_grise',
      label: 'Retard Carte Grise',
      render: (row) => {
        const delay = calculateDelay(row.date_expiration_carte_grise)
        const color = getDelayColor(delay)

        return (
          <div className="d-flex align-items-center">
            <span style={{ color: color, fontWeight: '600' }}>
              {formatDelay(delay)}
            </span>
          </div>
        )
      },
    },
    {
      id: 'date_expiration_assurance',
      label: 'Exp. Assurance',
      render: (row) =>
        row.date_expiration_assurance
          ? new Date(row.date_expiration_assurance).toLocaleDateString('fr-FR')
          : 'N/A',
    },
    {
      id: 'retard_assurance',
      label: 'Retard Assurance',
      render: (row) => {
        const delay = calculateDelay(row.date_expiration_assurance)
        const color = getDelayColor(delay)

        return (
          <div className="d-flex align-items-center">
            <span style={{ color: color, fontWeight: '600' }}>
              {formatDelay(delay)}
            </span>
          </div>
        )
      },
    },
  ]

  // Récupérer tous les documents administratifs
  const fetchDocuments = async () => {
    try {
      const response = await api.get('documents-administratifs')
      console.log('Documents récupérés :', response.data)
      setDocuments(response.data)
      setFilteredDocuments(response.data)
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error)
      setSnackbarMessage('Erreur lors de la récupération des documents')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Charger les documents au montage du composant
  useEffect(() => {
    fetchDocuments()
  }, [])

  // Filtrer les documents selon le terme de recherche
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredDocuments(documents)
    } else {
      const filtered = documents.filter(
        (doc) =>
          doc.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.num_parc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.parc_colas?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredDocuments(filtered)
    }
  }, [searchTerm, documents])

  // Ouvre le modal de création
  const handleCreate = () => {
    setSelectedDocument(null)
    setOpenCreateModal(true)
  }

  // Sauvegarde un nouveau document
  const handleSaveCreate = async (document) => {
    try {
      const response = await api.post('/documents-administratifs', document)
      console.log('Document créé:', response.data)
      await fetchDocuments()
      setOpenCreateModal(false)
      setSnackbarMessage('Document administratif créé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      setSnackbarMessage('Impossible de créer le document administratif')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Ouvre le modal d'édition
  const handleEdit = (document) => {
    setSelectedDocument(document)
    setOpenEditModal(true)
  }

  // Sauvegarde les modifications
  const handleSaveEdit = async (document) => {
    try {
      const response = await api.put(
        `/documents-administratifs/${document.id_document}`,
        document
      )
      console.log('Document modifié:', response.data)
      await fetchDocuments()
      setOpenEditModal(false)
      setSnackbarMessage('Document administratif modifié avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      setSnackbarMessage('Impossible de modifier le document administratif')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Ouvre la boîte de dialogue de confirmation de suppression
  const handleDelete = (document) => {
    setDocumentToDelete(document)
    setOpenDialog(true)
  }

  // Confirme et effectue la suppression
  const confirmDelete = async () => {
    try {
      await api.delete(
        `/documents-administratifs/${documentToDelete.id_document}`
      )
      console.log('Document supprimé:', documentToDelete.id_document)
      await fetchDocuments()
      setOpenDialog(false)
      setDocumentToDelete(null)
      setSnackbarMessage('Document administratif supprimé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setSnackbarMessage('Impossible de supprimer le document administratif')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      setOpenDialog(false)
    }
  }

  // Gère le changement de recherche
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  // Efface la recherche
  const handleClearSearch = () => {
    setSearchTerm('')
  }

  return (
    <div>
      <Breadcrumb
        mainText="Listes"
        subText="Documents Administratifs"
        showCreateButton={true}
        onCreate={handleCreate}
      />

      {/* Barre de recherche */}
      <Box sx={{ mb: 3, mt: 2 }}>
        <TextField
          fullWidth
          placeholder="Rechercher par désignation, N° Parc ou Parc Colas..."
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
        data={filteredDocuments}
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

      {/* Modal de création */}
      <DocumentsAdministratifsCreate
        isOpen={openCreateModal}
        onSave={handleSaveCreate}
        onClose={() => setOpenCreateModal(false)}
      />

      {/* Modal d'édition */}
      <DocumentsAdministratifsEdit
        isOpen={openEditModal}
        document={selectedDocument}
        onChange={(updated) => setSelectedDocument(updated)}
        onSave={handleSaveEdit}
        onClose={() => setOpenEditModal(false)}
      />

      {/* Dialogue de confirmation de suppression */}
      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmDelete}
        title="Suppression"
        content="Êtes-vous sûr de vouloir supprimer ce document administratif ?"
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

export default DocumentsAdministratifsViews
