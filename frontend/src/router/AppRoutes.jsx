import { Route, Routes, Navigate } from 'react-router-dom'
import Login from '../views/authentication/login'
import Register from '../views/authentication/register'
import Profile from '../views/account/profile'
import Security from '../views/account/security'
import Logout from '../views/logout'
import NotFound from '../views/misc/notfound'
import Layout from '../layouts/Layout'
import PrivateRoute from '../layouts/PrivateRoute'
import Camion from '../views/dashboard/camion/CamionViews'
import Attachement from '../views/dashboard/attachement/AttachementViews'
import Utilisateur from '../views/dashboard/user/UserView'

// Routes Flotte
import Flotte from '../views/dashboard/flotte/FlotteViews'
import MaintenancePreventive from '../views/dashboard/flotte/maintenancePreventive/MaintenancePreventiveViews'
import DocumentsAdministratifs from '../views/dashboard/flotte/documentsAdministratifs/DocumentsAdministratifsViews'
import Operateurs from '../views/dashboard/flotte/operateurs/OperateursViews'
import DetailMateriel from '../views/dashboard/flotte/detailmateriel/DetailMaterielView'
import Notification from '../views/dashboard/notification/NotificationView'
import Curative from '../views/dashboard/maintenance/curative/CurativeView'
import Preventive from '../views/dashboard/maintenance/preventive/PreventiveView'
import Map from '../views/map/MapViews'

// Composants Depot
import DepotLayout from '../views/dashboard/depot/depotLayout/DepotLayout'
import MouvementsPage from '../views/dashboard/depot/mouvement/MouvementsPage'
import CommandesPage from '../views/dashboard/depot/commande/CommandesPage'
import TransfertsPage from '../views/dashboard/depot/transfert/TransfertsPage'
import StockPage from '../views/dashboard/depot/stock/StockPage'

const AppRoutes = ({ user, isLoggedIn }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout user={user}>
              <Camion user={user} />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="/account/profile" element={<Profile user={user} />} />
      <Route path="/account/security" element={<Security user={user} />} />

      <Route
        path="/materiel"
        element={
          <Layout user={user}>
            <Camion user={user} />
          </Layout>
        }
      />

      <Route
        path="/utilisateurs"
        element={
          <Layout user={user}>
            <Utilisateur user={user} />
          </Layout>
        }
      />

      <Route
        path="/attachement"
        element={
          <Layout user={user}>
            <Attachement user={user} />
          </Layout>
        }
      />

      {/* Routes Flotte avec sous-menu */}
      <Route
        path="/flotte"
        element={
          <Layout user={user}>
            <Flotte user={user} />
          </Layout>
        }
      />
      <Route
        path="/flotte/ajout-flotte"
        element={
          <Layout user={user}>
            <MaintenancePreventive user={user} />
          </Layout>
        }
      />
      <Route
        path="/flotte/documents"
        element={
          <Layout user={user}>
            <DocumentsAdministratifs user={user} />
          </Layout>
        }
      />
      <Route
        path="/flotte/operateurs"
        element={
          <Layout user={user}>
            <Operateurs user={user} />
          </Layout>
        }
      />

      {/* ✨ ROUTES DEPOT - Intégrées dans Layout */}
      <Route
        path="/depot/:depotId/*"
        element={
          <Layout user={user}>
            <DepotLayout user={user} />
          </Layout>
        }
      >
        <Route path="stock" element={<StockPage />} />
        <Route path="mouvements" element={<MouvementsPage />} />
        <Route path="commandes" element={<CommandesPage />} />
        <Route path="transferts" element={<TransfertsPage />} />
        <Route index element={<Navigate to="stock" replace />} />
      </Route>

      <Route
        path="/notifications"
        element={
          <Layout user={user}>
            <Notification user={user} />
          </Layout>
        }
      />

      <Route
        path="/materiel/:id"
        element={
          <Layout user={user}>
            <DetailMateriel user={user} />
          </Layout>
        }
      />

      <Route
        path="/maintenance/preventive"
        element={
          <Layout user={user}>
            <Preventive user={user} />
          </Layout>
        }
      />

      <Route
        path="/maintenance/curative"
        element={
          <Layout user={user}>
            <Curative user={user} />
          </Layout>
        }
      />

      <Route path="/map" element={<Map />} />

      <Route
        path="/auth/login"
        element={isLoggedIn ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/auth/register"
        element={isLoggedIn ? <Navigate to="/" /> : <Register />}
      />
      <Route path="/logout" element={<Logout />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
