import { Link } from 'react-router-dom';
import { Home, ShieldX } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: 16,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(239,68,68,0.1)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-danger)', marginBottom: 8,
      }}>
        <ShieldX size={40} />
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>Acceso Denegado</h2>
      <p style={{ maxWidth: 340, color: 'var(--color-text-muted)' }}>
        No tienes permisos para acceder a esta sección. Contacta al administrador si crees que es un error.
      </p>
      <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 8 }}>
        <Home size={16} />
        Volver al Dashboard
      </Link>
    </div>
  );
}
