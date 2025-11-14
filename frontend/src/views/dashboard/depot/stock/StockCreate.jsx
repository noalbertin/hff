import { useState, useEffect } from 'react'
import { TextField } from '@mui/material'
import Modal from '../../../../components/ui/Modal'
import api from '../../../../utils/axios'
import AutocompleteField from '../../../../components/ui/AutocompleteField'

const StockCreate = ({ isOpen, onSave, onClose, depotId }) => {
  const [stock, setStock] = useState({
    materiel_id: '',
    depot_id: depotId || '',
    quantite: 0,
    quantite_minimum: 0,
  })

  const [isFormValid, setIsFormValid] = useState(false)
  const [materiels, setMateriels] = useState([])
  const [depots, setDepots] = useState([])

  // Charger les matériels
  useEffect(() => {
    const fetchMateriels = async () => {
      try {
        const { data } = await api.get('materiel/sans-stock')
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

  // Mettre à jour depot_id si depotId change
  useEffect(() => {
    if (depotId) {
      setStock((prev) => ({ ...prev, depot_id: depotId }))
    }
  }, [depotId])

  // Vérifier la validité du formulaire
  useEffect(() => {
    const isValid =
      stock.materiel_id !== '' &&
      stock.depot_id !== '' &&
      stock.quantite >= 0 &&
      stock.quantite_minimum >= 0
    setIsFormValid(isValid)
  }, [stock])

  // Gestion des changements
  const handleChange = (event) => {
    const { name, value } = event.target
    setStock((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Réinitialiser le formulaire
  const resetForm = () => {
    setStock({
      materiel_id: '',
      depot_id: depotId || '',
      quantite: 0,
      quantite_minimum: 0,
    })
  }

  // Sauvegarder
  const handleSave = () => {
    const dataToSend = {
      ...stock,
      materiel_id: parseInt(stock.materiel_id, 10),
      depot_id: parseInt(stock.depot_id, 10),
      quantite: parseInt(stock.quantite, 10),
      quantite_minimum: parseInt(stock.quantite_minimum, 10),
    }
    onSave(dataToSend)
  }

  // Options pour les autocomplete
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
      title="Ajouter un stock"
      btnLabel="Créer"
      isOpen={isOpen}
      onSave={handleSave}
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
            label="Matériel"
            name="materiel_id"
            value={stock.materiel_id}
            onChange={handleChange}
            options={materielOptions}
          />
        </div>
      </div>

      {/* Dépôt (désactivé si depotId est fourni) */}
      <div className="row">
        <div className="col mb-3">
          <AutocompleteField
            required
            label="Dépôt"
            name="depot_id"
            value={stock.depot_id}
            onChange={handleChange}
            options={depotOptions}
            disabled={!!depotId}
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
            name="quantite"
            value={stock.quantite}
            onChange={handleChange}
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
            name="quantite_minimum"
            value={stock.quantite_minimum}
            onChange={handleChange}
            sx={textFieldStyle}
            inputProps={{ min: 0 }}
          />
        </div>
      </div>
    </Modal>
  )
}

export default StockCreate
