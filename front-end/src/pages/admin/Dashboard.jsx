import { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import api from '../../api/axios';
import { formatFee } from '../../utils/feeDisplay';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/doctors?status=pending'),
    ]).then(([sRes, dRes]) => {
      setStats(sRes.data || sRes);
      setPendingDoctors((dRes.data || dRes)?.slice(0, 5) || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id, approve) => {
    setApproving(id);
    try {
      await api.patch(`/admin/doctors/${id}/${approve ? 'approve' : 'reject'}`);
      toast.success(approve ? 'Doctor approved!' : 'Doctor rejected');
      setPendingDoctors(prev => prev.filter(d => d.id !== id));
      if (stats) {
        setStats(prev => ({
          ...prev,
          pendingDoctors: prev.pendingDoctors - 1,
          approvedDoctors: approve ? prev.approvedDoctors + 1 : prev.approvedDoctors
        }));
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setApproving(null);
    }
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: 'bi-people-fill', color: 'blue' },
    { label: 'Total Doctors', value: stats.totalDoctors, icon: 'bi-person-badge', color: 'green' },
    { label: 'Approved Doctors', value: stats.approvedDoctors, icon: 'bi-shield-check', color: 'teal' },
    { label: 'Pending Approvals', value: stats.pendingDoctors, icon: 'bi-hourglass-split', color: 'orange' },
    { label: "Today's Appointments", value: stats.todayAppointments, icon: 'bi-calendar-day', color: 'purple' },
    { label: 'Total Revenue', value: formatFee(stats.totalRevenue), icon: 'bi-currency-rupee', color: 'green', isText: true },
  ] : [];

  const barData = {
    labels: stats?.last7Days?.map(d => new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })) || [],
    datasets: [{
      label: 'Appointments',
      data: stats?.last7Days?.map(d => d.count) || [],
      backgroundColor: 'rgba(79, 70, 229, 0.85)',
      borderColor: '#4f46e5',
      borderWidth: 0,
      borderRadius: 8,
      barPercentage: 0.6,
    }]
  };

  const STATUS_COLORS = {
    pending: '#fbbf24', confirmed: '#3b82f6', completed: '#10b981', cancelled: '#ef4444', rescheduled: '#8b5cf6'
  };

  const doughnutData = {
    labels: stats?.statusDist?.map(s => s.status) || [],
    datasets: [{
      data: stats?.statusDist?.map(s => s.count) || [],
      backgroundColor: stats?.statusDist?.map(s => STATUS_COLORS[s.status] || '#9ca3af') || [],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  if (loading) return (
    <div>
      <div className="row g-4 mb-4">{[...Array(6)].map((_, i) => <div key={i} className="col-md-2"><div className="skeleton skeleton-card" /></div>)}</div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-light">
        <div>
          <h2 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>
            <i className="bi bi-grid-fill me-2" style={{ color: 'var(--primary)' }} />
            Admin Overview
          </h2>
          <p className="text-secondary mb-0">Platform performance and user management</p>
        </div>
        <div className="d-none d-md-flex align-items-center gap-3 bg-white px-4 py-2 rounded-pill shadow-sm border border-light">
          <div className="text-end">
            <div className="text-uppercase text-muted" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px' }}>Today's Date</div>
            <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
            <i className="bi bi-calendar3 text-primary"></i>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row g-3 mb-4">
        {statCards.map((s, idx) => (
          <div key={s.label} className="col-6 col-md-4 col-lg-2" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'none'}>
              <div className="card-body p-3 p-xl-4 d-flex flex-column">
                <div className={`d-flex align-items-center justify-content-center mb-3 rounded-circle`} style={{ width: 44, height: 44, background: `var(--${s.color}-light, #f8f9fa)` }}>
                  <i className={`bi ${s.icon}`} style={{ fontSize: '1.25rem', color: `var(--${s.color}, #6c757d)` }} />
                </div>
                <div className="mt-auto">
                  <div className="fw-bold text-dark mb-1" style={{ fontSize: s.isText ? '1.4rem' : '1.75rem', lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div className="text-muted fw-medium" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {s.label}
                  </div>
                </div>
              </div>
              <div className="position-absolute bottom-0 start-0 w-100" style={{ height: 4, background: `var(--${s.color}, #6c757d)` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* Bar Chart */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent border-0 pt-4 pb-0 px-4">
              <h6 className="mb-0 fw-bold text-dark">Appointment Trends</h6>
              <p className="text-muted small mb-0">Last 7 days overview</p>
            </div>
            <div className="card-body px-4 pb-4 pt-3">
              {stats?.last7Days?.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { borderDash: [4, 4] }, ticks: { stepSize: 1 } }, x: { grid: { display: false } } } }} />
                </div>
              ) : <div className="text-muted d-flex h-100 align-items-center justify-content-center pb-4">No data available</div>}
            </div>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-transparent border-0 pt-4 pb-0 px-4">
              <h6 className="mb-0 fw-bold text-dark">Status Distribution</h6>
              <p className="text-muted small mb-0">Current appointment states</p>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center px-4 pb-4 pt-3">
              {stats?.statusDist?.length > 0 ? (
                <div style={{ width: '100%', maxWidth: 280, height: 280 }}>
                  <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }, cutout: '75%' }} />
                </div>
              ) : <div className="text-muted pb-4">No data available</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Doctors */}
      {pendingDoctors.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
            <h6 className="mb-0 fw-bold d-flex align-items-center">
              <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm" style={{ width: 32, height: 32 }}>
                <i className="bi bi-person-lines-fill" />
              </div>
              Pending Approvals
            </h6>
            <span className="badge bg-warning text-dark rounded-pill px-3 py-2 fw-semibold">{pendingDoctors.length} requests</span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 text-muted font-monospace" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>APPLICANT</th>
                  <th className="text-muted font-monospace" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>SPECIALIZATION</th>
                  <th className="text-muted font-monospace" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>PROPOSED FEE</th>
                  <th className="text-end pe-4 text-muted font-monospace" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {pendingDoctors.map(d => (
                  <tr key={d.id} className="border-bottom">
                    <td className="ps-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-circle bg-primary-light text-primary fw-bold" style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {d.name.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{d.name}</div>
                          <div className="text-muted small">{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="badge bg-light text-dark border px-2 py-1 rounded-pill">{d.specialization}</span>
                    </td>
                    <td className="fw-semibold text-success py-3">{formatFee(d.base_fee)}</td>
                    <td className="text-end pe-4 py-3">
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          className="btn btn-sm btn-outline-success rounded-pill px-3 fw-medium"
                          onClick={() => handleApprove(d.id, true)}
                          disabled={approving === d.id}
                        >
                          <i className="bi bi-check-lg me-1" />Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-medium"
                          onClick={() => handleApprove(d.id, false)}
                          disabled={approving === d.id}
                        >
                          <i className="bi bi-x-lg me-1" />Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
