import { useState, useEffect } from 'react'
import Modal from '../../../components/ui/Modal'
import InputField from '../../../components/ui/form/InputField'
import SelectField from '../../../components/ui/form/SelectField'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TextField, FormControlLabel, Checkbox } from '@mui/material'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import api from '../../../utils/axios'
import AutocompleteField from '../../../components/ui/AutocompleteField'

const AttachementCreate = ({ isOpen, onSave, onClose }) => {
  // État local pour stocker les données du formulaire
  const [attachement, setAttachement] = useState({
    materiel_id: '',
    lot: '',
    heure_debut: '',
    heure_fin: '',
    km_debut: '',
    km_fin: '',
    facture: false,
    observation: '',
    date_utilise: dayjs(),
    statut: 'Attente Travail',
  })

  // État pour la liste des matériels
  const [materiels, setMateriels] = useState([])

  // Charger les matériels depuis le backend
  useEffect(() => {
    const fetchMateriels = async () => {
      try {
        const { data } = await api.get('materiel')
        setMateriels(data)
      } catch (error) {
        console.error('Erreur lors du chargement des matériels:', error)
      }
    }

    if (isOpen) {
      fetchMateriels()
    }
  }, [isOpen])

  // Options pour les selects
  const lotOptions = [
    { value: 'Lot 1', label: 'Lot 1' },
    { value: 'Lot 2', label: 'Lot 2' },
    { value: 'Lot 3', label: 'Lot 3' },
    { value: 'Cerc', label: 'Cerc' },
    { value: 'HFF', label: 'HFF' },
  ]

  const statutOptions = [
    { value: 'En location', label: 'En location' },
    { value: 'Attente Travail', label: 'Attente Travail' },
    { value: 'En panne', label: 'En panne' },
  ]

  // Options pour les matériels - assurez-vous que m.id existe
  const materielOptions = materiels.map((m) => ({
    value: String(m.id),
    label: `${m.designation} - N°Parc: ${m.num_parc} (Parc Colas: ${m.parc_colas})`,
  }))

  // Vérifie si le formulaire est valide
  const isFormValid =
    attachement.materiel_id !== '' &&
    attachement.lot !== '' &&
    attachement.date_utilise !== null

  // Gère les changements pour les champs texte et select
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setAttachement((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Gère le changement de date
  const handleDateChange = (newDate) => {
    setAttachement((prevState) => ({
      ...prevState,
      date_utilise: newDate,
    }))
  }

  // Récupérer les dernières valeurs du matériel sélectionné
  const handleMaterielChange = async (event) => {
    const { value } = event.target

    // Mettre à jour le materiel_id
    setAttachement((prevState) => ({
      ...prevState,
      materiel_id: value,
    }))

    // Si un matériel est sélectionné, récupérer ses dernières valeurs
    if (value) {
      try {
        const { data } = await api.get(`materiel/${value}/last-attachement`)

        // Mettre à jour heure_debut et km_debut avec les valeurs finales précédentes
        setAttachement((prevState) => ({
          ...prevState,
          materiel_id: value,
          heure_debut: data.heure_fin || '',
          km_debut: data.km_fin || '',
          lot: data.lot || '',
          statut: data.statut || '',
        }))
      } catch (error) {
        console.error(
          'Erreur lors de la récupération du dernier attachement:',
          error
        )
      }
    }
  }

  // Gère la sauvegarde des données
  const handleSave = () => {
    // Fonction helper pour convertir les valeurs numériques
    const parseNumericValue = (value) => {
      // Si strictement égal à une chaîne vide, null ou undefined
      if (value === '' || value === null || value === undefined) {
        return null
      }

      // Convertir en nombre
      const numValue = Number(value)

      // Si c'est NaN, retourner null
      // Sinon retourner la valeur (qui peut être 0)
      return isNaN(numValue) ? null : numValue
    }

    const dataToSend = {
      ...attachement,
      date_utilise: attachement.date_utilise.format('YYYY-MM-DD'),
      materiel_id: parseInt(attachement.materiel_id, 10),
      heure_debut: parseNumericValue(attachement.heure_debut),
      heure_fin: parseNumericValue(attachement.heure_fin),
      km_debut: parseNumericValue(attachement.km_debut),
      km_fin: parseNumericValue(attachement.km_fin),
    }

    onSave(dataToSend)
  }

  // Réinitialise tous les champs du formulaire
  const resetForm = () => {
    setAttachement({
      materiel_id: '',
      lot: '',
      heure_debut: '',
      heure_fin: '',
      km_debut: '',
      km_fin: '',
      facture: false,
      observation: '',
      date_utilise: dayjs(),
      statut: 'Attente Travail',
    })
  }

  return (
    <Modal
      title="Créer un attachement"
      btnLabel="Créer"
      isOpen={isOpen}
      onSave={handleSave}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="600px"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
        {/* Sélection du matériel */}
        <div className="row">
          <div className="col mb-3 mt-2">
            <AutocompleteField
              required
              label="Matériel"
              name="materiel_id"
              value={attachement.materiel_id}
              onChange={handleMaterielChange} // ← Changez ici
              options={materielOptions}
            />
          </div>
        </div>

        {/* Lot et Statut */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <SelectField
              required
              label="Lot"
              name="lot"
              value={attachement.lot}
              onChange={handleChange}
              options={lotOptions}
            />
          </div>
          <div className="col-md-6 mb-3">
            <SelectField
              label="Statut"
              name="statut"
              value={attachement.statut}
              onChange={handleChange}
              options={statutOptions}
            />
          </div>
        </div>

        {/* Date d'utilisation */}
        <div className="row">
          <div className="col mb-3">
            <DatePicker
              label="Date d'utilisation *"
              value={attachement.date_utilise}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </div>
        </div>

        {/* Heures début et fin */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <InputField
              type="number"
              label="Heure début"
              name="heure_debut"
              value={attachement.heure_debut}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </div>
          <div className="col-md-6 mb-3">
            <InputField
              type="number"
              label="Heure fin"
              name="heure_fin"
              value={attachement.heure_fin}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </div>
        </div>

        {/* Kilomètres début et fin */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <InputField
              type="number"
              label="Km début"
              name="km_debut"
              value={attachement.km_debut}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </div>
          <div className="col-md-6 mb-3">
            <InputField
              type="number"
              label="Km fin"
              name="km_fin"
              value={attachement.km_fin}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </div>
        </div>

        {/* Observation */}
        <div className="row">
          <div className="col mb-3">
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observation"
              name="observation"
              value={attachement.observation}
              onChange={handleChange}
              size="small"
            />
          </div>
        </div>

        {/* Facture */}
        <div className="row">
          <div className="col mb-2">
            <FormControlLabel
              control={
                <Checkbox
                  name="facture"
                  checked={attachement.facture}
                  onChange={handleChange}
                />
              }
              label="Facturé"
            />
          </div>
        </div>
      </LocalizationProvider>
    </Modal>
  )
}

export default AttachementCreate
