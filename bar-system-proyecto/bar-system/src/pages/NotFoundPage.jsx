import { useNavigate } from 'react-router-dom';
import { Beer } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', gap: 20, padding: 24, textAlign: 'center',
    }}>
      <Beer size={56} style={{ color: 'var(--color-gold)', opacity: 0.5 }} />
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '5rem', color: 'var(--color-gold)', opacity: 0.4, lineHeight: 1 }}>
        404
      </h1>
      <h2>Página no encontrada</h2>
      <p style={{ maxWidth: 320, color: 'var(--color-text-muted)' }}>
        La ruta que buscas no existe en el sistema de gestión.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        Volver al inicio
      </button>
    </div>
  );
}
