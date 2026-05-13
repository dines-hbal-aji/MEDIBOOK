import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { formatDate, formatTime } from '../../utils/formatDate';
import { formatFee } from '../../utils/feeDisplay';

const STATUS_BADGE = {
  pending: 'badge-pending', confirmed: 'badge-confirmed',
  completed: 'badge-completed', cancelled: 'badge-cancelled', rescheduled: 'badge-rescheduled'
};

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAppts = () => {
    api.get('/doctor/appointments')
      .then(res => setAppointments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppts(); }, []);

  const handleComplete = async (id) => {
    try {
      await api.patch(`/doctor/appointments/${id}/complete`);
      toast.success('Appointment marked as completed');
      fetchAppts();
    } catch (err) {
      toast.error(err.message || 'Failed to complete appointment');
    }
  };

  const canComplete = (appt) => {
    return appt.status === 'confirmed';
  };

  const hasPrescription = (appt) => appt.status === 'completed';

  if (loading) return (
    <div>
      <div className="page-header"><h2>Appointments</h2></div>
      <div className="skeleton skeleton-card" style={{ height: 300 }} />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h2><i className="bi bi-calendar2-check me-2 text-primary" />My Appointments</h2>
        <p className="text-muted">View and manage patient appointments</p>
      </div>

      <div className="table-card">
        {appointments.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-calendar-x empty-icon" />
            <h5>No appointments yet</h5>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Fee</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="fw-semibold">{a.patient_name}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{a.patient_email}</div>
                    </td>
                    <td>{formatDate(a.date)}</td>
                    <td>{formatTime(a.start_time)} – {formatTime(a.end_time)}</td>
                    <td className="fw-semibold">{formatFee(a.total_fee)}</td>
                    <td className="text-muted" style={{ fontSize: '0.82rem', maxWidth: 120 }}>
                      <span className="text-truncate d-block">{a.notes || '–'}</span>
                    </td>
                    <td>
                      <span className={`badge-status ${STATUS_BADGE[a.status]}`}>{a.status}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {canComplete(a) && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleComplete(a.id)}
                          >
                            <i className="bi bi-check-circle me-1" />Complete
                          </button>
                        )}
                        {hasPrescription(a) && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/doctor/prescriptions/add/${a.id}`)}
                          >
                            <i className="bi bi-file-medical me-1" />Prescription
                          </button>
                        )}
                      </div>
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

export default DoctorAppointments;
