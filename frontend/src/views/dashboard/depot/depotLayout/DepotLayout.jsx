import { Outlet, useParams } from 'react-router-dom'
import {
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material'
import { useAuthStore, selectUser } from '../../../../store/auth'
import WarehouseIcon from '@mui/icons-material/Warehouse'
import PersonIcon from '@mui/icons-material/Person'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PhoneIcon from '@mui/icons-material/Phone'
import EditIcon from '@mui/icons-material/Edit'
import DepotNav from '../depotNav/DepotNav'
import { useState, useEffect } from 'react'
import api from '../../../../utils/axios'
import DepotEdit from './DepotLayoutEdit'

const DepotLayout = ({ user }) => {
  const { depotId } = useParams()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { role: userRole, id_user: currentUserId } = useAuthStore(selectUser)

  // États
  const [depot, setDepot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openModal, setOpenModal] = useState(false)

  // Couleurs par dépôt (basées sur l'ID)
  const getDepotColors = (id) => {
    const colors = {
      1: {
        couleur: '#1d4ed8',
        gradient: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)',
      },
      2: {
        couleur: '#0369a1',
        gradient: 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)',
      },
      3: {
        couleur: '#0d9488',
        gradient: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
      },
    }
    return colors[id] || colors[1]
  }

  // Récupérer les données du dépôt
  useEffect(() => {
    const fetchDepot = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/depots/${depotId}`)
        setDepot(response.data)
        setError(null)
      } catch (err) {
        console.error('Erreur lors du chargement du dépôt:', err)
        setError('Impossible de charger les informations du dépôt')
      } finally {
        setLoading(false)
      }
    }

    fetchDepot()
  }, [depotId])

  // Ouvrir le modal
  const handleOpenModal = () => {
    setOpenModal(true)
  }

  // Fermer le modal
  const handleCloseModal = () => {
    setOpenModal(false)
  }

  // Mettre à jour le dépôt après modification
  const handleUpdateDepot = (updatedDepot) => {
    setDepot(updatedDepot)
  }

  // Affichage pendant le chargement
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Affichage en cas d'erreur
  if (error || !depot) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Dépôt introuvable'}</Alert>
      </Box>
    )
  }

  const colors = getDepotColors(depot.id)

  return (
    <>
      {/* En-tête du dépôt avec design moderne */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          m: 0,
          gap: 3,
          mb: 3,
          p: 3,
          background: colors.gradient,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
          color: 'white',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Icône avec effet glass */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.15)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <WarehouseIcon sx={{ fontSize: 36 }} />
        </Box>

        {/* Contenu de l'en-tête */}
        <Box sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
          {/* Titre et bouton modifier */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2,
              flexWrap: isMobile ? 'wrap' : 'nowrap',
            }}
          >
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              fontWeight="700"
              sx={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                color: 'white',
                flexGrow: 1,
              }}
            >
              {depot.nom}
            </Typography>

            {userRole === 'admin' && (
              // Bouton modifier (admin seulement)
              <IconButton
                onClick={handleOpenModal}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>

          {/* Informations du dépôt */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr'
                : 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 2,
              alignItems: 'center',
            }}
          >
            {/* Responsable */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(5px)',
              }}
            >
              <PersonIcon sx={{ fontSize: 20, opacity: 0.9 }} />
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                    fontSize: '11px',
                    display: 'block',
                  }}
                >
                  Responsable
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  sx={{ fontSize: '13px' }}
                >
                  {depot.responsable || 'Non renseigné'}
                </Typography>
              </Box>
            </Box>

            {/* Adresse */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(5px)',
              }}
            >
              <LocationOnIcon sx={{ fontSize: 20, opacity: 0.9 }} />
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                    fontSize: '11px',
                    display: 'block',
                  }}
                >
                  Adresse
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  sx={{ fontSize: '13px' }}
                >
                  {depot.adresse || 'Non renseignée'}
                </Typography>
              </Box>
            </Box>

            {/* Contact */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(5px)',
              }}
            >
              <PhoneIcon sx={{ fontSize: 20, opacity: 0.9 }} />
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                    fontSize: '11px',
                    display: 'block',
                  }}
                >
                  Contact
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  sx={{ fontSize: '13px' }}
                >
                  {depot.contact || 'Non renseigné'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Navigation entre les onglets */}
      <DepotNav depotId={depotId} />

      {/* Contenu */}
      <Outlet context={{ depotId, depot, user }} />

      {/* Modal de modification séparé */}
      <DepotEdit
        isOpen={openModal}
        depot={depot}
        onSave={handleUpdateDepot}
        onClose={handleCloseModal}
      />
    </>
  )
}

export default DepotLayout
