import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import AutocompleteField from '../../../../components/ui/AutocompleteField'
import 'dayjs/locale/fr'
import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { TextField, MenuItem } from '@mui/material'
import api from '../../../../utils/axios'

const PreventiveCreate = ({ isOpen, onSave, onClose }) => {
  const [maintenance, setMaintenance] = useState({
    materiel_id: '',
    nom_operation: '',
    date_planifiee: null,
    heures_fonctionnement_cible: '',
    km_fonctionnement_cible: '',
    priorite: 'Moyenne',
    statut: 'Planifiée',
    date_debut_intervention: null,
    date_fin_intervention: null,
    notes_intervention: '',
    cout_pieces: '',
  })

  const [materielList, setMaterielList] = useState([])

  // Récupérer la liste des matériels
  useEffect(() => {
    const fetchMaterielList = async () => {
      try {
        const response = await api.get('/materiel')
        const formattedMateriel = response.data.map((materiel) => ({
          value: materiel.id,
          label: `${materiel.designation || 'N/A'} - N°Parc: ${
            materiel.num_parc || 'N/A'
          } - Parc Colas: ${materiel.parc_colas || 'N/A'}`,
        }))
        setMaterielList(formattedMateriel)
      } catch (error) {
        console.error('Erreur lors de la récupération des matériels:', error)
      }
    }

    if (isOpen) {
      fetchMaterielList()
    }
  }, [isOpen])

  // Validation du formulaire
  const isFormValid =
    maintenance.materiel_id !== '' &&
    maintenance.nom_operation.trim() !== '' &&
    maintenance.date_planifiee !== null

  // Gestion des changements d'autocomplete
  const handleAutocompleteChange = (event) => {
    const { name, value } = event.target
    setMaintenance((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Gestion des changements de champs texte
  const handleInputChange = (event) => {
    const { name, value } = event.target
    setMaintenance((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Gestion des changements de dates
  const handleDateChange = (field) => (newValue) => {
    setMaintenance((prev) => ({
      ...prev,
      [field]: newValue,
    }))
  }

  // Sauvegarde
  const handleSave = () => {
    const formattedMaintenance = {
      ...maintenance,
      date_planifiee: maintenance.date_planifiee
        ? dayjs(maintenance.date_planifiee).format('YYYY-MM-DD')
        : null,
      date_debut_intervention: maintenance.date_debut_intervention
        ? dayjs(maintenance.date_debut_intervention).format('YYYY-MM-DD')
        : null,
      date_fin_intervention: maintenance.date_fin_intervention
        ? dayjs(maintenance.date_fin_intervention).format('YYYY-MM-DD')
        : null,
      heures_fonctionnement_cible:
        maintenance.heures_fonctionnement_cible || null,
      km_fonctionnement_cible: maintenance.km_fonctionnement_cible || null,
      cout_pieces: maintenance.cout_pieces || null,
    }
    onSave(formattedMaintenance)
  }

  // Réinitialisation
  const resetForm = () => {
    setMaintenance({
      materiel_id: '',
      nom_operation: '',
      date_planifiee: null,
      heures_fonctionnement_cible: '',
      km_fonctionnement_cible: '',
      priorite: 'Moyenne',
      statut: 'Planifiée',
      date_debut_intervention: null,
      date_fin_intervention: null,
      notes_intervention: '',
      cout_pieces: '',
    })
  }

  return (
    <Modal
      title="Créer une maintenance préventive"
      btnLabel="Créer"
      isOpen={isOpen}
      onSave={handleSave}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="600px"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
        {/* Matériel */}
        <div className="row">
          <div className="col mb-3 mt-2">
            <AutocompleteField
              required
              label="Matériel"
              name="materiel_id"
              value={maintenance.materiel_id}
              onChange={handleAutocompleteChange}
              options={materielList}
            />
          </div>
        </div>

        {/* Nom de l'opération et date planifiée */}
        <div className="row">
          <div className="col-md-8 mb-3">
            <TextField
              required
              fullWidth
              label="Nom de l'opération"
              name="nom_operation"
              value={maintenance.nom_operation}
              onChange={handleInputChange}
              placeholder="Ex: Vidange, Graissage, Nettoyage filtres..."
            />
          </div>
          <div className="col-md-4 mb-3">
            <DatePicker
              label="Date planifiée *"
              value={maintenance.date_planifiee}
              onChange={handleDateChange('date_planifiee')}
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

        {/* Date planifiée et Priorité */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <TextField
              select
              fullWidth
              label="Statut"
              name="statut"
              value={maintenance.statut}
              onChange={handleInputChange}
            >
              <MenuItem value="Planifiée">Planifiée</MenuItem>
              <MenuItem value="En cours">En cours</MenuItem>
              <MenuItem value="Terminée">Terminée</MenuItem>
            </TextField>
          </div>
          <div className="col-md-6 mb-3">
            <TextField
              select
              fullWidth
              label="Priorité"
              name="priorite"
              value={maintenance.priorite}
              onChange={handleInputChange}
            >
              <MenuItem value="Basse">Basse</MenuItem>
              <MenuItem value="Moyenne">Moyenne</MenuItem>
              <MenuItem value="Haute">Haute</MenuItem>
            </TextField>
          </div>
        </div>

        {/* Heures et KM de fonctionnement */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <TextField
              fullWidth
              type="number"
              label="Heures fonctionnement cible"
              name="heures_fonctionnement_cible"
              value={maintenance.heures_fonctionnement_cible}
              onChange={handleInputChange}
              placeholder="Ex: 1000"
            />
          </div>
          <div className="col-md-6 mb-3">
            <TextField
              fullWidth
              type="number"
              label="KM fonctionnement cible"
              name="km_fonctionnement_cible"
              value={maintenance.km_fonctionnement_cible}
              onChange={handleInputChange}
              placeholder="Ex: 50000"
            />
          </div>
        </div>

        {/* Séparateur */}
        <hr className="my-3" style={{ borderTop: '1px dashed #ccc' }} />

        {/* Section Suppléant (optionnel) */}
        <div className="row">
          <div className="col-12 mb-2">
            <h6
              className="text-secondary"
              style={{ fontSize: '0.95rem', fontWeight: '600' }}
            >
              Information Supplémentaire (optionnel)
            </h6>
          </div>
        </div>

        {/* Dates d'intervention */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <DatePicker
              label="Date début intervention"
              value={maintenance.date_debut_intervention}
              onChange={handleDateChange('date_debut_intervention')}
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
              onChange={handleDateChange('date_fin_intervention')}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </div>
        </div>

        {/* Coût pièces */}
        <div className="row">
          <div className="col mb-3">
            <TextField
              fullWidth
              type="number"
              label="Coût pièces (Ar)"
              name="cout_pieces"
              value={maintenance.cout_pieces}
              onChange={handleInputChange}
              placeholder="0.00"
              inputProps={{ step: '0.01' }}
            />
          </div>
        </div>

        {/* Notes d'intervention */}
        <div className="row">
          <div className="col mb-3">
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes d'intervention"
              name="notes_intervention"
              value={maintenance.notes_intervention}
              onChange={handleInputChange}
              placeholder="Détails de l'intervention préventive..."
            />
          </div>
        </div>
      </LocalizationProvider>
    </Modal>
  )
}

export default PreventiveCreate
