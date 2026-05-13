import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatDate';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [toggling, setToggling] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (roleFilter) params.append('role', roleFilter);
    api.get(`/admin/users?${params}`)
      .then(res => setUsers(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const res = await api.patch(`/admin/users/${id}/toggle`);
      toast.success(res.message);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: u.is_active ? 0 : 1 } : u));
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setToggling(null);
    }
  };

  const ROLE_COLORS = { admin: '#6610f2', doctor: '#0d6efd', user: '#198754' };

  return (
    <div>
      <div className="page-header">
        <h2><i className="bi bi-people-fill me-2 text-primary" />Manage Users</h2>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-7">
              <div className="search-box">
                <i className="bi bi-search search-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="user">Patients</option>
                <option value="doctor">Doctors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={() => { setSearch(''); setRoleFilter(''); }}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="p-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton skeleton-line mb-3" style={{ height: 44 }} />)}</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-person-x empty-icon" />
            <h5>No users found</h5>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="fw-semibold">{u.name}</td>
                    <td className="text-muted">{u.email}</td>
                    <td className="text-muted">{u.phone || '—'}</td>
                    <td>
                      <span className="badge" style={{ background: ROLE_COLORS[u.role] + '22', color: ROLE_COLORS[u.role], fontSize: '0.78rem', fontWeight: 600 }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.85rem' }}>{formatDate(u.created_at)}</td>
                    <td>
                      <span className={`badge-status ${u.is_active ? 'badge-approved' : 'badge-not-approved'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => handleToggle(u.id)}
                        disabled={toggling === u.id}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
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

export default ManageUsers;
