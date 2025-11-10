import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EngineeringIcon from '@mui/icons-material/Engineering'
import InfoIcon from '@mui/icons-material/Info'
import BuildIcon from '@mui/icons-material/Build'
import AssignmentIcon from '@mui/icons-material/Assignment'
import DescriptionIcon from '@mui/icons-material/Description'
import PersonIcon from '@mui/icons-material/Person'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import api from '../../../../utils/axios'

const DetailMaterielView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [materiel, setMateriel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMateriel = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`tous/${id}`)
        console.log('Données reçues:', data)
        setMateriel(data)
      } catch (error) {
        console.error('Erreur lors du chargement du matériel:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMateriel()
    }
  }, [id])

  const handleBack = () => {
    navigate(-1)
  }

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

  if (!materiel) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
        <Paper
          elevation={0}
          sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}
        >
          <Typography variant="h6" color="text.secondary">
            Matériel non trouvé
          </Typography>
        </Paper>
      </Box>
    )
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const renderRetard = (jours) => {
    if (jours === null || jours === undefined) return null

    if (jours < 0) {
      return (
        <Chip
          label={`Retard: ${Math.abs(jours)}j`}
          size="small"
          sx={{
            ml: 1,
            bgcolor: '#fee',
            color: '#c00',
            fontWeight: 600,
            border: '1px solid #fcc',
          }}
        />
      )
    } else if (jours <= 30) {
      return (
        <Chip
          label={`${jours}j restants`}
          size="small"
          sx={{
            ml: 1,
            bgcolor: '#fff3e0',
            color: '#e65100',
            fontWeight: 600,
            border: '1px solid #ffe0b2',
          }}
        />
      )
    } else {
      return (
        <Chip
          label={`${jours}j restants`}
          size="small"
          sx={{
            ml: 1,
            bgcolor: '#e8f5e9',
            color: '#2e7d32',
            fontWeight: 600,
            border: '1px solid #c8e6c9',
          }}
        />
      )
    }
  }

  const InfoField = ({ label, value, retard = null }) => (
    <Box sx={{ mb: 2.5 }}>
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
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          mt: 0.5,
          color: '#1e293b',
        }}
      >
        {value || '-'}
        {retard && renderRetard(retard)}
      </Typography>
    </Box>
  )

  const BooleanIndicator = ({ label, value }) => (
    <Box sx={{ mb: 2.5 }}>
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
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
        {value ? (
          <CheckCircleIcon sx={{ fontSize: 20, color: '#22c55e', mr: 1 }} />
        ) : (
          <CancelIcon sx={{ fontSize: 20, color: '#ef4444', mr: 1 }} />
        )}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: value ? '#22c55e' : '#ef4444',
          }}
        >
          {value ? 'Oui' : 'Non'}
        </Typography>
      </Box>
    </Box>
  )

  const StatutChip = ({ statut }) => {
    if (!statut) return '-'

    const getStyle = () => {
      if (statut === 'En location')
        return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' }
      if (statut === 'En panne')
        return { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' }
      return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' }
    }

    const style = getStyle()

    return (
      <Chip
        label={statut}
        sx={{
          fontWeight: 700,
          fontSize: '13px',
          bgcolor: style.bg,
          color: style.color,
          border: `1px solid ${style.border}`,
          height: 32,
          px: 1,
        }}
      />
    )
  }

  const MaintenanceStatutChip = ({ statut }) => {
    const getStyle = () => {
      if (statut === 'Terminé')
        return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' }
      if (statut === 'En cours')
        return { bg: '#dbeafe', color: '#2563eb', border: '#bfdbfe' }
      return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' }
    }

    const style = getStyle()

    return (
      <Chip
        label={statut}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: '11px',
          bgcolor: style.bg,
          color: style.color,
          border: `1px solid ${style.border}`,
          height: 24,
        }}
      />
    )
  }

  const PrioriteChip = ({ priorite }) => {
    const getStyle = () => {
      if (priorite === 'Urgente')
        return { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' }
      if (priorite === 'Haute')
        return { bg: '#fed7aa', color: '#c2410c', border: '#fdba74' }
      if (priorite === 'Moyenne')
        return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' }
      return { bg: '#e0e7ff', color: '#4f46e5', border: '#c7d2fe' }
    }

    const style = getStyle()

    return (
      <Chip
        label={priorite}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: '11px',
          bgcolor: style.bg,
          color: style.color,
          border: `1px solid ${style.border}`,
          height: 24,
        }}
      />
    )
  }

  const SectionCard = ({ icon, title, children }) => (
    <Card
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
          p: 2.5,
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              bgcolor: '#fff',
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            {title}
          </Typography>
        </Box>
      </Box>
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  )

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
          <IconButton
            onClick={handleBack}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              mb: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)',
                transform: 'translateX(-4px)',
                transition: 'all 0.3s',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: '#fff', mb: 1 }}
          >
            Détails du Matériel
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}
          >
            {materiel.designation} • {materiel.num_parc} •{' '}
            {materiel.parc_colas || '-'}
          </Typography>
        </Box>
      </Box>

      {/* Contenu principal */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, mt: -3 }}>
        {/* Carte Statut */}
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            background: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
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
                    Statut Actuel
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <StatutChip statut={materiel.statut} />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <InfoField label="N° Parc" value={materiel.num_parc} />
              </Grid>
              <Grid item xs={12} md={3}>
                <InfoField label="Parc Colas" value={materiel.parc_colas} />
              </Grid>
              <Grid item xs={12} md={3}>
                <BooleanIndicator label="Suivi Actif" value={materiel.suivi} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Informations Principales */}
        <SectionCard
          icon={<InfoIcon sx={{ color: '#667eea', fontSize: 24 }} />}
          title="Informations Principales"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <InfoField label="Désignation" value={materiel.designation} />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField label="Modèle" value={materiel.modele} />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField label="Série" value={materiel.serie} />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField label="CST" value={materiel.cst} />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField label="Année" value={materiel.annee} />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField label="Casier" value={materiel.casier} />
            </Grid>
            <Grid item xs={12}>
              <InfoField
                label="N° Chassis (ID)"
                value={materiel.numero_chassis}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* PM */}
        <SectionCard
          icon={<EngineeringIcon sx={{ color: '#f59e0b', fontSize: 24 }} />}
          title="PM"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <InfoField
                label="Date Dernier PM"
                value={formatDate(materiel.date_dernier_pm)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField
                label="Heure Dernier PM"
                value={
                  materiel.heure_dernier_pm
                    ? `${materiel.heure_dernier_pm}h`
                    : '-'
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField
                label="Km Dernier PM"
                value={
                  materiel.km_dernier_pm ? `${materiel.km_dernier_pm} km` : '-'
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField
                label="Heure Prochain PM"
                value={
                  materiel.heure_prochain_pm
                    ? `${materiel.heure_prochain_pm}h`
                    : '-'
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField
                label="Km Prochain PM"
                value={
                  materiel.km_prochain_pm
                    ? `${materiel.km_prochain_pm} km`
                    : '-'
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField label="Type PM" value={materiel.type_pm} />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField label="N° PM" value={materiel.num_pm} />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Historique de Maintenance Préventive */}
        {materiel.maintenances_preventives &&
          materiel.maintenances_preventives.length > 0 && (
            <SectionCard
              icon={<BuildIcon sx={{ color: '#3b82f6', fontSize: 24 }} />}
              title={`Historique de Maintenance Préventive (${materiel.maintenances_preventives.length})`}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Opération
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Date Planifiée
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Heures Cible
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        KM Cible
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Priorité
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Statut
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Intervention
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Coût Pièces
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {materiel.maintenances_preventives.map((maintenance) => (
                      <TableRow
                        key={maintenance.id_maintenance_preventive}
                        hover
                      >
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'pre-line', // garde les retours à la ligne du texte
                              wordBreak: 'break-word', // coupe les mots longs si besoin
                            }}
                          >
                            {maintenance.nom_operation}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {formatDate(maintenance.date_planifiee)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {maintenance.heures_fonctionnement_cible || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {maintenance.km_fonctionnement_cible || '-'}
                        </TableCell>
                        <TableCell>
                          <PrioriteChip priorite={maintenance.priorite} />
                        </TableCell>
                        <TableCell>
                          <MaintenanceStatutChip statut={maintenance.statut} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {maintenance.date_debut_intervention ? (
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ color: '#64748b' }}
                              >
                                Début:{' '}
                                {formatDate(
                                  maintenance.date_debut_intervention
                                )}
                              </Typography>
                              {maintenance.date_fin_intervention && (
                                <Typography
                                  variant="caption"
                                  sx={{ display: 'block', color: '#64748b' }}
                                >
                                  Fin:{' '}
                                  {formatDate(
                                    maintenance.date_fin_intervention
                                  )}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: '0.875rem', fontWeight: 600 }}
                        >
                          {formatCurrency(maintenance.cout_pieces || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Résumé des coûts pour préventive */}
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#64748b', fontWeight: 600 }}
                    >
                      Total Pièces
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#1e293b' }}
                    >
                      {formatCurrency(
                        materiel.maintenances_preventives.reduce(
                          (sum, m) => sum + (parseFloat(m.cout_pieces) || 0),
                          0
                        )
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#64748b', fontWeight: 600 }}
                    >
                      Planifiées
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#f59e0b' }}
                    >
                      {
                        materiel.maintenances_preventives.filter(
                          (m) => m.statut === 'Planifiée'
                        ).length
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#64748b', fontWeight: 600 }}
                    >
                      Terminées
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#16a34a' }}
                    >
                      {
                        materiel.maintenances_preventives.filter(
                          (m) => m.statut === 'Terminée'
                        ).length
                      }
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </SectionCard>
          )}

        {/* Historique de Maintenance Curative */}
        {materiel.maintenances_curatives &&
          materiel.maintenances_curatives.length > 0 && (
            <SectionCard
              icon={
                <HealthAndSafetyIcon sx={{ color: '#ef4444', fontSize: 24 }} />
              }
              title={`Historique de Maintenance Curative (${materiel.maintenances_curatives.length})`}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Date Signalement
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Description
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Catégorie
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Statut
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Intervention
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Pièces
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>
                        Coût
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {materiel.maintenances_curatives.map((maintenance) => (
                      <TableRow key={maintenance.id_maintenance_curative} hover>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {formatDate(maintenance.date_signalement)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', maxWidth: 300 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'pre-line', // garde les retours à la ligne du texte
                              wordBreak: 'break-word', // coupe les mots longs si besoin
                            }}
                          >
                            {maintenance.description_signalement || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {maintenance.categorie}
                        </TableCell>
                        <TableCell>
                          <MaintenanceStatutChip statut={maintenance.statut} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {maintenance.date_debut_intervention ? (
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ color: '#64748b' }}
                              >
                                Début:{' '}
                                {formatDate(
                                  maintenance.date_debut_intervention
                                )}
                              </Typography>
                              {maintenance.date_fin_intervention && (
                                <Typography
                                  variant="caption"
                                  sx={{ display: 'block', color: '#64748b' }}
                                >
                                  Fin:{' '}
                                  {formatDate(
                                    maintenance.date_fin_intervention
                                  )}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          <Box>
                            {maintenance.pieces_remplacees ? (
                              <Typography
                                variant="caption"
                                sx={{ display: 'block', color: '#64748b' }}
                              >
                                Remplacées: {maintenance.pieces_remplacees}
                              </Typography>
                            ) : maintenance.pieces_reparees ? (
                              <Typography
                                variant="caption"
                                sx={{ display: 'block', color: '#64748b' }}
                              >
                                Réparées: {maintenance.pieces_reparees}
                              </Typography>
                            ) : (
                              '-'
                            )}
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: '0.875rem', fontWeight: 600 }}
                        >
                          {formatCurrency(maintenance.cout_pieces || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Résumé des coûts pour curative */}
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#64748b', fontWeight: 600 }}
                    >
                      Total Pièces
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#1e293b' }}
                    >
                      {formatCurrency(
                        materiel.maintenances_curatives.reduce(
                          (sum, m) => sum + (parseFloat(m.cout_pieces) || 0),
                          0
                        )
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#64748b', fontWeight: 600 }}
                    >
                      En cours
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#2563eb' }}
                    >
                      {
                        materiel.maintenances_curatives.filter(
                          (m) => m.statut === 'En cours'
                        ).length
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#64748b', fontWeight: 600 }}
                    >
                      Terminées
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: '#16a34a' }}
                    >
                      {
                        materiel.maintenances_curatives.filter(
                          (m) => m.statut === 'Terminé'
                        ).length
                      }
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </SectionCard>
          )}

        {/* Attachement */}
        <SectionCard
          icon={<AssignmentIcon sx={{ color: '#10b981', fontSize: 24 }} />}
          title="Informations Attachement"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <InfoField label="Lot" value={materiel.lot} />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField
                label="Heure Fin"
                value={materiel.heure_fin ? `${materiel.heure_fin}h` : '-'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField
                label="Km Fin"
                value={materiel.km_fin ? `${materiel.km_fin} km` : '-'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <BooleanIndicator label="Facturé" value={materiel.facture} />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoField
                label="Date Utilisé"
                value={formatDate(materiel.date_utilise)}
              />
            </Grid>
            <Grid item xs={12}>
              <InfoField label="Observation" value={materiel.observation} />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Documents Administratifs */}
        <SectionCard
          icon={<DescriptionIcon sx={{ color: '#ef4444', fontSize: 24 }} />}
          title="Documents Administratifs"
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <InfoField
                label="Date IPS"
                value={formatDate(materiel.date_ips)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoField
                label="Dernière VT"
                value={formatDate(materiel.date_derniere_vt)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoField
                label="Prochaine VT"
                value={formatDate(materiel.date_prochaine_vt)}
                retard={materiel.jours_avant_vt}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoField
                label="Expiration Carte Grise"
                value={formatDate(materiel.date_expiration_carte_grise)}
                retard={materiel.jours_avant_carte_grise}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoField
                label="Expiration Assurance"
                value={formatDate(materiel.date_expiration_assurance)}
                retard={materiel.jours_avant_assurance}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Opérateurs */}
        <SectionCard
          icon={<PersonIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />}
          title="Opérateurs"
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: '#1e293b',
                fontSize: '0.95rem',
              }}
            >
              Opérateur Principal
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <InfoField
                  label="Matricule"
                  value={materiel.matricule_operateur}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <InfoField label="Nom" value={materiel.nom_operateur} />
              </Grid>
              <Grid item xs={12} md={4}>
                <InfoField
                  label="Téléphone"
                  value={materiel.telephone_operateur}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: '#1e293b',
                fontSize: '0.95rem',
              }}
            >
              Suppléant / Aide Chauffeur
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <InfoField
                  label="Matricule"
                  value={materiel.matricule_suppleant}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <InfoField label="Nom" value={materiel.nom_suppleant} />
              </Grid>
              <Grid item xs={12} md={4}>
                <InfoField
                  label="Téléphone"
                  value={materiel.telephone_suppleant}
                />
              </Grid>
            </Grid>
          </Box>
        </SectionCard>
      </Box>
    </Box>
  )
}

export default DetailMaterielView
