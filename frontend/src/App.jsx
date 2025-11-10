import { useEffect } from 'react'
import MainWrapper from './layouts/MainWrapper'
import { useLocation } from 'react-router-dom'
import AppRoutes from './router/AppRoutes'
import { Blank } from './layouts/Blank'
import { useAuthStore, selectUser, selectIsLoggedIn } from './store/auth'
import { checkAndRefreshToken } from './utils/auth'

function App() {
  const location = useLocation()
  const isAuthPath =
    location.pathname.includes('auth') ||
    location.pathname.includes('error') ||
    location.pathname.includes('under-maintenance') ||
    location.pathname.includes('blank')

  // Utilisation des sélecteurs
  const user = useAuthStore(selectUser)
  const isLoggedIn = useAuthStore(selectIsLoggedIn)

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAndRefreshToken()
    }

    initializeAuth()
  }, [isAuthPath])

  return (
    <MainWrapper>
      {isAuthPath ? (
        <AppRoutes user={user} isLoggedIn={isLoggedIn}>
          <Blank />
        </AppRoutes>
      ) : (
        <AppRoutes user={user} isLoggedIn={isLoggedIn} />
      )}
    </MainWrapper>
  )
}

export default App
