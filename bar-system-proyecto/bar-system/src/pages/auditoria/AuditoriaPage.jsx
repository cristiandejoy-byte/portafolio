import { useState, useMemo, useEffect } from 'react';
import { useToast } from '../../components/common/Toast.jsx';
import { SEDES } from '../../context/AuthContext';
import {
  ShieldCheck, Search, Download, RefreshCw,
  LogIn, LogOut, Settings, AlertTriangle, Package,
  Users, Filter, Clock,
} from 'lucide-react';
import './AuditoriaPage.css';

// Tipos de eventos con ícono y badge
const EVENT_META = {
  LOGIN:         { label: 'Login',          badge: 'badge-success', Icon: LogIn },
  LOGOUT:        { label: 'Logout',         badge: 'badge-muted',   Icon: LogOut },
  CREAR_USUARIO: { label: 'Crear usuario',  badge: 'badge-info',    Icon: Users },
  EDITAR_USUARIO:{ label: 'Editar usuario', badge: 'badge-info',    Icon: Users },
  TOGGLE_USUARIO:{ label: 'Toggle usuario', badge: 'badge-warning', Icon: Users },
  CREAR_PRODUCTO:{ label: 'Crear producto', badge: 'badge-gold',    Icon: Package },
  EDITAR_PRODUCTO:{ label:'Editar producto',badge: 'badge-gold',    Icon: Package },
  AJUSTE_STOCK:  { label: 'Ajuste stock',   badge: 'badge-warning', Icon: RefreshCw },
  CONFIG_STOCK:  { label: 'Config. stock',  badge: 'badge-info',    Icon: Settings },
};

// Genera logs de auditoría de ejemplo para demostración
function generateSampleLogs() {
  const usuarios = ['admin', 'cajero_bog', 'mesero_bog', 'cajero_cal'];
  const tipos = Object.keys(EVENT_META);
  const sedes = [1, 2, 3];
  const ips = ['192.168.1.10', '192.168.1.25', '10.0.0.5', '172.16.0.3'];

  const logs = [];
  const now = Date.now();

  for (let i = 0; i < 45; i++) {
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const ts = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000);
    logs.push({
      id: i + 1,
      tipo,
      usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
      sedeId: sedes[Math.floor(Math.random() * sedes.length)],
      ip: ips[Math.floor(Math.random() * ips.length)],
      detalle: buildDetalle(tipo, i),
      timestamp: ts.toISOString(),
    });
  }
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function buildDetalle(tipo, idx) {
  const map = {
    LOGIN:          'Inicio de sesión exitoso',
    LOGOUT:         'Cierre de sesión',
    CREAR_USUARIO:  `Usuario "mesero_${idx}" creado con rol MESERO`,
    EDITAR_USUARIO: `Contraseña actualizada para usuario #${idx % 6 + 1}`,
    TOGGLE_USUARIO: `Usuario #${idx % 6 + 1} desactivado`,
    CREAR_PRODUCTO: `Producto "Cerveza Especial #${idx}" agregado al catálogo`,
    EDITAR_PRODUCTO:`Precio actualizado: producto #${idx % 12 + 1}`,
    AJUSTE_STOCK:   `Ajuste +${Math.floor(Math.random()*20)+1} uds — Recepción de pedido`,
    CONFIG_STOCK:   `Stock configurado: 50 uds, mínimo 10`,
  };
  return map[tipo] || 'Acción registrada';
}

let SAMPLE_LOGS = null;

