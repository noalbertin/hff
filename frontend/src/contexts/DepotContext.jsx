// contexts/DepotContext.jsx
import { createContext, useContext, useState } from 'react'

const DepotContext = createContext()

export const DepotProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <DepotContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </DepotContext.Provider>
  )
}

export const useDepotContext = () => {
  const context = useContext(DepotContext)
  if (!context) {
    throw new Error('useDepotContext must be used within DepotProvider')
  }
  return context
}
