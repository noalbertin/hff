import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { Box, Tab, Tabs, useMediaQuery, useTheme, Chip } from '@mui/material'
import InventoryIcon from '@mui/icons-material/Inventory'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'

const DepotNav = ({ depotId }) => {
  const { '*': currentPath } = useParams()
  const currentTab = currentPath ? currentPath.split('/')[0] : 'stock'
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Données avec badges (vous pouvez les récupérer depuis votre API)
  const tabs = [
    { 
      label: 'Stock Actuel', 
      value: 'stock', 
      icon: <InventoryIcon />,
      path: `/depot/${depotId}/stock`,
      badge: 45 // Total articles
    },
    { 
      label: 'Mouvements', 
      value: 'mouvements', 
      icon: <SwapHorizIcon />,
      path: `/depot/${depotId}/mouvements`,
      badge: 12 // Mouvements aujourd'hui
    },
    { 
      label: 'Commandes', 
      value: 'commandes', 
      icon: <ShoppingCartIcon />,
      path: `/depot/${depotId}/commandes`,
      badge: 3 // Commandes en attente
    },
    { 
      label: 'Transferts', 
      value: 'transferts', 
      icon: <LocalShippingIcon />,
      path: `/depot/${depotId}/transferts`,
      badge: 1 // Transferts en cours
    },
  ]

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        px: { xs: 1, sm: 3 },
        pt: 2,
        pb: 1,
        mx: { xs: 1, sm: 2 },
        mb: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
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
      }}
    >
      <Tabs 
        value={currentTab}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons="auto"
        centered={!isMobile}
        indicatorColor="secondary"
        textColor="inherit"
        sx={{
          minHeight: 56,
          position: 'relative',
          zIndex: 1,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: 3,
            backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(255, 255, 255, 0.3)',
          },
          '& .MuiTabs-flexContainer': {
            gap: { xs: 1, sm: 2 },
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            icon={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {tab.icon}
                {tab.badge && (
                  <Chip
                    label={tab.badge}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: currentTab === tab.value ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
                      color: currentTab === tab.value ? '#667eea' : 'white',
                      minWidth: 24,
                      '& .MuiChip-label': {
                        px: 1,
                      },
                    }}
                  />
                )}
              </Box>
            }
            label={isMobile ? tab.label.split(' ')[0] : tab.label}
            value={tab.value}
            component={NavLink}
            to={tab.path}
            sx={{
              minHeight: 48,
              minWidth: { xs: 'auto', sm: 120 },
              py: { xs: 1, sm: 1.5 },
              px: { xs: 1.5, sm: 3 },
              borderRadius: 2,
              textTransform: 'none',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: currentTab === tab.value ? 700 : 500,
              color: currentTab === tab.value ? '#fff' : 'rgba(255, 255, 255, 0.8)',
              backgroundColor: currentTab === tab.value ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)',
              },
              '&.Mui-selected': {
                color: '#fff',
                fontWeight: 700,
              },
              '& .MuiTab-iconWrapper': {
                marginRight: 1,
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  )
}

export default DepotNav