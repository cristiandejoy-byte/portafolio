import { useState, useMemo, useEffect, useCallback } from 'react';
import { useToast } from '../../components/common/Toast.jsx';
import { SEDES } from '../../context/AuthContext';
import {
  ShieldCheck, Search, Download, RefreshCw, LogIn, LogOut,
  Settings, AlertTriangle, Package, Users, Filter, Clock,
  ChevronDown, X,
} from 'lucide-react';

const API = 'http://localhost:3001/api';

const TIPO_CONFIG = {
  LOGIN:             { icon: LogIn,          color: 'var(--color-success)',    bg: 'rgba(34,197,94,0.12)',    label: 'Login' },
  LOGOUT:            { icon: LogOut,         color: 'var(--color-text-muted)', bg: 'rgba(148,163,184,0.12)', label: 'Logout' },
  AJUSTE_STOCK:      { icon: Package,        color: 'var(--color-gold)',       bg: 'rgba(200,169,110,0.12)', label: 'Ajuste Stock' },
  CREAR_PRODUCTO:    { icon: Package,        color: '#60a5fa',                 bg: 'rgba(96,165,250,0.12)',  label: 'Crear Producto' },
  EDITAR_PRODUCTO:   { icon: Settings,       color: '#a78bfa',                 bg: 'rgba(167,139,250,0.12)', label: 'Editar Producto' },
  ELIMINAR_PRODUCTO: { icon: AlertTriangle,  color: 'var(--color-danger)',     bg: 'rgba(239,68,68,0.12)',   label: 'Eliminar Producto' },
  CREAR_USUARIO:     { icon: Users,          color: '#34d399',                 bg: 'rgba(52,211,153,0.12)',  label: 'Crear Usuario' },
  EDITAR_USUARIO:    { icon: Settings,       color: '#fbbf24',                 bg: 'rgba(251,191,36,0.12)', label: 'Editar Usuario' },
  TOGGLE_USUARIO:    { icon: Users,          color: '#fb923c',                 bg: 'rgba(251,146,60,0.12)', label: 'Cambio Estado' },
};

function TipoBadge({ tipo }) {
  const cfg = TIPO_CONFIG[tipo] || {
    icon: Clock, color: 'var(--color-text-muted)',
    bg: 'rgba(148,163,184,0.12)', label: tipo,
  };
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
      color: cfg.color, background: cfg.bg,
    }}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function formatTs(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AuditoriaPage() {
  const { showToast } = useToast();

  const [logs, setLogs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterSede, setFilterSede] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Usa la ruta real del backend: GET /api/inventory/audit
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/inventory/audit`);
      if (!res.ok) throw new Error('Error al cargar auditoría');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter(l => {
      const matchSearch =
        !q ||
        l.usuario?.toLowerCase().includes(q) ||
        l.detalle?.toLowerCase().includes(q) ||
        l.ip?.includes(q);
      const matchTipo = !filterTipo || l.tipo === filterTipo;
      // sedeId puede venir como número o string desde MySQL
      const matchSede = !filterSede || String(l.sedeId) === filterSede;
      return matchSearch && matchTipo && matchSede;
    });
  }, [logs, search, filterTipo, filterSede]);

  function exportCSV() {
    const header = ['ID', 'Tipo', 'Usuario', 'Sede', 'IP', 'Detalle', 'Timestamp'];
    const rows = filtered.map(l => [
      l.id,
      l.tipo,
      l.usuario,
      SEDES.find(s => s.id === l.sedeId)?.nombre || l.sedeId || '—',
      l.ip || '—',
      `"${(l.detalle || '').replace(/"/g, '""')}"`,
      l.timestamp,
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'auditoria.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exportado', 'success');
  }

  const tiposUnicos = [...new Set(logs.map(l => l.tipo))].sort();
  const activeFilters = [filterTipo, filterSede].filter(Boolean).length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="page-title">Auditoría del Sistema</h1>
            <p className="page-subtitle">
              {loading ? 'Cargando…' : `${filtered.length} de ${logs.length} registros`}
            </p>
          </div>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Actualizar
          </button>
          <button className="btn btn-secondary btn-sm" onClick={exportCSV} disabled={!filtered.length}>
            <Download size={14} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="page-toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Buscar por usuario, detalle o IP…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0 }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <button
          className={`btn btn-secondary btn-sm ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(f => !f)}
        >
          <Filter size={14} />
          Filtros
          {activeFilters > 0 && (
            <span style={{
              background: 'var(--color-gold)', color: '#0d0d0d',
              borderRadius: 999, padding: '0 6px', fontSize: '0.7rem', fontWeight: 700,
            }}>
              {activeFilters}
            </span>
          )}
          <ChevronDown size={12} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Tipo de evento</label>
              <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
                <option value="">Todos</option>
                {tiposUnicos.map(t => (
                  <option key={t} value={t}>{TIPO_CONFIG[t]?.label || t}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Sede</label>
              <select value={filterSede} onChange={e => setFilterSede(e.target.value)}>
                <option value="">Todas</option>
                {SEDES.map(s => (
                  <option key={s.id} value={String(s.id)}>{s.nombre}</option>
                ))}
              </select>
            </div>
            {activeFilters > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ alignSelf: 'flex-end' }}
                onClick={() => { setFilterTipo(''); setFilterSede(''); }}
              >
                <X size={13} /> Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="empty-state">
            <div className="spinner" />
            <p>Cargando registros…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={40} style={{ color: 'var(--color-text-muted)', marginBottom: 12 }} />
            <p>No se encontraron registros</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Usuario</th>
                <th>Sede</th>
                <th>IP</th>
                <th>Detalle</th>
                <th>Fecha / Hora</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => {
                const sede = SEDES.find(s => s.id === log.sedeId);
                return (
                  <tr key={log.id}>
                    <td><TipoBadge tipo={log.tipo} /></td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {log.usuario}
                      </span>
                    </td>
                    <td>{sede?.nombre || '—'}</td>
                    <td>
                      <code style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {log.ip || '—'}
                      </code>
                    </td>
                    <td style={{ maxWidth: 300, color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                      {log.detalle}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        <Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {formatTs(log.timestamp)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
