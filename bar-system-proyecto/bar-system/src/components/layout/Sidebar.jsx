import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import {
  LayoutDashboard, Users, Package, ChevronLeft, ChevronRight,
  LogOut, Beer, MapPin, BarChart2, ShieldCheck,
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = {
  ADMINISTRADOR: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/usuarios',  icon: Users,           label: 'Usuarios' },
    { to: '/productos', icon: Package,         label: 'Productos' },
    { to: '/inventario',icon: BarChart2,       label: 'Inventario' },
    { to: '/auditoria', icon: ShieldCheck,     label: 'Auditoría' },
  ],
  CAJERO: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ],
  MESERO: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ],
};

export default function Sidebar() {
  const { user, selectedSede, logout } = useAuth();
  const { collapsed, toggle } = useSidebar();
  const navigate = useNavigate();

  const items = NAV_ITEMS[user?.rol] || [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Beer size={22} />
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <span className="sidebar-brand">Último Revolcón</span>
            <span className="sidebar-tagline">Nexus Software Factory</span>
          </div>
        )}
      </div>

      {/* Sede indicator */}
      {selectedSede && !collapsed && (
        <div className="sidebar-sede">
          <MapPin size={12} />
          <span>Sede {selectedSede.nombre}</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        {!collapsed && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.nombre?.charAt(0) || '?'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.nombre}</span>
              <span className="sidebar-user-role">{user?.rol}</span>
            </div>
          </div>
        )}
        <button
          className="sidebar-link sidebar-logout"
          onClick={handleLogout}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button className="sidebar-toggle" onClick={toggle} aria-label="Toggle sidebar">
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
