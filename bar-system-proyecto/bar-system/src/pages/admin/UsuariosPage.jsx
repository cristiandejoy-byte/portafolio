import { useState, useMemo, useEffect } from 'react';
import { useUsersStore } from '../../store/index.js';
import { SEDES } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast.jsx';
import Modal from '../../components/common/Modal.jsx';
import { Search, Plus, Edit2, UserX, UserCheck, Users, Filter } from 'lucide-react';
import './UsuariosPage.css';

const ROLES = ['ADMINISTRADOR', 'CAJERO', 'MESERO'];

const EMPTY_FORM = {
  nombre: '', username: '', password: '', email: '',
  rol: '', sedeId: '', activo: true,
};

export default function UsuariosPage() {
  const { users, addUser, updateUser, toggleActive, fetchUsers } = useUsersStore();
  const toast = useToast();

  useEffect(() => { fetchUsers(); }, []);

  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [filterSede, setFilterSede] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // HU-008: Listado con filtros
  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.nombre.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      const matchRol = !filterRol || u.rol === filterRol;
      const matchSede = !filterSede || String(u.sedeId) === filterSede;
      const matchEstado = filterEstado === '' ? true : u.activo === (filterEstado === 'activo');
      return matchSearch && matchRol && matchSede && matchEstado;
    });
  }, [users, search, filterRol, filterSede, filterEstado]);

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    activos: users.filter(u => u.activo).length,
    admins: users.filter(u => u.rol === 'ADMINISTRADOR').length,
  }), [users]);

  function openCreate() {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }

  // HU-006: Editar
  function openEdit(u) {
    setEditingUser(u);
    setForm({
      nombre: u.nombre,
      username: u.username,
      password: '',
      email: u.email || '',
      rol: u.rol,
      sedeId: u.sedeId ? String(u.sedeId) : '',
      activo: u.activo,
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate(f) {
    const e = {};
    if (!f.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!f.username.trim()) e.username = 'El usuario es obligatorio';
    else if (f.username.length < 4) e.username = 'Mínimo 4 caracteres';
    if (!editingUser && !f.password) e.password = 'La contraseña es obligatoria para usuarios nuevos';
    if (f.password && f.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (!f.rol) e.rol = 'Selecciona un rol';
    if (f.rol !== 'ADMINISTRADOR' && !f.sedeId) e.sedeId = 'Selecciona una sede';
    return e;
  }

  async function handleSave() {
    const e = validate(form);
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);

    const data = {
      nombre: form.nombre.trim(),
      username: form.username.trim().toLowerCase(),
      email: form.email.trim(),
      rol: form.rol,
      sedeId: form.rol === 'ADMINISTRADOR' ? null : Number(form.sedeId),
      activo: form.activo,
    };
    if (form.password) data.password = form.password;

    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
        toast('Usuario actualizado correctamente', 'success');
      } else {
        await addUser(data);
        toast('Usuario creado correctamente', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      toast(err.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  }

  // HU-007: Desactivar
  async function handleToggleActive(u) {
    try {
      await toggleActive(u.id);
      toast(
        u.activo ? `${u.nombre} ha sido desactivado` : `${u.nombre} fue reactivado`,
        u.activo ? 'warning' : 'success'
      );
    } catch (err) {
      toast(err.message || 'Error al cambiar estado', 'error');
    }
  }

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  const sedeNombre = (id) => SEDES.find(s => s.id === id)?.nombre || '—';

  return (
    <div className="usuarios-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">Administra cuentas, roles y accesos por sede</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-label">Total usuarios</p>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Activos</p>
          <p className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.activos}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Inactivos</p>
          <p className="stat-value" style={{ color: 'var(--color-danger)' }}>{stats.total - stats.activos}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="filter-bar">
          <div className="search-input-wrapper" style={{ flex: 2 }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, usuario o correo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={filterRol} onChange={e => setFilterRol(e.target.value)} style={{ width: 160 }}>
            <option value="">Todos los roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filterSede} onChange={e => setFilterSede(e.target.value)} style={{ width: 150 }}>
            <option value="">Todas las sedes</option>
            {SEDES.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ width: 140 }}>
            <option value="">Cualquier estado</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          {(search || filterRol || filterSede || filterEstado) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterRol(''); setFilterSede(''); setFilterEstado(''); }}>
              Limpiar
            </button>
          )}
        </div>

        <p className="text-xs text-muted" style={{ marginBottom: 12 }}>
          Mostrando {filtered.length} de {users.length} usuarios
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Sede</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state" style={{ padding: '32px 0' }}>
                      <Users size={36} />
                      <h4>Sin resultados</h4>
                      <p>Intenta con otros filtros</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id} style={{ opacity: u.activo ? 1 : 0.55 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="u-avatar">{u.nombre.charAt(0)}</div>
                      <span className="font-mono text-sm">{u.username}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{u.nombre}</td>
                  <td>
                    <span className={`badge ${u.rol === 'ADMINISTRADOR' ? 'badge-gold' : u.rol === 'CAJERO' ? 'badge-info' : 'badge-muted'}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td>{u.sedeId ? sedeNombre(u.sedeId) : <span className="text-muted">Global</span>}</td>
                  <td>
                    <span className={`badge ${u.activo ? 'badge-success' : 'badge-danger'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-muted text-sm">{u.createdAt}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-icon" title="Editar" onClick={() => openEdit(u)}>
                        <Edit2 size={15} />
                      </button>
                      <button
                        className={`btn btn-icon ${u.activo ? 'btn-danger' : 'btn-success'}`}
                        title={u.activo ? 'Desactivar' : 'Activar'}
                        onClick={() => handleToggleActive(u)}
                      >
                        {u.activo ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Guardando...</> : (editingUser ? 'Actualizar' : 'Crear Usuario')}
            </button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label>Nombre completo *</label>
            <input value={form.nombre} onChange={e => setField('nombre', e.target.value)} placeholder="Ej. Andrés Gómez" />
            {errors.nombre && <p className="form-error">{errors.nombre}</p>}
          </div>
          <div className="form-group">
            <label>Nombre de usuario *</label>
            <input value={form.username} onChange={e => setField('username', e.target.value)} placeholder="mesero_bog" />
            {errors.username && <p className="form-error">{errors.username}</p>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Contraseña {editingUser ? '(dejar vacío para no cambiar)' : '*'}</label>
            <input type="password" value={form.password} onChange={e => setField('password', e.target.value)} placeholder="••••••••" />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="usuario@revolcon.co" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Rol *</label>
            <select value={form.rol} onChange={e => setField('rol', e.target.value)}>
              <option value="">Seleccionar rol...</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.rol && <p className="form-error">{errors.rol}</p>}
          </div>
          <div className="form-group">
            <label>Sede asignada {form.rol !== 'ADMINISTRADOR' ? '*' : ''}</label>
            <select
              value={form.sedeId}
              onChange={e => setField('sedeId', e.target.value)}
              disabled={form.rol === 'ADMINISTRADOR'}
            >
              <option value="">
                {form.rol === 'ADMINISTRADOR' ? 'Global (todas las sedes)' : 'Seleccionar sede...'}
              </option>
              {SEDES.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
            {errors.sedeId && <p className="form-error">{errors.sedeId}</p>}
          </div>
        </div>

        {editingUser && (
          <div className="form-group">
            <label style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textTransform: 'none', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                style={{ width: 'auto' }}
                checked={form.activo}
                onChange={e => setField('activo', e.target.checked)}
              />
              Usuario activo
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
