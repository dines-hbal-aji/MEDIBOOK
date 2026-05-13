import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_DASHBOARDS = {
  admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  user: '/user/dashboard'
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, token } = useAuth();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_DASHBOARDS[user.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
