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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import TableView from '../../../../components/ui-table/TableView'
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog'
import Breadcrumb from '../../../../components/ui/Breadcrumb'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/fr'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import dayjs from 'dayjs'

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

  // États pour le modal d'export PDF
  const [openPdfDialog, setOpenPdfDialog] = useState(false)
  const [pdfStartDate, setPdfStartDate] = useState(null)
  const [pdfEndDate, setPdfEndDate] = useState(null)

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

  // Fonction pour fermer le dialogue et réinitialiser les dates
  const handleClosePdfDialog = () => {
    setOpenPdfDialog(false)
    setPdfStartDate(null)
    setPdfEndDate(null)
  }

  // Fonction pour générer le PDF
  const generatePDF = async () => {
    if (!pdfStartDate || !pdfEndDate) {
      setSnackbarMessage('Veuillez sélectionner une période')
      setSnackbarSeverity('warning')
      setOpenSnackbar(true)
      return
    }

    try {
      // Filtrer les maintenances par date de signalement
      const filteredByDate = maintenances.filter((maintenance) => {
        const date = dayjs(maintenance.date_signalement)
        return (
          date.isAfter(pdfStartDate.subtract(1, 'day')) &&
          date.isBefore(pdfEndDate.add(1, 'day'))
        )
      })

      if (filteredByDate.length === 0) {
        setSnackbarMessage(
          'Aucune maintenance curative trouvée pour cette période'
        )
        setSnackbarSeverity('warning')
        setOpenSnackbar(true)
        return
      }

      // Trier par date de signalement
      filteredByDate.sort((a, b) =>
        dayjs(a.date_signalement).diff(dayjs(b.date_signalement))
      )

      // Créer le document PDF en mode paysage
      const doc = new jsPDF('landscape')

      // === THÈME ROUGE PROFESSIONNEL ===
      const primaryColor = [220, 53, 69]
      const primaryDark = [200, 35, 51]
      const darkRed = [139, 0, 0]
      const successColor = [40, 167, 69]
      const warningColor = [255, 193, 7]
      const infoColor = [23, 162, 184]
      const lightGray = [248, 249, 250]
      const borderColor = [220, 220, 220]
      const darkGray = [52, 58, 64]

      // === EN-TÊTE MODERNE ROUGE ===
      doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2])
      doc.rect(0, 0, doc.internal.pageSize.width, 50, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(
        'RAPPORT DE MAINTENANCE CURATIVE',
        doc.internal.pageSize.width / 2,
        22,
        { align: 'center' }
      )

      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Période du ${pdfStartDate.format(
          'DD/MM/YYYY'
        )} jusqu'au ${pdfEndDate.format('DD/MM/YYYY')}`,
        doc.internal.pageSize.width / 2,
        32,
        { align: 'center' }
      )

      doc.setFontSize(10)
      doc.text(
        `Généré le ${dayjs().format('DD/MM/YYYY à HH:mm')}`,
        doc.internal.pageSize.width / 2,
        40,
        { align: 'center' }
      )

      // === CARTES STATISTIQUES MODERNES ===
      const statsY = 60
      const cardHeight = 32
      const cardSpacing = 5
      const startX = 15

      // Calculer les statistiques
      const totalMaintenances = filteredByDate.length
      const enAttente = filteredByDate.filter(
        (m) => m.statut === 'En attente'
      ).length
      const enCours = filteredByDate.filter(
        (m) => m.statut === 'En cours'
      ).length
      const terminees = filteredByDate.filter(
        (m) => m.statut === 'Terminée'
      ).length
      const immediates = filteredByDate.filter(
        (m) => m.categorie === 'Immédiate'
      ).length
      const coutTotal = filteredByDate.reduce(
        (sum, m) => sum + (parseFloat(m.cout_pieces) || 0),
        0
      )
      const pourcentageTerminees =
        totalMaintenances > 0
          ? Math.round((terminees / totalMaintenances) * 100)
          : 0

      // Largeur des cartes (5 cartes égales)
      const cardWidth =
        (doc.internal.pageSize.width - startX * 2 - cardSpacing * 4) / 5

      // === CARTE 1: TOTAL MAINTENANCES ===
      let currentX = startX

      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(...primaryColor)
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      doc.setFillColor(...primaryColor)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('TOTAL', currentX + cardWidth / 2, statsY + 10, {
        align: 'center',
      })

      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryColor)
      doc.text(
        totalMaintenances.toString(),
        currentX + cardWidth / 2,
        statsY + 22,
        { align: 'center' }
      )

      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('maintenances', currentX + cardWidth / 2, statsY + 28, {
        align: 'center',
      })

      // === CARTE 2: COÛT TOTAL ===
      currentX += cardWidth + cardSpacing

      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(...infoColor)
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      doc.setFillColor(...infoColor)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('COÛT TOTAL', currentX + cardWidth / 2, statsY + 10, {
        align: 'center',
      })

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...infoColor)
      doc.text(`${coutTotal}`, currentX + cardWidth / 2, statsY + 20, {
        align: 'center',
      })

      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('Ariary', currentX + cardWidth / 2, statsY + 27, {
        align: 'center',
      })

      // === CARTE 3: IMMÉDIATES ===
      currentX += cardWidth + cardSpacing

      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(...darkRed)
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      doc.setFillColor(...darkRed)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('IMMÉDIATES', currentX + cardWidth / 2, statsY + 10, {
        align: 'center',
      })

      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...darkRed)
      doc.text(
        immediates.toString(),
        currentX + cardWidth / 2 - 8,
        statsY + 22,
        { align: 'center' }
      )

      doc.setFontSize(12)
      doc.setTextColor(108, 117, 125)
      const pctImmediates =
        totalMaintenances > 0
          ? Math.round((immediates / totalMaintenances) * 100)
          : 0
      doc.text(
        `(${pctImmediates}%)`,
        currentX + cardWidth / 2 + 8,
        statsY + 22,
        { align: 'left' }
      )

      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text('urgentes', currentX + cardWidth / 2, statsY + 28, {
        align: 'center',
      })

      // === CARTE 4: EN ATTENTE ===
      currentX += cardWidth + cardSpacing

      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(...warningColor)
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      doc.setFillColor(...warningColor)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('EN ATTENTE', currentX + cardWidth / 2, statsY + 10, {
        align: 'center',
      })

      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...warningColor)
      doc.text(enAttente.toString(), currentX + cardWidth / 2, statsY + 22, {
        align: 'center',
      })

      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      const pctAttente =
        totalMaintenances > 0
          ? Math.round((enAttente / totalMaintenances) * 100)
          : 0
      doc.text(
        `${pctAttente}% du total`,
        currentX + cardWidth / 2,
        statsY + 28,
        { align: 'center' }
      )

      // === CARTE 5: TERMINÉES ===
      currentX += cardWidth + cardSpacing

      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(...successColor)
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      doc.setFillColor(...successColor)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('TERMINÉES', currentX + cardWidth / 2, statsY + 10, {
        align: 'center',
      })

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

      doc.setFillColor(220, 252, 231)
      doc.roundedRect(
        progressBarX,
        progressBarY,
        progressBarWidth,
        3,
        1,
        1,
        'F'
      )

      doc.setFillColor(...successColor)
      doc.roundedRect(progressBarX, progressBarY, progressFill, 3, 1, 1, 'F')

      // === LIGNE DE SÉPARATION ===
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
        let statutColor = [darkGray[0], darkGray[1], darkGray[2]]
        let statutBg = [255, 255, 255]
        if (maintenance.statut === 'En attente') {
          statutColor = [255, 193, 7]
          statutBg = [255, 243, 205]
        } else if (maintenance.statut === 'En cours') {
          statutColor = [23, 162, 184]
          statutBg = [209, 236, 241]
        } else if (maintenance.statut === 'Terminée') {
          statutColor = [40, 167, 69]
          statutBg = [212, 237, 218]
        }

        let categorieColor = [darkGray[0], darkGray[1], darkGray[2]]
        let categorieBg = [255, 255, 255]
        if (maintenance.categorie === 'Immédiate') {
          categorieColor = [darkRed[0], darkRed[1], darkRed[2]]
          categorieBg = [255, 228, 228]
        } else if (maintenance.categorie === 'Différée') {
          categorieColor = [108, 117, 125]
          categorieBg = [233, 236, 239]
        }

        return {
          data: [
            dayjs(maintenance.date_signalement).format('DD/MM/YYYY'),
            maintenance.designation || 'N/A',
            maintenance.num_parc || 'N/A',
            maintenance.parc_colas || 'N/A',
            maintenance.description_signalement || '-',
            maintenance.categorie || '-',
            maintenance.statut || '-',
            maintenance.date_debut_intervention
              ? dayjs(maintenance.date_debut_intervention).format('DD/MM/YYYY')
              : '-',
            maintenance.date_fin_intervention
              ? dayjs(maintenance.date_fin_intervention).format('DD/MM/YYYY')
              : '-',
            maintenance.cout_pieces || '-',
            maintenance.pieces_remplacees || '-',
            maintenance.pieces_reparees || '-',
            maintenance.notes_reparation || '-',
          ],
          styles: {
            categorieColor,
            categorieBg,
            statutColor,
            statutBg,
            rowBg: index % 2 === 0 ? lightGray : [255, 255, 255],
          },
        }
      })

      // === TABLEAU ===
      autoTable(doc, {
        startY: tableStartY,
        head: [
          [
            'DATE',
            'MATÉRIEL',
            'N° PARC',
            'COLAS',
            'DESCRIPTION',
            'CATÉGORIE',
            'STATUT',
            'DÉBUT',
            'FIN',
            'COÛT',
            'PIÈCES REMPL.',
            'PIÈCES RÉPAR.',
            'NOTES',
          ],
        ],
        body: tableData.map((rowData) => [
          {
            content: rowData.data[0],
            styles: {
              fontStyle: 'bold',
              fontSize: 7,
              cellPadding: 2,
              halign: 'center',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[1],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'left',
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
              cellPadding: 3,
              halign: 'center',
              fontStyle: 'bold',
              textColor: rowData.styles.categorieColor,
              fillColor: rowData.styles.categorieBg,
              lineWidth: 0.5,
              lineColor: rowData.styles.categorieColor,
            },
          },
          {
            content: rowData.data[6],
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
            content: rowData.data[7],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'center',
              fillColor: rowData.styles.rowBg,
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
              halign: 'right',
              fontStyle: 'bold',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[10],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'left',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[11],
            styles: {
              fontSize: 7,
              cellPadding: 2,
              halign: 'left',
              fillColor: rowData.styles.rowBg,
            },
          },
          {
            content: rowData.data[12],
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
          fontSize: 8,
          cellPadding: 3,
          halign: 'center',
          lineWidth: 0.5,
          lineColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
        },
        columnStyles: {
          0: { cellWidth: 18, halign: 'center' },
          1: { cellWidth: 22, halign: 'left' },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 25, halign: 'left' },
          5: { cellWidth: 18, halign: 'center' },
          6: { cellWidth: 18, halign: 'center' },
          7: { cellWidth: 18, halign: 'center' },
          8: { cellWidth: 18, halign: 'center' },
          9: { cellWidth: 20, halign: 'right' },
          10: { cellWidth: 22, halign: 'left' },
          11: { cellWidth: 22, halign: 'left' },
          12: { cellWidth: 'auto', halign: 'left' },
        },
        margin: { top: tableStartY, left: 10, right: 10 },
        tableWidth: 'auto',
        showHead: 'firstPage',
        didDrawPage: function (data) {
          const pageCount = doc.internal.getNumberOfPages()
          const currentPage = data.pageNumber

          doc.setFillColor(250, 250, 250)
          doc.rect(
            0,
            doc.internal.pageSize.height - 30,
            doc.internal.pageSize.width,
            30,
            'F'
          )

          doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
          doc.setLineWidth(1)
          doc.line(
            15,
            doc.internal.pageSize.height - 30,
            doc.internal.pageSize.width - 15,
            doc.internal.pageSize.height - 30
          )

          doc.setFontSize(8)
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
          doc.setFont('helvetica', 'normal')

          doc.text(
            'Maintenance Curative - Henri Fraise',
            15,
            doc.internal.pageSize.height - 20
          )

          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
          doc.setFont('helvetica', 'bold')
          doc.text(
            `Page ${currentPage} sur ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 20,
            { align: 'center' }
          )

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
          'Analyse détaillée des maintenances curatives',
          doc.internal.pageSize.width / 2,
          35,
          { align: 'center' }
        )

        let currentY = 60

        const differees = filteredByDate.filter(
          (m) => m.categorie === 'Différée'
        ).length
        const summaryData = [
          ['Maintenances totales', totalMaintenances.toString(), '100%'],
          [
            'Maintenances immédiates',
            immediates.toString(),
            `${Math.round((immediates / totalMaintenances) * 100)}%`,
          ],
          [
            'Maintenances différées',
            differees.toString(),
            `${Math.round((differees / totalMaintenances) * 100)}%`,
          ],
          [
            'En attente de traitement',
            enAttente.toString(),
            `${Math.round((enAttente / totalMaintenances) * 100)}%`,
          ],
          [
            'En cours de réparation',
            enCours.toString(),
            `${Math.round((enCours / totalMaintenances) * 100)}%`,
          ],
          [
            'Réparations terminées',
            terminees.toString(),
            `${Math.round((terminees / totalMaintenances) * 100)}%`,
          ],
          [
            'Coût total des pièces',
            `${coutTotal.toLocaleString('fr-FR')} Ar`,
            '-',
          ],
          [
            'Coût moyen par maintenance',
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
          didParseCell: function (data) {
            if (
              data.row.index > 0 &&
              data.column.index === 2 &&
              data.cell.raw !== '-'
            ) {
              const value = parseInt(data.cell.raw.replace('%', ''))
              if (value > 50) {
                data.cell.styles.fillColor = [215, 232, 205]
              } else if (value > 20) {
                data.cell.styles.fillColor = [255, 243, 205]
              } else {
                data.cell.styles.fillColor = [248, 215, 218]
              }
            }
          },
        })

        currentY = doc.lastAutoTable.finalY + 20

        if (currentY < doc.internal.pageSize.height - 80) {
          doc.setFontSize(14)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
          doc.text('DISTRIBUTION PAR STATUT', 20, currentY)
          currentY += 10

          const maxStat = Math.max(enAttente, enCours, terminees)
          const barWidth = 150
          const barHeight = 15
          const startX = 40

          const attenteWidth =
            maxStat > 0 ? (enAttente / maxStat) * barWidth : 0
          doc.setFillColor(255, 193, 7)
          doc.roundedRect(startX, currentY, attenteWidth, barHeight, 2, 2, 'F')
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
          doc.setFontSize(9)
          doc.text('En attente', 20, currentY + 10)
          doc.text(
            `${enAttente} (${Math.round(
              (enAttente / totalMaintenances) * 100
            )}%)`,
            startX + barWidth + 10,
            currentY + 10
          )
          currentY += 25

          const coursWidth = maxStat > 0 ? (enCours / maxStat) * barWidth : 0
          doc.setFillColor(23, 162, 184)
          doc.roundedRect(startX, currentY, coursWidth, barHeight, 2, 2, 'F')
          doc.text('En cours', 20, currentY + 10)
          doc.text(
            `${enCours} (${Math.round((enCours / totalMaintenances) * 100)}%)`,
            startX + barWidth + 10,
            currentY + 10
          )
          currentY += 25

          const termineWidth =
            maxStat > 0 ? (terminees / maxStat) * barWidth : 0
          doc.setFillColor(40, 167, 69)
          doc.roundedRect(startX, currentY, termineWidth, barHeight, 2, 2, 'F')
          doc.text('Terminées', 20, currentY + 10)
          doc.text(
            `${terminees} (${Math.round(
              (terminees / totalMaintenances) * 100
            )}%)`,
            startX + barWidth + 10,
            currentY + 10
          )
        }

        const sigY = doc.internal.pageSize.height - 50
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
        doc.setLineWidth(0.5)
        doc.line(
          doc.internal.pageSize.width - 150,
          sigY,
          doc.internal.pageSize.width - 50,
          sigY
        )

        doc.setFontSize(8)
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
        doc.text(
          'Service Maintenance',
          doc.internal.pageSize.width - 100,
          sigY + 10,
          { align: 'center' }
        )
      }

      // === SAUVEGARDE DU PDF ===
      const fileName = `Rapport_Maintenance_Curative_${pdfStartDate.format(
        'DDMMYYYY'
      )}_${pdfEndDate.format('DDMMYYYY')}_${dayjs().format('HHmm')}.pdf`
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
        color: '#dc2626',
      },
      Différée: {
        color: '#ca8a04',
      },
    }

    const { color } = styles[categorie] || {
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
        color: '#ca8a04',
      },
      'En cours': {
        color: '#2563eb',
      },
      Terminée: {
        color: '#16a34a',
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
      id: 'date_signalement',
      label: 'Date Signalement',
      render: (row) => formatDate(row.date_signalement),
    },
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
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
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
        <Button
          variant="contained"
          color="error"
          startIcon={<PictureAsPdfIcon />}
          onClick={() => setOpenPdfDialog(true)}
          sx={{ minWidth: '180px', whiteSpace: 'nowrap' }}
        >
          Exporter PDF
        </Button>
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
            onClick={generatePDF}
            variant="contained"
            color="error"
            startIcon={<PictureAsPdfIcon />}
          >
            Générer PDF
          </Button>
        </DialogActions>
      </Dialog>

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
