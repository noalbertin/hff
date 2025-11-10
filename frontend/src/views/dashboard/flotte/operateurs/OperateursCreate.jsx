import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import AutocompleteField from '../../../../components/ui/AutocompleteField'
import api from '../../../../utils/axios'
import InputField from '../../../../components/ui/form/InputField'

const OperateurCreate = ({ isOpen, onSave, onClose }) => {
  // État local pour stocker les données du formulaire
  const [operateur, setOperateur] = useState({
    flotte_id: '',
    matricule: '',
    nom: '',
    telephone: '',
    nom_suppleant: '',
    telephone_suppleant: '',
    matricule_suppleant: '',
  })

  // État pour stocker la liste des flottes
  const [flotteList, setFlotteList] = useState([])

  // Récupérer la liste des flottes sans opérateur au chargement du composant
  useEffect(() => {
    const fetchFlotteList = async () => {
      try {
        // Route pour récupérer les flottes sans opérateur
        const response = await api.get('flotte/sans-operateur')

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
    operateur.flotte_id !== '' &&
    operateur.nom !== '' &&
    operateur.matricule !== '' &&
    operateur.telephone !== ''

  // Gère le changement de l'autocomplete
  const handleAutocompleteChange = (event) => {
    const { name, value } = event.target
    setOperateur((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Gère le changement des champs texte
  const handleInputChange = (event) => {
    const { name, value } = event.target
    setOperateur((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Gère la sauvegarde des données du formulaire
  const handleSave = () => {
    // Préparer les données à envoyer
    const formattedOperateur = {
      ...operateur,
    }
    onSave(formattedOperateur)
  }

  // Réinitialise tous les champs du formulaire après soumission
  const resetForm = () => {
    setOperateur({
      flotte_id: '',
      matricule: '',
      nom: '',
      telephone: '',
      nom_suppleant: '',
      telephone_suppleant: '',
      matricule_suppleant: '',
    })
  }

  return (
    <Modal
      title="Affecter un opérateur"
      btnLabel="Créer"
      isOpen={isOpen}
      onSave={handleSave}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="550px"
    >
      {/* Champ Flotte (Matériel) avec Autocomplete */}
      <div className="row">
        <div className="col mb-3 mt-2">
          <AutocompleteField
            required
            label="Matériel"
            name="flotte_id"
            value={operateur.flotte_id}
            onChange={handleAutocompleteChange}
            options={flotteList}
          />
        </div>
      </div>

      {/* Section Opérateur Principal */}
      <div className="row">
        <div className="col-12 mb-2">
          <h6
            className="text-primary"
            style={{ fontSize: '0.95rem', fontWeight: '600' }}
          >
            Opérateur Principal
          </h6>
        </div>
      </div>

      {/* Matricule */}
      <div className="row">
        <div className="col mb-3">
          <InputField
            label="Nom"
            name="nom"
            value={operateur.nom}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Nom et Téléphone sur la même ligne */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <InputField
            type="number"
            label="Matricule"
            name="matricule"
            value={operateur.matricule}
            onChange={handleInputChange}
          />
        </div>

        <div className="col-md-6 mb-3">
          <InputField
            label="Téléphone "
            name="telephone"
            value={operateur.telephone}
            onChange={handleInputChange}
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
            Suppléant ou Aide chauffeur (optionnel)
          </h6>
        </div>
      </div>
      {/* Matricule */}
      <div className="row">
        {/* Nom du suppléant */}
        <div className="col mb-3">
          <InputField
            label="Nom Suppléant"
            name="nom_suppleant"
            value={operateur.nom_suppleant}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <InputField
            type="number"
            label="Matricule Suppléant"
            name="matricule_suppleant"
            value={operateur.matricule_suppleant}
            onChange={handleInputChange}
          />
        </div>

        {/* Téléphone du suppléant */}
        <div className="col-md-6 mb-3">
          <InputField
            label="Téléphone Suppléant"
            name="telephone_suppleant"
            value={operateur.telephone_suppleant}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </Modal>
  )
}

export default OperateurCreate
