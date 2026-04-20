import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { Menu, MapPin, ChevronRight, Bell, Home } from 'lucide-react';
import './Topbar.css';

const ROUTE_LABELS = {
  '/dashboard':  'Dashboard',
  '/usuarios':   'Gestión de Usuarios',
  '/productos':  'Maestra de Productos',
  '/inventario': 'Inventario',
  '/auditoria':  'Auditoría',
  '/perfil':     'Mi Perfil',
};

export default function Topbar() {
  const { user, selectedSede } = useAuth();
  const { toggle } = useSidebar();
  const location = useLocation();

  const label = ROUTE_LABELS[location.pathname] || 'Panel';

  return (
    <header className="topbar">
      {/* Left: hamburger + breadcrumb */}
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={toggle} aria-label="Toggle sidebar">
          <Menu size={20} />
        </button>

        <nav className="topbar-breadcrumb" aria-label="breadcrumb">
          <Link to="/dashboard" className="topbar-crumb topbar-crumb-home">
            <Home size={14} />
          </Link>
          {location.pathname !== '/dashboard' && (
            <>
              <ChevronRight size={13} className="topbar-crumb-sep" />
              <span className="topbar-crumb topbar-crumb-active">{label}</span>
            </>
          )}
        </nav>
      </div>

      {/* Right: sede + user */}
      <div className="topbar-right">
        {selectedSede && (
          <div className="topbar-sede">
            <MapPin size={13} />
            <span>{selectedSede.nombre}</span>
          </div>
        )}

        <div className="topbar-user">
          <div className="topbar-avatar">
            {user?.nombre?.charAt(0) || '?'}
          </div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.nombre?.split(' ')[0]}</span>
            <span className="topbar-user-role">{user?.rol}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
