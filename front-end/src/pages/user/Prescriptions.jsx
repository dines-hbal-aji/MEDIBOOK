import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatDate';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/prescriptions/my')
      .then(res => setPrescriptions(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="page-header"><h2>Prescriptions</h2></div>
      <div className="row g-4">
        {[...Array(3)].map((_, i) => <div key={i} className="col-md-6"><div className="skeleton skeleton-card" style={{ height: 220 }} /></div>)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h2><i className="bi bi-file-medical me-2 text-primary" />My Prescriptions</h2>
        <p className="text-muted">View prescriptions from your doctors</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-file-earmark-medical empty-icon" />
          <h5>No prescriptions yet</h5>
          <p className="text-muted">Prescriptions from your completed appointments will appear here</p>
        </div>
      ) : (
        <div className="row g-4">
          {prescriptions.map(p => (
            <div key={p.id} className="col-md-6">
              <div className="prescription-card">
                <div className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="fw-bold mb-0">{p.doctor_name}</h6>
                      <div className="text-primary" style={{ fontSize: '0.875rem' }}>{p.specialization}</div>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.82rem' }}>{formatDate(p.appointment_date)}</div>
                  </div>

                  <div className="mb-3">
                    <div className="fw-semibold text-muted mb-1" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Diagnosis</div>
                    <div>{p.diagnosis}</div>
                  </div>

                  {p.medicines && p.medicines.length > 0 && (
                    <div className="mb-3">
                      <div className="fw-semibold text-muted mb-2" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Medicines</div>
                      {p.medicines.map((m, i) => (
                        <div key={i} className="medicine-row">
                          <div className="fw-semibold">{m.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                            {m.dosage} · {m.frequency} · {m.duration}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {p.instructions && (
                    <div className="mb-3">
                      <div className="fw-semibold text-muted mb-1" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Instructions</div>
                      <div className="text-muted">{p.instructions}</div>
                    </div>
                  )}

                  {p.follow_up_date && (
                    <div className="p-2 rounded-3" style={{ background: '#e8f0fe', fontSize: '0.875rem' }}>
                      <i className="bi bi-calendar-event me-2 text-primary" />
                      Follow-up: <strong>{formatDate(p.follow_up_date)}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
