import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import InputField from '../../../../components/ui/form/InputField'
import SelectField from '../../../../components/ui/form/SelectField'
import AutocompleteField from '../../../../components/ui/AutocompleteField'
import { Autocomplete, TextField } from '@mui/material'
import 'dayjs/locale/fr'
import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import api from '../../../../utils/axios'

const FlotteEdit = ({
  isOpen,
  maintenance,
  onChange,
  onSave,
  onClose,
  flotteList = [],
}) => {
  // Fallback si maintenance est null/undefined
  const validMaintenance = maintenance || {}

  const [numPmOptions, setNumPmOptions] = useState([])
  const [isFormValid, setIsFormValid] = useState(true)
  const [allMateriels, setAllMateriels] = useState([])

  // Options pour le suivi
  const suiviOptions = [
    { value: true, label: 'Oui' },
    { value: false, label: 'Non' },
  ]

  // Générer les options d'années (année actuelle ± 5 ans)
  const currentYear = new Date().getFullYear()
  const anneeOptions = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear - 5 + i
    return { value: year, label: year.toString() }
  })

  // Récupérer TOUS les matériels
  useEffect(() => {
    const fetchAllMateriels = async () => {
      try {
        const { data } = await api.get('materiel')
        const options = data.map((item) => ({
          value: item.id,
          label: `${item.designation || 'N/A'} - N°Parc: ${
            item.num_parc || 'N/A'
          } (Parc Colas: ${item.parc_colas || 'N/A'})`,
        }))
        setAllMateriels(options)
      } catch (error) {
        console.error('Erreur lors du chargement des matériels:', error)
      }
    }

    if (isOpen) {
      fetchAllMateriels()
    }
  }, [isOpen])

  // Récupérer les num_pm depuis la base de données
  useEffect(() => {
    const fetchNumPm = async () => {
      try {
        const { data } = await api.get('/flotte/numPM')
        setNumPmOptions(data)
      } catch (error) {
        console.error('Erreur lors de la récupération des num_pm:', error)
      }
    }

    if (isOpen) {
      fetchNumPm()
    }
  }, [isOpen])

  // Vérifier la validité du formulaire
  const checkFormValidity = () => {
    const { materiel_id, annee } = validMaintenance
    const isValid = materiel_id && annee
    setIsFormValid(isValid)
  }

  useEffect(() => {
    checkFormValidity()
  }, [validMaintenance])

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    onChange({
      materiel_id: '',
      annee: new Date().getFullYear(),
      suivi: true,
      casier: '',
      numero_chassis: '',
      date_dernier_pm: null,
      heure_dernier_pm: '',
      km_dernier_pm: '',
      heure_prochain_pm: '',
      km_prochain_pm: '',
      type_pm: '',
      num_pm: '',
    })
  }

  // Gère les changements pour les champs standards
  const handleChange = (event) => {
    const { name, value } = event.target
    onChange({ ...validMaintenance, [name]: value })
  }

  // Gère le changement du champ suivi
  const handleSuiviChange = (event) => {
    const { value } = event.target
    const boolValue = value === 'true' || value === true
    onChange({
      ...validMaintenance,
      suivi: boolValue ? 1 : 0,
    })
  }

  // CORRECTION : Fonction pour formater correctement la date pour MySQL
  const formatDateForMySQL = (dateValue) => {
    if (!dateValue) return null

    // Si c'est déjà un objet dayjs
    if (dayjs.isDayjs(dateValue)) {
      return dateValue.format('YYYY-MM-DD')
    }

    // Si c'est une string ISO ou autre format
    return dayjs(dateValue).format('YYYY-MM-DD')
  }

  // Gère le changement de la date
  const handleDateChange = (newValue) => {
    onChange({
      ...validMaintenance,
      date_dernier_pm: newValue ? formatDateForMySQL(newValue) : null,
    })
  }

  // Gère le changement de l'autocomplete
  const handleAutocompleteChange = (event) => {
    const { name, value } = event.target
    onChange({
      ...validMaintenance,
      [name]: value,
      materiel: name === 'materiel_id' ? undefined : validMaintenance.materiel,
    })
  }

  // Gère la sauvegarde
  const handleSave = () => {
    const dataToSave = {
      ...validMaintenance,
      // S'assurer que la date est au bon format
      date_dernier_pm: formatDateForMySQL(validMaintenance.date_dernier_pm),
      casier: validMaintenance.casier || null,
      numero_chassis: validMaintenance.numero_chassis || null,
      heure_dernier_pm: validMaintenance.heure_dernier_pm || null,
      km_dernier_pm: validMaintenance.km_dernier_pm || null,
      heure_prochain_pm: validMaintenance.heure_prochain_pm || null,
      km_prochain_pm: validMaintenance.km_prochain_pm || null,
      type_pm: validMaintenance.type_pm || null,
      num_pm: validMaintenance.num_pm || null,
      suivi:
        validMaintenance.suivi === true || validMaintenance.suivi === 1 ? 1 : 0,
    }

    console.log('Data à sauvegarder:', dataToSave) // Pour déboguer
    onSave(dataToSave)
  }

  // Destructuration des valeurs avec conversion du suivi
  const {
    materiel_id = '',
    annee = new Date().getFullYear(),
    suivi: suiviRaw = true,
    casier = '',
    numero_chassis = '',
    date_dernier_pm = null,
    heure_dernier_pm = '',
    km_dernier_pm = '',
    heure_prochain_pm = '',
    km_prochain_pm = '',
    type_pm = '',
    num_pm = '',
  } = validMaintenance

  const suivi = suiviRaw === 1 || suiviRaw === true

  // Combiner flotteList et allMateriels pour l'édition
  const availableOptions =
    isOpen && materiel_id
      ? [
          ...allMateriels.filter((opt) => opt.value === materiel_id),
          ...flotteList.filter((opt) => opt.value !== materiel_id),
        ]
      : flotteList

  return (
    <Modal
      title="Modifier Flotte"
      btnLabel="Sauvegarder"
      isOpen={isOpen}
      onSave={handleSave}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="700px"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
        {/* Section Informations Générales */}
        <div className="mb-3 mt-3">
          <div className="border-start border-primary border-4 ps-3 py-2 bg-light">
            <h6 className="mb-0 text-primary fw-semibold">
              Informations Générales
            </h6>
          </div>
        </div>

        {/* Sélection du matériel et année */}
        <div className="row">
          <div className="col mb-3 mt-2">
            <AutocompleteField
              required
              label="Matériel"
              name="materiel_id"
              value={materiel_id}
              onChange={handleAutocompleteChange}
              options={availableOptions}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <SelectField
              required
              label="Année"
              name="annee"
              value={annee}
              onChange={handleChange}
              options={anneeOptions}
            />
          </div>
          <div className="col-md-6 mb-3">
            <SelectField
              label="Suivi"
              name="suivi"
              value={suivi}
              onChange={handleSuiviChange}
              options={suiviOptions}
            />
          </div>
        </div>

        {/* Suivi, Casier et Numéro de chassis */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <InputField
              label="Casier"
              name="casier"
              value={casier}
              onChange={handleChange}
              maxLength={25}
            />
          </div>
          <div className="col-md-6 mb-3">
            <InputField
              label="Id"
              type="number"
              name="numero_chassis"
              value={numero_chassis}
              onChange={handleChange}
              maxLength={50}
            />
          </div>
        </div>

        {/* Section Dernier PM */}
        <div className="mb-3 mt-4">
          <div className="border-start border-secondary border-4 ps-3 py-2 bg-light">
            <h6 className="mb-0 text-secondary fw-semibold">
              Dernier PM Effectué
            </h6>
          </div>
        </div>

        {/* Date du dernier PM */}
        <div className="row">
          <div className="col-md-12 mb-3">
            <DatePicker
              label="Date du dernier PM"
              value={date_dernier_pm ? dayjs(date_dernier_pm) : null}
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

        {/* Heures et Kilomètres du dernier PM */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <InputField
              type="number"
              label="Heures (dernier PM)"
              name="heure_dernier_pm"
              value={heure_dernier_pm}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-3">
            <InputField
              type="number"
              label="Kilomètres (dernier PM)"
              name="km_dernier_pm"
              value={km_dernier_pm}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section Prochain PM */}
        <div className="mb-3 mt-4">
          <div className="border-start border-success border-4 ps-3 py-2 bg-light">
            <h6 className="mb-0 text-success fw-semibold">
              Prochain PM Planifié
            </h6>
          </div>
        </div>

        {/* Heures et Kilomètres du prochain PM */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <InputField
              type="number"
              label="Heures (prochain PM)"
              name="heure_prochain_pm"
              value={heure_prochain_pm}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-3">
            <InputField
              type="number"
              label="Kilomètres (prochain PM)"
              name="km_prochain_pm"
              value={km_prochain_pm}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Type et Numéro PM */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <InputField
              type="number"
              label="Type PM"
              name="type_pm"
              value={type_pm}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <Autocomplete
              freeSolo
              options={numPmOptions.map(
                (option) => option.label || option.value
              )}
              value={num_pm || ''}
              onChange={(event, newValue) => {
                onChange({
                  ...validMaintenance,
                  num_pm: newValue || '',
                })
              }}
              onInputChange={(event, newInputValue) => {
                onChange({
                  ...validMaintenance,
                  num_pm: newInputValue || '',
                })
              }}
              renderInput={(params) => (
                <TextField {...params} label="N° PM" fullWidth />
              )}
            />
          </div>
        </div>
      </LocalizationProvider>
    </Modal>
  )
}

export default FlotteEdit
