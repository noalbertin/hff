import { Box, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useAuthStore, selectUser } from '../../store/auth'

const Breadcrumb = ({
  mainText,
  subText,
  onCreate,
  showCreateButton = true,
}) => {
  const { role: userRole } = useAuthStore(selectUser) // ✅ Récupérer le rôle
  const isAdmin = userRole === 'admin' // ✅ Vérifier si admin

  return (
    <Box className="d-flex flex-row justify-content-between align-items-start align-items-md-center mb-3">
      <Box className="d-flex flex-column justify-content-center">
        <h4 className="py-3 mb-0">
          <span className="text-muted fw-light">{subText} ・</span> {mainText}
        </h4>
      </Box>
      {/* ✅ Afficher le bouton uniquement si admin ET showCreateButton est true */}
      {showCreateButton && isAdmin && (
        <Box className="d-flex align-content-center flex-wrap gap-2">
          <Button
            variant="contained"
            type="submit"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: '#1C252E',
              textTransform: 'none',
              fontSize: '0.875rem',
              borderRadius: '8px',
              fontWeight: '700',
              '&:hover': { bgcolor: '#454F5B' },
            }}
            onClick={onCreate}
          >
            Créer
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Breadcrumb
