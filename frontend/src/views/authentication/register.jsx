import { useEffect, useState, useRef } from 'react'
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
import ReCAPTCHA from 'react-google-recaptcha'
import { register } from '../../utils/auth'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, selectIsLoggedIn } from '../../store/auth'
import { AuthWrapper } from '../authentication/AuthWrapper'

function Register() {
  const recaptchaRef = useRef(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState(null)

  const isLoggedIn = useAuthStore(selectIsLoggedIn)
  const navigate = useNavigate()

  // Vérifier si tous les champs sont remplis et les mots de passe correspondent
  const passwordsMatch = password === password2
  const isFormValid =
    username.trim() !== '' &&
    password.trim() !== '' &&
    password2.trim() !== '' &&
    passwordsMatch &&
    recaptchaToken !== null // Ajout de la validation reCAPTCHA

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/')
    }
  }, [isLoggedIn, navigate])

  const resetForm = () => {
    setUsername('')
    setPassword('')
    setPassword2('')
    setRecaptchaToken(null)
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token)
    console.log('reCAPTCHA token:', token)
  }

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null)
    setError('Le reCAPTCHA a expiré. Veuillez réessayer.')
    setOpen(true)
  }

  const handleRecaptchaError = () => {
    setRecaptchaToken(null)
    setError('Erreur reCAPTCHA. Veuillez réessayer.')
    setOpen(true)
  }

  // Dans votre composant Register, modifiez l'appel à register
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation côté client
    if (!username.trim() || !password.trim() || !password2.trim()) {
      setError('Veuillez remplir tous les champs')
      setOpen(true)
      return
    }

    if (password !== password2) {
      setError('Les mots de passe ne correspondent pas')
      setOpen(true)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setOpen(true)
      return
    }

    // Vérifier le reCAPTCHA
    if (!recaptchaToken) {
      setError('Veuillez compléter la vérification reCAPTCHA')
      setOpen(true)
      return
    }

    setLoading(true)
    const { error: registerError } = await register(
      username,
      password,
      password2,
      recaptchaToken // Passer le token
    )
    setLoading(false)

    if (registerError) {
      // Gestion des erreurs du backend
      const errorMessage =
        typeof registerError === 'string'
          ? registerError
          : registerError.error || JSON.stringify(registerError)
      setError(errorMessage)
      setOpen(true)
      // Réinitialiser le reCAPTCHA en cas d'erreur
      if (recaptchaRef.current) {
        recaptchaRef.current.reset()
        setRecaptchaToken(null)
      }
    } else {
      navigate('/')
      resetForm()
    }
  }

  // Afficher l'erreur de correspondance uniquement si l'utilisateur a commencé à taper
  const showPasswordMismatch = password2 !== '' && !passwordsMatch

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
      <p className="mb-4">Créez votre compte et commencez l'aventure</p>
      <form onSubmit={handleSubmit} className="mb-3">
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
          <FormControl fullWidth error={showPasswordMismatch} sx={inputStyles}>
            <InputLabel htmlFor="password2">
              Confirmer le mot de passe
            </InputLabel>
            <OutlinedInput
              id="password2"
              type={showPassword2 ? 'text' : 'password'}
              placeholder="Confirmer le mot de passe"
              required
              fullWidth
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword2(!showPassword2)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword2 ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Confirmer le mot de passe"
            />
          </FormControl>
          {showPasswordMismatch && (
            <p
              style={{
                color: '#d32f2f',
                fontSize: '0.75rem',
                marginTop: '4px',
              }}
            >
              Les mots de passe ne correspondent pas
            </p>
          )}
        </div>

        {/* reCAPTCHA v2 */}
        <div
          className="mb-3 mt-4"
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey="6Lcp9QYsAAAAAA12_YuqDOQO4m8LXxkmZd52oIuM"
            onChange={handleRecaptchaChange}
            onExpired={handleRecaptchaExpired}
            onErrored={handleRecaptchaError}
            theme="light"
            size="normal"
            hl="fr"
          />
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
            {loading ? '' : "S'inscrire"}
          </Button>
        </div>
      </form>
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <p style={{ color: '#637381', fontSize: '0.875rem' }}>
          Vous avez déjà un compte ?{' '}
          <Link
            to="/auth/login"
            style={{
              color: '#1C252E',
              fontWeight: '700',
              textDecoration: 'none',
            }}
          >
            Se connecter
          </Link>
        </p>
      </div>

      <Snackbar
        open={open}
        autoHideDuration={4000}
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

export default Register
