//src/views/dashboard/camion/CamionCreate.jsx

import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import InputField from '../../../components/ui/form/InputField'
import 'dayjs/locale/fr'

const CamionCreate = ({ isOpen, onSave, onClose }) => {
  // État local pour stocker les données du formulaire
  const [camion, setCamion] = useState({
    designation: '',
    serie: '',
    modele: '',
    cst: '',
    num_parc: '',
    immatriculation: '',
    parc_colas: '',
  })

  // Vérifie si le formulaire est valide avant de pouvoir le soumettre
  const isFormValid =
    camion.designation !== '' && camion.modele !== '' && camion.num_parc !== ''

  // Gère les changements pour les champs texte du formulaire
  const handleChange = (event) => {
    const { name, value } = event.target
    setCamion((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Gère la sauvegarde des données du formulaire (actuellement affichées en console)
  const handleSave = () => {
    onSave(camion) // Peut être utilisé si on veut appeler une fonction parent
  }

  // Réinitialise tous les champs du formulaire après soumission
  const resetForm = () => {
    setCamion({
      designation: '',
      serie: '',
      modele: '',
      cst: '',
      num_parc: '',
      immatriculation: '',
      parc_colas: '',
    })
  }

  return (
    <Modal
      title="Créer un camion"
      btnLabel="Créer"
      isOpen={isOpen}
      onSave={handleSave}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="435px"
    >
      {/* Champ designation */}
      <div className="row">
        <div className="col mb-3 mt-2">
          <InputField
            required
            label="Désignation"
            name="designation"
            value={camion.designation}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Champs N° Parc et Parc Colas sur une seule ligne */}
      <div className="row">
        {/* Champ N° Parc */}
        <div className="col-md-6 mb-3">
          <InputField
            required
            label="N° Parc"
            name="num_parc"
            value={camion.num_parc}
            onChange={handleChange}
          />
        </div>

        {/* Champ Parc Colas */}
        <div className="col-md-6 mb-3">
          <InputField
            label="Parc Colas"
            name="parc_colas"
            value={camion.parc_colas}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Champs N° Série et Modèle sur une seule ligne */}
      <div className="row">
        {/* Champ N° Série */}
        <div className="col-md-6 mb-3">
          <InputField
            label="N° Série"
            name="serie"
            value={camion.serie}
            onChange={handleChange}
          />
        </div>

        {/* Champ Modèle */}
        <div className="col-md-6 mb-3">
          <InputField
            required
            label="Modèle"
            name="modele"
            value={camion.modele}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Champs Immatriculation et CST sur une seule ligne */}
      <div className="row">
        {/* Champ Immatriculation */}
        <div className="col-md-6 mb-3">
          <InputField
            label="Immatriculation"
            name="immatriculation"
            value={camion.immatriculation}
            onChange={handleChange}
          />
        </div>

        {/* Champ CST */}
        <div className="col-md-6 mb-3">
          <InputField
            label="CST"
            name="cst"
            value={camion.cst}
            onChange={handleChange}
          />
        </div>
      </div>
    </Modal>
  )
}

export default CamionCreate
