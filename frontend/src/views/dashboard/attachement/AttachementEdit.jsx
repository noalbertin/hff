//src/views/dashboard/attachement/AttachementEdit.jsx

import { useState, useEffect } from 'react'
import { TextField, FormControlLabel, Checkbox, MenuItem } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Modal from '../../../components/ui/Modal'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import api from '../../../utils/axios'
import AutocompleteField from '../../../components/ui/AutocompleteField'

const AttachementEdit = ({
  isOpen,
  attachement,
  onChange,
  onSave,
  onClose,
}) => {
  // Fallback si `attachement` est null/undefined
  const validAttachement = attachement || {}

  // État local pour valider le formulaire
  const [isFormValid, setIsFormValid] = useState(true)

  // État pour la liste des matériels
  const [materiels, setMateriels] = useState([])

  // Options pour les selects
  const lotOptions = ['Lot 1', 'Lot 2', 'Lot 3', 'Cerc', 'HFF']
  const statutOptions = ['En location', 'Attente Travail', 'En panne']

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

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    onChange({
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

  // Vérifie si tous les champs requis sont remplis correctement
  const checkFormValidity = () => {
    const { materiel_id = '', lot = '', date_utilise = null } = validAttachement
    const isValid = materiel_id !== '' && lot !== '' && date_utilise !== null
    setIsFormValid(isValid)
  }

  // Chaque fois que `attachement` change, on vérifie la validité du formulaire
  useEffect(() => {
    checkFormValidity()
  }, [validAttachement])

  // Destructuration pour faciliter l'accès aux champs
  const {
    materiel_id = '',
    lot = '',
    heure_debut = '',
    heure_fin = '',
    km_debut = '',
    km_fin = '',
    facture = false,
    observation = '',
    date_utilise = null,
    statut = 'Attente Travail',
  } = validAttachement

  // Convertir date_utilise en objet dayjs si c'est une chaîne
  const dateValue = date_utilise ? dayjs(date_utilise) : dayjs()

  // Style commun pour les TextField
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      '&:hover fieldset': { borderColor: '#1C252E' },
      '&.Mui-focused fieldset': { borderColor: '#1C252E' },
    },
    '& .MuiInputLabel-root': {
      fontWeight: 'bold',
      color: '#637381',
      '&.Mui-focused': {
        fontWeight: 'bold',
        color: '#1C252E',
      },
    },
  }

  const materielOptions = materiels.map((m) => ({
    value: m.id,
    label: `${m.designation} - ${m.modele} (${m.serie})`,
  }))

  return (
    <Modal
      title="Modifier un attachement"
      btnLabel="Sauvegarder"
      isOpen={isOpen}
      onSave={() => onSave(validAttachement)}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="600px"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
        {/* Sélection du matériel */}
        <div className="row">
          <div className="row">
            <div className="col mb-3 mt-2">
              <AutocompleteField
                required
                label="Matériel *"
                name="materiel_id"
                value={materiel_id}
                onChange={(e) =>
                  onChange({ ...validAttachement, materiel_id: e.target.value })
                }
                options={materielOptions}
              />
            </div>
          </div>
        </div>

        {/* Lot et Statut */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <TextField
              select
              label="Lot *"
              fullWidth
              sx={textFieldStyle}
              value={lot}
              onChange={(e) =>
                onChange({ ...validAttachement, lot: e.target.value })
              }
            >
              {lotOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div className="col-md-6 mb-3">
            <TextField
              select
              label="Statut"
              fullWidth
              sx={textFieldStyle}
              value={statut}
              onChange={(e) =>
                onChange({ ...validAttachement, statut: e.target.value })
              }
            >
              {statutOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </div>

        {/* Date d'utilisation */}
        <div className="row">
          <div className="col mb-3">
            <DatePicker
              label="Date d'utilisation *"
              value={dateValue}
              onChange={(newDate) =>
                onChange({ ...validAttachement, date_utilise: newDate })
              }
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: textFieldStyle,
                },
              }}
            />
          </div>
        </div>

        {/* Heures début et fin */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <TextField
              type="number"
              label="Heure début"
              fullWidth
              sx={textFieldStyle}
              value={heure_debut}
              onChange={(e) =>
                onChange({ ...validAttachement, heure_debut: e.target.value })
              }
              inputProps={{ min: 0 }}
            />
          </div>
          <div className="col-md-6 mb-3">
            <TextField
              type="number"
              label="Heure fin"
              fullWidth
              sx={textFieldStyle}
              value={heure_fin}
              onChange={(e) =>
                onChange({ ...validAttachement, heure_fin: e.target.value })
              }
              inputProps={{ min: 0 }}
            />
          </div>
        </div>

        {/* Kilomètres début et fin */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <TextField
              type="number"
              label="Km début"
              fullWidth
              sx={textFieldStyle}
              value={km_debut}
              onChange={(e) =>
                onChange({ ...validAttachement, km_debut: e.target.value })
              }
              inputProps={{ min: 0 }}
            />
          </div>
          <div className="col-md-6 mb-3">
            <TextField
              type="number"
              label="Km fin"
              fullWidth
              sx={textFieldStyle}
              value={km_fin}
              onChange={(e) =>
                onChange({ ...validAttachement, km_fin: e.target.value })
              }
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
              sx={textFieldStyle}
              value={observation}
              onChange={(e) =>
                onChange({ ...validAttachement, observation: e.target.value })
              }
            />
          </div>
        </div>

        {/* Facture */}
        <div className="row">
          <div className="col mb-2">
            <FormControlLabel
              control={
                <Checkbox
                  checked={facture}
                  onChange={(e) =>
                    onChange({ ...validAttachement, facture: e.target.checked })
                  }
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

export default AttachementEdit
