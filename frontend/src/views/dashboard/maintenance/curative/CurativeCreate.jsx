import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import InputField from '../../../../components/ui/form/InputField'
import SelectField from '../../../../components/ui/form/SelectField'
import AutocompleteField from '../../../../components/ui/AutocompleteField'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TextField } from '@mui/material'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import api from '../../../../utils/axios'

const CurativeCreate = ({ isOpen, onSave, onClose }) => {
  // État local pour stocker les données du formulaire
  const [maintenance, setMaintenance] = useState({
    materiel_id: '',
    date_signalement: dayjs(),
    description_signalement: '',
    categorie: 'Immédiate',
    statut: 'En attente',
    date_debut_intervention: null,
    date_fin_intervention: null,
    pieces_remplacees: '',
    pieces_reparees: '',
    cout_pieces: '',
    notes_reparation: '',
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
  const categorieOptions = [
    { value: 'Immédiate', label: 'Immédiate' },
    { value: 'Différée', label: 'Différée' },
  ]

  const statutOptions = [
    { value: 'En attente', label: 'En attente' },
    { value: 'En cours', label: 'En cours' },
    { value: 'Terminée', label: 'Terminée' },
  ]

  // Options pour les matériels
  const materielOptions = materiels.map((m) => ({
    value: String(m.id),
    label: `${m.designation} - N°Parc: ${m.num_parc} (Parc Colas: ${m.parc_colas})`,
  }))

  // Vérifie si le formulaire est valide
  const isFormValid =
    maintenance.materiel_id !== '' &&
    maintenance.date_signalement !== null &&
    maintenance.description_signalement !== ''

  // Gère les changements pour les champs texte et select
  const handleChange = (event) => {
    const { name, value } = event.target
    setMaintenance((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Gère le changement de date signalement
  const handleDateSignalementChange = (newDate) => {
    setMaintenance((prevState) => ({
      ...prevState,
      date_signalement: newDate,
    }))
  }

  // Gère le changement de date début intervention
  const handleDateDebutChange = (newDate) => {
    setMaintenance((prevState) => ({
      ...prevState,
      date_debut_intervention: newDate,
    }))
  }

  // Gère le changement de date fin intervention
  const handleDateFinChange = (newDate) => {
    setMaintenance((prevState) => ({
      ...prevState,
      date_fin_intervention: newDate,
    }))
  }

  // Gère la sauvegarde des données
  const handleSave = () => {
    const dataToSend = {
      ...maintenance,
      materiel_id: parseInt(maintenance.materiel_id, 10),
      date_signalement: maintenance.date_signalement.format('YYYY-MM-DD'),
      date_debut_intervention: maintenance.date_debut_intervention
        ? maintenance.date_debut_intervention.format('YYYY-MM-DD')
        : null,
      date_fin_intervention: maintenance.date_fin_intervention
        ? maintenance.date_fin_intervention.format('YYYY-MM-DD')
        : null,
      pieces_remplacees: maintenance.pieces_remplacees || null,
      pieces_reparees: maintenance.pieces_reparees || null,
      cout_pieces: maintenance.cout_pieces
        ? parseFloat(maintenance.cout_pieces)
        : null,
      notes_reparation: maintenance.notes_reparation || null,
    }

    onSave(dataToSend)
  }

  // Réinitialise tous les champs du formulaire
  const resetForm = () => {
    setMaintenance({
      materiel_id: '',
      date_signalement: dayjs(),
      description_signalement: '',
      categorie: 'Immédiate',
      statut: 'En attente',
      date_debut_intervention: null,
      date_fin_intervention: null,
      pieces_remplacees: '',
      pieces_reparees: '',
      cout_pieces: '',
      notes_reparation: '',
    })
  }

  return (
    <Modal
      title="Créer une maintenance curative"
      btnLabel="Créer"
      isOpen={isOpen}
      onSave={handleSave}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="700px"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
        {/* Section Signalement */}
        <div className="mb-3 mt-3">
          <div className="border-start border-danger border-4 ps-3 py-2 bg-light">
            <h6 className="mb-0 text-danger fw-semibold">
              Signalement de la Panne
            </h6>
          </div>
        </div>

        {/* Sélection du matériel */}
        <div className="row">
          <div className="col-md-8 mb-3">
            <AutocompleteField
              required
              label="Matériel"
              name="materiel_id"
              value={maintenance.materiel_id}
              onChange={handleChange}
              options={materielOptions}
            />
          </div>
          <div className="col-md-4 mb-3">
            <DatePicker
              label="Date de signalement *"
              value={maintenance.date_signalement}
              onChange={handleDateSignalementChange}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </div>
        </div>

        {/* Description du signalement */}
        <div className="row">
          <div className="col mb-3">
            <TextField
              required
              fullWidth
              multiline
              rows={3}
              label="Description du signalement"
              name="description_signalement"
              value={maintenance.description_signalement}
              onChange={handleChange}
              size="small"
              placeholder="Décrivez la panne signalée..."
            />
          </div>
        </div>

        {/* Catégorie et Statut */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <SelectField
              required
              label="Catégorie"
              name="categorie"
              value={maintenance.categorie}
              onChange={handleChange}
              options={categorieOptions}
            />
          </div>

          <div className="col-md-6 mb-3">
            <SelectField
              label="Statut"
              name="statut"
              value={maintenance.statut}
              onChange={handleChange}
              options={statutOptions}
            />
          </div>
        </div>

        {/* Séparateur */}
        <hr className="my-3" style={{ borderTop: '1px dashed #ccc' }} />

        {/* Section Intervention */}
        <div className="mb-3">
          <div className="border-start border-primary border-4 ps-3 py-2 bg-light">
            <h6 className="mb-0 text-primary fw-semibold">
              Intervention (optionnel)
            </h6>
          </div>
        </div>

        {/* Dates d'intervention */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <DatePicker
              label="Date début intervention"
              value={maintenance.date_debut_intervention}
              onChange={handleDateDebutChange}
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
              label="Date fin intervention"
              value={maintenance.date_fin_intervention}
              onChange={handleDateFinChange}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </div>
        </div>

        {/* Séparateur */}
        <hr className="my-3" style={{ borderTop: '1px dashed #ccc' }} />

        {/* Section Diagnostic et Réparation */}
        <div className="mb-3">
          <div className="border-start border-success border-4 ps-3 py-2 bg-light">
            <h6 className="mb-0 text-success fw-semibold">
              Diagnostic et Réparation (optionnel)
            </h6>
          </div>
        </div>

        {/* Pièces remplacées et réparées */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Pièces remplacées"
              name="pieces_remplacees"
              value={maintenance.pieces_remplacees}
              onChange={handleChange}
              size="small"
              placeholder="Liste des pièces remplacées..."
            />
          </div>

          <div className="col-md-6 mb-3">
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Pièces réparées"
              name="pieces_reparees"
              value={maintenance.pieces_reparees}
              onChange={handleChange}
              size="small"
              placeholder="Liste des pièces réparées..."
            />
          </div>
        </div>

        {/* Coût des pièces */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <InputField
              type="number"
              label="Coût des pièces (Ar)"
              name="cout_pieces"
              value={maintenance.cout_pieces}
              onChange={handleChange}
              inputProps={{ min: 0, step: '0.01' }}
            />
          </div>
        </div>

        {/* Notes de réparation */}
        <div className="row">
          <div className="col mb-3">
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes de réparation"
              name="notes_reparation"
              value={maintenance.notes_reparation}
              onChange={handleChange}
              size="small"
              placeholder="Notes supplémentaires sur la réparation et prévention future..."
            />
          </div>
        </div>
      </LocalizationProvider>
    </Modal>
  )
}

export default CurativeCreate
