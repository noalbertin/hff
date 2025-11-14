import { useState, useEffect } from 'react'
import { TextField, Alert, Chip } from '@mui/material'
import Modal from '../../../../components/ui/Modal'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import dayjs from 'dayjs'

const MouvementEdit = ({ isOpen, mouvement, onChange, onSave, onClose }) => {
  const validMouvement = mouvement || {}
  const [isFormValid, setIsFormValid] = useState(true)

  // Vérifier la validité du formulaire
  useEffect(() => {
    // Pour l'édition, on accepte même si les champs sont vides
    setIsFormValid(true)
  }, [validMouvement])

  // Réinitialiser le formulaire
  const resetForm = () => {
    // Ne rien faire car on ne peut pas réinitialiser un mouvement existant
  }

  const {
    id = '',
    designation = '',
    num_parc = '',
    parc_colas = '',
    depot_nom = '',
    depot_destination_nom = '',
    type_mouvement = '',
    quantite = 0,
    reference_document = '',
    commentaire = '',
    utilisateur = '',
    created_at = '',
  } = validMouvement

  // Déterminer si c'est un transfert
  const isTransfert = type_mouvement === 'SORTIE' && depot_destination_nom
  const isEntree = type_mouvement === 'ENTREE'

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
      title="Modifier un Mouvement"
      btnLabel="Sauvegarder"
      isOpen={isOpen}
      onSave={() => onSave(validMouvement)}
      onClose={onClose}
      isFormValid={isFormValid}
      resetForm={resetForm}
      maxWidth="700px"
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        Seuls les champs <strong>référence</strong>,{' '}
        <strong>commentaire</strong> et <strong>utilisateur</strong> peuvent
        être modifiés pour préserver l'intégrité du stock.
      </Alert>

      {/* Informations en lecture seule */}
      <div className="row">
        <div className="col-md-6 mb-3 mt-2">
          <TextField
            fullWidth
            label="Date"
            value={dayjs(created_at).format('DD/MM/YYYY HH:mm')}
            disabled
            sx={textFieldStyle}
          />
        </div>
        <div className="col-md-6 mb-3 mt-2">
          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                fontSize: '0.85rem',
                fontWeight: 'bold',
                color: '#637381',
              }}
            >
              Type de mouvement
            </label>
          </div>
          <Chip
            icon={
              isTransfert ? (
                <SwapHorizIcon />
              ) : isEntree ? (
                <ArrowDownwardIcon />
              ) : (
                <ArrowUpwardIcon />
              )
            }
            label={isTransfert ? 'Transfert' : type_mouvement}
            color={isEntree ? 'success' : 'error'}
            size="medium"
            sx={{ fontWeight: 600, fontSize: '0.9rem', height: 40 }}
          />
        </div>
      </div>

      {/* Matériel */}
      <div className="row">
        <div className="col mb-3">
          <TextField
            fullWidth
            label="Matériel"
            value={`${designation} - N°Parc: ${num_parc} (${parc_colas})`}
            disabled
            sx={textFieldStyle}
          />
        </div>
      </div>

      {/* Quantité */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <TextField
            fullWidth
            type="number"
            label="Quantité"
            value={quantite}
            disabled
            sx={textFieldStyle}
          />
        </div>
        <div className="col-md-6 mb-3">
          <TextField
            fullWidth
            label="Référence document"
            name="reference_document"
            value={reference_document}
            onChange={(e) =>
              onChange({
                ...validMouvement,
                reference_document: e.target.value,
              })
            }
            sx={textFieldStyle}
            placeholder="BL-2024-001"
          />
        </div>
      </div>

      {/* Utilisateur (modifiable) */}
      <div className="row">
        <div className="col mb-3">
          <TextField
            fullWidth
            label="Utilisateur"
            name="utilisateur"
            value={utilisateur}
            onChange={(e) =>
              onChange({ ...validMouvement, utilisateur: e.target.value })
            }
            sx={textFieldStyle}
          />
        </div>
      </div>

      {/* Commentaire (modifiable) */}
      <div className="row">
        <div className="col mb-3">
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Commentaire"
            name="commentaire"
            value={commentaire}
            onChange={(e) =>
              onChange({ ...validMouvement, commentaire: e.target.value })
            }
            sx={textFieldStyle}
            placeholder="Ajouter un commentaire..."
          />
        </div>
      </div>
    </Modal>
  )
}

export default MouvementEdit
