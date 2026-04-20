import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
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
        <AlertTriangle size={40} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', lineHeight: 1, color: 'var(--color-gold)' }}>404</h1>
      <h2 style={{ fontFamily: 'var(--font-display)' }}>Página no encontrada</h2>
      <p style={{ maxWidth: 320, color: 'var(--color-text-muted)' }}>
        La ruta que intentas acceder no existe o no tienes permisos para verla.
      </p>
      <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 8 }}>
        <Home size={16} />
        Ir al Dashboard
      </Link>
    </div>
  );
}
