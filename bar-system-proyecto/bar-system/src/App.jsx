import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast.jsx';
import AppLayout from './components/layout/AppLayout.jsx';

// Pages
import LoginPage        from './pages/auth/LoginPage.jsx';
import SedeSelectPage   from './pages/auth/SedeSelectPage.jsx';
import DashboardPage    from './pages/dashboard/DashboardPage.jsx';
import UsuariosPage     from './pages/admin/UsuariosPage.jsx';
import ProductosPage    from './pages/admin/ProductosPage.jsx';
import InventarioPage   from './pages/inventory/InventarioPage.jsx';
import AuditoriaPage    from './pages/auditoria/AuditoriaPage.jsx';
import NotFoundPage     from './pages/misc/NotFoundPage.jsx';
import AccessDeniedPage from './pages/misc/AccessDeniedPage.jsx';

// ── Guards ──────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user)    return <Navigate to="/login" replace />;
  if (!isAdmin) return <AccessDeniedPage />;
  return children;
}

function SedeGuard({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol !== 'ADMINISTRADOR') return <Navigate to="/dashboard" replace />;
  return children;
}

// ── Router ──────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Sede selection — admin only, after first login */}
      <Route path="/elegir-sede" element={
        <SedeGuard><SedeSelectPage /></SedeGuard>
      } />

      {/* Protected shell */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/usuarios"   element={<RequireAdmin><UsuariosPage /></RequireAdmin>} />
        <Route path="/productos"  element={<RequireAdmin><ProductosPage /></RequireAdmin>} />
        <Route path="/inventario" element={<RequireAdmin><InventarioPage /></RequireAdmin>} />
        <Route path="/auditoria"  element={<RequireAdmin><AuditoriaPage /></RequireAdmin>} />
        <Route path="/403"        element={<AccessDeniedPage />} />
        <Route path="/404"        element={<NotFoundPage />} />
        <Route path="*"           element={<NotFoundPage />} />
      </Route>

      {/* Root */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
