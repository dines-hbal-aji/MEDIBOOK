import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDate, formatTime } from '../../utils/formatDate';
import { formatFee } from '../../utils/feeDisplay';
import { useAuth } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const { doctor } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctor/appointments')
      .then(res => setAppointments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  const todayAppts = appointments.filter(a => a.date === today);
  const pending = appointments.filter(a => a.status === 'pending');
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const totalPatients = new Set(appointments.map(a => a.user_id)).size;

  const stats = [
    { label: "Today's Appointments", value: todayAppts.length, icon: 'bi-calendar-day', color: 'blue' },
    { label: 'Total Patients', value: totalPatients, icon: 'bi-people-fill', color: 'green' },
    { label: 'Confirmed', value: confirmed.length, icon: 'bi-calendar-check', color: 'teal' },
    { label: 'Pending Review', value: pending.length, icon: 'bi-hourglass-split', color: 'orange' },
  ];

  const todaySchedule = todayAppts
    .filter(a => ['confirmed', 'pending'].includes(a.status))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const recentAppts = appointments.slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <h2><i className="bi bi-house-fill me-2 text-primary" />Doctor Dashboard</h2>
        <p className="text-muted">Manage your appointments and patients</p>
      </div>

      {!doctor?.is_approved && (
        <div className="approval-banner mb-4">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-hourglass-split text-warning fs-4" />
            <div>
              <div className="fw-semibold">Account Pending Approval</div>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                Your account is under review by admin. You'll be notified when approved.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="row g-4 mb-4">
        {stats.map(s => (
          <div key={s.label} className="col-6 col-md-3">
            <div className={`stat-card ${s.color}`}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{loading ? '–' : s.value}</div>
                </div>
                <div className="stat-icon"><i className={`bi ${s.icon}`} /></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Today's Schedule */}
        <div className="col-md-5">
          <div className="table-card h-100">
            <div className="p-3 border-bottom d-flex align-items-center gap-2">
              <i className="bi bi-clock text-primary" />
              <h6 className="mb-0 fw-semibold">Today's Schedule</h6>
            </div>
            {todaySchedule.length === 0 ? (
              <div className="empty-state py-4">
                <i className="bi bi-calendar-x empty-icon" style={{ fontSize: '2.5rem' }} />
                <h6>No appointments today</h6>
              </div>
            ) : (
              <div className="timeline p-3">
                {todaySchedule.map(a => (
                  <div key={a.id} className="timeline-item">
                    <div className="fw-semibold">{formatTime(a.start_time)}</div>
                    <div>{a.patient_name}</div>
                    <div className="text-muted" style={{ fontSize: '0.82rem' }}>{formatFee(a.total_fee)}</div>
                    <span className={`badge-status badge-${a.status} mt-1`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="col-md-7">
          <div className="table-card">
            <div className="p-3 border-bottom">
              <h6 className="mb-0 fw-semibold">Recent Appointments</h6>
            </div>
            {loading ? (
              <div className="p-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton skeleton-line mb-2" />)}</div>
            ) : recentAppts.length === 0 ? (
              <div className="empty-state py-4">
                <i className="bi bi-calendar-x empty-icon" style={{ fontSize: '2.5rem' }} />
                <h6>No appointments yet</h6>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppts.map(a => (
                      <tr key={a.id}>
                        <td className="fw-semibold">{a.patient_name}</td>
                        <td>{formatDate(a.date)}</td>
                        <td>{formatTime(a.start_time)}</td>
                        <td>
                          <span className={`badge-status badge-${a.status}`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
