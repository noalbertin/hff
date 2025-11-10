import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'
import './page-auth.css'
import { AuthWrapper } from './AuthWrapper'

export const RegisterPage = () => {
  const recaptchaRef = useRef(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    terms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation basique
    if (!formData.terms) {
      setError('You must agree to the terms and conditions')
      setLoading(false)
      return
    }

    // Récupérer le token reCAPTCHA
    const recaptchaToken = recaptchaRef.current.getValue()

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification')
      setLoading(false)
      return
    }

    try {
      // Envoyer au backend
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log('Registration successful:', data)
        // Redirection ou message de succès
        // window.location.href = '/dashboard'
      } else {
        setError(data.message || 'Registration failed')
        // Réinitialiser le captcha en cas d'erreur
        recaptchaRef.current.reset()
      }
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred. Please try again.')
      recaptchaRef.current.reset()
    } finally {
      setLoading(false)
    }
  }

  const handleRecaptchaChange = (token) => {
    console.log('reCAPTCHA token:', token)
    // Token disponible, vous pouvez effacer l'erreur si présente
    if (error && error.includes('reCAPTCHA')) {
      setError('')
    }
  }

  const handleRecaptchaExpired = () => {
    console.log('reCAPTCHA expired')
    setError('reCAPTCHA expired. Please verify again.')
  }

  const handleRecaptchaError = () => {
    console.log('reCAPTCHA error')
    setError('reCAPTCHA error. Please try again.')
  }

  return (
    <AuthWrapper>
      <h4 className="mb-2">Adventure starts here 🚀</h4>
      <p className="mb-4">Make your app management easy and fun!</p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={formData.username}
            onChange={handleChange}
            name="username"
            placeholder="Enter your username"
            required
            autoFocus
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="mb-3 form-password-toggle">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <div className="input-group input-group-merge">
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              name="password"
              placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
              aria-describedby="password"
              required
            />
            <span className="input-group-text cursor-pointer">
              <i className="bx bx-hide"></i>
            </span>
          </div>
        </div>

        <div className="mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="terms-conditions"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              required
            />
            <label className="form-check-label" htmlFor="terms-conditions">
              I agree to
              <a aria-label="privacy policy and terms" href="#">
                {' '}
                privacy policy & terms
              </a>
            </label>
          </div>
        </div>

        {/* reCAPTCHA v2 */}
        <div className="mb-3">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey="VOTRE_SITE_KEY_V2_ICI"
            onChange={handleRecaptchaChange}
            onExpired={handleRecaptchaExpired}
            onErrored={handleRecaptchaError}
            theme="light"
            size="normal"
          />
        </div>

        <button
          aria-label="Click me"
          className="btn btn-primary d-grid w-100"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign up'}
        </button>
      </form>

      <p className="text-center">
        <span>Already have an account?</span>
        <Link
          aria-label="Go to Login Page"
          to="/auth/login"
          className="d-flex align-items-center justify-content-center"
        >
          <i className="bx bx-chevron-left scaleX-n1-rtl bx-sm"></i>
          Back to login
        </Link>
      </p>
    </AuthWrapper>
  )
}
