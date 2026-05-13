import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { formatFee } from '../../utils/feeDisplay';
import { formatDate } from '../../utils/formatDate';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [actionId, setActionId] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const fetchDoctors = () => {
    setLoading(true);
    const q = tab !== 'all' ? `?status=${tab}` : '';
    api.get(`/admin/doctors${q}`)
      .then(res => setDoctors(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoctors(); }, [tab]);

  const handleAction = async (id, action) => {
    setActionId(id);
    try {
      await api.patch(`/admin/doctors/${id}/${action}`);
      toast.success(action === 'approve' ? 'Doctor approved!' : 'Doctor rejected');
      fetchDoctors();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div>
      <div className="page-header">
        <h2><i className="bi bi-person-badge me-2 text-primary" />Manage Doctors</h2>
      </div>

      <div className="table-card">
        <div className="custom-tabs border-bottom px-3">
          <ul className="nav">
            {['pending', 'approved', 'all'].map(t => (
              <li key={t} className="nav-item">
                <button className={`nav-link ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {loading ? (
          <div className="p-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton skeleton-line mb-3" style={{ height: 50 }} />)}</div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-person-x empty-icon" />
            <h5>No doctors found</h5>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Certificate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(d => (
                  <>
                    <tr key={d.id} onClick={() => setExpanded(expanded === d.id ? null : d.id)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="fw-semibold">{d.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>{formatDate(d.created_at)}</div>
                      </td>
                      <td className="text-muted">{d.email}</td>
                      <td>{d.specialization}</td>
                      <td>{d.experience_years} yrs</td>
                      <td>{formatFee(d.base_fee)}</td>
                      <td>
                        {d.certificate_path ? (
                          <a href={`${baseUrl}${d.certificate_path}`} target="_blank" rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-secondary" onClick={e => e.stopPropagation()}>
                            <i className="bi bi-file-earmark me-1" />View
                          </a>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        <span className={`badge-status ${d.is_approved ? 'badge-approved' : 'badge-not-approved'}`}>
                          {d.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {!d.is_approved ? (
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-success" onClick={() => handleAction(d.id, 'approve')} disabled={actionId === d.id}>
                              <i className="bi bi-check" />
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleAction(d.id, 'reject')} disabled={actionId === d.id}>
                              <i className="bi bi-x" />
                            </button>
                          </div>
                        ) : (
                          <button className="btn btn-sm btn-outline-warning" onClick={() => handleAction(d.id, 'reject')} disabled={actionId === d.id}>
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded === d.id && (
                      <tr key={`exp-${d.id}`}>
                        <td colSpan={8} style={{ background: '#f8faff' }}>
                          <div className="p-3">
                            <strong>Bio:</strong> {d.bio || 'No bio provided'}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDoctors;
