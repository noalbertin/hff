
import { Outlet, useParams } from 'react-router-dom'
import { Typography, Box, Chip, Breadcrumbs, useTheme, useMediaQuery } from '@mui/material'
import WarehouseIcon from '@mui/icons-material/Warehouse'
import PersonIcon from '@mui/icons-material/Person'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PhoneIcon from '@mui/icons-material/Phone'
import DepotNav from './DepotNav'

const DepotLayout = ({ user }) => {
  const { depotId } = useParams()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  // Données des dépôts
const depotsData = {
  1: { 
    nom: 'Dépôt Principal', 
    responsable: 'Sylvano', 
    adresse: 'Zone Industrielle A',
    telephone: '+261 34 12 345 67',
    couleur: '#1d4ed8',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)'
  },
  2: { 
    nom: 'Dépôt Secondaire', 
    responsable: 'Rakoto', 
    adresse: 'Route Nationale 1',
    telephone: '+261 34 23 456 78',
    couleur: '#0369a1',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)'
  },
  3: { 
    nom: 'Dépôt Tertiaire', 
    responsable: 'Rabe', 
    adresse: 'Avenue du Commerce',
    telephone: '+261 34 34 567 89',
    couleur: '#0d9488',
    gradient: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)'
  },
}

  const depot = depotsData[depotId]

  if (!depot) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Dépôt introuvable
        </Typography>
      </Box>
    )
  }

  return (
    <>
      {/* En-tête du dépôt avec design moderne */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        m: 0,
        gap: 3, 
        mb: 3,
        p: 3,
        background: depot.gradient,
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
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}>
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
          {/* Titre et badges */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 2,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            
          }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              fontWeight="700"
              sx={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', color: 'white', }}
              
            >
              {depot.nom}
            </Typography>
          </Box>
          
          {/* Informations du dépôt */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 2,
            alignItems: 'center'
          }}>
            {/* Responsable */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(5px)',
            }}>
              <PersonIcon sx={{ fontSize: 20, opacity: 0.9 }} />
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    opacity: 0.8,
                    fontSize: '11px',
                    display: 'block'
                  }}
                >
                  Responsable
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="600"
                  sx={{ fontSize: '13px' }}
                >
                  {depot.responsable}
                </Typography>
              </Box>
            </Box>
            
            {/* Adresse */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(5px)',
            }}>
              <LocationOnIcon sx={{ fontSize: 20, opacity: 0.9 }} />
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    opacity: 0.8,
                    fontSize: '11px',
                    display: 'block'
                  }}
                >
                  Adresse
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="600"
                  sx={{ fontSize: '13px' }}
                >
                  {depot.adresse}
                </Typography>
              </Box>
            </Box>
            
            {/* Contact */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(5px)',
            }}>
              <PhoneIcon sx={{ fontSize: 20, opacity: 0.9 }} />
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    opacity: 0.8,
                    fontSize: '11px',
                    display: 'block'
                  }}
                >
                  Contact
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="600"
                  sx={{ fontSize: '13px' }}
                >
                  {depot.telephone}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Navigation entre les onglets */}
      <DepotNav depotId={depotId} />

      {/* Contenu de la page avec design glassmorphism */}
      <Box sx={{ 
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        minHeight: '400px',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }
      }}>
        {/* Contenu avec z-index pour être au-dessus du fond */}
        <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
          <Outlet context={{ depotId, depot, user }} />
        </Box>
      </Box>
    </>
  )
}

export default DepotLayout