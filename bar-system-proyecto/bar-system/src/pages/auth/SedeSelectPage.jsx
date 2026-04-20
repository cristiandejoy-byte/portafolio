import { useNavigate } from 'react-router-dom';
import { useAuth, SEDES } from '../../context/AuthContext';
import { MapPin, ArrowRight, Beer } from 'lucide-react';
import './SedeSelectPage.css';

export default function SedeSelectPage() {
  const { user, chooseSede } = useAuth();
  const navigate = useNavigate();

  function handleSelect(sede) {
    chooseSede(sede);
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="sede-page">
      <div className="sede-bg">
        <div className="sede-bg-glow" />
      </div>

      <div className="sede-container">
        <div className="sede-header">
          <div className="sede-icon">
            <Beer size={28} />
          </div>
          <h1>El Último Revolcón</h1>
          <p>
            Bienvenido, <strong>{user?.nombre}</strong>.<br />
            Selecciona la sede que deseas gestionar en esta sesión.
          </p>
        </div>

        <div className="sede-grid">
          {SEDES.map((sede) => (
            <button
              key={sede.id}
              className="sede-card"
              onClick={() => handleSelect(sede)}
            >
              <div className="sede-card-icon">
                <MapPin size={24} />
              </div>
              <div className="sede-card-info">
                <span className="sede-card-name">{sede.nombre}</span>
                <span className="sede-card-city">{sede.ciudad}</span>
              </div>
              <ArrowRight size={18} className="sede-card-arrow" />
            </button>
          ))}
        </div>

        <p className="sede-note">
          Puedes cambiar de sede en cualquier momento cerrando sesión.
        </p>
      </div>
    </div>
  );
}
