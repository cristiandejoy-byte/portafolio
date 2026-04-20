import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, SEDES } from '../../context/AuthContext';
import { useUsersStore, useInventoryStore } from '../../store/index.js';
import {
  Users, Package, AlertTriangle, BarChart2,
  MapPin, TrendingUp, ArrowRight, ShieldCheck,
  Activity, Zap,
} from 'lucide-react';

const API = 'http://localhost:3001/api';

export default function DashboardPage() {
  const { user, selectedSede, isAdmin } = useAuth();
  const { users, fetchUsers }           = useUsersStore();
  const { products, stock, fetchProducts, fetchStock } = useInventoryStore();

  const [auditCount, setAuditCount]     = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [visible, setVisible]           = useState(false);

  useEffect(() => { fetchUsers(); },    [fetchUsers]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    const sedeId = selectedSede?.id ?? user?.sedeId;
    if (sedeId) fetchStock(sedeId);
  }, [selectedSede, user, fetchStock]);
  useEffect(() => {
    setLoadingAudit(true);
    fetch(`${API}/inventory/audit`)
      .then(r => r.json())
      .then(data => setAuditCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setAuditCount(0))
      .finally(() => setLoadingAudit(false));
  }, []);

  // Animate in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const sedeId    = selectedSede?.id ?? user?.sedeId ?? null;
  const sedeStock = sedeId ? (stock[sedeId] || {}) : {};

  const stats = useMemo(() => {
    const activeUsers   = Array.isArray(users) ? users.filter(u => u.activo).length : 0;
    const totalProducts = Array.isArray(products) ? products.filter(p => p.activo).length : 0;
    const stockEntries  = Object.entries(sedeStock);
    const stockBajo     = stockEntries.filter(([, s]) => s.cantidad <= s.minimo).length;
    const valorStock    = stockEntries.reduce((acc, [productoId, s]) => {
      const prod = Array.isArray(products) ? products.find(p => p.id === Number(productoId)) : null;
      return acc + (s.cantidad * (prod?.precio ?? 0));
    }, 0);
    return { activeUsers, totalProducts, stockBajo, valorStock };
  }, [users, products, sedeStock]);

  const stockBajoItems = useMemo(() =>
    Object.entries(sedeStock)
      .filter(([, s]) => s.cantidad <= s.minimo)
      .map(([productoId, s]) => ({
        ...s,
        productoId: Number(productoId),
        producto: Array.isArray(products) ? products.find(p => p.id === Number(productoId)) : null,
        agotado: s.cantidad === 0,
      }))
      .filter(s => s.producto)
      .slice(0, 5),
    [sedeStock, products]
  );

  const sedeLabel = isAdmin
    ? (selectedSede?.nombre ?? 'Todas las sedes')
    : (SEDES.find(s => s.id === user?.sedeId)?.nombre ?? '—');

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="page-container" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}>

      {/* ── Hero header ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(200,169,110,0.08) 0%, rgba(200,169,110,0.02) 100%)',
        border: '1px solid rgba(200,169,110,0.15)',
        borderRadius: 20,
        padding: '28px 32px',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', right: -60, top: -60,
          width: 240, height: 240, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,169,110,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: 'var(--color-gold)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              <Zap size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />
              {saludo}
            </p>
            <h1 style={{ fontSize: '1.9rem', fontFamily: 'var(--font-display)', fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
              {user?.nombre}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', margin: '6px 0 0', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={13} style={{ color: 'var(--color-gold)' }} />
              {sedeLabel}
              <span style={{ color: 'var(--color-border)', margin: '0 4px' }}>·</span>
              <span style={{ color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{user?.rol?.toLowerCase()}</span>
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 10, padding: '8px 14px',
          }}>
            <Activity size={14} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 600 }}>Sistema activo</span>
          </div>
        </div>
      </div>

      {/* ── KPI grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        <KpiCard delay={0}  icon={<Users size={18}/>}        label="Usuarios activos"       value={stats.activeUsers}   sub={`de ${Array.isArray(users)?users.length:0} totales`} color="#c8a96e" to="/usuarios" />
        <KpiCard delay={60} icon={<Package size={18}/>}      label="Productos activos"      value={stats.totalProducts} sub="en catálogo"             color="#60a5fa" to="/productos" />
        <KpiCard delay={120} icon={<AlertTriangle size={18}/>} label="Stock bajo / agotado" value={stats.stockBajo}     sub="por reponer"             color={stats.stockBajo>0?'#ef4444':'#22c55e'} to="/inventario" alert={stats.stockBajo>0} />
        <KpiCard delay={180} icon={<TrendingUp size={18}/>}  label="Valor inventario"       value={`$${stats.valorStock.toLocaleString('es-CO')}`} sub="precio × cantidad" color="#a78bfa" />
        {isAdmin && (
          <KpiCard delay={240} icon={<ShieldCheck size={18}/>} label="Registros auditoría"  value={loadingAudit?'…':auditCount} sub="eventos totales"  color="#34d399" to="/auditoria" />
        )}
      </div>

      {/* ── Stock bajo ── */}
      {stockBajoItems.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.04)',
          border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 28,
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(239,68,68,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(239,68,68,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertTriangle size={15} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Productos con stock bajo</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{stockBajoItems.length} producto{stockBajoItems.length!==1?'s':''} requieren atención</div>
              </div>
            </div>
            <Link to="/inventario" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8rem' }}>
              Ver inventario <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ padding: '8px 0' }}>
            {stockBajoItems.map((s, i) => {
              const pct = s.minimo > 0 ? Math.min(Math.round((s.cantidad / s.minimo) * 100), 100) : 0;
              return (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto 180px',
                  alignItems: 'center',
                  gap: 16,
                  padding: '12px 24px',
                  borderBottom: i < stockBajoItems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.producto.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.producto.categoria}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.agotado ? '#ef4444' : '#f59e0b', lineHeight: 1 }}>{s.cantidad}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: 2 }}>cantidad</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-secondary)', lineHeight: 1 }}>{s.minimo}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: 2 }}>mínimo</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em',
                        color: s.agotado ? '#ef4444' : '#f59e0b',
                        background: s.agotado ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        padding: '2px 7px', borderRadius: 999,
                      }}>
                        {s.agotado ? 'AGOTADO' : 'BAJO'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        borderRadius: 99,
                        background: s.agotado
                          ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                          : 'linear-gradient(90deg, #f59e0b, #d97706)',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Accesos rápidos ── */}
      <div>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
          Accesos rápidos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { to: '/inventario', icon: Package,     label: 'Inventario',  sub: 'Ver y ajustar stock',   color: '#60a5fa' },
            { to: '/productos',  icon: BarChart2,   label: 'Productos',   sub: 'Catálogo y precios',    color: '#a78bfa' },
            { to: '/usuarios',   icon: Users,       label: 'Usuarios',    sub: 'Gestionar accesos',     color: '#c8a96e', adminOnly: true },
            { to: '/auditoria',  icon: ShieldCheck, label: 'Auditoría',   sub: 'Registro de eventos',   color: '#34d399', adminOnly: true },
          ]
            .filter(l => !l.adminOnly || isAdmin)
            .map((l, i) => (
              <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 14,
                  padding: '16px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  animationDelay: `${i * 40}ms`,
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = l.color;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: `${l.color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: l.color,
                  }}>
                    <l.icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{l.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{l.sub}</div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color, to, alert, delay = 0 }) {
  const [hovered, setHovered] = useState(false);

  const inner = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`
          : 'var(--color-surface)',
        border: `1px solid ${hovered ? color + '40' : (alert ? '#ef444430' : 'var(--color-border)')}`,
        borderRadius: 16,
        padding: '20px 22px',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px ${color}20` : 'none',
        cursor: to ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* subtle top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}, transparent)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.25s',
      }} />

      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, marginBottom: 14,
      }}>
        {icon}
      </div>

      <div style={{
        fontSize: '1.75rem', fontWeight: 800, lineHeight: 1,
        color: alert ? '#ef4444' : 'var(--color-text-primary)',
        fontVariantNumeric: 'tabular-nums',
        marginBottom: 4,
      }}>
        {value ?? <span style={{ display: 'inline-block', width: 40, height: 28, background: 'var(--color-border)', borderRadius: 6 }} />}
      </div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)' }}>{sub}</div>

      {to && (
        <div style={{
          position: 'absolute', bottom: 16, right: 16,
          color: hovered ? color : 'var(--color-text-muted)',
          transition: 'color 0.2s, transform 0.2s',
          transform: hovered ? 'translateX(2px)' : 'none',
        }}>
          <ArrowRight size={14} />
        </div>
      )}
    </div>
  );

  return to
    ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link>
    : inner;
}
