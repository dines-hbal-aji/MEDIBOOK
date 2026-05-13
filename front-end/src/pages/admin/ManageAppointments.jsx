import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDate, formatTime } from '../../utils/formatDate';
import { formatFee } from '../../utils/feeDisplay';

const STATUS_BADGE = {
  pending: 'badge-pending', confirmed: 'badge-confirmed',
  completed: 'badge-completed', cancelled: 'badge-cancelled', rescheduled: 'badge-rescheduled'
};

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', from_date: '', to_date: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAppts = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (filters.status) params.append('status', filters.status);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);

    api.get(`/admin/appointments?${params}`)
      .then(res => {
        setAppointments(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppts(); }, [filters, page]);

  const exportCSV = () => {
    const headers = ['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Doctor Fee', 'Commission', 'Total', 'Status'];
    const rows = appointments.map(a => [
      a.id, a.patient_name, a.doctor_name, a.date, a.start_time,
      a.doctor_fee, a.commission_amount, a.total_fee, a.status
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'appointments.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h2><i className="bi bi-calendar2-check me-2 text-primary" />All Appointments</h2>
          <p className="text-muted">{total} total appointments</p>
        </div>
        <button className="btn btn-outline-success" onClick={exportCSV}>
          <i className="bi bi-download me-2" />Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select className="form-select" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
                <option value="">All Statuses</option>
                {['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">From Date</label>
              <input type="date" className="form-control" value={filters.from_date}
                onChange={e => setFilters(p => ({ ...p, from_date: e.target.value }))} />
            </div>
            <div className="col-md-3">
              <label className="form-label">To Date</label>
              <input type="date" className="form-control" value={filters.to_date}
                onChange={e => setFilters(p => ({ ...p, to_date: e.target.value }))} />
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-outline-secondary w-100"
                onClick={() => { setFilters({ status: '', from_date: '', to_date: '' }); setPage(1); }}>
                <i className="bi bi-x-circle me-1" />Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="p-4">{[...Array(5)].map((_, i) => <div key={i} className="skeleton skeleton-line mb-3" style={{ height: 44 }} />)}</div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-calendar-x empty-icon" />
            <h5>No appointments found</h5>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Doctor Fee</th>
                    <th>Commission</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id}>
                      <td className="text-muted" style={{ fontSize: '0.82rem' }}>#{a.id}</td>
                      <td className="fw-semibold">{a.patient_name}</td>
                      <td>{a.doctor_name}</td>
                      <td>{formatDate(a.date)}</td>
                      <td style={{ fontSize: '0.85rem' }}>{formatTime(a.start_time)}</td>
                      <td>{formatFee(a.doctor_fee)}</td>
                      <td>{formatFee(a.commission_amount)}</td>
                      <td className="fw-semibold">{formatFee(a.total_fee)}</td>
                      <td>
                        <span className={`badge-status ${STATUS_BADGE[a.status]}`}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center p-3">
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p => p - 1)}>‹</button>
                    </li>
                    {[...Array(totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage(p => p + 1)}>›</button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageAppointments;
