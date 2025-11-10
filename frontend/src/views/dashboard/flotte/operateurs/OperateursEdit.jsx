import { useState, useEffect } from 'react'
import Modal from '../../../../components/ui/Modal'
import AutocompleteField from '../../../../components/ui/AutocompleteField'
import api from '../../../../utils/axios'
import InputField from '../../../../components/ui/form/InputField'

const OperateursEdit = ({ isOpen, operateurData, onSave, onClose }) => {
  const [operateur, setOperateur] = useState({
    id_operateur: '',
    flotte_id: null, // ✅ Changé de '' à null
    matricule: '',
    nom: '',
    telephone: '',
    nom_suppleant: '',
    telephone_suppleant: '',
    matricule_suppleant: '',
  })

  const [flotteList, setFlotteList] = useState([])

  // Charger les données de l'opérateur à modifier
  useEffect(() => {
    if (operateurData && isOpen) {
      console.log('📥 Données reçues:', operateurData)
      setOperateur({
        id_operateur: operateurData.id_operateur || '',
        flotte_id: operateurData.flotte_id || null, // ✅ Changé
        matricule: operateurData.matricule || '',
        nom: operateurData.nom || '',
        telephone: operateurData.telephone || '',
        nom_suppleant: operateurData.nom_suppleant || '',
        telephone_suppleant: operateurData.telephone_suppleant || '',
        matricule_suppleant: operateurData.matricule_suppleant || '',
      })
    }
  }, [operateurData, isOpen])

  // Récupérer la liste des flottes
  useEffect(() => {
    const fetchFlotteList = async () => {
      try {
        const responseSansOperateur = await api.get('flotte/sans-operateur')

        let flotteActuelle = null
        if (operateurData?.flotte_id) {
          try {
            const responseFlotteActuelle = await api.get(
              `flotte/${operateurData.flotte_id}`
            )
            flotteActuelle = responseFlotteActuelle.data
          } catch (error) {
            console.error('Erreur flotte actuelle:', error)
          }
        }

        const allFlottes = [...responseSansOperateur.data]
        if (flotteActuelle) {
          allFlottes.unshift(flotteActuelle)
        }

        // ✅ FIX : Adapter à la structure réelle des données
        const formattedFlotte = allFlottes.map((flotte) => ({
          value: flotte.id_flotte,
          label: `${
            flotte.materiel_designation || flotte.materiel?.designation || 'N/A'
          } - N°Parc: ${
            flotte.num_parc || flotte.materiel?.num_parc || 'N/A'
          } - Parc Colas: ${
            flotte.parc_colas || flotte.materiel?.parc_colas || 'N/A'
          }`,
          // Stocker les infos pour référence
          designation:
            flotte.materiel_designation || flotte.materiel?.designation,
          num_parc: flotte.num_parc || flotte.materiel?.num_parc,
          parc_colas: flotte.parc_colas || flotte.materiel?.parc_colas,
        }))

        console.log('✅ Options formatées:', formattedFlotte)
        setFlotteList(formattedFlotte)
      } catch (error) {
        console.error('Erreur récupération flottes:', error)
      }
    }

    if (isOpen) {
      fetchFlotteList()
    }
  }, [isOpen, operateurData])

  // ✅ Validation modifiée
  const isFormValid = operateur.flotte_id !== null && operateur.nom !== ''

  // ✅ FIX CRITIQUE : onChange doit gérer correctement les objets MUI Autocomplete
  const handleAutocompleteChange = (event, newValue) => {
    console.log('🔄 AutoComplete onChange:', { event, newValue })

    // newValue est l'objet complet sélectionné ou null
    setOperateur((prevState) => ({
      ...prevState,
      flotte_id: newValue?.value || null,
    }))
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setOperateur((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSave = () => {
    console.log('💾 Données à sauvegarder:', operateur)

    if (!operateur.id_operateur) {
      console.error('❌ ID opérateur manquant!')
      return
    }

    onSave(operateur)
  }

  const resetForm = () => {
    setOperateur({
      id_operateur: '',
      flotte_id: null, // ✅ Changé
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
      title="Modifier un opérateur"
      btnLabel="Enregistrer"
      isOpen={isOpen}
      onSave={handleSave}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="550px"
    >
      <div className="row">
        <div className="col mb-3 mt-2">
          <AutocompleteField
            required
            label="Matériel"
            name="flotte_id"
            value={
              flotteList.find((f) => f.value === operateur.flotte_id) || null
            }
            onChange={handleAutocompleteChange}
            options={flotteList}
          />
        </div>
      </div>

      {/* Reste du formulaire inchangé */}
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
            label="Téléphone"
            name="telephone"
            value={operateur.telephone}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <hr className="my-3" style={{ borderTop: '1px dashed #ccc' }} />

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

      <div className="row">
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

export default OperateursEdit