function getLogs() {
  // Combina logs del localStorage (ajustes reales) + logs de ejemplo
  const stored = JSON.parse(localStorage.getItem('audit_log') || '[]');
  if (!SAMPLE_LOGS) SAMPLE_LOGS = generateSampleLogs();
  return [...stored, ...SAMPLE_LOGS].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function toCSV(rows) {
  const header = ['ID', 'Fecha/Hora', 'Tipo', 'Usuario', 'Sede', 'IP', 'Detalle'];
  const lines = rows.map(r => [
    r.id,
    formatDate(r.timestamp),
    EVENT_META[r.tipo]?.label || r.tipo,
    r.usuario,
    SEDES.find(s => s.id === r.sedeId)?.nombre || r.sedeId,
    r.ip,
    `"${r.detalle}"`,
  ].join(','));
  return [header.join(','), ...lines].join('\n');
}

export default function AuditoriaPage() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterSede, setFilterSede] = useState('');
  const [filterUsuario, setFilterUsuario] = useState('');
  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => { setLogs(getLogs()); }, []);

  function refresh() {
    setLogs(getLogs());
    toast('Log de auditoría actualizado', 'info');
  }

  // HU-024: filtros
  const filtered = useMemo(() => {
    return logs.filter(r => {
      const q = search.toLowerCase();
      const matchQ = !q || r.usuario.toLowerCase().includes(q) || r.detalle.toLowerCase().includes(q) || r.ip.includes(q);
      const matchTipo = !filterTipo || r.tipo === filterTipo;
      const matchSede = !filterSede || String(r.sedeId) === filterSede;
      const matchUser = !filterUsuario || r.usuario === filterUsuario;
      const ts = new Date(r.timestamp);
      const matchDesde = !filterDesde || ts >= new Date(filterDesde);
      const matchHasta = !filterHasta || ts <= new Date(filterHasta + 'T23:59:59');
      return matchQ && matchTipo && matchSede && matchUser && matchDesde && matchHasta;
    });
  }, [logs, search, filterTipo, filterSede, filterUsuario, filterDesde, filterHasta]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const uniqueUsuarios = [...new Set(logs.map(l => l.usuario))].sort();

  // HU-024: exportar CSV
  function handleExport() {
    const csv = toCSV(filtered);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exportados ${filtered.length} registros`, 'success');
  }

  function clearFilters() {
    setSearch(''); setFilterTipo(''); setFilterSede('');
    setFilterUsuario(''); setFilterDesde(''); setFilterHasta('');
    setPage(1);
  }

  const stats = useMemo(() => ({
    total: logs.length,
    hoy: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
    logins: logs.filter(l => l.tipo === 'LOGIN').length,
    ajustes: logs.filter(l => l.tipo === 'AJUSTE_STOCK').length,
  }), [logs]);

  return (
    <div className="auditoria-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Log de Auditoría</h1>
          <p className="page-subtitle">Registro de todas las acciones del sistema — solo lectura</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={refresh}>
            <RefreshCw size={15} />
            Actualizar
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
            <Download size={15} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-label">Total registros</p>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Hoy</p>
          <p className="stat-value" style={{ color: 'var(--color-gold)' }}>{stats.hoy}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Inicios de sesión</p>
          <p className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.logins}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Ajustes de stock</p>
          <p className="stat-value" style={{ color: 'var(--color-warning)' }}>{stats.ajustes}</p>
        </div>
      </div>

      <div className="card">
        {/* Filters */}
        <div className="auditoria-filters">
          <div className="search-input-wrapper" style={{ flex: 2 }}>
            <Search size={16} />
            <input
              placeholder="Buscar por usuario, detalle o IP..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select value={filterTipo} onChange={e => { setFilterTipo(e.target.value); setPage(1); }} style={{ width: 170 }}>
            <option value="">Todos los eventos</option>
            {Object.entries(EVENT_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select value={filterUsuario} onChange={e => { setFilterUsuario(e.target.value); setPage(1); }} style={{ width: 155 }}>
            <option value="">Todos los usuarios</option>
            {uniqueUsuarios.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <select value={filterSede} onChange={e => { setFilterSede(e.target.value); setPage(1); }} style={{ width: 140 }}>
            <option value="">Todas las sedes</option>
            {SEDES.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>

        <div className="auditoria-date-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
            <span className="text-xs text-muted">Rango de fechas:</span>
          </div>
          <input type="date" value={filterDesde} onChange={e => { setFilterDesde(e.target.value); setPage(1); }} style={{ width: 160 }} />
          <span className="text-xs text-muted">hasta</span>
          <input type="date" value={filterHasta} onChange={e => { setFilterHasta(e.target.value); setPage(1); }} style={{ width: 160 }} />
          {(search || filterTipo || filterSede || filterUsuario || filterDesde || filterHasta) && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Limpiar filtros</button>
          )}
          <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>
            {filtered.length} registros encontrados
          </span>
        </div>

        {/* Table */}
        <div className="table-wrapper" style={{ marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha / Hora</th>
                <th>Tipo de evento</th>
                <th>Usuario</th>
                <th>Sede</th>
                <th>IP</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state" style={{ padding: '32px 0' }}>
                      <ShieldCheck size={36} />
                      <h4>Sin registros</h4>
                      <p>No hay eventos que coincidan con los filtros aplicados</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map(r => {
                const meta = EVENT_META[r.tipo] || { label: r.tipo, badge: 'badge-muted', Icon: ShieldCheck };
                const { Icon } = meta;
                const sede = SEDES.find(s => s.id === r.sedeId);
                return (
                  <tr key={r.id}>
                    <td className="font-mono text-xs text-muted">{r.id}</td>
                    <td className="font-mono text-xs" style={{ whiteSpace: 'nowrap' }}>
                      {formatDate(r.timestamp)}
                    </td>
                    <td>
                      <span className={`badge ${meta.badge}`} style={{ display: 'inline-flex', gap: 5 }}>
                        <Icon size={11} />
                        {meta.label}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-sm">{r.usuario}</span>
                    </td>
                    <td className="text-sm">{sede?.nombre || '—'}</td>
                    <td className="font-mono text-xs text-muted">{r.ip}</td>
                    <td className="text-sm" style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.detalle}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="auditoria-pagination">
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(1)}>«</button>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Anterior</button>
            <span className="text-sm text-muted">
              Página {page} de {totalPages}
            </span>
            <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente ›</button>
            <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        )}
      </div>
    </div>
  );
}
