import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';
import { useInactivityLogout } from '../../hooks/useInactivityLogout';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import './AppLayout.css';

function InnerLayout() {
  const { user, selectedSede, logout } = useAuth();
  const { collapsed } = useSidebar();
  const navigate = useNavigate();

  // HU-003: cierre de sesión automático por inactividad (5 min)
  useInactivityLogout(() => {
    logout();
    navigate('/login');
  }, !!user);

  return (
    <div className={`app-layout${collapsed ? ' layout-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-body">
        <Topbar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { user, selectedSede } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.rol === 'ADMINISTRADOR' && !selectedSede) {
    return <Navigate to="/elegir-sede" replace />;
  }

  return (
    <SidebarProvider>
      <InnerLayout />
    </SidebarProvider>
  );
}
