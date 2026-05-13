import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        role={user?.role}
        onClose={() => setSidebarOpen(false)}
        mobileOpen={sidebarOpen}
      />

      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={sidebarCollapsed ? { marginLeft: 0 } : {}}>
        <Navbar onToggleSidebar={toggleSidebar} />
        <div className="page-content fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
