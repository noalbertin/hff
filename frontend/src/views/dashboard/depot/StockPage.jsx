import React from 'react'
import { useOutletContext } from 'react-router-dom'
import { Box, Typography } from '@mui/material'

const StockPage = () => {
  const { depotId, depot } = useOutletContext()

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Stock du {depot.nom}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Ici vous afficherez le stock spécifique au dépôt {depotId}
      </Typography>
      {/* Votre composant de tableau de stock ici */}
    </Box>
  )
}

export default StockPage