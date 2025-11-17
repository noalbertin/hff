import { useState, useEffect } from 'react'
import { TextField, Alert } from '@mui/material'
import Modal from '../../../../components/ui/Modal'
import api from '../../../../utils/axios'
import { refreshSidebarDepots } from '../../../../layouts/Sidebar'

const DepotLayoutEdit = ({ isOpen, depot, onSave, onClose }) => {
  // Fallback si `depot` est null/undefined
  const validDepot = depot || {}

  // État local pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    responsable: '',
    adresse: '',
    contact: '',
  })

  // États pour le chargement et les erreurs
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // État local pour valider le formulaire
  const [isFormValid, setIsFormValid] = useState(true)

  // Initialiser le formulaire quand le dépôt change
  useEffect(() => {
    if (validDepot) {
      setFormData({
        nom: validDepot.nom || '',
        responsable: validDepot.responsable || '',
        adresse: validDepot.adresse || '',
        contact: validDepot.contact || '',
      })
    }
  }, [validDepot])

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nom: validDepot.nom || '',
      responsable: validDepot.responsable || '',
      adresse: validDepot.adresse || '',
      contact: validDepot.contact || '',
    })
    setError(null)
    setSuccess(false)
  }

  // Vérifie si tous les champs requis sont remplis correctement
  const checkFormValidity = () => {
    const { nom = '' } = formData
    const isValid = nom.trim() !== ''
    setIsFormValid(isValid)
  }

  // Chaque fois que le formulaire change, on vérifie la validité
  useEffect(() => {
    checkFormValidity()
  }, [formData])

  // Gérer les changements dans les champs
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Soumettre la modification
  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await api.put(`/depots/${validDepot.id}`, formData)
      setSuccess(true)

      console.log('✅ Dépôt modifié avec succès')

      // ⭐ RAFRAÎCHIR LE SIDEBAR IMMÉDIATEMENT
      refreshSidebarDepots()

      // Appeler le callback onSave avec les données mises à jour
      if (onSave) {
        onSave(response.data)
      }

      // Fermer le modal après un court délai pour voir le message de succès
      setTimeout(() => {
        onClose()
      }, 300)
    } catch (err) {
      console.error('❌ Erreur lors de la modification:', err)
      setError(
        err.response?.data?.error || 'Erreur lors de la modification du dépôt'
      )
    } finally {
      setLoading(false)
    }
  }

  // Destructuration pour faciliter l'accès aux champs
  const { nom = '', responsable = '', adresse = '', contact = '' } = formData

  return (
    <Modal
      title="Modifier le dépôt"
      btnLabel={loading ? 'Enregistrement...' : 'Enregistrer'}
      isOpen={isOpen}
      onSave={handleSave}
      onClose={onClose}
      isFormValid={isFormValid && !loading}
      resetForm={resetForm}
    >
      {/* Message de succès */}
      {success && (
        <div className="row">
          <div className="col mb-3">
            <Alert severity="success">
              Le dépôt a été modifié avec succès !
            </Alert>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="row">
          <div className="col mb-3">
            <Alert severity="error">{error}</Alert>
          </div>
        </div>
      )}

      {/* Champ Nom du dépôt */}
      <div className="row">
        <div className="col mb-3 mt-2">
          <TextField
            label="Nom du dépôt"
            fullWidth
            required
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
            value={nom}
            onChange={(e) => handleChange('nom', e.target.value)}
            disabled={loading}
            error={!nom.trim() && nom !== ''}
            helperText={!nom.trim() && nom !== '' ? 'Le nom est requis' : ''}
          />
        </div>
      </div>

      {/* Champs Responsable et Contact sur la même ligne */}
      <div className="row">
        <div className="col-md-6 mb-3 mt-2">
          <TextField
            label="Responsable"
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
            value={responsable}
            onChange={(e) => handleChange('responsable', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="col-md-6 mb-3 mt-2">
          <TextField
            label="Contact"
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
            value={contact}
            onChange={(e) => handleChange('contact', e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Champ Adresse */}
      <div className="row">
        <div className="col mb-3 mt-2">
          <TextField
            label="Adresse"
            fullWidth
            multiline
            rows={3}
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
            value={adresse}
            onChange={(e) => handleChange('adresse', e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
    </Modal>
  )
}

export default DepotLayoutEdit
