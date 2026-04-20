import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Beer, AlertCircle, Loader } from 'lucide-react';
import './Login.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = await login(form.username, form.password);

      // HU-004: Si es admin → elegir sede primero
      if (user.rol === 'ADMINISTRADOR') {
        navigate('/elegir-sede', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
      </div>

      <div className="login-container">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <Beer size={28} />
          </div>
          <div>
            <h1 className="login-brand-name">El Último Revolcón</h1>
            <p className="login-brand-sub">Sistema de Gestión de Bar · Nexus Software Factory</p>
          </div>
        </div>

        {/* Card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2>Iniciar Sesión</h2>
            <p>Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                placeholder="ej. admin"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="login-pass-wrapper">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-pass-toggle"
                  onClick={() => setShowPass(s => !s)}
                  aria-label={showPass ? 'Ocultar' : 'Mostrar'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18 }} />
                  Verificando...
                </>
              ) : (
                'Entrar al sistema'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="login-demo">
            <p className="login-demo-title">Credenciales de prueba</p>
            <div className="login-demo-grid">
              {[
                { role: 'Admin', user: 'admin', pass: 'admin123' },
                { role: 'Cajero', user: 'cajero_bog', pass: 'cajero123' },
                { role: 'Mesero', user: 'mesero_bog', pass: 'mesero123' },
              ].map(c => (
                <button
                  key={c.role}
                  type="button"
                  className="login-demo-btn"
                  onClick={() => setForm({ username: c.user, password: c.pass })}
                >
                  <span className="login-demo-role">{c.role}</span>
                  <span className="login-demo-user">{c.user}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="login-footer">
          © 2026 Nexus Software Factory · Confidencial
        </p>
      </div>
    </div>
  );
}
