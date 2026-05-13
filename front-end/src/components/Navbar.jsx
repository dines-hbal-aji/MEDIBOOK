import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handle = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const profilePath = user?.role === 'doctor' ? '/doctor/profile' : '#';

  return (
    <header className="app-navbar">
      <button
        className="btn btn-sm me-3 d-lg-none"
        style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.35rem 0.7rem' }}
        onClick={onToggleSidebar}
        title="Toggle Sidebar"
      >
        <i className="bi bi-list fs-5" />
      </button>

      <div className="me-auto">
        <span className="text-muted d-none d-md-inline" style={{ fontSize: '0.875rem' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="navbar-actions">
        <NotificationBell />

        <div ref={avatarRef} style={{ position: 'relative' }}>
          <div
            className="user-avatar"
            onClick={() => setAvatarOpen(!avatarOpen)}
            title={user?.name}
          >
            {getInitials(user?.name)}
          </div>

          {avatarOpen && (
            <div
              className="fade-in"
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'white', borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid #e5e7eb',
                minWidth: 200, zIndex: 2000
              }}
            >
              <div className="p-3 border-bottom">
                <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{user?.name}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>{user?.email}</div>
                <span className="badge badge-status badge-confirmed mt-1" style={{ fontSize: '0.7rem' }}>
                  {user?.role}
                </span>
              </div>
              {user?.role === 'doctor' && (
                <button
                  className="dropdown-item d-flex align-items-center gap-2 p-3"
                  onClick={() => { navigate(profilePath); setAvatarOpen(false); }}
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                >
                  <i className="bi bi-person-circle text-primary" />
                  <span style={{ fontSize: '0.875rem' }}>My Profile</span>
                </button>
              )}
              <button
                className="dropdown-item d-flex align-items-center gap-2 p-3"
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#dc3545' }}
              >
                <i className="bi bi-box-arrow-right" />
                <span style={{ fontSize: '0.875rem' }}>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
