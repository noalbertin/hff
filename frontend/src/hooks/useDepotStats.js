// hooks/useDepotStats.js
import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { useDepotContext } from '../contexts/DepotContext'

export const useDepotStats = (depotId) => {
  const { refreshTrigger } = useDepotContext()
  const [stockCount, setStockCount] = useState(0)
  const [quantiteTotal, setQuantiteTotal] = useState(0)
  const [mouvementsCount, setMouvementsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!depotId) return

      try {
        setLoading(true)
        setError(null)

        // Récupérer les données des endpoints existants
        const [stockResponse, mouvementsResponse] = await Promise.all([
          api.get(`/stocks/depot/${depotId}`),
          api.get(`/mouvements/depot/${depotId}/mouvements-24h`),
        ])

        // Traitement des données de stock
        const stocks = stockResponse.data || []
        const stockTotal = stocks.length
        const quantiteTotale = stocks.reduce((total, stock) => {
          return total + (parseInt(stock.quantite) || 0)
        }, 0)

        // Traitement des mouvements (déjà filtrés sur 24h par l'API)
        const mouvements24h = mouvementsResponse.data || []

        setStockCount(stockTotal)
        setQuantiteTotal(quantiteTotale)
        setMouvementsCount(mouvements24h.length)
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error)
        setError('Erreur de chargement des statistiques')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Rafraîchir les données toutes les 2 minutes
    const interval = setInterval(fetchStats, 120000)
    return () => clearInterval(interval)
  }, [depotId, refreshTrigger])

  return {
    stockCount,
    quantiteTotal,
    mouvementsCount,
    loading,
    error,
  }
}
