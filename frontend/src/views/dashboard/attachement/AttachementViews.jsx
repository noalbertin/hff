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
import TableView from '../../../components/ui-table/TableView'
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import { useAuthStore, selectUser } from '../../../store/auth'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/fr'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import AttachementEdit from './AttachementEdit'
import AttachementCreate from './AttachementCreate'
import api from '../../../utils/axios'
import dayjs from 'dayjs'

const AttachementViews = () => {
  const [attachements, setAttachements] = useState([])
  const [filteredAttachements, setFilteredAttachements] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAttachement, setSelectedAttachement] = useState(null)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [attachementToDelete, setAttachementToDelete] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const { role: userRole } = useAuthStore(selectUser)

  // États pour le modal d'export PDF
  const [openPdfDialog, setOpenPdfDialog] = useState(false)
  const [pdfStartDate, setPdfStartDate] = useState(null)
  const [pdfEndDate, setPdfEndDate] = useState(null)

  // Charger les attachements depuis le backend
  const fetchAttachements = async () => {
    try {
      const { data } = await api.get('attachement')
      setAttachements(data)
      setFilteredAttachements(data)
    } catch (error) {
      console.error('Erreur lors du chargement des attachements:', error)
      setSnackbarMessage('Erreur lors du chargement des attachements')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  useEffect(() => {
    fetchAttachements()
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
      setFilteredAttachements(attachements)
    } else {
      const filtered = attachements.filter((attachement) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          attachement.materiel_designation
            ?.toLowerCase()
            .includes(searchLower) ||
          attachement.lot?.toLowerCase().includes(searchLower) ||
          attachement.statut?.toLowerCase().includes(searchLower) ||
          attachement.observation?.toLowerCase().includes(searchLower) ||
          attachement.materiel_num_parc?.toLowerCase().includes(searchLower) ||
          attachement.materiel_parc_colas
            ?.toLowerCase()
            .includes(searchLower) ||
          attachement.id?.toString().includes(searchLower)
        )
      })
      setFilteredAttachements(filtered)
    }
  }, [searchTerm, attachements])

  // Fonction pour fermer le dialogue et réinitialiser les dates
  const handleClosePdfDialog = () => {
    setOpenPdfDialog(false)
    setPdfStartDate(null)
    setPdfEndDate(null)
  }

  // Fonction complète pour générer le PDF des attachements avec bandeau statistiques
  const generatePDF = async () => {
    if (!pdfStartDate || !pdfEndDate) {
      setSnackbarMessage('Veuillez sélectionner une période')
      setSnackbarSeverity('warning')
      setOpenSnackbar(true)
      return
    }

    try {
      // Filtrer les attachements par date
      const filteredByDate = attachements.filter((attachement) => {
        const date = dayjs(attachement.date_utilise)
        return (
          date.isAfter(pdfStartDate.subtract(1, 'day')) &&
          date.isBefore(pdfEndDate.add(1, 'day'))
        )
      })

      if (filteredByDate.length === 0) {
        setSnackbarMessage('Aucun attachement trouvé pour cette période')
        setSnackbarSeverity('warning')
        setOpenSnackbar(true)
        return
      }

      // Trier par date
      filteredByDate.sort((a, b) =>
        dayjs(a.date_utilise).diff(dayjs(b.date_utilise))
      )

      // Créer le document PDF en mode paysage
      const doc = new jsPDF('landscape')

      // Définir les couleurs du thème
      const primaryColor = [41, 128, 185] // Bleu professionnel
      const successColor = [40, 167, 69] // Vert succès
      const dangerColor = [220, 53, 69] // Rouge danger
      const warningColor = [255, 193, 7] // Jaune avertissement
      const lightGray = [248, 249, 250] // Gris clair pour lignes alternées
      const borderColor = [222, 226, 230] // Couleur des bordures

      // === EN-TÊTE PROFESSIONNEL ===
      // Fond coloré pour l'en-tête
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, doc.internal.pageSize.width, 50, 'F')

      // Logo/titre principal (centré)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text("Rapport d'Attachement", doc.internal.pageSize.width / 2, 22, {
        align: 'center',
      })

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
      const statsY = 55
      const cardHeight = 28
      const cardSpacing = 5
      const startX = 15

      // Calculer les statistiques
      const totalAttachements = filteredByDate.length
      const factures = filteredByDate.filter((a) => a.facture).length
      const pourcentageFactures =
        totalAttachements > 0
          ? Math.round((factures / totalAttachements) * 100)
          : 0
      const statsLocation = filteredByDate.filter(
        (a) => a.statut === 'En location'
      ).length
      const statsPanne = filteredByDate.filter(
        (a) => a.statut === 'En panne'
      ).length
      const statsAutre = totalAttachements - statsLocation - statsPanne

      // Largeur des cartes (4 cartes égales)
      const cardWidth =
        (doc.internal.pageSize.width - startX * 2 - cardSpacing * 3) / 4

      // === CARTE 1: TOTAL ATTACHEMENTS ===
      let currentX = startX

      // Fond de la carte avec bordure
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(41, 128, 185) // Bordure bleue
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      // Icône ou badge coloré en haut
      doc.setFillColor(41, 128, 185)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      // Label
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('TOTAL', currentX + cardWidth / 2, statsY + 8, {
        align: 'center',
      })

      // Valeur principale
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(41, 128, 185)
      doc.text(
        totalAttachements.toString(),
        currentX + cardWidth / 2,
        statsY + 20,
        { align: 'center' }
      )

      // Sous-label
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('attachements', currentX + cardWidth / 2, statsY + 26, {
        align: 'center',
      })

      // === CARTE 2: FACTURÉS ===
      currentX += cardWidth + cardSpacing

      // Fond et bordure
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(40, 167, 69) // Bordure verte
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      // Badge vert
      doc.setFillColor(40, 167, 69)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      // Label
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('FACTURÉS', currentX + cardWidth / 2, statsY + 8, {
        align: 'center',
      })

      // Valeur principale avec pourcentage
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(40, 167, 69)
      doc.text(factures.toString(), currentX + cardWidth / 2 - 8, statsY + 20, {
        align: 'center',
      })

      doc.setFontSize(12)
      doc.setTextColor(108, 117, 125)
      doc.text(
        `(${pourcentageFactures}%)`,
        currentX + cardWidth / 2 + 8,
        statsY + 20,
        { align: 'left' }
      )

      // Barre de progression
      const progressBarWidth = cardWidth - 16
      const progressBarX = currentX + 8
      const progressBarY = statsY + 23
      const progressFill =
        totalAttachements > 0
          ? (factures / totalAttachements) * progressBarWidth
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

      doc.setFillColor(40, 167, 69) // Remplissage vert
      doc.roundedRect(progressBarX, progressBarY, progressFill, 3, 1, 1, 'F')

      // === CARTE 3: EN LOCATION ===
      currentX += cardWidth + cardSpacing

      // Fond et bordure
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(22, 163, 74) // Bordure verte location
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      // Badge
      doc.setFillColor(22, 163, 74)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      // Label
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('EN LOCATION', currentX + cardWidth / 2, statsY + 8, {
        align: 'center',
      })

      // Valeur
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(22, 163, 74)
      doc.text(
        statsLocation.toString(),
        currentX + cardWidth / 2,
        statsY + 20,
        { align: 'center' }
      )

      // Pourcentage
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      const pctLocation =
        totalAttachements > 0
          ? Math.round((statsLocation / totalAttachements) * 100)
          : 0
      doc.text(
        `${pctLocation}% du total`,
        currentX + cardWidth / 2,
        statsY + 26,
        { align: 'center' }
      )

      // === CARTE 4: EN PANNE ===
      currentX += cardWidth + cardSpacing

      // Fond et bordure
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'FD')
      doc.setDrawColor(220, 53, 69) // Bordure rouge panne
      doc.setLineWidth(0.5)
      doc.roundedRect(currentX, statsY, cardWidth, cardHeight, 3, 3, 'S')

      // Badge rouge
      doc.setFillColor(220, 53, 69)
      doc.circle(currentX + 10, statsY + 10, 4, 'F')

      // Label
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      doc.text('EN PANNE', currentX + cardWidth / 2, statsY + 8, {
        align: 'center',
      })

      // Valeur
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(220, 53, 69)
      doc.text(statsPanne.toString(), currentX + cardWidth / 2, statsY + 20, {
        align: 'center',
      })

      // Pourcentage
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(108, 117, 125)
      const pctPanne =
        totalAttachements > 0
          ? Math.round((statsPanne / totalAttachements) * 100)
          : 0
      doc.text(`${pctPanne}% du total`, currentX + cardWidth / 2, statsY + 26, {
        align: 'center',
      })

      // === LIGNE DE SÉPARATION ÉLÉGANTE ===
      doc.setDrawColor(222, 226, 230)
      doc.setLineWidth(0.3)
      doc.line(
        15,
        statsY + cardHeight + 5,
        doc.internal.pageSize.width - 15,
        statsY + cardHeight + 5
      )

      // === INFORMATIONS COMPLÉMENTAIRES (statut "Autre") ===
      let tableStartY = statsY + cardHeight + 10
      if (statsAutre > 0) {
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(108, 117, 125)
        doc.text(
          `Note: ${statsAutre} attachement(s) avec autre statut`,
          doc.internal.pageSize.width / 2,
          statsY + cardHeight + 10,
          { align: 'center' }
        )
        tableStartY = statsY + cardHeight + 15
      }

      // Préparer les données pour le tableau avec mise en forme conditionnelle
      const tableData = filteredByDate.map((att, index) => {
        // Déterminer la couleur du statut
        let statutColor = [108, 117, 125] // Gris par défaut
        if (att.statut === 'En location') statutColor = successColor
        if (att.statut === 'En panne') statutColor = dangerColor

        // Déterminer la couleur pour "Facturé"
        const factureColor = att.facture ? successColor : dangerColor

        return [
          dayjs(att.date_utilise).format('DD/MM/YYYY'),
          att.materiel_designation || 'N/A',
          att.materiel_num_parc || 'N/A',
          att.materiel_parc_colas || 'N/A',
          att.lot || '-',
          att.heure_debut && att.heure_fin
            ? `${att.heure_debut} - ${att.heure_fin}`
            : '-',
          att.km_debut && att.km_fin ? `${att.km_debut} - ${att.km_fin}` : '-',
          att.statut || '-',
          att.facture ? 'Oui' : 'Non',
          att.observation || '-',
          // Stocker les couleurs pour les cellules spécifiques
          statutColor, // Pour la colonne Statut
          factureColor, // Pour la colonne Facturé
          index, // Pour les lignes alternées
        ]
      })

      // Générer le tableau avec design moderne
      autoTable(doc, {
        startY: tableStartY,
        head: [
          [
            {
              content: 'Date',
              styles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold',
              },
            },
            {
              content: 'Matériel',
              styles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold',
              },
            },
            {
              content: 'Parc HFF',
              styles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold',
              },
            },
            {
              content: 'Parc Colas',
              styles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold',
              },
            },
            {
              content: 'Lot',
              styles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold',
              },
            },
            {
              content: 'Heures',
              styles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold',
              },
            },
            {
              content: 'Km',
              styles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold',
              },
            },
            {
              content: 'Statut',
              styles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold',
              },
            },
            {
              content: 'Facturé',
              styles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold',
              },
            },
            {
              content: 'Observation',
              styles: {
                fillColor: primaryColor,
                textColor: 255,
                fontStyle: 'bold',
              },
            },
          ],
        ],
        body: tableData.map((row, rowIndex) => [
          { content: row[0], styles: { fontStyle: 'bold' } },
          row[1],
          row[2],
          row[3],
          row[4],
          row[5],
          row[6],
          {
            content: row[7],
            styles: {
              textColor: row[10], // Couleur du statut
              fontStyle: 'bold',
              fillColor: rowIndex % 2 === 0 ? lightGray : [255, 255, 255],
            },
          },
          {
            content: row[8],
            styles: {
              textColor: row[11], // Couleur facturé
              fontStyle: 'bold',
              fillColor: rowIndex % 2 === 0 ? lightGray : [255, 255, 255],
            },
          },
          {
            content: row[9],
            styles: {
              fillColor: rowIndex % 2 === 0 ? lightGray : [255, 255, 255],
            },
          },
        ]),
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: borderColor,
          lineWidth: 0.1,
          textColor: [33, 37, 41],
          font: 'helvetica',
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: 4,
          halign: 'center',
        },
        bodyStyles: {
          cellPadding: 3,
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: lightGray,
        },
        columnStyles: {
          0: {
            cellWidth: 22,
            halign: 'center',
            fontStyle: 'bold',
          },
          1: {
            cellWidth: 35,
            halign: 'left',
          },
          2: {
            cellWidth: 22,
            halign: 'center',
          },
          3: {
            cellWidth: 22,
            halign: 'center',
          },
          4: {
            cellWidth: 20,
            halign: 'center',
          },
          5: {
            cellWidth: 25,
            halign: 'center',
          },
          6: {
            cellWidth: 25,
            halign: 'center',
          },
          7: {
            cellWidth: 22,
            halign: 'center',
            fontStyle: 'bold',
          },
          8: {
            cellWidth: 18,
            halign: 'center',
            fontStyle: 'bold',
          },
          9: {
            cellWidth: 'auto',
            halign: 'left',
          },
        },
        margin: { top: tableStartY },
        didDrawPage: function (data) {
          // Ajouter un footer sur chaque page
          const pageCount = doc.internal.getNumberOfPages()

          // Ligne de séparation
          doc.setDrawColor(...borderColor)
          doc.setLineWidth(0.5)
          doc.line(
            14,
            doc.internal.pageSize.height - 25,
            doc.internal.pageSize.width - 14,
            doc.internal.pageSize.height - 25
          )

          // Texte du footer
          doc.setFontSize(8)
          doc.setTextColor(108, 117, 125)
          doc.setFont('helvetica', 'normal')

          // Footer gauche - Nom de l'entreprise/système
          doc.text(
            'PDF pour Attachements - Henri Fraise',
            14,
            doc.internal.pageSize.height - 15
          )

          // Footer centre - Numéro de page
          doc.text(
            `Page ${data.pageNumber} sur ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 15,
            { align: 'center' }
          )

          // Footer droit - Date
          doc.text(
            `Document confidentiel - ${dayjs().format('DD/MM/YYYY')}`,
            doc.internal.pageSize.width - 14,
            doc.internal.pageSize.height - 15,
            { align: 'right' }
          )
        },
      })

      // === PAGE DE RÉSUMÉ (optionnelle pour les rapports longs) ===
      if (filteredByDate.length > 20) {
        doc.addPage('landscape')

        // Titre page de résumé
        doc.setFillColor(...primaryColor)
        doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text('Synthèse du Rapport', doc.internal.pageSize.width / 2, 25, {
          align: 'center',
        })

        doc.setFontSize(11)
        doc.text(
          `Période: ${pdfStartDate.format(
            'DD/MM/YYYY'
          )} jusqu'au ${pdfEndDate.format('DD/MM/YYYY')}`,
          doc.internal.pageSize.width / 2,
          35,
          { align: 'center' }
        )

        // Réinitialiser la couleur du texte
        doc.setTextColor(33, 37, 41)

        // Statistiques détaillées
        const startY = 60
        let currentY = startY

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Statistiques Générales', 20, currentY)
        currentY += 15

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')

        // Tableau de statistiques
        const summaryData = [
          ["Total d'attachements", totalAttachements.toString()],
          ['Attachements facturés', `${factures} (${pourcentageFactures}%)`],
          ['En location', statsLocation.toString()],
          ['En panne', statsPanne.toString()],
          ['Autres statuts', statsAutre.toString()],
        ]

        autoTable(doc, {
          startY: currentY,
          head: [['Catégorie', 'Valeur']],
          body: summaryData,
          theme: 'grid',
          styles: {
            fontSize: 10,
            cellPadding: 5,
          },
          headStyles: {
            fillColor: primaryColor,
            textColor: 255,
            fontStyle: 'bold',
          },
          columnStyles: {
            0: { cellWidth: 100, fontStyle: 'bold' },
            1: { cellWidth: 60, halign: 'center' },
          },
          margin: { left: 20, right: 20 },
        })

        currentY = doc.lastAutoTable.finalY + 20

        // Graphique de distribution (simulé avec du texte)
        if (currentY < doc.internal.pageSize.height - 50) {
          doc.setFontSize(14)
          doc.setFont('helvetica', 'bold')
          doc.text('Distribution par Statut', 20, currentY)
          currentY += 10

          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')

          // Barre de progression simple pour la visualisation
          const barWidth = 150
          const maxValue = Math.max(statsLocation, statsPanne, statsAutre)

          const drawBar = (label, value, color, y) => {
            const barLength = maxValue > 0 ? (value / maxValue) * barWidth : 0

            doc.setFillColor(...color)
            doc.rect(40, y, barLength, 8, 'F')

            doc.setTextColor(33, 37, 41)
            doc.text(label, 20, y + 6)
            doc.text(
              `${value} (${Math.round((value / totalAttachements) * 100)}%)`,
              40 + barWidth + 10,
              y + 6
            )
          }

          drawBar('En location', statsLocation, successColor, currentY)
          currentY += 15
          drawBar('En panne', statsPanne, dangerColor, currentY)
          currentY += 15
          drawBar('Autre', statsAutre, [108, 117, 125], currentY)
        }
      }

      // Sauvegarder le PDF avec un nom significatif
      const fileName = `Rapport_Attachements_${pdfStartDate.format(
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

  // Colonnes du tableau
  const columns = [
    {
      id: 'date_utilise',
      label: 'Date',
      render: (row) => dayjs(row.date_utilise).format('DD/MM/YYYY'),
    },
    {
      id: 'materiel_designation',
      label: 'Matériel',
      render: (row) => row.materiel_designation || 'N/A',
    },
    {
      id: 'num_parc',
      label: 'Parc HFF',
      render: (row) => row.materiel_num_parc || 'N/A',
    },
    {
      id: 'parc_colas',
      label: 'Parc Colas',
      render: (row) => row.materiel_parc_colas || 'N/A',
    },
    { id: 'lot', label: 'Lot', render: (row) => row.lot },
    {
      id: 'heures',
      label: 'Heures',
      render: (row) => {
        if (row.heure_debut != null && row.heure_fin != null) {
          return `${row.heure_debut} - ${row.heure_fin}`
        }
        return '-'
      },
    },
    {
      id: 'kilometres',
      label: 'Km',
      render: (row) => {
        if (row.km_debut != null && row.km_fin != null) {
          return `${row.km_debut} - ${row.km_fin}`
        }
        return '-'
      },
    },
    {
      id: 'statut',
      label: 'Statut',
      render: (row) => (
        <span
          className={
            row.statut === 'En location'
              ? 'text-success'
              : row.statut === 'En panne'
              ? 'text-danger'
              : 'text-warning'
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 12px',
            fontSize: '14px',
            fontWeight: '700',
            textAlign: 'center',
            minWidth: '80px',
          }}
        >
          {row.statut}
        </span>
      ),
    },
    {
      id: 'facture',
      label: 'Facturé',
      render: (row) => (
        <div className="d-flex align-items-center">
          <span
            className={`me-2 rounded-circle`}
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: row.facture ? '#28a745' : '#dc3545',
            }}
          />
          <span
            className={
              row.facture
                ? 'text-success fw-semibold'
                : 'text-danger fw-semibold'
            }
          >
            {row.facture ? 'Oui' : 'Non'}
          </span>
        </div>
      ),
    },
    {
      id: 'observation',
      label: 'Observation',
      render: (row) => (
        <div
          style={{
            maxWidth: '250px',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {row.observation || '-'}
        </div>
      ),
    },
  ]

  // Ouvre le modal de création d'attachement
  const handleCreate = () => {
    setSelectedAttachement(null)
    setOpenCreateModal(true)
  }

  // Gère l'enregistrement d'un nouvel attachement
  const handleSaveCreate = async (attachement) => {
    try {
      const { data } = await api.post('attachement', attachement)
      console.log('Created:', data)
      await fetchAttachements()
      setOpenCreateModal(false)
      setSnackbarMessage('Attachement créé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error("Erreur lors de la création de l'attachement :", error)
      setSnackbarMessage("Impossible de créer l'attachement")
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Ouvre le modal d'édition
  const handleEdit = (row) => {
    setSelectedAttachement(row)
    setOpenEditModal(true)
  }

  // Gère l'enregistrement des modifications
  const handleSaveEdit = async (updatedAttachement) => {
    try {
      const parseNumericValue = (value) => {
        if (value === '' || value === null || value === undefined) {
          return null
        }
        const numValue = parseInt(value, 10)
        return isNaN(numValue) ? null : numValue
      }

      const dataToSend = {
        ...updatedAttachement,
        date_utilise: dayjs.isDayjs(updatedAttachement.date_utilise)
          ? updatedAttachement.date_utilise.format('YYYY-MM-DD')
          : dayjs(updatedAttachement.date_utilise).format('YYYY-MM-DD'),
        heure_debut: parseNumericValue(updatedAttachement.heure_debut),
        heure_fin: parseNumericValue(updatedAttachement.heure_fin),
        km_debut: parseNumericValue(updatedAttachement.km_debut),
        km_fin: parseNumericValue(updatedAttachement.km_fin),
      }
      const { data } = await api.put(
        `attachement/${updatedAttachement.id}`,
        dataToSend
      )
      console.log('Edited:', data)
      await fetchAttachements()
      setOpenEditModal(false)
      setSnackbarMessage('Attachement modifié avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error("Erreur lors de la modification de l'attachement :", error)
      setSnackbarMessage("Impossible de modifier l'attachement")
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  // Ouvre le dialogue de confirmation pour la suppression
  const handleDelete = (row) => {
    setAttachementToDelete(row)
    setOpenDialog(true)
  }

  // Confirme la suppression
  const confirmDelete = async () => {
    try {
      await api.delete(`attachement/${attachementToDelete.id}`)
      console.log('Deleted:', attachementToDelete)
      await fetchAttachements()
      setOpenDialog(false)
      setSnackbarMessage('Attachement supprimé avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error("Erreur lors de la suppression de l'attachement :", error)
      setOpenDialog(false)
      setSnackbarMessage("Impossible de supprimer l'attachement")
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  return (
    <>
      <Breadcrumb
        mainText="Listes"
        subText="Attachement"
        showCreateButton={true}
        onCreate={handleCreate}
      />

      {/* Barre de recherche et bouton PDF */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par matériel, lot, statut, observation ou ID..."
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
          color="primary"
          startIcon={<PictureAsPdfIcon />}
          onClick={() => setOpenPdfDialog(true)}
          sx={{ minWidth: '180px', whiteSpace: 'nowrap' }}
        >
          Exporter PDF
        </Button>
      </Box>

      {/* Tableau principal affichant les attachements */}
      <Box className="card">
        <TableView
          data={filteredAttachements}
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
            color="primary"
            startIcon={<PictureAsPdfIcon />}
          >
            Générer PDF
          </Button>
        </DialogActions>
      </Dialog>

      <AttachementCreate
        isOpen={openCreateModal}
        onSave={handleSaveCreate}
        onClose={() => setOpenCreateModal(false)}
      />

      <AttachementEdit
        isOpen={openEditModal}
        attachement={selectedAttachement}
        onChange={(updatedAttachement) =>
          setSelectedAttachement(updatedAttachement)
        }
        onSave={handleSaveEdit}
        onClose={() => setOpenEditModal(false)}
      />

      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmDelete}
        title="Suppression"
        content="Êtes-vous sûr de vouloir supprimer cet attachement?"
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

export default AttachementViews
