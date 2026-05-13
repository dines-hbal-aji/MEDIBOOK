import { NavLink } from 'react-router-dom';

const USER_LINKS = [
  { to: '/user/dashboard', icon: 'bi-house-fill', label: 'Dashboard' },
  { to: '/user/doctors', icon: 'bi-person-badge', label: 'Find Doctors' },
  { to: '/user/appointments', icon: 'bi-calendar2-week', label: 'My Appointments' },
  { to: '/user/prescriptions', icon: 'bi-file-medical', label: 'Prescriptions' },
];

const DOCTOR_LINKS = [
  { to: '/doctor/dashboard', icon: 'bi-house-fill', label: 'Dashboard' },
  { to: '/doctor/profile', icon: 'bi-person-circle', label: 'My Profile' },
  { to: '/doctor/slots', icon: 'bi-clock', label: 'Manage Slots' },
  { to: '/doctor/appointments', icon: 'bi-calendar2-check', label: 'Appointments' },
];

const ADMIN_LINKS = [
  { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { to: '/admin/doctors', icon: 'bi-person-badge', label: 'Manage Doctors' },
  { to: '/admin/users', icon: 'bi-people-fill', label: 'Manage Users' },
  { to: '/admin/appointments', icon: 'bi-calendar2-check', label: 'Appointments' },
  { to: '/admin/settings', icon: 'bi-gear-fill', label: 'Settings' },
];

const ROLE_LINKS = { user: USER_LINKS, doctor: DOCTOR_LINKS, admin: ADMIN_LINKS };
const ROLE_LABELS = { user: 'Patient Portal', doctor: 'Doctor Portal', admin: 'Admin Panel' };

const Sidebar = ({ role, onClose, mobileOpen }) => {
  const links = ROLE_LINKS[role] || USER_LINKS;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          onClick={onClose}
        />
      )}

      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">M</div>
          <div>
            <div className="brand-name">MediBook</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{ROLE_LABELS[role]}</div>
          </div>
          <button
            className="d-md-none ms-auto btn btn-sm"
            style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none' }}
            onClick={onClose}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <i className={`bi ${link.icon}`} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
            MediBook v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
