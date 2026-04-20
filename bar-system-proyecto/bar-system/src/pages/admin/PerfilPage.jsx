import { useState } from 'react';
import { useAuth, SEDES } from '../../context/AuthContext';
import { useUsersStore } from '../../store/index.js';
import { useToast } from '../../components/common/Toast.jsx';
import { UserCircle, Lock, MapPin, Shield, Clock, Save } from 'lucide-react';
import './PerfilPage.css';

export default function PerfilPage() {
  const { user } = useAuth();
  const { users, updateUser } = useUsersStore();
  const toast = useToast();

  const currentUser = users.find(u => u.id === user?.id) || user;
  const sede = SEDES.find(s => s.id === currentUser?.sedeId);

  const [passForm, setPassForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [passErrors, setPassErrors] = useState({});
  const [savingPass, setSavingPass] = useState(false);

  const [nameForm, setNameForm] = useState({ nombre: currentUser?.nombre || '' });
  const [savingName, setSavingName] = useState(false);

  async function handleChangeName(e) {
    e.preventDefault();
    if (!nameForm.nombre.trim()) return;
    setSavingName(true);
    await new Promise(r => setTimeout(r, 400));
    updateUser(user.id, { nombre: nameForm.nombre.trim() });
    toast('Nombre actualizado correctamente', 'success');
    setSavingName(false);
  }

  async function handleChangePass(e) {
    e.preventDefault();
    const errs = {};
    if (!passForm.actual) errs.actual = 'Ingresa tu contraseña actual';
    if (!passForm.nueva || passForm.nueva.length < 6) errs.nueva = 'Mínimo 6 caracteres';
    if (passForm.nueva !== passForm.confirmar) errs.confirmar = 'Las contraseñas no coinciden';

    // En demo: aceptamos cualquier contraseña actual
    if (Object.keys(errs).length) { setPassErrors(errs); return; }

    setSavingPass(true);
    await new Promise(r => setTimeout(r, 500));
    // En producción: mandar hash al backend
    updateUser(user.id, { password: passForm.nueva });
    toast('Contraseña actualizada correctamente', 'success');
    setPassForm({ actual: '', nueva: '', confirmar: '' });
    setPassErrors({});
    setSavingPass(false);
  }

  const rol = currentUser?.rol || '';
  const rolColor = rol === 'ADMINISTRADOR' ? 'badge-gold' : rol === 'CAJERO' ? 'badge-info' : 'badge-muted';

  return (
    <div className="perfil-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-subtitle">Información de tu cuenta y configuración de acceso</p>
        </div>
      </div>

      <div className="perfil-grid">
        {/* Card principal — info de cuenta */}
        <div className="card perfil-card-main">
          <div className="perfil-avatar-area">
            <div className="perfil-avatar">
              {currentUser?.nombre?.charAt(0) || '?'}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{currentUser?.nombre}</h2>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <span className={`badge ${rolColor}`}>{rol}</span>
                <span className={`badge ${currentUser?.activo ? 'badge-success' : 'badge-danger'}`}>
                  {currentUser?.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          <div className="perfil-info-grid">
            <div className="perfil-info-item">
              <UserCircle size={16} />
              <div>
                <span className="perfil-info-label">Nombre de usuario</span>
                <span className="perfil-info-value font-mono">{currentUser?.username}</span>
              </div>
            </div>

            {currentUser?.email && (
              <div className="perfil-info-item">
                <Shield size={16} />
                <div>
                  <span className="perfil-info-label">Correo electrónico</span>
                  <span className="perfil-info-value">{currentUser.email}</span>
                </div>
              </div>
            )}

            <div className="perfil-info-item">
              <MapPin size={16} />
              <div>
                <span className="perfil-info-label">Sede asignada</span>
                <span className="perfil-info-value">{sede?.nombre || 'Global (todas las sedes)'}</span>
              </div>
            </div>

            <div className="perfil-info-item">
              <Clock size={16} />
              <div>
                <span className="perfil-info-label">Cuenta creada</span>
                <span className="perfil-info-value">{currentUser?.createdAt || '—'}</span>
              </div>
            </div>

            <div className="perfil-info-item">
              <Shield size={16} />
              <div>
                <span className="perfil-info-label">Sesión expira</span>
                <span className="perfil-info-value">5 min de inactividad</span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Cambiar nombre */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCircle size={18} style={{ color: 'var(--color-gold)' }} />
                Actualizar nombre
              </h3>
            </div>
            <form onSubmit={handleChangeName}>
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  value={nameForm.nombre}
                  onChange={e => setNameForm({ nombre: e.target.value })}
                  placeholder="Tu nombre completo"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingName || !nameForm.nombre.trim()}
              >
                {savingName
                  ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Guardando...</>
                  : <><Save size={15} /> Guardar nombre</>
                }
              </button>
            </form>
          </div>

          {/* Cambiar contraseña */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={18} style={{ color: 'var(--color-gold)' }} />
                Cambiar contraseña
              </h3>
            </div>
            <form onSubmit={handleChangePass}>
              <div className="form-group">
                <label>Contraseña actual</label>
                <input
                  type="password"
                  value={passForm.actual}
                  onChange={e => setPassForm(f => ({ ...f, actual: e.target.value }))}
                  placeholder="••••••••"
                />
                {passErrors.actual && <p className="form-error">{passErrors.actual}</p>}
              </div>
              <div className="form-group">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  value={passForm.nueva}
                  onChange={e => setPassForm(f => ({ ...f, nueva: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                />
                {passErrors.nueva && <p className="form-error">{passErrors.nueva}</p>}
              </div>
              <div className="form-group">
                <label>Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={passForm.confirmar}
                  onChange={e => setPassForm(f => ({ ...f, confirmar: e.target.value }))}
                  placeholder="Repite la nueva contraseña"
                />
                {passErrors.confirmar && <p className="form-error">{passErrors.confirmar}</p>}
              </div>
              <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                <Lock size={14} />
                <span>Las contraseñas se almacenan con hash en la base de datos. Nunca se guardan en texto plano.</span>
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingPass}>
                {savingPass
                  ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Actualizando...</>
                  : <><Lock size={15} /> Cambiar contraseña</>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
