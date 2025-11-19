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

const FlotteCreate = ({ isOpen, onSave, onClose, flotteList = [] }) => {
  // État local pour stocker les données du formulaire
  const [maintenance, setMaintenance] = useState({
    flotte_id: '',
    annee: new Date().getFullYear(),
    suivi: true,
    casier: '',
    numero_chassis: '',
    date_dernier_pm: dayjs(),
    heure_dernier_pm: '',
    km_dernier_pm: '',
    heure_prochain_pm: '',
    km_prochain_pm: '',
    type_pm: '',
    num_pm: '',
  })
  const [numPmOptions, setNumPmOptions] = useState([])

  // Récupérer les num_pm au montage du composant
  useEffect(() => {
    const fetchNumPm = async () => {
      try {
        const { data } = await api.get('/flotte/numPM') // ou 'materiel/num-pm' selon votre route
        setNumPmOptions(data)
      } catch (error) {
        console.error('Erreur lors de la récupération des num_pm:', error)
      }
    }

    if (isOpen) {
      fetchNumPm()
    }
  }, [isOpen])

  // Options pour le suivi
  const suiviOptions = [
    { value: true, label: 'Oui' },
    { value: false, label: 'Non' },
  ]

  // Générer les options d'années (année actuelle ± 5 ans)
  const currentYear = new Date().getFullYear()
  const anneeOptions = Array.from({ length: 35 }, (_, i) => {
    const year = currentYear - 25 + i
    return { value: year, label: year.toString() }
  })

  // Vérifie si le formulaire est valide
  const isFormValid =
    maintenance.flotte_id !== '' &&
    maintenance.annee !== '' &&
    (maintenance.date_dernier_pm !== null ||
      maintenance.heure_dernier_pm !== '' ||
      maintenance.km_dernier_pm !== '')

  // Gère les changements pour les champs standards
  const handleChange = (event) => {
    const { name, value } = event.target
    setMaintenance((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Gère le changement du champ suivi (boolean)
  const handleSuiviChange = (event) => {
    const { value } = event.target
    setMaintenance((prevState) => ({
      ...prevState,
      suivi: value === 'true' || value === true,
    }))
  }

  // Gère le changement de la date (DatePicker)
  const handleDateChange = (newValue) => {
    setMaintenance((prevState) => ({
      ...prevState,
      date_dernier_pm: newValue,
    }))
  }

  // Gère le changement de l'autocomplete
  const handleAutocompleteChange = (event) => {
    const { name, value } = event.target
    setMaintenance((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Gère la sauvegarde des données
  const handleSave = () => {
    // Convertir les valeurs vides en null pour la base de données
    const dataToSave = {
      ...maintenance,
      date_dernier_pm: maintenance.date_dernier_pm
        ? maintenance.date_dernier_pm.format('YYYY-MM-DD')
        : null,
      casier: maintenance.casier || null,
      numero_chassis: maintenance.numero_chassis || null,
      heure_dernier_pm: maintenance.heure_dernier_pm || null,
      km_dernier_pm: maintenance.km_dernier_pm || null,
      heure_prochain_pm: maintenance.heure_prochain_pm || null,
      km_prochain_pm: maintenance.km_prochain_pm || null,
      type_pm: maintenance.type_pm || null,
      num_pm: maintenance.num_pm || null,
    }
    onSave(dataToSave)
  }

  // Réinitialise tous les champs du formulaire
  const resetForm = () => {
    setMaintenance({
      flotte_id: '',
      annee: new Date().getFullYear(),
      suivi: true,
      casier: '',
      numero_chassis: '',
      date_dernier_pm: dayjs(),
      heure_dernier_pm: '',
      km_dernier_pm: '',
      heure_prochain_pm: '',
      km_prochain_pm: '',
      type_pm: '',
      num_pm: '',
    })
  }

  return (
    <Modal
      title="Enregistrer Flotte"
      btnLabel="Enregistrer"
      isOpen={isOpen}
      onSave={handleSave}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="700px"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
        <div className="mb-3 mt-3">
          <div className="border-start border-primary border-4 ps-3 py-2 bg-light">
            <h6 className="mb-0 text-primary fw-semibold">
              Informations Générales
            </h6>
          </div>
        </div>

        {/* Sélection du matériel et année */}
        <div className="row">
          <div className="col-md-8 mb-3">
            <AutocompleteField
              required
              label="Matériel"
              name="flotte_id"
              value={maintenance.flotte_id}
              onChange={handleAutocompleteChange}
              options={flotteList}
            />
          </div>
          <div className="col-md-4 mb-3">
            <SelectField
              required
              label="Année"
              name="annee"
              value={maintenance.annee}
              onChange={handleChange}
              options={anneeOptions}
            />
          </div>
        </div>

        {/* Suivi, Casier et Numéro de chassis */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <SelectField
              label="Suivi"
              name="suivi"
              value={maintenance.suivi}
              onChange={handleSuiviChange}
              options={suiviOptions}
            />
          </div>
          <div className="col-md-4 mb-3">
            <InputField
              label="Casier"
              name="casier"
              value={maintenance.casier}
              onChange={handleChange}
              maxLength={25}
            />
          </div>
          <div className="col-md-4 mb-3">
            <InputField
              label="Id"
              type="number"
              name="numero_chassis"
              value={maintenance.numero_chassis}
              onChange={handleChange}
              maxLength={50}
            />
          </div>
        </div>

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
              value={maintenance.date_dernier_pm}
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
              value={maintenance.heure_dernier_pm}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-3">
            <InputField
              type="number"
              label="Kilomètres (dernier PM)"
              name="km_dernier_pm"
              value={maintenance.km_dernier_pm}
              onChange={handleChange}
            />
          </div>
        </div>

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
              value={maintenance.heure_prochain_pm}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-3">
            <InputField
              type="number"
              label="Kilomètres (prochain PM)"
              name="km_prochain_pm"
              value={maintenance.km_prochain_pm}
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
              value={maintenance.type_pm}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <Autocomplete
              freeSolo
              options={numPmOptions.map(
                (option) => option.label || option.value
              )}
              value={maintenance.num_pm || ''}
              onChange={(event, newValue) => {
                setMaintenance((prevState) => ({
                  ...prevState,
                  num_pm: newValue || '',
                }))
              }}
              onInputChange={(event, newInputValue) => {
                setMaintenance((prevState) => ({
                  ...prevState,
                  num_pm: newInputValue || '',
                }))
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

export default FlotteCreate
