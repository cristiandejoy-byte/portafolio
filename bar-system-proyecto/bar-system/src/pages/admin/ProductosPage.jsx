import { useState, useMemo, useEffect } from 'react';
import { useInventoryStore } from '../../store/index.js';
import { useToast } from '../../components/common/Toast.jsx';
import Modal from '../../components/common/Modal.jsx';
import { Search, Plus, Edit2, ToggleLeft, ToggleRight, Package } from 'lucide-react';
import './ProductosPage.css';

const EMPTY_FORM = { nombre: '', categoria: '', precio: '', descripcion: '', activo: true };

function formatCOP(v) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);
}

export default function ProductosPage() {
  const { products, categories, addProduct, updateProduct, toggleProductActive, fetchProducts } = useInventoryStore();
  const toast = useToast();

  useEffect(() => { fetchProducts(); }, []);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const q = search.toLowerCase();
      const matchQ = !q || p.nombre.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q);
      const matchCat = !filterCat || p.categoria === filterCat;
      const matchEst = filterEstado === '' ? true : p.activo === (filterEstado === 'activo');
      return matchQ && matchCat && matchEst;
    });
  }, [products, search, filterCat, filterEstado]);

  const stats = useMemo(() => ({
    total: products.length,
    activos: products.filter(p => p.activo).length,
    cats: [...new Set(products.map(p => p.categoria))].length,
    avgPrice: products.filter(p => p.activo).reduce((s, p) => s + p.precio, 0) / (products.filter(p => p.activo).length || 1),
  }), [products]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({ nombre: p.nombre, categoria: p.categoria, precio: String(p.precio), descripcion: p.descripcion || '', activo: p.activo });
    setErrors({});
    setModalOpen(true);
  }

  function validate(f) {
    const e = {};
    if (!f.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!f.categoria) e.categoria = 'Selecciona una categoría';
    if (!f.precio || isNaN(Number(f.precio)) || Number(f.precio) <= 0) e.precio = 'Precio válido requerido (mayor a 0)';
    return e;
  }

  async function handleSave() {
    const e = validate(form);
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);

    const data = {
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      precio: Number(form.precio),
      descripcion: form.descripcion.trim(),
    };

    try {
      if (editing) {
        await updateProduct(editing.id, data);
        toast('Producto actualizado', 'success');
      } else {
        await addProduct(data);
        toast('Producto creado y agregado a todas las sedes', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      toast(err.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(p) {
    try {
      await toggleProductActive(p.id);
      toast(p.activo ? `${p.nombre} desactivado` : `${p.nombre} activado`, p.activo ? 'warning' : 'success');
    } catch (err) {
      toast(err.message || 'Error al cambiar estado', 'error');
    }
  }

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  const CAT_COLORS = {
    'Cervezas': 'badge-warning',
    'Cócteles': 'badge-info',
    'Licores': 'badge-gold',
    'Gaseosas & Jugos': 'badge-success',
    'Snacks': 'badge-muted',
    'Shots': 'badge-danger',
  };

  return (
    <div className="productos-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Maestra de Productos</h1>
          <p className="page-subtitle">Catálogo global disponible en todas las sedes</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-label">Total productos</p>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Activos</p>
          <p className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.activos}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Categorías</p>
          <p className="stat-value">{stats.cats}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Precio promedio</p>
          <p className="stat-value" style={{ fontSize: '1.25rem' }}>{formatCOP(Math.round(stats.avgPrice))}</p>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <div className="search-input-wrapper" style={{ flex: 2 }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ width: 180 }}>
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ width: 140 }}>
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          {(search || filterCat || filterEstado) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterCat(''); setFilterEstado(''); }}>
              Limpiar
            </button>
          )}
        </div>

        <p className="text-xs text-muted" style={{ marginBottom: 12 }}>
          {filtered.length} de {products.length} productos
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state" style={{ padding: '32px 0' }}>
                      <Package size={36} />
                      <h4>Sin productos</h4>
                      <p>Crea el primer producto del catálogo</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} style={{ opacity: p.activo ? 1 : 0.5 }}>
                  <td className="text-muted text-sm font-mono">#{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                  <td>
                    <span className={`badge ${CAT_COLORS[p.categoria] || 'badge-muted'}`}>
                      {p.categoria}
                    </span>
                  </td>
                  <td>
                    <span className="precio-chip">{formatCOP(p.precio)}</span>
                  </td>
                  <td className="text-sm text-muted truncate" style={{ maxWidth: 200 }}>
                    {p.descripcion || '—'}
                  </td>
                  <td>
                    <span className={`badge ${p.activo ? 'badge-success' : 'badge-danger'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-icon" title="Editar" onClick={() => openEdit(p)}>
                        <Edit2 size={15} />
                      </button>
                      <button
                        className={`btn btn-icon ${p.activo ? 'btn-danger' : 'btn-success'}`}
                        title={p.activo ? 'Desactivar' : 'Activar'}
                        onClick={() => handleToggle(p)}
                      >
                        {p.activo ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Producto' : 'Nuevo Producto'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving
                ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Guardando...</>
                : editing ? 'Actualizar' : 'Crear Producto'
              }
            </button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Nombre del producto *</label>
            <input value={form.nombre} onChange={e => setField('nombre', e.target.value)} placeholder="Ej. Cerveza Club Colombia" />
            {errors.nombre && <p className="form-error">{errors.nombre}</p>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Categoría *</label>
            <select value={form.categoria} onChange={e => setField('categoria', e.target.value)}>
              <option value="">Seleccionar categoría...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.categoria && <p className="form-error">{errors.categoria}</p>}
          </div>
          <div className="form-group">
            <label>Precio (COP) *</label>
            <input
              type="number"
              value={form.precio}
              onChange={e => setField('precio', e.target.value)}
              placeholder="15000"
              min={0}
            />
            {errors.precio && <p className="form-error">{errors.precio}</p>}
            {form.precio && !isNaN(Number(form.precio)) && (
              <p className="form-hint">{formatCOP(Number(form.precio))}</p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={e => setField('descripcion', e.target.value)}
            placeholder="Descripción breve del producto..."
            rows={3}
          />
        </div>

        {!editing && (
          <div className="alert alert-info" style={{ marginTop: 8 }}>
            <Package size={16} />
            <span>El producto se agregará con stock 0 en todas las sedes. Configura el stock en la sección de Inventario.</span>
          </div>
        )}
      </Modal>
    </div>
  );
}
