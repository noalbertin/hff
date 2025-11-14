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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontSize: '0.875rem',
              borderRadius: '8px',
              fontWeight: '700',
              padding: '8px 16px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              transition: 'all 0.2s ease-in-out',
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
