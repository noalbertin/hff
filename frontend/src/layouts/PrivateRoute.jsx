import { Navigate } from 'react-router-dom'
import { useAuthStore, selectIsLoggedIn } from '../store/auth'

const PrivateRoute = ({ children }) => {
  const isLoggedIn = useAuthStore(selectIsLoggedIn)

  return isLoggedIn ? <>{children}</> : <Navigate to="/auth/login" />
}

export default PrivateRoute
