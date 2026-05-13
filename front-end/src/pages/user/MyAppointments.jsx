import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { formatDate, formatTime } from '../../utils/formatDate';
import { formatFee } from '../../utils/feeDisplay';

const STATUS_BADGE = {
  pending: 'badge-pending', confirmed: 'badge-confirmed',
  completed: 'badge-completed', cancelled: 'badge-cancelled', rescheduled: 'badge-rescheduled'
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [cancelModal, setCancelModal] = useState(null);
  const [reschedModal, setReschedModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = () => {
    api.get('/appointments/my')
      .then(res => setAppointments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, []);

  const now = new Date();

  const canModify = (appt) => {
    const slotDt = new Date(`${appt.date}T${appt.start_time}`);
    return (slotDt - now) > 24 * 60 * 60 * 1000;
  };

  const filtered = {
    upcoming: appointments.filter(a => ['confirmed', 'pending'].includes(a.status) && new Date(`${a.date}T${a.start_time}`) > now),
    past: appointments.filter(a => ['completed', 'rescheduled'].includes(a.status) || (new Date(`${a.date}T${a.start_time}`) <= now && ['confirmed', 'pending'].includes(a.status))),
    cancelled: appointments.filter(a => a.status === 'cancelled'),
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    setActionLoading(true);
    try {
      await api.patch(`/appointments/${cancelModal.id}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error(err.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
      setCancelModal(null);
    }
  };

  const handleReschedule = async () => {
    if (!reschedModal) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/appointments/${reschedModal.id}/reschedule`);
      toast.success(res.message || 'Appointment rescheduled successfully');
      fetchAppointments();
    } catch (err) {
      if (err.nextAvailableDate === null) {
        toast.error('No available slots for this doctor');
      } else {
        toast.error(err.message || 'Rescheduling failed');
      }
    } finally {
      setActionLoading(false);
      setReschedModal(null);
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Are you sure you want to mark this appointment as completed?')) return;
    try {
      await api.patch(`/appointments/${id}/complete`);
      toast.success('Appointment marked as completed');
      fetchAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to complete appointment');
    }
  };

  const AppointmentTable = ({ list }) => {
    if (list.length === 0) {
      return (
        <div className="empty-state">
          <i className="bi bi-calendar-x empty-icon" />
          <h5>No appointments here</h5>
          <p className="text-muted">Nothing to show in this category</p>
        </div>
      );
    }
    return (
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Fee</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map(a => {
              const modifiable = canModify(a) && ['confirmed', 'pending'].includes(a.status);
              return (
                <tr key={a.id}>
                  <td>
                    <div className="fw-semibold">{a.doctor_name}</div>
                    <div className="text-muted" style={{ fontSize: '0.82rem' }}>{a.specialization}</div>
                  </td>
                  <td>{formatDate(a.date)}</td>
                  <td>{formatTime(a.start_time)} – {formatTime(a.end_time)}</td>
                  <td className="fw-semibold">{formatFee(a.total_fee)}</td>
                  <td>
                    <span className={`badge-status ${STATUS_BADGE[a.status]}`}>{a.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2><i className="bi bi-calendar2-week me-2 text-primary" />My Appointments</h2>
      </div>

      <div className="table-card">
        <div className="custom-tabs border-bottom px-3">
          <ul className="nav">
            {[
              { key: 'upcoming', label: 'Upcoming', count: filtered.upcoming.length },
              { key: 'past', label: 'Past', count: filtered.past.length },
              { key: 'cancelled', label: 'Cancelled', count: filtered.cancelled.length },
            ].map(t => (
              <li key={t.key} className="nav-item">
                <button
                  className={`nav-link ${tab === t.key ? 'active' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span className="badge ms-2" style={{ background: tab === t.key ? 'var(--primary)' : '#e5e7eb', color: tab === t.key ? 'white' : '#6b7280', fontSize: '0.7rem' }}>
                      {t.count}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {loading ? (
          <div className="p-4">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton skeleton-line mb-3" style={{ height: 50 }} />)}
          </div>
        ) : (
          <AppointmentTable list={filtered[tab]} />
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16 }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-danger">Cancel Appointment</h5>
                <button className="btn-close" onClick={() => setCancelModal(null)} />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel your appointment with <strong>{cancelModal.doctor_name}</strong> on <strong>{formatDate(cancelModal.date)}</strong>?</p>
                <div className="alert alert-danger py-2" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-exclamation-triangle me-2" />This action cannot be undone.
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary" onClick={() => setCancelModal(null)}>Keep</button>
                <button className="btn btn-danger" onClick={handleCancel} disabled={actionLoading}>
                  {actionLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                  Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16 }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Reschedule Appointment</h5>
                <button className="btn-close" onClick={() => setReschedModal(null)} />
              </div>
              <div className="modal-body">
                <p>We'll automatically move you to the <strong>next available slot</strong> for <strong>{reschedModal.doctor_name}</strong>.</p>
                <div className="alert alert-info py-2" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-info-circle me-2" />
                  The system will find the earliest available slot after your current appointment date.
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary" onClick={() => setReschedModal(null)}>Cancel</button>
                <button className="btn btn-warning text-dark" onClick={handleReschedule} disabled={actionLoading}>
                  {actionLoading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-arrow-repeat me-2" />}
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
