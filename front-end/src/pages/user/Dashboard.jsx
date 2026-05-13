import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatDate, formatTime } from '../../utils/formatDate';
import { formatFee } from '../../utils/feeDisplay';
import { useNotifications } from '../../context/NotificationContext';

const STATUS_BADGE = {
  pending: 'badge-pending', confirmed: 'badge-confirmed',
  completed: 'badge-completed', cancelled: 'badge-cancelled', rescheduled: 'badge-rescheduled'
};

const UserDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    Promise.all([
      api.get('/appointments/my'),
      api.get('/prescriptions/my'),
    ]).then(([aRes, pRes]) => {
      setAppointments(aRes.data || []);
      setPrescriptions(pRes.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = appointments.filter(a => {
    const d = new Date(`${a.date}T${a.start_time}`);
    return d > now && ['confirmed', 'pending'].includes(a.status);
  });

  const stats = [
    { label: 'Upcoming', value: upcoming.length, icon: 'bi-calendar-check', color: 'blue' },
    { label: 'Total Appointments', value: appointments.length, icon: 'bi-calendar2', color: 'green' },
    { label: 'Prescriptions', value: prescriptions.length, icon: 'bi-file-medical', color: 'purple' },
    { label: 'Unread Alerts', value: unreadCount, icon: 'bi-bell', color: 'orange' },
  ];

  const recent = appointments.slice(0, 5);

  if (loading) {
    return (
      <div>
        <div className="row g-4 mb-4">
          {[...Array(4)].map((_, i) => <div key={i} className="col-md-3"><div className="skeleton skeleton-card" /></div>)}
        </div>
        <div className="skeleton skeleton-card" style={{ height: 200 }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2><i className="bi bi-house-fill me-2 text-primary" />Patient Dashboard</h2>
        <p className="text-muted">Welcome back! Manage your health appointments.</p>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-4">
        {stats.map(s => (
          <div key={s.label} className="col-6 col-md-3">
            <div className={`stat-card ${s.color}`}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.value}</div>
                </div>
                <div className="stat-icon">
                  <i className={`bi ${s.icon}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <Link to="/user/doctors" className="card text-decoration-none d-block" style={{ background: 'linear-gradient(135deg, #0d6efd, #6610f2)', color: 'white', padding: '1.5rem', borderRadius: 16 }}>
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                <i className="bi bi-search-heart" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Find a Doctor</div>
                <div style={{ opacity: 0.8, fontSize: '0.875rem' }}>Book your next appointment</div>
              </div>
              <i className="bi bi-arrow-right ms-auto fs-5" />
            </div>
          </Link>
        </div>
        <div className="col-md-6">
          <Link to="/user/appointments" className="card text-decoration-none d-block" style={{ background: 'linear-gradient(135deg, #198754, #20c997)', color: 'white', padding: '1.5rem', borderRadius: 16 }}>
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                <i className="bi bi-calendar2-week" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>My Appointments</div>
                <div style={{ opacity: 0.8, fontSize: '0.875rem' }}>{upcoming.length} upcoming</div>
              </div>
              <i className="bi bi-arrow-right ms-auto fs-5" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="table-card">
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
          <h6 className="mb-0 fw-semibold">Recent Appointments</h6>
          <Link to="/user/appointments" className="btn btn-sm btn-outline-primary">View All</Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-calendar-x empty-icon" />
            <h5>No appointments yet</h5>
            <p className="text-muted">Find a doctor and book your first appointment</p>
            <Link to="/user/doctors" className="btn btn-primary mt-2">Find Doctors</Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="fw-semibold">{a.doctor_name}</div>
                      <div className="text-muted" style={{ fontSize: '0.82rem' }}>{a.specialization}</div>
                    </td>
                    <td>
                      <div>{formatDate(a.date)}</div>
                      <div className="text-muted" style={{ fontSize: '0.82rem' }}>{formatTime(a.start_time)}</div>
                    </td>
                    <td className="fw-semibold">{formatFee(a.total_fee)}</td>
                    <td>
                      <span className={`badge-status ${STATUS_BADGE[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
