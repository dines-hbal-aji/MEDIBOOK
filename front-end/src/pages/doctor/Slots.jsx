import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { formatDate, formatTime } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';

const DURATIONS = [15, 30, 45, 60];

const Slots = () => {
  const { doctor } = useAuth();
  const [mode, setMode] = useState('single');
  const [form, setForm] = useState({ date: '', from_date: '', to_date: '', start_time: '09:00', end_time: '17:00', duration: 30 });
  const [slots, setSlots] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const fetchSlots = () => {
    setLoading(true);
    const q = filterDate ? `?date=${filterDate}` : '';
    api.get(`/doctor/slots${q}`)
      .then(res => setSlots(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSlots(); }, [filterDate]);

  // Generate preview
  useEffect(() => {
    const { start_time, end_time, duration } = form;
    if (!start_time || !end_time || !duration) { setPreview([]); return; }

    const toMin = (t) => { const [h, m] = t.split(':'); return parseInt(h) * 60 + parseInt(m); };
    const toTime = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

    const slots = [];
    let cur = toMin(start_time);
    const end = toMin(end_time);
    while (cur + parseInt(duration) <= end) {
      slots.push({ start: toTime(cur), end: toTime(cur + parseInt(duration)) });
      cur += parseInt(duration);
    }
    setPreview(slots);
  }, [form.start_time, form.end_time, form.duration]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!doctor?.is_approved) {
      toast.error('Your account must be approved before creating slots');
      return;
    }
    setCreating(true);
    try {
      const body = { mode, start_time: form.start_time, end_time: form.end_time, duration: form.duration };
      if (mode === 'single') body.date = form.date;
      else { body.from_date = form.from_date; body.to_date = form.to_date; }

      const res = await api.post('/doctor/slots', body);
      toast.success(res.message || 'Slots created successfully');
      fetchSlots();
    } catch (err) {
      toast.error(err.message || 'Failed to create slots');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (slotId) => {
    try {
      await api.delete(`/doctor/slots/${slotId}`);
      toast.success('Slot deleted');
      fetchSlots();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const notApproved = !doctor?.is_approved;

  return (
    <div>
      <div className="page-header">
        <h2><i className="bi bi-clock me-2 text-primary" />Manage Slots</h2>
        <p className="text-muted">Create and manage your appointment slots</p>
      </div>

      {notApproved && (
        <div className="approval-banner mb-4">
          <i className="bi bi-lock-fill me-2 text-warning" />
          <strong>Account pending approval.</strong> Slot creation is disabled until your account is approved.
        </div>
      )}

      <div className="row g-4 mb-4">
        {/* Create Panel */}
        <div className="col-md-5">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0 fw-semibold"><i className="bi bi-plus-circle me-2 text-primary" />Create Slots</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleCreate}>
                {/* Mode Toggle */}
                <div className="mb-3">
                  <div className="btn-group w-100">
                    {['single', 'range'].map(m => (
                      <button
                        key={m}
                        type="button"
                        className={`btn ${mode === m ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setMode(m)}
                        disabled={notApproved}
                      >
                        {m === 'single' ? '📅 Single Date' : '📆 Date Range'}
                      </button>
                    ))}
                  </div>
                </div>

                {mode === 'single' ? (
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" min={today} value={form.date}
                      onChange={e => setForm(p => ({ ...p, date: e.target.value }))} disabled={notApproved} />
                  </div>
                ) : (
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">From</label>
                      <input type="date" className="form-control" min={today} value={form.from_date}
                        onChange={e => setForm(p => ({ ...p, from_date: e.target.value }))} disabled={notApproved} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">To</label>
                      <input type="date" className="form-control" min={form.from_date || today} value={form.to_date}
                        onChange={e => setForm(p => ({ ...p, to_date: e.target.value }))} disabled={notApproved} />
                    </div>
                  </div>
                )}

                <div className="row g-2 mb-3">
                  <div className="col-5">
                    <label className="form-label">Start Time</label>
                    <input type="time" className="form-control" value={form.start_time}
                      onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} disabled={notApproved} />
                  </div>
                  <div className="col-5">
                    <label className="form-label">End Time</label>
                    <input type="time" className="form-control" value={form.end_time}
                      onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} disabled={notApproved} />
                  </div>
                  <div className="col">
                    <label className="form-label">Duration</label>
                    <select className="form-select" value={form.duration}
                      onChange={e => setForm(p => ({ ...p, duration: parseInt(e.target.value) }))} disabled={notApproved}>
                      {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                </div>

                {preview.length > 0 && (
                  <div className="p-3 rounded-3 mb-3" style={{ background: 'var(--bg-light)', fontSize: '0.82rem' }}>
                    <div className="fw-semibold mb-2 text-muted">Preview ({preview.length} slots)</div>
                    <div className="d-flex flex-wrap gap-1">
                      {preview.slice(0, 8).map((s, i) => (
                        <span key={i} className="badge" style={{ background: '#e8f0fe', color: 'var(--primary)', fontWeight: 500 }}>
                          {formatTime(s.start)}
                        </span>
                      ))}
                      {preview.length > 8 && <span className="badge bg-secondary">+{preview.length - 8} more</span>}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100" disabled={creating || notApproved}>
                  {creating ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</> : <>
                    <i className="bi bi-plus-circle me-2" />Generate {preview.length > 0 ? `${preview.length} ` : ''}Slots
                  </>}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Slots Table */}
        <div className="col-md-7">
          <div className="table-card">
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom gap-2">
              <h6 className="mb-0 fw-semibold">My Slots</h6>
              <input type="date" className="form-control form-control-sm" style={{ maxWidth: 160 }}
                value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </div>
            {loading ? (
              <div className="p-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton skeleton-line mb-2" />)}</div>
            ) : slots.length === 0 ? (
              <div className="empty-state py-4">
                <i className="bi bi-clock empty-icon" style={{ fontSize: '2.5rem' }} />
                <h6>No slots found</h6>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Create slots using the panel on the left</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Patient</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map(s => (
                      <tr key={s.id}>
                        <td>{formatDate(s.date)}</td>
                        <td>{formatTime(s.start_time)} – {formatTime(s.end_time)}</td>
                        <td>
                          {s.is_booked
                            ? <span className="badge-status badge-confirmed">Booked</span>
                            : <span className="badge-status" style={{ background: '#d1e7dd', color: '#0f5132' }}>Available</span>}
                        </td>
                        <td className="text-muted" style={{ fontSize: '0.85rem' }}>{s.patient_name || '–'}</td>
                        <td>
                          {!s.is_booked && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(s.id)}
                              title="Delete slot"
                            >
                              <i className="bi bi-trash" />
                            </button>
                          )}
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

export default Slots;
