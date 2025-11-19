import { useState, useEffect } from 'react'
import {
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Alert,
} from '@mui/material'
import Modal from '../../../../components/ui/Modal'
import api from '../../../../utils/axios'
import AutocompleteField from '../../../../components/ui/AutocompleteField'
import { useAuthStore, selectUser } from '../../../../store/auth'

const MouvementCreate = ({ isOpen, onSave, onClose, depotId }) => {
  const user = useAuthStore(selectUser)

  const [mouvement, setMouvement] = useState({
    materiel_id: '',
    depot_id: depotId || '',
    type_mouvement: 'ENTREE',
    quantite: 0,
    depot_destination_id: '',
    reference_document: '',
    commentaire: '',
    utilisateur: user?.name || '',
  })

  const [isFormValid, setIsFormValid] = useState(false)
  const [materiels, setMateriels] = useState([])
  const [depots, setDepots] = useState([])
  const [stockDisponible, setStockDisponible] = useState(null)

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
      setMouvement((prev) => ({ ...prev, depot_id: depotId }))
    }
  }, [depotId])

  useEffect(() => {
    const fetchMaterielsFromDepot = async () => {
      if (!mouvement.depot_id) {
        setMateriels([])
        return
      }

      try {
        // 1. Récupérer TOUS les matériels
        const { data: allMateriels } = await api.get('materiel')

        // 2. Récupérer le stock du dépôt sélectionné
        const { data: stockData } = await api.get(
          `stocks/depot/${mouvement.depot_id}`
        )

        let materielsDisponibles = []

        if (mouvement.type_mouvement === 'ENTREE') {
          // ✅ ENTRÉE : Afficher TOUS les matériels qui ont un enregistrement de stock dans ce dépôt (même quantité = 0)
          materielsDisponibles = allMateriels.filter((mat) =>
            stockData.some((stock) => stock.materiel_id === mat.id)
          )
        } else {
          // ✅ SORTIE : Afficher uniquement les matériels avec quantité > 0
          const materielsAvecStock = stockData.filter(
            (stock) => stock.quantite > 0
          )
          materielsDisponibles = allMateriels.filter((mat) =>
            materielsAvecStock.some((stock) => stock.materiel_id === mat.id)
          )
        }

        setMateriels(materielsDisponibles)
      } catch (error) {
        console.error('Erreur lors du chargement des matériels:', error)
        setMateriels([])
      }
    }

    if (isOpen && mouvement.depot_id) {
      fetchMaterielsFromDepot()
    }
  }, [isOpen, mouvement.depot_id, mouvement.type_mouvement])

  // ✅ AJOUT : Charger le stock disponible quand un matériel est sélectionné
  useEffect(() => {
    const fetchStockDisponible = async () => {
      if (!mouvement.materiel_id || !mouvement.depot_id) {
        setStockDisponible(null)
        return
      }

      try {
        const { data: stockData } = await api.get(
          `stocks/depot/${mouvement.depot_id}`
        )
        const stock = stockData.find(
          (s) => s.materiel_id === parseInt(mouvement.materiel_id, 10)
        )
        setStockDisponible(stock ? stock.quantite : 0)
      } catch (error) {
        console.error('Erreur lors du chargement du stock:', error)
        setStockDisponible(null)
      }
    }

    if (mouvement.type_mouvement === 'SORTIE') {
      fetchStockDisponible()
    }
  }, [mouvement.materiel_id, mouvement.depot_id, mouvement.type_mouvement])

  // Vérifier la validité du formulaire
  useEffect(() => {
    const isTransfert =
      mouvement.type_mouvement === 'SORTIE' && mouvement.depot_destination_id

    const isValid =
      mouvement.materiel_id !== '' &&
      mouvement.depot_id !== '' &&
      mouvement.quantite > 0 &&
      (mouvement.type_mouvement === 'ENTREE' ||
        (mouvement.type_mouvement === 'SORTIE' && !isTransfert) ||
        (isTransfert && mouvement.depot_destination_id !== ''))

    setIsFormValid(isValid)
  }, [mouvement])

  // Gestion des changements
  const handleChange = (event) => {
    const { name, value } = event.target
    setMouvement((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Gestion du changement de dépôt
  const handleDepotChange = (event) => {
    const { name, value } = event.target
    setMouvement((prev) => ({
      ...prev,
      [name]: value,
      materiel_id: '', // Réinitialiser le matériel sélectionné
    }))
    setStockDisponible(null)
  }

  // Gestion du changement de type
  const handleTypeChange = (event) => {
    setMouvement((prev) => ({
      ...prev,
      type_mouvement: event.target.value,
      depot_destination_id: '', // Réinitialiser la destination
      materiel_id: '', // Réinitialiser le matériel
    }))
    setStockDisponible(null)
  }

  // Réinitialiser le formulaire
  const resetForm = () => {
    setMouvement({
      materiel_id: '',
      depot_id: depotId || '',
      type_mouvement: 'ENTREE',
      quantite: 0,
      depot_destination_id: '',
      reference_document: '',
      commentaire: '',
      utilisateur: user?.name || '',
    })
    setStockDisponible(null)
  }

  // Sauvegarder
  const handleSave = () => {
    const dataToSend = {
      materiel_id: parseInt(mouvement.materiel_id, 10),
      depot_id: parseInt(mouvement.depot_id, 10),
      type_mouvement: mouvement.type_mouvement,
      quantite: parseInt(mouvement.quantite, 10),
      depot_destination_id: mouvement.depot_destination_id
        ? parseInt(mouvement.depot_destination_id, 10)
        : null,
      reference_document: mouvement.reference_document || null,
      commentaire: mouvement.commentaire || null,
      utilisateur: mouvement.utilisateur || null,
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
      title="Nouveau Mouvement de Stock"
      btnLabel="Enregistrer"
      isOpen={isOpen}
      onSave={handleSave}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="700px"
    >
      {/* Type de mouvement */}
      <div className="row">
        <div className="col mb-3 mt-2">
          <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
            Type de mouvement *
          </FormLabel>
          <RadioGroup
            row
            name="type_mouvement"
            value={mouvement.type_mouvement}
            onChange={handleTypeChange}
          >
            <FormControlLabel
              value="ENTREE"
              control={<Radio />}
              label="Entrée"
            />
            <FormControlLabel
              value="SORTIE"
              control={<Radio />}
              label="Sortie"
            />
          </RadioGroup>
        </div>
      </div>

      {/* Dépôt source */}
      <div className="row">
        <div className="col mb-3">
          <AutocompleteField
            required
            label="Dépôt source"
            name="depot_id"
            value={mouvement.depot_id}
            onChange={handleDepotChange}
            options={depotOptions}
            disabled={!!depotId}
          />
        </div>
      </div>

      {/* Message informatif */}
      {mouvement.depot_id && (
        <div className="row">
          <div className="col mb-3">
            <Alert severity="info">
              {mouvement.type_mouvement === 'ENTREE'
                ? 'Tous les matériels enregistrés dans ce dépôt sont disponibles.'
                : 'Seuls les matériels avec un stock disponible (quantité > 0) sont affichés.'}
            </Alert>
          </div>
        </div>
      )}

      {/* Afficher le stock disponible pour les sorties */}
      {mouvement.type_mouvement === 'SORTIE' &&
        mouvement.materiel_id &&
        stockDisponible !== null && (
          <div className="row">
            <div className="col mb-3">
              <Alert severity={stockDisponible > 0 ? 'info' : 'warning'}>
                Stock disponible: <strong>{stockDisponible}</strong> unité(s)
              </Alert>
            </div>
          </div>
        )}

      {/* Matériel et Quantité */}
      <div className="row">
        <div className="col mb-3">
          <AutocompleteField
            required
            label="Matériel"
            name="materiel_id"
            value={mouvement.materiel_id}
            onChange={handleChange}
            options={materielOptions}
            disabled={!mouvement.depot_id}
          />
          {!mouvement.depot_id && (
            <small style={{ color: '#637381', marginTop: 4, display: 'block' }}>
              Veuillez d'abord sélectionner un dépôt
            </small>
          )}
        </div>
        <div className="col-md-6 mb-3">
          <TextField
            required
            fullWidth
            type="number"
            label="Quantité"
            name="quantite"
            value={mouvement.quantite}
            onChange={handleChange}
            sx={textFieldStyle}
            inputProps={{
              min: 1,
              max:
                mouvement.type_mouvement === 'SORTIE' &&
                stockDisponible !== null
                  ? stockDisponible
                  : undefined,
            }}
          />
        </div>
      </div>

      {/* Utilisateur et Référence document (pour les sorties) */}
      {mouvement.type_mouvement === 'SORTIE' && (
        <div className="row">
          <div className="col mb-3">
            <TextField
              fullWidth
              label="Utilisateur"
              name="utilisateur"
              value={mouvement.utilisateur}
              onChange={handleChange}
              sx={textFieldStyle}
            />
          </div>
          <div className="col mb-3">
            <TextField
              fullWidth
              label="Référence document"
              name="reference_document"
              value={mouvement.reference_document}
              onChange={handleChange}
              sx={textFieldStyle}
              placeholder="BL-2024-001"
            />
          </div>
        </div>
      )}

      {/* Commentaire */}
      <div className="row">
        <div className="col mb-3">
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Commentaire"
            name="commentaire"
            value={mouvement.commentaire}
            onChange={handleChange}
            sx={textFieldStyle}
            placeholder="Ajouter un commentaire..."
          />
        </div>
      </div>
    </Modal>
  )
}

export default MouvementCreate
