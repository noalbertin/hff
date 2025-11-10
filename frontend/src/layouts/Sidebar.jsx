// Sidebar.jsx - Version améliorée
import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import menuData from '../data/menuData.json'
import api from '../utils/axios'

// Imports dynamiques des familles d'icônes
import * as FaIcons from 'react-icons/fa'
import * as MdIcons from 'react-icons/md'
import * as IoIcons from 'react-icons/io'
import * as BiIcons from 'react-icons/bi'

const iconLibraries = {
  fa: FaIcons,
  md: MdIcons,
  io: IoIcons,
  bi: BiIcons,
}

const Sidebar = () => {
  const [notificationCount, setNotificationCount] = useState(0)
  const [notificationPriorities, setNotificationPriorities] = useState({
    urgent: 0,
    attention: 0,
    info: 0,
  })

  useEffect(() => {
    fetchNotificationCount()

    // Rafraîchir le compteur toutes les 2 minutes
    const interval = setInterval(() => {
      fetchNotificationCount()
    }, 120000)

    return () => clearInterval(interval)
  }, [])

  const fetchNotificationCount = async () => {
    try {
      const { data } = await api.get('/notifications/count')
      if (data.success) {
        setNotificationCount(data.data.total)
        setNotificationPriorities({
          urgent: data.data.urgent || 0,
          attention: data.data.attention || 0,
          info: data.data.info || 0,
        })
      }
    } catch (error) {
      console.error('Erreur chargement compteur notifications:', error)
    }
  }

  return (
    <aside
      id="layout-menu"
      className="layout-menu menu-vertical menu bg-menu-theme"
    >
      <div className="app-brand demo">
        <span className="app-brand-logo demo">
          <img
            src="/assets/img/sneat.svg"
            alt="sneat-logo"
            aria-label="Sneat logo image"
          />
        </span>
        <span
          className="app-brand-text demo menu-text fw-bold ms-2"
          style={{ textTransform: 'none' }}
        >
          Henri Fraise
        </span>
      </div>

      <div className="menu-inner-shadow"></div>

      <ul className="menu-inner py-1">
        {menuData.map((section) => (
          <React.Fragment key={section.header}>
            {section.header && (
              <li className="menu-header small text-uppercase">
                <span className="menu-header-text">{section.header}</span>
              </li>
            )}
            {section.items.map((item) => (
              <MenuItem
                key={item.text}
                {...item}
                notificationCount={
                  item.text === 'Notifications' ? notificationCount : 0
                }
                notificationPriorities={
                  item.text === 'Notifications' ? notificationPriorities : null
                }
                refreshNotifications={fetchNotificationCount}
              />
            ))}
          </React.Fragment>
        ))}
      </ul>
    </aside>
  )
}

const MenuItem = (item) => {
  const location = useLocation()
  const isActive = location.pathname === item.link
  const hasSubmenu = item.submenu && item.submenu.length > 0
  const isSubmenuActive =
    hasSubmenu &&
    item.submenu.some((subitem) => location.pathname === subitem.link)

  // Récupération de l'icône
  const IconLib = iconLibraries[item.iconLib]
  const Icon = IconLib ? IconLib[item.icon] : null

  // Déterminer le style du badge selon la priorité
  const getBadgeStyle = () => {
    if (item.text !== 'Notifications' || !item.notificationPriorities) {
      return 'bg-danger'
    }

    const { urgent, attention } = item.notificationPriorities

    if (urgent > 0) {
      return 'bg-danger'
    } else if (attention > 0) {
      return 'bg-warning'
    } else {
      return 'bg-info'
    }
  }

  // Style du badge avec animation
  const notificationBadgeStyle = {
    position: 'absolute',
    top: '50%',
    right: '15px',
    transform: 'translateY(-50%)',
    minWidth: '22px',
    height: '22px',
    borderRadius: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
    padding: '0 7px',
    border: '2px solid white',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    zIndex: 10,
  }

  return (
    <li
      className={`menu-item ${isActive || isSubmenuActive ? 'active' : ''} ${
        hasSubmenu && isSubmenuActive ? 'open' : ''
      } ${
        item.text === 'Notifications' && item.notificationCount > 0
          ? 'has-notification'
          : ''
      }`}
    >
      <NavLink
        aria-label={`Navigate to ${item.text} ${!item.available ? 'Pro' : ''}`}
        to={item.link}
        className={`menu-link ${item.submenu ? 'menu-toggle' : ''}`}
        target={item.link.includes('http') ? '_blank' : undefined}
        style={{ position: 'relative' }}
        onClick={() => {
          // Rafraîchir les notifications quand on clique sur le menu
          if (item.text === 'Notifications' && item.refreshNotifications) {
            item.refreshNotifications()
          }
        }}
      >
        {Icon ? (
          <Icon className="menu-icon tf-icons text-lg" />
        ) : (
          <i className={`menu-icon tf-icons ${item.icon}`}></i>
        )}
        <div>{item.text}</div>

        {/* Badge Pro */}
        {item.available === false && (
          <div className="badge bg-label-primary fs-tiny rounded-pill ms-auto">
            Pro
          </div>
        )}

        {/* Badge Notifications avec animation */}
        {item.text === 'Notifications' && item.notificationCount > 0 && (
          <span
            className={`badge ${getBadgeStyle()} notification-badge-animated`}
            style={notificationBadgeStyle}
            title={
              item.notificationPriorities
                ? `${item.notificationPriorities.urgent} urgentes, ${item.notificationPriorities.attention} attention, ${item.notificationPriorities.info} info`
                : `${item.notificationCount} notifications`
            }
          >
            {item.notificationCount > 99 ? '99+' : item.notificationCount}
          </span>
        )}
      </NavLink>

      {item.submenu && (
        <ul className="menu-sub">
          {item.submenu.map((subitem) => (
            <MenuItem key={subitem.text} {...subitem} />
          ))}
        </ul>
      )}
    </li>
  )
}

// Ajout du style CSS pour les animations
const styleElement = document.createElement('style')
styleElement.textContent = `
  @keyframes notification-pulse {
    0%, 100% {
      transform: translateY(-50%) scale(1);
      opacity: 1;
    }
    50% {
      transform: translateY(-50%) scale(1.08);
      opacity: 0.95;
    }
  }

  /* Animation d'apparition */
  @keyframes badge-appear {
    0% {
      transform: translateY(-50%) scale(0);
      opacity: 0;
    }
    50% {
      transform: translateY(-50%) scale(1.15);
    }
    100% {
      transform: translateY(-50%) scale(1);
      opacity: 1;
    }
  }

  /* Classe pour l'animation */
  .notification-badge-animated {
    animation: notification-pulse 2s ease-in-out infinite, badge-appear 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  /* Hover effect */
  .menu-item:hover .notification-badge-animated {
    transform: translateY(-50%) scale(1.05);
    transition: transform 0.2s ease;
    animation-play-state: paused;
  }

  /* Style quand le menu est actif */
  .menu-item.active .notification-badge-animated {
    animation: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  /* Ajustement pour menu réduit */
  .menu-vertical.menu-collapsed .notification-badge-animated {
    right: 8px;
    min-width: 20px;
    height: 20px;
    font-size: 10px;
    padding: 0 5px;
  }

  /* Style responsive */
  @media (max-width: 768px) {
    .notification-badge-animated {
      right: 10px;
      min-width: 20px;
      height: 20px;
      font-size: 10px;
    }
  }
`

// Ajouter le style seulement une fois
if (!document.getElementById('notification-badge-styles')) {
  styleElement.id = 'notification-badge-styles'
  document.head.appendChild(styleElement)
}

export default Sidebar
