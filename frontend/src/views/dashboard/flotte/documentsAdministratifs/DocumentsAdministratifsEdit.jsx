import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import AutocompleteField from '../../../../components/ui/AutocompleteField'
import 'dayjs/locale/fr'
import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import api from '../../../../utils/axios'

const DocumentsAdministratifsEdit = ({ isOpen, document, onSave, onClose }) => {
  // État local pour stocker les données du formulaire
  const [editedDocument, setEditedDocument] = useState({
    flotte_id: '',
    date_ips: null,
    date_derniere_vt: null,
    date_prochaine_vt: null,
    date_expiration_carte_grise: null,
    date_expiration_assurance: null,
  })

  // État pour stocker la liste des flottes
  const [flotteList, setFlotteList] = useState([])

  // Charger les données du document à éditer
  useEffect(() => {
    if (document && isOpen) {
      setEditedDocument({
        flotte_id: document.flotte_id || '',
        date_ips: document.date_ips ? dayjs(document.date_ips) : null,
        date_derniere_vt: document.date_derniere_vt
          ? dayjs(document.date_derniere_vt)
          : null,
        date_prochaine_vt: document.date_prochaine_vt
          ? dayjs(document.date_prochaine_vt)
          : null,
        date_expiration_carte_grise: document.date_expiration_carte_grise
          ? dayjs(document.date_expiration_carte_grise)
          : null,
        date_expiration_assurance: document.date_expiration_assurance
          ? dayjs(document.date_expiration_assurance)
          : null,
      })
    }
  }, [document, isOpen])

  // Récupérer la liste des flottes au chargement du composant
  useEffect(() => {
    const fetchFlotteList = async () => {
      try {
        // Récupérer TOUTES les flottes pour l'édition
        const response = await api.get('/flotte')

        // Formater les données pour l'autocomplete
        const formattedFlotte = response.data.map((flotte) => ({
          value: flotte.id_flotte,
          label: `${flotte.materiel?.designation || 'N/A'} - N°Parc: ${
            flotte.materiel?.num_parc || 'N/A'
          } - Parc Colas: ${flotte.materiel?.parc_colas || 'N/A'}`,
          designation: flotte.materiel?.designation,
          num_parc: flotte.materiel?.num_parc,
          parc_colas: flotte.materiel?.parc_colas,
        }))

        setFlotteList(formattedFlotte)
      } catch (error) {
        console.error('Erreur lors de la récupération des flottes:', error)
      }
    }

    if (isOpen) {
      fetchFlotteList()
    }
  }, [isOpen])

  // Vérifie si le formulaire est valide avant de pouvoir le soumettre
  const isFormValid =
    editedDocument.flotte_id !== '' && editedDocument.date_prochaine_vt !== null

  // Gère le changement de l'autocomplete
  const handleAutocompleteChange = (event) => {
    const { name, value } = event.target
    setEditedDocument((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Gère le changement des dates (DatePicker) - fonction individuelle par champ
  const handleDateChange = (field) => (newValue) => {
    setEditedDocument((prevState) => ({
      ...prevState,
      [field]: newValue,
    }))
  }

  // Gère la sauvegarde des données du formulaire
  const handleSave = () => {
    // Formater les dates avant de les envoyer
    const formattedDocument = {
      ...editedDocument,
      id_document: document.id_document,
      date_ips: editedDocument.date_ips
        ? dayjs(editedDocument.date_ips).format('YYYY-MM-DD')
        : null,
      date_derniere_vt: editedDocument.date_derniere_vt
        ? dayjs(editedDocument.date_derniere_vt).format('YYYY-MM-DD')
        : null,
      date_prochaine_vt: editedDocument.date_prochaine_vt
        ? dayjs(editedDocument.date_prochaine_vt).format('YYYY-MM-DD')
        : null,
      date_expiration_carte_grise: editedDocument.date_expiration_carte_grise
        ? dayjs(editedDocument.date_expiration_carte_grise).format('YYYY-MM-DD')
        : null,
      date_expiration_assurance: editedDocument.date_expiration_assurance
        ? dayjs(editedDocument.date_expiration_assurance).format('YYYY-MM-DD')
        : null,
    }
    onSave(formattedDocument)
  }

  // Réinitialise tous les champs du formulaire après soumission
  const resetForm = () => {
    setEditedDocument({
      flotte_id: '',
      date_ips: null,
      date_derniere_vt: null,
      date_prochaine_vt: null,
      date_expiration_carte_grise: null,
      date_expiration_assurance: null,
    })
  }

  return (
    <Modal
      title="Modifier un document administratif"
      btnLabel="Modifier"
      isOpen={isOpen}
      onSave={handleSave}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="435px"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
        {/* Champ Flotte (Matériel) avec Autocomplete */}
        <div className="row">
          <div className="col mb-3 mt-2">
            <AutocompleteField
              required
              label="Matériel"
              name="flotte_id"
              value={editedDocument.flotte_id}
              onChange={handleAutocompleteChange}
              options={flotteList}
            />
          </div>
        </div>

        {/* Champs Date IPS sur une seule ligne */}
        <div className="row">
          {/* Champ Date IPS */}
          <div className="col mb-3">
            <DatePicker
              label="Date IPS"
              value={editedDocument.date_ips}
              onChange={handleDateChange('date_ips')}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </div>
        </div>

        {/* Champ Date Prochaine VT et Date Dernière VT */}
        <div className="row">
          {/* Champ Date Dernière VT */}
          <div className="col-md-6 mb-3">
            <DatePicker
              label="Date Dernière VT"
              value={editedDocument.date_derniere_vt}
              onChange={handleDateChange('date_derniere_vt')}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </div>

          <div className="col-md-6 mb-3">
            <DatePicker
              label="Date Prochaine VT *"
              value={editedDocument.date_prochaine_vt}
              onChange={handleDateChange('date_prochaine_vt')}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </div>
        </div>

        {/* Champs Date Expiration Carte Grise et Date Expiration Assurance sur une seule ligne */}
        <div className="row">
          {/* Champ Date Expiration Carte Grise */}
          <div className="col-md-6 mb-3">
            <DatePicker
              label="Date Expiration Carte Grise"
              value={editedDocument.date_expiration_carte_grise}
              onChange={handleDateChange('date_expiration_carte_grise')}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </div>

          {/* Champ Date Expiration Assurance */}
          <div className="col-md-6 mb-3">
            <DatePicker
              label="Date Expiration Assurance"
              value={editedDocument.date_expiration_assurance}
              onChange={handleDateChange('date_expiration_assurance')}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </div>
        </div>
      </LocalizationProvider>
    </Modal>
  )
}

export default DocumentsAdministratifsEdit
