import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminTheme } from '../context/AdminThemeContext';
import {
  FiGrid, FiHelpCircle, FiLogOut,
  FiBriefcase, FiBookOpen, FiActivity, FiDollarSign, FiUsers,
  FiChevronsLeft, FiChevronsRight, FiX, FiMessageCircle, FiShield, FiPlay,
} from 'react-icons/fi';

/* ── Collapse toggle button (desktop) ── */
function CollapseBtn({ collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: '1.5px solid rgba(108,99,255,0.35)',
        background: 'linear-gradient(135deg, rgba(108,99,255,0.18), rgba(255,107,157,0.10))',
        cursor: 'pointer',
        color: '#9A9BBF',
        transition: 'all 0.22s ease',
        flexShrink: 0,
        outline: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'linear-gradient(135deg, #6C63FF, #FF6B9D)';
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(108,99,255,0.45)';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(108,99,255,0.18), rgba(255,107,157,0.10))';
        e.currentTarget.style.color = '#9A9BBF';
        e.currentTarget.style.borderColor = 'rgba(108,99,255,0.35)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Subtle pulse ring */}
      <span style={{
        position: 'absolute', inset: -3,
        borderRadius: '50%',
        border: '1px solid rgba(108,99,255,0.15)',
        pointerEvents: 'none',
      }} />
      {collapsed
        ? <FiChevronsRight size={14} />
        : <FiChevronsLeft size={14} />
      }
    </button>
  );
}

/* ── Mobile close button ── */
function CloseBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Tutup menu"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: '5px 12px 5px 8px',
        borderRadius: 20,
        border: '1.5px solid rgba(255,82,82,0.3)',
        background: 'rgba(255,82,82,0.08)',
        cursor: 'pointer',
        color: '#FF5252',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        transition: 'all 0.2s ease',
        outline: 'none',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,82,82,0.18)';
        e.currentTarget.style.borderColor = 'rgba(255,82,82,0.55)';
        e.currentTarget.style.transform = 'scale(1.04)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,82,82,0.08)';
        e.currentTarget.style.borderColor = 'rgba(255,82,82,0.3)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <FiX size={13} />
      Tutup
    </button>
  );
}

export default function AdminSidebar() {
  const { admin, logoutAdmin } = useAuth();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, closeMobileSidebar } = useAdminTheme();
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard',         icon: <FiGrid size={19} /> },
    { path: '/admin/users',     label: 'Kelola User',       icon: <FiUsers size={19} /> },
    { path: '/admin/admins',    label: 'Kelola Admin',      icon: <FiShield size={19} /> },
    { path: '/admin/lowongan',  label: 'Kelola Lowongan',   icon: <FiBriefcase size={19} /> },
      { path: '/admin/tutorial',  label: 'Tips Wawancara',    icon: <FiBookOpen size={19} /> },
      { path: '/admin/video-tutorials', label: 'Video Tutorial', icon: <FiPlay size={19} /> },
    { path: '/admin/usaha',     label: 'Tips Memulai Usaha',icon: <FiActivity size={19} /> },
    { path: '/admin/keuangan',  label: 'Tips Keuangan',     icon: <FiDollarSign size={19} /> },
    { path: '/admin/kuis',      label: 'Kelola Kuis',       icon: <FiHelpCircle size={19} /> },
  ];

  const isActive = (path) => location.pathname === path;
  const collapsed = sidebarCollapsed;
  const initials = admin?.nama?.charAt(0)?.toUpperCase() || 'A';

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileSidebarOpen && (
        <div className="admin-sidebar__overlay" onClick={closeMobileSidebar} />
      )}

      <aside className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''} ${mobileSidebarOpen ? 'admin-sidebar--mobile-open' : ''}`}>

        {/* ── Logo / Header ── */}
        <div className="admin-sidebar__logo">
          {!collapsed && (
            <div className="admin-sidebar__brand">
              <div className="admin-sidebar__brand-icon">BK</div>
              <div>
                <span className="admin-sidebar__brand-name">BiKA</span>
                <p className="admin-sidebar__brand-sub">Admin Panel</p>
              </div>
            </div>
          )}

          {/* Desktop: collapse toggle */}
          <span className="admin-sidebar__toggle--desktop">
            <CollapseBtn collapsed={collapsed} onClick={toggleSidebar} />
          </span>

          {/* Mobile: close pill */}
          <span className="admin-sidebar__toggle--mobile">
            <CloseBtn onClick={closeMobileSidebar} />
          </span>
        </div>

        {/* ── Navigation ── */}
        <nav className="admin-sidebar__nav">
          {!collapsed && <p className="admin-sidebar__nav-label">MENU</p>}
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar__nav-item ${isActive(item.path) ? 'admin-sidebar__nav-item--active' : ''}`}
              title={collapsed ? item.label : ''}
              onClick={closeMobileSidebar}
            >
              <span className="admin-sidebar__nav-icon">{item.icon}</span>
              {!collapsed && <span className="admin-sidebar__nav-text">{item.label}</span>}
              {!collapsed && isActive(item.path) && <span className="admin-sidebar__nav-dot" />}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__spacer" />

        {/* ── Support Card ── */}
        {!collapsed && (
  <div className="admin-sidebar__support">
    <div className="admin-sidebar__support-avatar">👤</div>
    <p className="admin-sidebar__support-title">Butuh bantuan?</p>
    <p className="admin-sidebar__support-sub">Hubungi developer</p>
    
    {/* Bungkus button dengan tag anchor */}
    <a 
      href="https://wa.me/+6287762006122" 
      target="_blank" 
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <button className="admin-sidebar__support-btn">
        <FiMessageCircle size={12} style={{ marginRight: 5, verticalAlign: 'middle' }} /> 
        Hubungi
      </button>
    </a>
  </div>
)}

        {/* ── Admin Footer ── */}
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__admin-info">
            <div className="admin-sidebar__admin-avatar">{initials}</div>
            {!collapsed && (
              <div className="admin-sidebar__admin-details">
                <p className="admin-sidebar__admin-name">{admin?.nama || 'Admin'}</p>
                <p className="admin-sidebar__admin-role">{admin?.role || 'admin'}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={logoutAdmin} className="admin-sidebar__logout" title="Keluar">
              <FiLogOut size={15} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

