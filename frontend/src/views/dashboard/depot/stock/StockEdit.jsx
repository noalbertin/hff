import { useState, useEffect } from 'react'
import { TextField } from '@mui/material'
import Modal from '../../../../components/ui/Modal'
import api from '../../../../utils/axios'
import AutocompleteField from '../../../../components/ui/AutocompleteField'

const StockEdit = ({ isOpen, stock, onChange, onSave, onClose }) => {
  const validStock = stock || {}
  const [isFormValid, setIsFormValid] = useState(true)
  const [materiels, setMateriels] = useState([])
  const [depots, setDepots] = useState([])

  // Charger les matériels
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

  // Charger les dépôts
  useEffect(() => {
    const fetchDepots = async () => {
      try {
        const { data } = await api.get('depots')
        setDepots(data)
      } catch (error) {
        console.error('Erreur lors du chargement des dépôts:', error)
      }
    }

    if (isOpen) {
      fetchDepots()
    }
  }, [isOpen])

  // Vérifier la validité du formulaire
  const checkFormValidity = () => {
    const {
      materiel_id = '',
      depot_id = '',
      quantite = 0,
      quantite_minimum = 0,
    } = validStock
    const isValid =
      materiel_id !== '' &&
      depot_id !== '' &&
      quantite >= 0 &&
      quantite_minimum >= 0
    setIsFormValid(isValid)
  }

  useEffect(() => {
    checkFormValidity()
  }, [validStock])

  // Réinitialiser le formulaire
  const resetForm = () => {
    onChange({
      materiel_id: '',
      depot_id: '',
      quantite: 0,
      quantite_minimum: 0,
    })
  }

  const {
    materiel_id = '',
    depot_id = '',
    quantite = 0,
    quantite_minimum = 0,
  } = validStock

  // Options pour les autocomplete - Convertir les IDs en string pour la cohérence
  const materielOptions = materiels.map((m) => ({
    value: String(m.id),
    label: `${m.designation} - N°Parc: ${m.num_parc} (${m.parc_colas})`,
  }))

  const depotOptions = depots.map((d) => ({
    value: String(d.id),
    label: `${d.nom} - ${d.responsable}`,
  }))

  // Style pour les champs
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

  return (
    <Modal
      title="Modifier un stock"
      btnLabel="Sauvegarder"
      isOpen={isOpen}
      onSave={() => onSave(validStock)}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="600px"
    >
      {/* Matériel */}
      <div className="row">
        <div className="col mb-3 mt-2">
          <AutocompleteField
            required
            disabled
            label="Matériel"
            name="materiel_id"
            value={String(materiel_id)}
            onChange={(e) =>
              onChange({ ...validStock, materiel_id: e.target.value })
            }
            options={materielOptions}
          />
        </div>
      </div>

      {/* Dépôt */}
      <div className="row">
        <div className="col mb-3">
          <AutocompleteField
            required
            disabled
            label="Dépôt"
            name="depot_id"
            value={String(depot_id)} // Convertir en string
            onChange={(e) =>
              onChange({ ...validStock, depot_id: e.target.value })
            }
            options={depotOptions}
          />
        </div>
      </div>

      {/* Quantité actuelle et minimum */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <TextField
            required
            fullWidth
            type="number"
            label="Quantité actuelle"
            value={quantite} // Garder comme nombre
            onChange={(e) =>
              onChange({ ...validStock, quantite: Number(e.target.value) })
            }
            sx={textFieldStyle}
            inputProps={{ min: 0 }}
          />
        </div>
        <div className="col-md-6 mb-3">
          <TextField
            required
            fullWidth
            type="number"
            label="Quantité minimum"
            value={quantite_minimum} // Garder comme nombre
            onChange={(e) =>
              onChange({
                ...validStock,
                quantite_minimum: Number(e.target.value),
              })
            }
            sx={textFieldStyle}
            inputProps={{ min: 0 }}
          />
        </div>
      </div>
    </Modal>
  )
}

export default StockEdit
