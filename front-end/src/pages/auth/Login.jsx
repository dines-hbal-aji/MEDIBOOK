import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ROLE_DASH = { admin: '/admin/dashboard', doctor: '/doctor/dashboard', user: '/user/dashboard' };

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) navigate(ROLE_DASH[user.role] || '/user/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { user: u } = await login(form.email, form.password);
      toast.success(`Welcome back, ${u.name}!`);
      navigate(ROLE_DASH[u.role] || '/user/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email, password) => setForm({ email, password });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d1b2a 0%, #1a2f4e 50%, #0d6efd22 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #0d6efd, #6610f2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(13,110,253,0.4)' }}>
            <i className="bi bi-heart-pulse-fill text-white fs-2" />
          </div>
          <h2 style={{ color: 'white', fontWeight: 700, marginBottom: 4 }}>MediBook</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Your healthcare companion</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h4 style={{ fontWeight: 700, marginBottom: 0.25 }}>Sign in</h4>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>Access your account</p>

          {location.state?.message && (
            <div className="alert alert-success py-2 mb-3" style={{ fontSize: '0.875rem' }}>
              <i className="bi bi-check-circle me-2" />{location.state.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope" /></span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock" /></span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button type="button" className="input-group-text" onClick={() => setShowPass(!showPass)}>
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={loading}
              style={{ fontSize: '1rem', borderRadius: 10 }}
            >
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : 'Sign in'}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted" style={{ fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/register" className="text-primary fw-semibold text-decoration-none">Register</Link>
            </span>
          </div>

          {/* Quick login hints */}
          <div className="mt-4 p-3 rounded-3" style={{ background: '#f8f9ff', border: '1px dashed #c7d2fe' }}>
            <div className="text-muted mb-2" style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Quick Demo Login
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {[
                { label: 'Admin', email: 'admin@medibook.com', pw: 'Admin@123', color: 'purple' },
                { label: 'Doctor', email: 'robert.mao@medibook.com', pw: 'RobertMao@123', color: 'success' },
                { label: 'Patient', email: 'john@medibook.com', pw: 'Patient@123', color: 'primary' },
              ].map(q => (
                <button
                  key={q.label}
                  type="button"
                  className={`btn btn-sm btn-outline-${q.color === 'purple' ? 'secondary' : q.color}`}
                  onClick={() => quickLogin(q.email, q.pw)}
                  style={{ fontSize: '0.78rem' }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
