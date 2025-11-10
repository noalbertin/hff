// src/views/dashboard/user/UserEdit.jsx
import { useState, useEffect } from 'react'
import { TextField, MenuItem, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import Modal from '../../../components/ui/Modal'

const UserEdit = ({ isOpen, user, onChange, onSave, onClose }) => {
  // Fallback si `user` est null/undefined
  const validUser = user || {}

  // État local pour valider le formulaire
  const [isFormValid, setIsFormValid] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  // Options pour le rôle
  const roleOptions = [
    { value: 'visiteur', label: 'Visiteur' },
    { value: 'admin', label: 'Admin' },
  ]

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    onChange({
      nom_user: '',
      password: '',
      role: 'visiteur',
    })
  }

  // Vérifie si tous les champs requis sont remplis correctement
  const checkFormValidity = () => {
    const { nom_user = '', role = '' } = validUser
    const isValid = nom_user.trim() !== '' && role !== ''
    setIsFormValid(isValid)
  }

  // Chaque fois que `user` change, on vérifie la validité du formulaire
  useEffect(() => {
    checkFormValidity()
  }, [validUser])

  // Destructuration pour faciliter l'accès aux champs
  const { nom_user = '', password = '', role = 'visiteur' } = validUser

  // Style commun pour les TextField
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
      title="Modifier un utilisateur"
      btnLabel="Sauvegarder"
      isOpen={isOpen}
      onSave={() => onSave(validUser)}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="600px"
    >
      {/* Nom d'utilisateur */}
      <div className="row">
        <div className="col mb-3 mt-2">
          <TextField
            required
            label="Nom d'utilisateur *"
            fullWidth
            sx={textFieldStyle}
            value={nom_user}
            onChange={(e) =>
              onChange({ ...validUser, nom_user: e.target.value })
            }
          />
        </div>
      </div>

      {/* Mot de passe */}
      <div className="row">
        <div className="col mb-3">
          <TextField
            label="Nouveau mot de passe (optionnel)"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            sx={textFieldStyle}
            value={password}
            onChange={(e) =>
              onChange({ ...validUser, password: e.target.value })
            }
            placeholder="Laisser vide pour conserver l'ancien"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
      </div>

      {/* Rôle */}
      <div className="row">
        <div className="col mb-3">
          <TextField
            select
            required
            label="Rôle *"
            fullWidth
            sx={textFieldStyle}
            value={role}
            onChange={(e) => onChange({ ...validUser, role: e.target.value })}
          >
            {roleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </div>
    </Modal>
  )
}

export default UserEdit
