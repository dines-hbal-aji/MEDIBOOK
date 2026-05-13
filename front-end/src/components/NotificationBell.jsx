import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatTimeAgo } from '../utils/formatDate';

const NOTIFICATION_ICONS = {
  booking: { icon: 'bi-calendar-check-fill', color: '#0d6efd', bg: '#e8f0fe' },
  reminder_1day: { icon: 'bi-clock-fill', color: '#fd7e14', bg: '#fff3e0' },
  reminder_1hour: { icon: 'bi-alarm-fill', color: '#fd7e14', bg: '#fff3e0' },
  reminder_15min: { icon: 'bi-alarm-fill', color: '#dc3545', bg: '#f8d7da' },
  completion: { icon: 'bi-check-circle-fill', color: '#198754', bg: '#d1e7dd' },
  approval: { icon: 'bi-shield-check', color: '#6610f2', bg: '#e8d5ff' },
  cancellation: { icon: 'bi-x-circle-fill', color: '#dc3545', bg: '#f8d7da' },
  rescheduled: { icon: 'bi-arrow-repeat', color: '#0d6efd', bg: '#e8f0fe' },
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, shaking, markRead, markAllRead } = useNotifications();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) await markRead(notif.id);
    if (notif.appointment_id) {
      navigate(`/user/appointments`);
    }
    setOpen(false);
  };

  const recent = notifications.slice(0, 5);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className={`notification-bell ${shaking ? 'shaking' : ''}`}
        onClick={() => setOpen(!open)}
        style={{ background: 'none', border: 'none', position: 'relative' }}
        title="Notifications"
      >
        <i className="bi bi-bell-fill" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown fade-in">
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
            <h6 className="mb-0 fw-semibold">Notifications</h6>
            {unreadCount > 0 && (
              <button className="btn btn-sm btn-link text-primary p-0 text-decoration-none" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '360px' }}>
            {recent.length === 0 ? (
              <div className="text-center p-4 text-muted">
                <i className="bi bi-bell-slash fs-2 d-block mb-2" />
                No notifications yet
              </div>
            ) : (
              recent.map(notif => {
                const cfg = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.booking;
                return (
                  <div
                    key={notif.id}
                    className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notification-icon" style={{ background: cfg.bg, color: cfg.color }}>
                      <i className={`bi ${cfg.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="fw-semibold text-truncate" style={{ fontSize: '0.875rem' }}>{notif.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>{notif.message}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                        {formatTimeAgo(notif.created_at)}
                      </div>
                    </div>
                    {!notif.is_read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0d6efd', flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 5 && (
            <div className="text-center p-2 border-top">
              <button className="btn btn-sm btn-link text-primary text-decoration-none" onClick={() => setOpen(false)}>
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
