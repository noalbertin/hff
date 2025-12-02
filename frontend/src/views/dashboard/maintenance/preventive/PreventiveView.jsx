import { useState, useEffect } from 'react'
import {
  Box,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import TableView from '../../../../components/ui-table/TableView'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog'
import Breadcrumb from '../../../../components/ui/Breadcrumb'
import MaintenancePreventiveCreate from './PreventiveCreate'
import MaintenancePreventiveEdit from './PreventiveEdit'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useAuthStore, selectUser } from '../../../../store/auth'
import 'dayjs/locale/fr'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import dayjs from 'dayjs'
import api from '../../../../utils/axios'

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
  // Ajouter ces états dans le composant PreventiveView (après les autres useState)
  const [openPdfDialog, setOpenPdfDialog] = useState(false)
  const [pdfStartDate, setPdfStartDate] = useState(null)
  const [pdfEndDate, setPdfEndDate] = useState(null)

  // Colonnes du tableau - Version avec calculs de reste
  const columns = [
    {
      id: 'date_planifiee',
      label: 'Date planifiée',
      render: (row) =>
        row.date_planifiee
          ? new Date(row.date_planifiee).toLocaleDateString('fr-FR')
          : 'N/A',
    },
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

  // Fonction pour fermer le dialogue PDF
  const handleClosePdfDialog = () => {
    setOpenPdfDialog(false)
    setPdfStartDate(null)
    setPdfEndDate(null)
  }

  const generatePreventivePDF = async () => {
    if (!pdfStartDate || !pdfEndDate) {
      setSnackbarMessage('Veuillez sélectionner une période')
      setSnackbarSeverity('warning')
      setOpenSnackbar(true)
      return
    }

    try {
      // Filtrer les maintenances par date planifiée
      const filteredByDate = maintenances.filter((maintenance) => {
        const date = dayjs(maintenance.date_planifiee)
        return (
          date.isAfter(pdfStartDate.subtract(1, 'day')) &&
          date.isBefore(pdfEndDate.add(1, 'day'))
        )
      })

      if (filteredByDate.length === 0) {
        setSnackbarMessage(
          'Aucune maintenance préventive trouvée pour cette période'
        )
        setSnackbarSeverity('warning')
        setOpenSnackbar(true)
        return
      }

      // Trier par date planifiée
      filteredByDate.sort((a, b) =>
        dayjs(a.date_planifiee).diff(dayjs(b.date_planifiee))
      )

      // Créer le document PDF en mode paysage
      const doc = new jsPDF('landscape')

      // Définir les couleurs du thème (vert professionnel)
      const primaryColor = [22, 163, 74] // Vert principal
      const primaryDark = [21, 128, 61] // Vert foncé
      const successColor = [22, 163, 74] // Vert
      const warningColor = [202, 138, 4] // Jaune/Orange
      const dangerColor = [220, 38, 38] // Rouge
      const infoColor = [37, 99, 235] // Bleu
      const lightGray = [248, 249, 250]
      const borderColor = [222, 226, 230]
      const darkGray = [52, 58, 64]

      // === EN-TÊTE PROFESSIONNEL ===
      // Fond coloré pour l'en-tête
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, doc.internal.pageSize.width, 50, 'F')

      // Logo/titre principal (centré)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(
        'Rapport de Maintenance Préventive',
        doc.internal.pageSize.width / 2,
        22,
        { align: 'center' }
      )

      // Sous-titre
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Période: ${pdfStartDate.format(
          'DD/MM/YYYY'
        )} jusqu'au ${pdfEndDate.format('DD/MM/YYYY')}`,
        doc.internal.pageSize.width / 2,
        32,
        { align: 'center' }
      )

      // Date de génération
      doc.setFontSize(10)
      doc.text(
        `Généré le: ${dayjs().format('DD/MM/YYYY à HH:mm')}`,
        doc.internal.pageSize.width / 2,
        40,
        { align: 'center' }
      )

      // === BANDEAU DE STATISTIQUES MODERNE ===
      const statsY = 60
      const cardHeight = 32
      const cardSpacing = 5
      const startX = 15

      // Calculer les statistiques
      const totalMaintenances = filteredByDate.length
      const planifiees = filteredByDate.filter(
        (m) => m.statut === 'Planifiée'
      ).length
      const enCours = filteredByDate.filter(
        (m) => m.statut === 'En cours'
      ).length
      const terminees = filteredByDate.filter(
        (m) => m.statut === 'Terminée'
      ).length
      const pourcentageTerminees =
        totalMaintenances > 0
          ? Math.round((terminees / totalMaintenances) * 100)
          : 0
      const pourcentagePlanifiees =
        totalMaintenances > 0
          ? Math.round((planifiees / totalMaintenances) * 100)
          : 0
      const hautePriorite = filteredByDate.filter(
        (m) => m.priorite === 'Haute'
      ).length
      const coutTotal = filteredByDate.reduce(
        (sum, m) => sum + (parseFloat(m.cout_pieces) || 0),
        0
      )

      // Largeur des cartes (5 cartes égales)
      const cardWidth =
        (doc.internal.pageSize.width - startX * 2 - cardSpacing * 4) / 5

      // === CARTE 1: TOTAL MAINTENANCES ===
      let currentX = startX

      // Fond de la carte avec bordure
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(...primaryColor)
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      // Badge coloré en haut
      doc.setFillColor(...primaryColor)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      // Label
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('TOTAL', currentX + cardWidth / 2, statsY + 10, {
        align: 'center',
      })

      // Valeur principale
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryColor)
      doc.text(
        totalMaintenances.toString(),
        currentX + cardWidth / 2,
        statsY + 22,
        { align: 'center' }
      )

      // Sous-label
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('maintenances', currentX + cardWidth / 2, statsY + 28, {
        align: 'center',
      })

      // === CARTE 2: COÛT TOTAL ===
      currentX += cardWidth + cardSpacing

      // Fond et bordure
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(...infoColor)
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      // Badge bleu
      doc.setFillColor(...infoColor)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      // Label
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('COÛT TOTAL', currentX + cardWidth / 2, statsY + 10, {
        align: 'center',
      })

      // Valeur principale
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...infoColor)
      doc.text(`${coutTotal} Ar`, currentX + cardWidth / 2, statsY + 20, {
        align: 'center',
      })

      // Sous-label
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('Ariary', currentX + cardWidth / 2, statsY + 27, {
        align: 'center',
      })

      // === CARTE 3: TERMINÉES ===
      currentX += cardWidth + cardSpacing

      // Fond et bordure
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(...successColor)
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      // Badge vert
      doc.setFillColor(...successColor)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      // Label
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('TERMINÉES', currentX + cardWidth / 2, statsY + 10, {
        align: 'center',
      })

      // Valeur principale avec pourcentage
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...successColor)
      doc.text(
        terminees.toString(),
        currentX + cardWidth / 2 - 8,
        statsY + 22,
        { align: 'center' }
      )

      doc.setFontSize(12)
      doc.setTextColor(108, 117, 125)
      doc.text(
        `(${pourcentageTerminees}%)`,
        currentX + cardWidth / 2 + 8,
        statsY + 22,
        { align: 'left' }
      )

      // Barre de progression
      const progressBarWidth = cardWidth - 16
      const progressBarX = currentX + 8
      const progressBarY = statsY + 26
      const progressFill =
        totalMaintenances > 0
          ? (terminees / totalMaintenances) * progressBarWidth
          : 0

      doc.setFillColor(220, 252, 231) // Fond vert clair
      doc.roundedRect(
        progressBarX,
        progressBarY,
        progressBarWidth,
        3,
        1,
        1,
        'F'
      )

      doc.setFillColor(...successColor) // Remplissage vert
      doc.roundedRect(progressBarX, progressBarY, progressFill, 3, 1, 1, 'F')

      // === CARTE 4: PLANIFIÉES ===
      currentX += cardWidth + cardSpacing

      // Fond et bordure
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(...warningColor)
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      // Badge orange
      doc.setFillColor(...warningColor)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      // Label
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('PLANIFIÉES', currentX + cardWidth / 2, statsY + 10, {
        align: 'center',
      })

      // Valeur
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...warningColor)
      doc.text(planifiees.toString(), currentX + cardWidth / 2, statsY + 22, {
        align: 'center',
      })

      // Pourcentage
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text(
        `${pourcentagePlanifiees}% du total`,
        currentX + cardWidth / 2,
        statsY + 28,
        { align: 'center' }
      )

      // === CARTE 5: HAUTE PRIORITÉ ===
      currentX += cardWidth + cardSpacing

      // Fond et bordure
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(...dangerColor)
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      // Badge rouge
      doc.setFillColor(...dangerColor)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      // Label
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('PRIORITÉ HAUTE', currentX + cardWidth / 1.8, statsY + 10, {
        align: 'center',
      })

      // Valeur
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...dangerColor)
      doc.text(
        hautePriorite.toString(),
        currentX + cardWidth / 2,
        statsY + 22,
        { align: 'center' }
      )

      // Pourcentage
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      const pctHautePriorite =
        totalMaintenances > 0
          ? Math.round((hautePriorite / totalMaintenances) * 100)
          : 0
      doc.text(
        `${pctHautePriorite}% du total`,
        currentX + cardWidth / 2,
        statsY + 28,
        { align: 'center' }
      )

      // === LIGNE DE SÉPARATION ÉLÉGANTE ===
      doc.setDrawColor(...borderColor)
      doc.setLineWidth(0.3)
      doc.line(
        15,
        statsY + cardHeight + 8,
        doc.internal.pageSize.width - 15,
        statsY + cardHeight + 8
      )

      // === INFORMATIONS COMPLÉMENTAIRES ===
      let tableStartY = statsY + cardHeight + 13
      if (enCours > 0) {
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(108, 117, 125)
        doc.text(
          `Note: ${enCours} maintenance(s) en cours d'exécution`,
          doc.internal.pageSize.width / 2,
          tableStartY,
          { align: 'center' }
        )
        tableStartY = statsY + cardHeight + 18
      }

      // === PRÉPARATION DES DONNÉES DU TABLEAU ===
      const tableData = filteredByDate.map((maintenance, index) => {
        // Couleurs selon le statut
        let statutColor = [darkGray[0], darkGray[1], darkGray[2]]
        let statutBg = [255, 255, 255]
        if (maintenance.statut === 'Planifiée') {
          statutColor = [37, 99, 235]
          statutBg = [219, 234, 254]
        } else if (maintenance.statut === 'En cours') {
          statutColor = [202, 138, 4]
          statutBg = [254, 243, 199]
        } else if (maintenance.statut === 'Terminée') {
          statutColor = [22, 163, 74]
          statutBg = [220, 252, 231]
        }

        // Couleurs selon la priorité
        let prioriteColor = [darkGray[0], darkGray[1], darkGray[2]]
        let prioriteBg = [255, 255, 255]
        if (maintenance.priorite === 'Haute') {
          prioriteColor = [220, 38, 38]
          prioriteBg = [254, 226, 226]
        } else if (maintenance.priorite === 'Moyenne') {
          prioriteColor = [202, 138, 4]
          prioriteBg = [254, 243, 199]
        } else if (maintenance.priorite === 'Basse') {
          prioriteColor = [37, 99, 235]
          prioriteBg = [219, 234, 254]
        }

        // Calcul des restes (heures et km)
        let heuresReste = '-'
        let heuresStatut = ''
        if (
          maintenance.heures_fonctionnement_cible != null &&
          maintenance.derniere_heure != null
        ) {
          const reste =
            maintenance.heures_fonctionnement_cible - maintenance.derniere_heure
          heuresReste = `${maintenance.heures_fonctionnement_cible}h (${
            reste > 0 ? '+' : ''
          }${reste}h)`
          heuresStatut =
            reste < 0 ? 'Dépassé' : reste < 100 ? 'Bientôt' : 'En cours'
        }

        let kmReste = '-'
        let kmStatut = ''
        if (
          maintenance.km_fonctionnement_cible != null &&
          maintenance.dernier_km != null
        ) {
          const reste =
            maintenance.km_fonctionnement_cible - maintenance.dernier_km
          kmReste = `${maintenance.km_fonctionnement_cible}km (${
            reste > 0 ? '+' : ''
          }${reste}km)`
          kmStatut =
            reste < 0 ? 'Dépassé' : reste < 500 ? 'Bientôt' : 'En cours'
        }

        return {
          data: [
            maintenance.materiel?.designation ||
              maintenance.designation ||
              'N/A',
            maintenance.materiel?.num_parc || maintenance.num_parc || 'N/A',
            maintenance.materiel?.parc_colas || maintenance.parc_colas || 'N/A',
            maintenance.derniere_date_utilise
              ? dayjs(maintenance.derniere_date_utilise).format('DD/MM/YYYY')
              : '-',
            maintenance.nom_operation || '-',
            maintenance.date_planifiee
              ? dayjs(maintenance.date_planifiee).format('DD/MM/YYYY')
              : 'N/A',
            maintenance.priorite || '-',
            maintenance.statut || '-',
            maintenance.derniere_heure || '-',
            heuresReste,
            maintenance.dernier_km || '-',
            kmReste,
            maintenance.date_debut_intervention &&
            maintenance.date_fin_intervention
              ? `${dayjs(maintenance.date_debut_intervention).format(
                  'DD/MM/YYYY'
                )} - ${dayjs(maintenance.date_fin_intervention).format(
                  'DD/MM/YYYY'
                )}`
              : maintenance.date_debut_intervention
              ? dayjs(maintenance.date_debut_intervention).format('DD/MM/YYYY')
              : '-',
            maintenance.cout_pieces || '-',
            maintenance.notes_intervention || '-',
          ],
          styles: {
            prioriteColor,
            prioriteBg,
            statutColor,
            statutBg,
            rowBg: index % 2 === 0 ? lightGray : [255, 255, 255],
          },
        }
      })

      // === TABLEAU AVEC DESIGN RESPONSIVE ===
      const startY = 110

      autoTable(doc, {
        startY: startY,
        head: [
          [
            'MATÉRIEL',
            'N° PARC',
            'COLAS',
            'DERNIÈRE UTIL.',
            'OPÉRATION',
            'DATE PLANIFIÉE',
            'PRIORITÉ',
            'STATUT',
            'DERN. H',
            'H CIBLE',
            'DERN. KM',
            'KM CIBLE',
            'INTERVENTION',
            'COÛT',
            'NOTES',
          ],
        ],
        body: tableData.map((rowData) => [
          {
            content: rowData.data[0],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'left',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[1],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'center',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[2],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'center',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[3],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'center',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[4],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'left',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[5],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'center',
              fontStyle: 'bold',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[6],
            styles: {
              fontSize: 7,
              cellPadding: 3,
              halign: 'center',
              fontStyle: 'bold',
              textColor: rowData.styles.prioriteColor,
              fillColor: rowData.styles.prioriteBg,
              lineWidth: 0.5,
              lineColor: rowData.styles.prioriteColor,
            },
          },
          {
            content: rowData.data[7],
            styles: {
              fontSize: 7,
              cellPadding: 3,
              halign: 'center',
              fontStyle: 'bold',
              textColor: rowData.styles.statutColor,
              fillColor: rowData.styles.statutBg,
              lineWidth: 0.5,
              lineColor: rowData.styles.statutColor,
            },
          },
          {
            content: rowData.data[8],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'center',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[9],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'center',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[10],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'center',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[11],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'center',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[12],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'center',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[13],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'right',
              fontStyle: 'bold',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[14],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'left',
              fillColor: rowData.styles.rowBg,
            },
          },
        ]),
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [borderColor[0], borderColor[1], borderColor[2]],
          lineWidth: 0.1,
          textColor: [darkGray[0], darkGray[1], darkGray[2]],
          font: 'helvetica',
          overflow: 'linebreak',
          minCellHeight: 8,
        },
        headStyles: {
          fillColor: [primaryDark[0], primaryDark[1], primaryDark[2]],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7,
          cellPadding: 3,
          halign: 'center',
          lineWidth: 0.5,
          lineColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 15 },
          2: { cellWidth: 15 },
          3: { cellWidth: 18 },
          4: { cellWidth: 22 },
          5: { cellWidth: 18 },
          6: { cellWidth: 16 },
          7: { cellWidth: 16 },
          8: { cellWidth: 15 },
          9: { cellWidth: 20 },
          10: { cellWidth: 15 },
          11: { cellWidth: 20 },
          12: { cellWidth: 25 },
          13: { cellWidth: 18 },
          14: { cellWidth: 'auto' },
        },
        margin: { top: startY, left: 10, right: 10 },
        tableWidth: 'auto',
        showHead: 'firstPage',
        didDrawPage: function (data) {
          const pageCount = doc.internal.getNumberOfPages()
          const currentPage = data.pageNumber

          // Footer avec design vert
          doc.setFillColor(250, 250, 250)
          doc.rect(
            0,
            doc.internal.pageSize.height - 30,
            doc.internal.pageSize.width,
            30,
            'F'
          )

          // Ligne verte de séparation
          doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
          doc.setLineWidth(1)
          doc.line(
            15,
            doc.internal.pageSize.height - 30,
            doc.internal.pageSize.width - 15,
            doc.internal.pageSize.height - 30
          )

          // Texte du footer
          doc.setFontSize(8)
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
          doc.setFont('helvetica', 'normal')

          // Gauche
          doc.text(
            'Maintenance Préventive - Henri Fraise',
            15,
            doc.internal.pageSize.height - 20
          )

          // Centre: Pagination
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
          doc.setFont('helvetica', 'bold')
          doc.text(
            `Page ${currentPage} sur ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 20,
            { align: 'center' }
          )

          // Droite
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
          doc.setFont('helvetica', 'normal')
          doc.text(
            `Confidentiel • ${dayjs().format('DD/MM/YYYY')}`,
            doc.internal.pageSize.width - 15,
            doc.internal.pageSize.height - 20,
            { align: 'right' }
          )
        },
      })

      // === PAGE DE SYNTHÈSE ===
      if (filteredByDate.length > 10) {
        doc.addPage('landscape')

        // En-tête synthèse
        doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2])
        doc.rect(0, 0, doc.internal.pageSize.width, 45, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.text('SYNTHÈSE ANALYTIQUE', doc.internal.pageSize.width / 2, 25, {
          align: 'center',
        })

        doc.setFontSize(10)
        doc.setFont('helvetica', 'italic')
        doc.text(
          'Analyse détaillée des maintenances préventives',
          doc.internal.pageSize.width / 2,
          35,
          { align: 'center' }
        )

        let currentY = 60

        // Tableau de synthèse
        const summaryData = [
          ['Maintenances totales', totalMaintenances.toString(), '100%'],
          [
            'Planifiées',
            planifiees.toString(),
            `${Math.round((planifiees / totalMaintenances) * 100)}%`,
          ],
          [
            'En cours',
            enCours.toString(),
            `${Math.round((enCours / totalMaintenances) * 100)}%`,
          ],
          [
            'Terminées',
            terminees.toString(),
            `${Math.round((terminees / totalMaintenances) * 100)}%`,
          ],
          [
            'Priorité haute',
            hautePriorite.toString(),
            `${Math.round((hautePriorite / totalMaintenances) * 100)}%`,
          ],
          [
            'Priorité moyenne',
            moyennePriorite.toString(),
            `${Math.round((moyennePriorite / totalMaintenances) * 100)}%`,
          ],
          [
            'Priorité basse',
            bassePriorite.toString(),
            `${Math.round((bassePriorite / totalMaintenances) * 100)}%`,
          ],
          ['Coût total', `${coutTotal} Ar`, '-'],
          [
            'Coût moyen',
            totalMaintenances > 0
              ? `${Math.round(coutTotal / totalMaintenances).toLocaleString(
                  'fr-FR'
                )} Ar`
              : '0 Ar',
            '-',
          ],
        ]

        autoTable(doc, {
          startY: currentY,
          head: [['INDICATEUR', 'VALEUR', 'POURCENTAGE']],
          body: summaryData,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 5,
            lineColor: [borderColor[0], borderColor[1], borderColor[2]],
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'center',
          },
          columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold', fillColor: [248, 249, 250] },
            1: { cellWidth: 60, halign: 'center' },
            2: { cellWidth: 40, halign: 'center' },
          },
          margin: { left: 20, right: 20 },
        })

        currentY = doc.lastAutoTable.finalY + 20

        // Graphique à barres
        if (currentY < doc.internal.pageSize.height - 80) {
          doc.setFontSize(14)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
          doc.text('DISTRIBUTION PAR STATUT', 20, currentY)
          currentY += 10

          const maxStat = Math.max(planifiees, enCours, terminees)
          const barWidth = 150
          const barHeight = 15
          const startX = 40

          // Barre Planifiées
          const planifieesWidth =
            maxStat > 0 ? (planifiees / maxStat) * barWidth : 0
          doc.setFillColor(37, 99, 235)
          doc.roundedRect(
            startX,
            currentY,
            planifieesWidth,
            barHeight,
            2,
            2,
            'F'
          )
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
          doc.setFontSize(9)
          doc.text('Planifiées', 20, currentY + 10)
          doc.text(
            `${planifiees} (${Math.round(
              (planifiees / totalMaintenances) * 100
            )}%)`,
            startX + barWidth + 10,
            currentY + 10
          )
          currentY += 25

          // Barre En cours
          const coursWidth = maxStat > 0 ? (enCours / maxStat) * barWidth : 0
          doc.setFillColor(202, 138, 4)
          doc.roundedRect(startX, currentY, coursWidth, barHeight, 2, 2, 'F')
          doc.text('En cours', 20, currentY + 10)
          doc.text(
            `${enCours} (${Math.round((enCours / totalMaintenances) * 100)}%)`,
            startX + barWidth + 10,
            currentY + 10
          )
          currentY += 25

          // Barre Terminées
          const termineesWidth =
            maxStat > 0 ? (terminees / maxStat) * barWidth : 0
          doc.setFillColor(22, 163, 74)
          doc.roundedRect(
            startX,
            currentY,
            termineesWidth,
            barHeight,
            2,
            2,
            'F'
          )
          doc.text('Terminées', 20, currentY + 10)
          doc.text(
            `${terminees} (${Math.round(
              (terminees / totalMaintenances) * 100
            )}%)`,
            startX + barWidth + 10,
            currentY + 10
          )
        }
      }

      // Sauvegarder le PDF
      const fileName = `Rapport_Maintenance_Preventive_${pdfStartDate.format(
        'DD-MM-YYYY'
      )}_${pdfEndDate.format('DD-MM-YYYY')}_${dayjs().format('HHmmss')}.pdf`
      doc.save(fileName)

      handleClosePdfDialog()
      setSnackbarMessage('PDF généré avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      setSnackbarMessage(
        'Erreur lors de la génération du PDF: ' + error.message
      )
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
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
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
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
        <Button
          variant="contained"
          color="success"
          startIcon={<PictureAsPdfIcon />}
          onClick={() => setOpenPdfDialog(true)}
          sx={{ minWidth: '180px', whiteSpace: 'nowrap' }}
        >
          Exporter PDF
        </Button>
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

      {/* Modal de sélection de dates pour le PDF */}
      <Dialog
        open={openPdfDialog}
        onClose={handleClosePdfDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Exporter en PDF</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
              <DatePicker
                label="Date de début"
                value={pdfStartDate}
                onChange={(newValue) => setPdfStartDate(newValue)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              <DatePicker
                label="Date de fin"
                value={pdfEndDate}
                onChange={(newValue) => setPdfEndDate(newValue)}
                format="DD/MM/YYYY"
                minDate={pdfStartDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePdfDialog}>Annuler</Button>
          <Button
            onClick={generatePreventivePDF}
            variant="contained"
            color="success"
            startIcon={<PictureAsPdfIcon />}
          >
            Générer PDF
          </Button>
        </DialogActions>
      </Dialog>

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
