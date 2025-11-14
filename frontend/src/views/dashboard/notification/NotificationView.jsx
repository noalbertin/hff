import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import NotificationsIcon from '@mui/icons-material/Notifications'
import FilterListIcon from '@mui/icons-material/FilterList'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import FileTextIcon from '@mui/icons-material/Description'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import InfoIcon from '@mui/icons-material/Info'
import WarningIcon from '@mui/icons-material/Warning'
import ErrorIcon from '@mui/icons-material/Error'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import EventIcon from '@mui/icons-material/Event'
import EngineeringIcon from '@mui/icons-material/Engineering'
import api from '../../../utils/axios'
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog'
import { useAuthStore, selectUser } from '../../../store/auth'

const NotificationView = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [notifToDelete, setNotifToDelete] = useState(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const { role: userRole, id_user: currentUserId } = useAuthStore(selectUser)

  const [statistics, setStatistics] = useState({
    total: 0,
    urgent: 0,
    attention: 0,
    info: 0,
    documents: 0,
    maintenance_preventive: 0,
    maintenance_curative: 0,
    locations: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    lu: 'all',
    type: 'all',
    priorite: 'all',
  })

  useEffect(() => {
    fetchNotifications()
    fetchStatistics()
  }, [filters])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.lu !== 'all') params.append('lu', filters.lu === 'read')
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.priorite !== 'all')
        params.append('priorite', filters.priorite)

      const { data } = await api.get(`/notifications?${params.toString()}`)
      if (data.success) {
        setNotifications(data.data)
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const { data } = await api.get('/notifications/count')
      if (data.success) {
        setStatistics(data.data)
      }
    } catch (error) {
      console.error('Erreur statistiques:', error)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      fetchNotifications()
      fetchStatistics()
    } catch (error) {
      console.error('Erreur marquage:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      fetchNotifications()
      fetchStatistics()
      setSnackbarMessage('Toutes les notifications marquées comme lues')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur marquage global:', error)
      setSnackbarMessage('Erreur lors du marquage')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  const handleDelete = (notif) => {
    setNotifToDelete(notif)
    setOpenDialog(true)
  }

  const confirmDelete = async () => {
    try {
      await api.delete(`/notifications/${notifToDelete.id_notification}`)
      await fetchNotifications()
      await fetchStatistics()
      setOpenDialog(false)
      setSnackbarMessage('Notification supprimée avec succès')
      setSnackbarSeverity('success')
      setOpenSnackbar(true)
    } catch (error) {
      console.error('Erreur lors de la suppression :', error)
      setOpenDialog(false)
      setSnackbarMessage(
        error.response?.data?.error || 'Impossible de supprimer la notification'
      )
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  const getTypeIcon = (type) => {
    const icons = {
      document: <FileTextIcon sx={{ fontSize: 20 }} />,
      maintenance_preventive: <EventIcon sx={{ fontSize: 20 }} />,
      maintenance_curative: <EngineeringIcon sx={{ fontSize: 20 }} />,
      location: <AttachMoneyIcon sx={{ fontSize: 20 }} />,
    }
    return icons[type] || <InfoIcon sx={{ fontSize: 20 }} />
  }

  const getTypeColor = (type) => {
    const colors = {
      document: '#ef4444',
      maintenance_preventive: '#3b82f6',
      maintenance_curative: '#f59e0b',
      location: '#10b981',
    }
    return colors[type] || '#667eea'
  }

  const getTypeLabel = (type) => {
    const labels = {
      document: 'Document',
      maintenance_preventive: 'Préventive',
      maintenance_curative: 'Curative',
      location: 'Location',
    }
    return labels[type] || type
  }

  const getPriorityChip = (priorite) => {
    const styles = {
      Urgent: {
        bg: '#fee2e2',
        color: '#dc2626',
        border: '#fecaca',
        icon: <ErrorIcon sx={{ fontSize: 14 }} />,
      },
      Attention: {
        bg: '#fed7aa',
        color: '#c2410c',
        border: '#fdba74',
        icon: <WarningIcon sx={{ fontSize: 14 }} />,
      },
      Info: {
        bg: '#dbeafe',
        color: '#2563eb',
        border: '#bfdbfe',
        icon: <InfoIcon sx={{ fontSize: 14 }} />,
      },
    }
    const style = styles[priorite] || styles.Info

    return (
      <Chip
        icon={style.icon}
        label={priorite}
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: '11px',
          bgcolor: style.bg,
          color: style.color,
          border: `1px solid ${style.border}`,
          height: 26,
          '& .MuiChip-icon': { color: style.color },
        }}
      />
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const StatCard = ({ title, value, icon, color, bgColor }) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        background: bgColor,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: color,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.7rem',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, color: color, mt: 1 }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.5)',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#f5f7fa',
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    )
  }

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', pb: 4 }}>
      {/* En-tête avec effet dégradé */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          pt: 3,
          pb: 6,
          px: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <IconButton
              onClick={handleBack}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                  transform: 'translateX(-4px)',
                  transition: 'all 0.3s',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Rafraîchir">
                <IconButton
                  onClick={() => {
                    fetchNotifications()
                    fetchStatistics()
                  }}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              {statistics.total > 0 && (
                <Button
                  variant="contained"
                  startIcon={<DoneAllIcon />}
                  onClick={handleMarkAllAsRead}
                  sx={{
                    bgcolor: 'rgba(34, 197, 94, 0.9)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(34, 197, 94, 1)' },
                  }}
                >
                  Tout marquer lu
                </Button>
              )}
            </Box>
          </Box>

          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: '#fff', mb: 1 }}
          >
            <NotificationsIcon
              sx={{ fontSize: 36, mr: 2, verticalAlign: 'middle' }}
            />
            Notifications
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Gestion des alertes et notifications système
          </Typography>
        </Box>
      </Box>

      {/* Contenu principal */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, mt: 4 }}>
        {/* Statistiques */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total non lues"
              value={statistics.total}
              icon={
                <NotificationsIcon sx={{ fontSize: 32, color: '#2563eb' }} />
              }
              color="#2563eb"
              bgColor="#dbeafe"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Urgentes"
              value={statistics.urgent}
              icon={<ErrorIcon sx={{ fontSize: 32, color: '#dc2626' }} />}
              color="#dc2626"
              bgColor="#fee2e2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Attention"
              value={statistics.attention}
              icon={<WarningIcon sx={{ fontSize: 32, color: '#f59e0b' }} />}
              color="#f59e0b"
              bgColor="#fed7aa"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Informations"
              value={statistics.info}
              icon={<InfoIcon sx={{ fontSize: 32, color: '#10b981' }} />}
              color="#10b981"
              bgColor="#dcfce7"
            />
          </Grid>
        </Grid>

        {/* Statistiques par type */}
        {/* <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Documents"
              value={statistics.documents || 0}
              icon={
                <FileTextIcon sx={{ fontSize: 28, color: '#ef4444' }} />
              }
              color="#ef4444"
              bgColor="#fee2e2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="M. Préventive"
              value={statistics.maintenance_preventive || 0}
              icon={
                <EventIcon sx={{ fontSize: 28, color: '#3b82f6' }} />
              }
              color="#3b82f6"
              bgColor="#dbeafe"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="M. Curative"
              value={statistics.maintenance_curative || 0}
              icon={
                <EngineeringIcon sx={{ fontSize: 28, color: '#f59e0b' }} />
              }
              color="#f59e0b"
              bgColor="#fed7aa"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Locations"
              value={statistics.locations || 0}
              icon={
                <AttachMoneyIcon sx={{ fontSize: 28, color: '#10b981' }} />
              }
              color="#10b981"
              bgColor="#dcfce7"
            />
          </Grid>
        </Grid> */}

        {/* Filtres */}
        <Card
          elevation={0}
          sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterListIcon sx={{ color: '#64748b' }} />
                <Typography sx={{ fontWeight: 600, color: '#475569' }}>
                  Filtres:
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
                {/* Filtre Lu/Non Lu */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Statut
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['all', 'unread', 'read'].map((status) => (
                      <Chip
                        key={status}
                        label={
                          status === 'all'
                            ? 'Toutes'
                            : status === 'unread'
                            ? 'Non lues'
                            : 'Lues'
                        }
                        onClick={() => setFilters({ ...filters, lu: status })}
                        sx={{
                          bgcolor:
                            filters.lu === status ? '#667eea' : '#f1f5f9',
                          color: filters.lu === status ? '#fff' : '#475569',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor:
                              filters.lu === status ? '#5568d3' : '#e2e8f0',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Filtre Type */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Type
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[
                      'all',
                      'document',
                      'maintenance_preventive',
                      'maintenance_curative',
                      'location',
                    ].map((type) => (
                      <Chip
                        key={type}
                        label={type === 'all' ? 'Tous' : getTypeLabel(type)}
                        onClick={() => setFilters({ ...filters, type: type })}
                        sx={{
                          bgcolor:
                            filters.type === type ? '#667eea' : '#f1f5f9',
                          color: filters.type === type ? '#fff' : '#475569',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor:
                              filters.type === type ? '#5568d3' : '#e2e8f0',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Filtre Priorité */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Priorité
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['all', 'Urgent', 'Attention', 'Info'].map((prio) => (
                      <Chip
                        key={prio}
                        label={prio === 'all' ? 'Toutes' : prio}
                        onClick={() =>
                          setFilters({ ...filters, priorite: prio })
                        }
                        sx={{
                          bgcolor:
                            filters.priorite === prio ? '#667eea' : '#f1f5f9',
                          color: filters.priorite === prio ? '#fff' : '#475569',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor:
                              filters.priorite === prio ? '#5568d3' : '#e2e8f0',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              <Typography
                variant="body2"
                sx={{ color: '#64748b', fontWeight: 600 }}
              >
                {notifications.length} notification(s)
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Liste des notifications */}
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}
        >
          {notifications.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <NotificationsIcon
                sx={{ fontSize: 80, color: '#cbd5e1', mb: 2 }}
              />
              <Typography
                variant="h6"
                sx={{ color: '#64748b', fontWeight: 600 }}
              >
                Aucune notification
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
                Aucune notification ne correspond aux filtres sélectionnés
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell
                      sx={{ fontWeight: 700, color: '#475569', width: 60 }}
                    >
                      Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                      Titre
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                      Message
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                      Matériel
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, color: '#475569', width: 100 }}
                    >
                      Priorité
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, color: '#475569', width: 150 }}
                    >
                      Date
                    </TableCell>
                    {userRole === 'admin' && (
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: '#475569',
                          width: 120,
                          textAlign: 'center',
                        }}
                      >
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.map((notif) => (
                    <TableRow
                      key={notif.id_notification}
                      hover
                      sx={{
                        bgcolor: !notif.lu ? '#eff6ff' : 'transparent',
                        borderLeft: !notif.lu ? '4px solid #3b82f6' : 'none',
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: `${getTypeColor(notif.type)}15`,
                            color: getTypeColor(notif.type),
                          }}
                        >
                          {getTypeIcon(notif.type)}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: '#1e293b' }}
                        >
                          {notif.titre}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: '#64748b', display: 'block', mt: 0.5 }}
                        >
                          {getTypeLabel(notif.type)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: '#475569', maxWidth: 400 }}
                        >
                          {notif.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {notif.designation ? (
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: '#1e293b',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <DirectionsCarIcon
                                sx={{ fontSize: 16, mr: 0.5, color: '#64748b' }}
                              />
                              {notif.designation}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: '#64748b' }}
                            >
                              {notif.num_parc}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{getPriorityChip(notif.priorite)}</TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {formatDate(notif.date_creation)}
                        </Typography>
                      </TableCell>
                      {userRole === 'admin' && (
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 1,
                              justifyContent: 'center',
                            }}
                          >
                            {!notif.lu && (
                              <Tooltip title="Marquer comme lu">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleMarkAsRead(notif.id_notification)
                                  }
                                  sx={{
                                    bgcolor: '#dcfce7',
                                    color: '#16a34a',
                                    '&:hover': { bgcolor: '#bbf7d0' },
                                  }}
                                >
                                  <CheckCircleIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(notif)}
                                sx={{
                                  bgcolor: '#fee2e2',
                                  color: '#dc2626',
                                  '&:hover': { bgcolor: '#fecaca' },
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>

      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmDelete}
        title="Suppression"
        content={`Êtes-vous sûr de vouloir supprimer cette notification?`}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default NotificationView
