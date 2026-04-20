import { useState, useMemo, useEffect } from 'react';
import { useInventoryStore } from '../../store/index.js';
import { useAuth, SEDES } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast.jsx';
import Modal from '../../components/common/Modal.jsx';
import {
  Search, AlertTriangle, Settings,
  Package, MapPin, RefreshCw
} from 'lucide-react';
import './InventarioPage.css';

function formatCOP(v) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);
}

function StockBar({ cantidad, minimo, maximo = 100 }) {
  const pct = Math.min(100, (cantidad / Math.max(maximo, 1)) * 100);
  const cls = cantidad <= 0 ? 'low' : cantidad <= minimo ? 'medium' : 'high';
  return (
    <div className="stock-bar">
      <div className="stock-track">
        <div className="stock-fill" style={{ width: `${pct}%` }} data-level={cls} />
      </div>
      <span style={{
        fontSize: '0.8rem',
        fontWeight: 700,
        color: cls === 'low' ? 'var(--color-danger)' : cls === 'medium' ? 'var(--color-warning)' : 'var(--color-success)',
        minWidth: 28,
        textAlign: 'right',
      }}>
        {cantidad}
      </span>
    </div>
  );
}

export default function InventarioPage() {
  const { isAdmin, selectedSede } = useAuth();
  const { products, stock, setStock, adjustStock, fetchProducts, fetchStock } = useInventoryStore();
  const toast = useToast();

  const [viewSedeId, setViewSedeId] = useState(selectedSede?.id || SEDES[0].id);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterAlerta, setFilterAlerta] = useState(false);

  const [modalStock, setModalStock] = useState(false);
  const [stockEdit, setStockEdit] = useState({ productoId: null, nombre: '', cantidad: 0, minimo: 5 });

  const [modalAjuste, setModalAjuste] = useState(false);
  const [ajusteForm, setAjusteForm] = useState({ productoId: null, nombre: '', delta: '', motivo: '' });
  const [ajusteErrors, setAjusteErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Cargar productos y stock al montar y cuando cambia la sede
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchStock(viewSedeId);
  }, [viewSedeId]);

  const viewSede = SEDES.find(s => s.id === viewSedeId);
  const sedeStock = stock[viewSedeId] || {};

  const rows = useMemo(() => {
    return products
      .filter(p => p.activo)
      .map(p => {
        const s = sedeStock[p.id] || { cantidad: 0, minimo: 5 };
        return { ...p, cantidad: s.cantidad, minimo: s.minimo };
      })
      .filter(p => {
        const q = search.toLowerCase();
        const matchQ = !q || p.nombre.toLowerCase().includes(q);
        const matchCat = !filterCat || p.categoria === filterCat;
        const matchAlerta = !filterAlerta || p.cantidad <= p.minimo;
        return matchQ && matchCat && matchAlerta;
      });
  }, [products, sedeStock, search, filterCat, filterAlerta]);

  const stats = useMemo(() => {
    const all = products.filter(p => p.activo).map(p => {
      const s = sedeStock[p.id] || { cantidad: 0, minimo: 5 };
      return { ...p, cantidad: s.cantidad, minimo: s.minimo };
    });
    return {
      totalItems: all.reduce((acc, p) => acc + p.cantidad, 0),
      lowCount: all.filter(p => p.cantidad <= p.minimo).length,
      outCount: all.filter(p => p.cantidad === 0).length,
      valorTotal: all.reduce((acc, p) => acc + p.cantidad * p.precio, 0),
    };
  }, [products, sedeStock]);

  const categories = [...new Set(products.map(p => p.categoria))].sort();

  function openSetStock(p) {
    const s = sedeStock[p.id] || { cantidad: 0, minimo: 5 };
    setStockEdit({ productoId: p.id, nombre: p.nombre, cantidad: s.cantidad, minimo: s.minimo });
    setModalStock(true);
  }

  async function handleSaveStock() {
    setSaving(true);
    try {
      await setStock(viewSedeId, stockEdit.productoId, stockEdit.cantidad, stockEdit.minimo);
      toast(`Stock de "${stockEdit.nombre}" actualizado → ${stockEdit.cantidad} uds`, 'success');
      setModalStock(false);
    } catch (err) {
      toast(err.message || 'Error al guardar stock', 'error');
    } finally {
      setSaving(false);
    }
  }

  function openAjuste(p) {
    setAjusteForm({ productoId: p.id, nombre: p.nombre, delta: '', motivo: '' });
    setAjusteErrors({});
    setModalAjuste(true);
  }

  async function handleSaveAjuste() {
    const e = {};
    if (!ajusteForm.delta || isNaN(Number(ajusteForm.delta)) || Number(ajusteForm.delta) === 0)
      e.delta = 'Ingresa un valor distinto de cero (positivo para añadir, negativo para restar)';
    if (!ajusteForm.motivo.trim()) e.motivo = 'El motivo es obligatorio para auditoría';
    if (Object.keys(e).length) { setAjusteErrors(e); return; }

    setSaving(true);
    try {
      const delta = Number(ajusteForm.delta);
      await adjustStock(viewSedeId, ajusteForm.productoId, delta, ajusteForm.motivo);
      toast(
        `Ajuste registrado: ${delta > 0 ? '+' : ''}${delta} uds en "${ajusteForm.nombre}"`,
        delta > 0 ? 'success' : 'warning'
      );
      setModalAjuste(false);
    } catch (err) {
      toast(err.message || 'Error al registrar ajuste', 'error');
    } finally {
      setSaving(false);
    }
  }

  const levelClass = (p) => p.cantidad === 0 ? 'level-out' : p.cantidad <= p.minimo ? 'level-low' : 'level-ok';

  return (
    <div className="inventario-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario</h1>
          <p className="page-subtitle">Stock en tiempo real por sede</p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={16} style={{ color: 'var(--color-gold)' }} />
            <select
              value={viewSedeId}
              onChange={e => setViewSedeId(Number(e.target.value))}
              style={{ width: 160 }}
            >
              {SEDES.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-label">Unidades totales</p>
          <p className="stat-value">{stats.totalItems}</p>
          <p className="stat-sub">en {viewSede?.nombre}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Valor estimado</p>
          <p className="stat-value" style={{ fontSize: '1.2rem', color: 'var(--color-gold)' }}>
            {formatCOP(stats.valorTotal)}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Stock bajo</p>
          <p className="stat-value" style={{ color: stats.lowCount > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
            {stats.lowCount}
          </p>
          <p className="stat-sub">productos bajo mínimo</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Agotados</p>
          <p className="stat-value" style={{ color: stats.outCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {stats.outCount}
          </p>
          <p className="stat-sub">requieren reposición urgente</p>
        </div>
      </div>

      {stats.lowCount > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} />
          <span>
            <strong>{stats.lowCount} producto(s)</strong> están en o por debajo del stock mínimo en la sede {viewSede?.nombre}.
            {stats.outCount > 0 && <> <strong>{stats.outCount}</strong> están completamente agotados.</>}
          </span>
        </div>
      )}

      <div className="card">
        <div className="filter-bar">
          <div className="search-input-wrapper" style={{ flex: 2 }}>
            <Search size={16} />
            <input
              placeholder="Buscar producto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ width: 180 }}>
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            className={`btn btn-sm ${filterAlerta ? 'btn-danger' : 'btn-ghost'}`}
            onClick={() => setFilterAlerta(a => !a)}
          >
            <AlertTriangle size={14} />
            Solo alertas
          </button>
        </div>

        <p className="text-xs text-muted" style={{ marginBottom: 12 }}>
          {rows.length} productos · Sede: {viewSede?.nombre}
        </p>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th style={{ minWidth: 200 }}>Stock actual</th>
                <th>Mínimo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state" style={{ padding: '32px 0' }}>
                      <Package size={36} />
                      <h4>Sin productos</h4>
                    </div>
                  </td>
                </tr>
              ) : rows.map(p => (
                <tr key={p.id} className={levelClass(p)}>
                  <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                  <td><span className="badge badge-muted">{p.categoria}</span></td>
                  <td className="font-mono text-sm" style={{ color: 'var(--color-gold)' }}>{formatCOP(p.precio)}</td>
                  <td style={{ minWidth: 180 }}>
                    <StockBar cantidad={p.cantidad} minimo={p.minimo} maximo={80} />
                  </td>
                  <td className="text-muted text-sm">{p.minimo}</td>
                  <td>
                    {p.cantidad === 0
                      ? <span className="badge badge-danger">Agotado</span>
                      : p.cantidad <= p.minimo
                        ? <span className="badge badge-warning">Stock bajo</span>
                        : <span className="badge badge-success">OK</span>
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-icon" title="Configurar stock" onClick={() => openSetStock(p)}>
                        <Settings size={15} />
                      </button>
                      <button className="btn btn-ghost btn-icon" title="Ajuste manual" onClick={() => openAjuste(p)}>
                        <RefreshCw size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Configurar stock */}
      <Modal
        isOpen={modalStock}
        onClose={() => setModalStock(false)}
        title={`Configurar Stock · ${stockEdit.nombre}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalStock(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSaveStock} disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Guardando...</> : 'Guardar Stock'}
            </button>
          </>
        }
      >
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          <MapPin size={16} />
          <span>Configurando stock para la sede <strong>{viewSede?.nombre}</strong></span>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Cantidad actual (unidades)</label>
            <input
              type="number" min={0}
              value={stockEdit.cantidad}
              onChange={e => setStockEdit(s => ({ ...s, cantidad: Number(e.target.value) }))}
            />
          </div>
          <div className="form-group">
            <label>Stock mínimo (alerta)</label>
            <input
              type="number" min={0}
              value={stockEdit.minimo}
              onChange={e => setStockEdit(s => ({ ...s, minimo: Number(e.target.value) }))}
            />
            <p className="form-hint">Se mostrará alerta cuando el stock caiga a este nivel o menos</p>
          </div>
        </div>
      </Modal>

      {/* Modal: Ajuste manual */}
      <Modal
        isOpen={modalAjuste}
        onClose={() => setModalAjuste(false)}
        title={`Ajuste Manual · ${ajusteForm.nombre}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalAjuste(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSaveAjuste} disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Registrando...</> : 'Registrar Ajuste'}
            </button>
          </>
        }
      >
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} />
          <span>Este ajuste quedará registrado en el log de auditoría con tu usuario, IP y timestamp.</span>
        </div>
        <div className="form-group">
          <label>Cantidad a ajustar</label>
          <input
            type="number"
            value={ajusteForm.delta}
            onChange={e => {
              setAjusteForm(f => ({ ...f, delta: e.target.value }));
              setAjusteErrors(er => { const n = { ...er }; delete n.delta; return n; });
            }}
            placeholder="Ej. +10 para añadir, -5 para restar"
          />
          {ajusteErrors.delta && <p className="form-error">{ajusteErrors.delta}</p>}
          <p className="form-hint">Usa valores positivos para agregar stock y negativos para reducirlo.</p>
        </div>
        <div className="form-group">
          <label>Motivo del ajuste *</label>
          <textarea
            value={ajusteForm.motivo}
            onChange={e => {
              setAjusteForm(f => ({ ...f, motivo: e.target.value }));
              setAjusteErrors(er => { const n = { ...er }; delete n.motivo; return n; });
            }}
            placeholder="Ej. Corrección de conteo físico, merma por derrame, recepción de pedido..."
            rows={3}
          />
          {ajusteErrors.motivo && <p className="form-error">{ajusteErrors.motivo}</p>}
        </div>
      </Modal>
    </div>
  );
}
