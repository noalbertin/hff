import { useState, useEffect } from 'react'
import {
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { login } from '../../utils/auth'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, selectIsLoggedIn } from '../../store/auth'
import { AuthWrapper } from '../authentication/AuthWrapper'

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isLoggedIn = useAuthStore(selectIsLoggedIn)

  // Vérifier si tous les champs sont remplis
  const isFormValid = username.trim() !== '' && password.trim() !== ''

  // Redirection si déjà connecté
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/')
    }
  }, [isLoggedIn, navigate])

  const resetForm = () => {
    setUsername('')
    setPassword('')
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!isFormValid) {
      setError('Veuillez remplir tous les champs')
      setOpen(true)
      return
    }

    setLoading(true)
    const { error: loginError } = await login(username, password)
    setLoading(false)

    if (loginError) {
      setError(loginError)
      setOpen(true)
    } else {
      navigate('/')
      resetForm()
    }
  }

  // Styles communs pour les champs
  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      '&:hover fieldset': {
        borderColor: '#1C252E',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1C252E',
      },
    },
    '& .MuiInputLabel-root': {
      '&.Mui-focused': {
        fontWeight: 'bold',
        color: '#1C252E',
      },
    },
  }

  return (
    <AuthWrapper>
      <p className="mb-4">
        Veuillez vous connecter à votre compte et commencer l'aventure
      </p>
      <form onSubmit={handleLogin} className="mb-3">
        <div className="mb-3">
          <TextField
            label="Nom d'utilisateur"
            id="username"
            autoFocus
            fullWidth
            required
            sx={inputStyles}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-3 mt-4">
          <FormControl fullWidth sx={inputStyles}>
            <InputLabel htmlFor="password">Mot de passe</InputLabel>
            <OutlinedInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="6+ caractères"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Mot de passe"
            />
          </FormControl>
        </div>

        <div className="mb-3 mt-4">
          <Button
            variant="contained"
            type="submit"
            sx={{
              bgcolor: '#1C252E',
              textTransform: 'none',
              fontSize: '1rem',
              borderRadius: '8px',
              fontWeight: '800',
              '&:hover': { bgcolor: '#454F5B' },
              '&.Mui-disabled': {
                bgcolor: '#E0E0E0',
                color: '#9E9E9E',
              },
            }}
            fullWidth
            disabled={loading || !isFormValid}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? '' : 'Se connecter'}
          </Button>
        </div>
      </form>
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <p style={{ color: '#637381', fontSize: '0.875rem' }}>
          Vous n'avez pas encore de compte ?{' '}
          <Link
            to="/auth/register"
            style={{
              color: '#1C252E',
              fontWeight: '700',
              textDecoration: 'none',
            }}
          >
            S'inscrire
          </Link>
        </p>
      </div>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </AuthWrapper>
  )
}

export default Login
