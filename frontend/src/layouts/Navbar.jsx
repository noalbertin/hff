import { Link } from 'react-router-dom'
import { useAuthStore, selectUser } from '../store/auth'

const Navbar = () => {
  const user = useAuthStore(selectUser)

  // Déterminer l'avatar et la couleur selon le rôle
  const getAvatarConfig = (role) => {
    if (role === 'admin') {
      return {
        icon: 'bx bxs-crown',
        bgColor: '#FFD700',
        textColor: '#1C252E',
        label: 'Administrateur',
      }
    }
    return {
      icon: 'bx bxs-user',
      bgColor: '#4CAF50',
      textColor: '#FFFFFF',
      label: 'Visiteur',
    }
  }

  const avatarConfig = getAvatarConfig(user?.role)

  return (
    <nav
      className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
      id="layout-navbar"
    >
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
        <a
          aria-label="toggle for sidebar"
          className="nav-item nav-link px-0 me-xl-4"
          href="#"
        >
          <i className="bx bx-menu bx-sm"></i>
        </a>
      </div>

      <div
        className="navbar-nav-right d-flex align-items-center"
        id="navbar-collapse"
      >
        <ul className="navbar-nav flex-row align-items-center ms-auto">
          {/* Avatar avec dropdown seulement */}
          <li className="nav-item navbar-dropdown dropdown-user dropdown">
            <a
              aria-label="dropdown profile avatar"
              className="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              data-bs-toggle="dropdown"
            >
              {/* Avatar à gauche */}
              <div
                className="avatar avatar-online me-2"
                style={{
                  backgroundColor: avatarConfig.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                }}
              >
                <i
                  className={avatarConfig.icon}
                  style={{
                    fontSize: '22px',
                    color: avatarConfig.textColor,
                  }}
                ></i>
              </div>

              {/* Nom + rôle à droite */}
              <div className="d-flex flex-column align-items-start">
                <span
                  className="fw-medium"
                  style={{ fontSize: '14px', lineHeight: '1.2' }}
                >
                  {user?.nom_user || 'Utilisateur'}
                </span>
                <small className="text-muted" style={{ fontSize: '12px' }}>
                  {avatarConfig.label}
                </small>
              </div>
            </a>

            {/* Dropdown menu */}
            <ul className="dropdown-menu dropdown-menu-end">
              {/* <li>
                <Link to="/#" className="dropdown-item">
                  <i className="bx bx-user me-2"></i>
                  <span className="align-middle">Mon Profil</span>
                </Link>
              </li>
              <li>
                <div className="dropdown-divider"></div>
              </li> */}
              <li>
                <Link to="/logout" className="dropdown-item">
                  <i className="bx bx-power-off me-2"></i>
                  <span className="align-middle">Déconnexion</span>
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
