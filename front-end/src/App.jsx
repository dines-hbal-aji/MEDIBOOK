import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LandingPage from './pages/LandingPage';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import DoctorList from './pages/user/DoctorList';
import DoctorDetail from './pages/user/DoctorDetail';
import MyAppointments from './pages/user/MyAppointments';
import Prescriptions from './pages/user/Prescriptions';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorProfile from './pages/doctor/Profile';
import Slots from './pages/doctor/Slots';
import DoctorAppointments from './pages/doctor/Appointments';
import AddPrescription from './pages/doctor/AddPrescription';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAppointments from './pages/admin/ManageAppointments';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<LandingPage />} />

            {/* User Routes */}
            <Route path="/user" element={
              <ProtectedRoute allowedRoles={['user']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="doctors" element={<DoctorList />} />
              <Route path="doctors/:id" element={<DoctorDetail />} />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="prescriptions" element={<Prescriptions />} />
            </Route>

            {/* Doctor Routes */}
            <Route path="/doctor" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="profile" element={<DoctorProfile />} />
              <Route path="slots" element={<Slots />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="prescriptions/add/:appointmentId" element={<AddPrescription />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="doctors" element={<ManageDoctors />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="appointments" element={<ManageAppointments />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '3rem' }} />
                <h3>Page Not Found</h3>
                <a href="/login" className="btn btn-primary">Go Home</a>
              </div>
            } />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{ fontSize: '0.875rem' }}
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
