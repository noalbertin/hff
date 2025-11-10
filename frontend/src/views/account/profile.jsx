import { useState, useEffect } from 'react'
import { AccountWrapper } from '../../components/wrapper/AccountWrapper'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Layout from '../../layouts/Layout'
import { useAuthStore, selectUser } from '../../store/auth'
import { updateProfile, getCurrentUser } from '../../utils/auth'

export const Profile = () => {
  // Utilisation du sélecteur
  const user = useAuthStore(selectUser)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')

  useEffect(() => {
    const fetchUserData = async () => {
      setFetchingData(true)
      const { data, error } = await getCurrentUser()

      if (error) {
        setError(error)
        showSnackbar('Erreur lors du chargement des données', 'error')
      } else if (data) {
        setFormData({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
          username: data.nom_user || data.username || '',
        })
      }
      setFetchingData(false)
    }

    fetchUserData()
  }, [])

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setOpenSnackbar(true)
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const dataToUpdate = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      username: formData.username,
    }

    try {
      const { data, error } = await updateProfile(dataToUpdate)

      if (error) {
        const errorMessage =
          typeof error === 'string'
            ? error
            : error.detail || 'Échec de la mise à jour du profil'
        setError(errorMessage)
        showSnackbar(errorMessage, 'error')
      } else {
        setSuccess('Profil mis à jour avec succès!')
        showSnackbar('Profil mis à jour avec succès!', 'success')

        // Mettre à jour le formData avec les données retournées
        if (data) {
          setFormData({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || '',
            username: data.nom_user || data.username || '',
          })
        }
      }
    } catch (err) {
      const errorMessage = 'Une erreur est survenue lors de la mise à jour'
      setError(errorMessage)
      showSnackbar(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingData) {
    return (
      <Layout user={user}>
        <AccountWrapper title="Account">
          <div
            className="card mb-4"
            style={{ textAlign: 'center', padding: '40px' }}
          >
            <CircularProgress />
            <p style={{ marginTop: '16px' }}>Chargement des données...</p>
          </div>
        </AccountWrapper>
      </Layout>
    )
  }

  return (
    <Layout user={user}>
      <AccountWrapper title="Account">
        <div className="card mb-4">
          <h5 className="card-header">Profile Details</h5>
          <div className="card-body">
            <div className="d-flex align-items-start align-items-sm-center gap-4">
              <img
                src="../assets/img/avatars/1.png"
                alt="user-avatar"
                className="d-block rounded"
                height="100"
                width="100"
                aria-label="Account image"
                id="uploadedAvatar"
              />
              <div className="button-wrapper">
                <label
                  htmlFor="upload"
                  className="btn btn-primary me-2 mb-4"
                  tabIndex="0"
                >
                  <span className="d-none d-sm-block">Upload new photo</span>
                  <i className="bx bx-upload d-block d-sm-none"></i>
                  <input
                    type="file"
                    id="upload"
                    className="account-file-input"
                    hidden
                    accept="image/png, image/jpeg"
                  />
                </label>
                <p className="text-muted mb-0">
                  Allowed JPG, GIF or PNG. Max size of 800K
                </p>
              </div>
            </div>
          </div>
          <hr className="my-0" />
          <div className="card-body">
            <form
              id="formAccountSettings"
              method="POST"
              onSubmit={handleSubmit}
            >
              <div className="row">
                <div className="mb-3 col-md-6">
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
                <div className="mb-3 col-md-6">
                  <label htmlFor="lastName" className="form-label">
                    Last Name
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3 col-md-6">
                  <label htmlFor="email" className="form-label">
                    E-mail
                  </label>
                  <input
                    className="form-control"
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="mb-3 col-md-6">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="username"
                  />
                </div>
              </div>
              <div className="mt-2">
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: '#1C252E',
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    '&:hover': { bgcolor: '#454F5B' },
                    marginRight: 2,
                  }}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Sauvegarde...' : 'Save changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </AccountWrapper>
    </Layout>
  )
}

export default Profile
