//src/views/dashboard/camion/CamionEdit.jsx
import { useState, useEffect } from 'react'
import { TextField } from '@mui/material'
import Modal from '../../../components/ui/Modal'

const CamionEdit = ({ isOpen, camion, onChange, onSave, onClose }) => {
  // Fallback si `camion` est null/undefined
  const validCamion = camion || {}

  // État local pour valider le formulaire
  const [isFormValid, setIsFormValid] = useState(true)

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    onChange({
      designation: '',
      modele: '',
      serie: '',
      cst: '',
      num_parc: '',
      immatriculation: '',
      parc_colas: '',
    })
  }

  // Vérifie si tous les champs requis sont remplis correctement
  const checkFormValidity = () => {
    const { designation = '', modele = '', num_parc = '' } = validCamion
    const isValid =
      designation.trim() !== '' &&
      modele.trim() !== '' &&
      num_parc.trim() !== ''
    setIsFormValid(isValid)
  }

  // Chaque fois que le `camion` change, on vérifie la validité du formulaire
  useEffect(() => {
    checkFormValidity()
  }, [validCamion])

  // Destructuration pour faciliter l'accès aux champs
  const {
    designation = '',
    modele = '',
    serie = '',
    cst = '',
    num_parc = '',
    immatriculation = '',
    parc_colas = '',
  } = validCamion

  return (
    <Modal
      title="Modifier un camion"
      btnLabel="Sauvegarder"
      isOpen={isOpen}
      onSave={() => onSave(validCamion)}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
    >
      {/* Champ Designation */}
      <div className="row">
        <div className="col mb-3 mt-2">
          <TextField
            label="Designation"
            fullWidth
            sx={{
              // Styles personnalisés MUI
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
            }}
            value={designation}
            onChange={(e) =>
              onChange({ ...validCamion, designation: e.target.value })
            }
          />
        </div>
      </div>

      {/* Champs N° Parc et Parc Colas sur la même ligne */}
      <div className="row">
        {/* Champ N° Parc */}
        <div className="col-md-6 mb-3 mt-2">
          <TextField
            label="N° Parc"
            id="num_parc"
            fullWidth
            sx={{
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
            }}
            value={num_parc}
            onChange={(e) =>
              onChange({ ...validCamion, num_parc: e.target.value })
            }
          />
        </div>

        {/* Champ Parc Colas */}
        <div className="col-md-6 mb-3 mt-2">
          <TextField
            label="Parc Colas"
            id="cst"
            fullWidth
            sx={{
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
            }}
            value={parc_colas}
            onChange={(e) =>
              onChange({ ...validCamion, parc_colas: e.target.value })
            }
          />
        </div>
      </div>

      {/* Champs Modèle et N° Série sur la même ligne */}
      <div className="row">
        {/* Champ Modèle */}
        <div className="col-md-6 mb-3 mt-2">
          <TextField
            label="Modèle"
            id="modele"
            fullWidth
            sx={{
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
            }}
            value={modele}
            onChange={(e) =>
              onChange({ ...validCamion, modele: e.target.value })
            }
          />
        </div>

        {/* Champ N° Série */}
        <div className="col-md-6 mb-3 mt-2">
          <TextField
            label="N° Série"
            id="serie"
            fullWidth
            sx={{
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
            }}
            value={serie}
            onChange={(e) =>
              onChange({ ...validCamion, serie: e.target.value })
            }
          />
        </div>
      </div>

      {/* Champs Immatriculation et CST sur la même ligne */}
      <div className="row">
        {/* Champ Immatriculation */}
        <div className="col-md-6 mb-3 mt-2">
          <TextField
            label="Immatriculation"
            id="immatriculation"
            fullWidth
            sx={{
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
            }}
            value={immatriculation}
            onChange={(e) =>
              onChange({ ...validCamion, immatriculation: e.target.value })
            }
          />
        </div>

        {/* Champ CST */}
        <div className="col-md-6 mb-3 mt-2">
          <TextField
            label="CST"
            id="cst"
            fullWidth
            sx={{
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
            }}
            value={cst}
            onChange={(e) => onChange({ ...validCamion, cst: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  )
}

export default CamionEdit
