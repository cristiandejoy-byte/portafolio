import { create } from 'zustand';
import { SEDES } from '../context/AuthContext';

const BASE = 'http://localhost:3001/api';

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la petición');
  return data;
}

// ─────────────────────────────────────────────
// AUDIT LOGGER — ahora guarda en MySQL via backend
// ─────────────────────────────────────────────
export function auditLog() {
  // La auditoría ahora la maneja el backend automáticamente
}

// ─────────────────────────────────────────────
// USERS STORE
// ─────────────────────────────────────────────
export const useUsersStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  // Cargar usuarios desde MySQL
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await api('GET', '/users');
      // Normalizar activo: MySQL devuelve 0/1, React espera true/false
      set({ users: users.map(u => ({ ...u, activo: u.activo === 1 || u.activo === true })), loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // HU-005: Crear usuario
  addUser: async (data) => {
    const newUser = await api('POST', '/users', data);
    set(state => ({
      users: [...state.users, { ...newUser, activo: newUser.activo === 1 || newUser.activo === true }]
    }));
    return newUser;
  },

  // HU-006: Editar usuario
  updateUser: async (id, data) => {
    const updated = await api('PUT', `/users/${id}`, data);
    set(state => ({
      users: state.users.map(u =>
        u.id === id ? { ...updated, activo: updated.activo === 1 || updated.activo === true } : u
      )
    }));
    return updated;
  },

  // HU-007: Activar / Desactivar
  toggleActive: async (id) => {
    const result = await api('PATCH', `/users/${id}/toggle`);
    set(state => ({
      users: state.users.map(u =>
        u.id === id ? { ...u, activo: result.activo } : u
      )
    }));
    return result;
  },
}));

// ─────────────────────────────────────────────
// PRODUCTS STORE
// ─────────────────────────────────────────────
export const CATEGORIES = ['Cervezas', 'Cócteles', 'Licores', 'Gaseosas & Jugos', 'Snacks', 'Shots'];

export const useInventoryStore = create((set, get) => ({
  products: [],
  stock: {},
  categories: CATEGORIES,
  loading: false,
  error: null,

  // Cargar productos desde MySQL
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await api('GET', '/inventory/products');
      set({
        products: products.map(p => ({ ...p, activo: p.activo === 1 || p.activo === true })),
        loading: false
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Cargar stock de una sede
  fetchStock: async (sedeId) => {
    try {
      const items = await api('GET', `/inventory/stock/${sedeId}`);
      // Convertir array a objeto { productoId: { cantidad, minimo } }
      const stockObj = {};
      items.forEach(item => {
        stockObj[item.productoId] = { cantidad: item.cantidad, minimo: item.minimo };
      });
      set(state => ({
        stock: { ...state.stock, [sedeId]: stockObj }
      }));
    } catch (err) {
      console.error('Error cargando stock:', err.message);
    }
  },

  // HU-009: Crear producto
  addProduct: async (data) => {
    const newProduct = await api('POST', '/inventory/products', data);
    set(state => ({
      products: [...state.products, { ...newProduct, activo: true }]
    }));
    return newProduct;
  },

  // HU-009: Editar producto
  updateProduct: async (id, data) => {
    const updated = await api('PUT', `/inventory/products/${id}`, data);
    set(state => ({
      products: state.products.map(p =>
        p.id === id ? { ...updated, activo: updated.activo === 1 || updated.activo === true } : p
      )
    }));
    return updated;
  },

  // HU-009: Toggle activo producto
  toggleProductActive: async (id) => {
    const p = get().products.find(p => p.id === id);
    const updated = await api('PUT', `/inventory/products/${id}`, { activo: !p.activo });
    set(state => ({
      products: state.products.map(p =>
        p.id === id ? { ...p, activo: !p.activo } : p
      )
    }));
    return updated;
  },

  // HU-013: Ajuste manual de stock
  adjustStock: async (sedeId, productoId, delta, motivo) => {
    const sedeStock = get().stock[sedeId] || {};
    const cur = sedeStock[productoId] || { cantidad: 0, minimo: 5 };
    const nuevaCantidad = Math.max(0, cur.cantidad + delta);
    await api('PUT', `/inventory/stock/${sedeId}/${productoId}`, {
      cantidad: nuevaCantidad,
      motivo: motivo || 'Ajuste manual',
    });
    set(state => ({
      stock: {
        ...state.stock,
        [sedeId]: {
          ...state.stock[sedeId],
          [productoId]: { ...cur, cantidad: nuevaCantidad }
        }
      }
    }));
  },

  // HU-010: Configurar stock
  setStock: async (sedeId, productoId, cantidad, minimo = 5) => {
    await api('PUT', `/inventory/stock/${sedeId}/${productoId}`, {
      cantidad: Number(cantidad),
      minimo: Number(minimo),
      motivo: 'Configuración inicial de stock',
    });
    set(state => ({
      stock: {
        ...state.stock,
        [sedeId]: {
          ...state.stock[sedeId],
          [productoId]: { cantidad: Number(cantidad), minimo: Number(minimo) }
        }
      }
    }));
  },

  // HU-012: Descuento automático al vender
  deductStock: async (sedeId, items) => {
    const sedeStock = { ...get().stock[sedeId] };
    for (const { productoId, cantidad } of items) {
      const cur = sedeStock[productoId] || { cantidad: 0, minimo: 5 };
      const nuevaCantidad = Math.max(0, cur.cantidad - cantidad);
      await api('PUT', `/inventory/stock/${sedeId}/${productoId}`, {
        cantidad: nuevaCantidad,
        motivo: 'Descuento por venta',
      });
      sedeStock[productoId] = { ...cur, cantidad: nuevaCantidad };
    }
    set(state => ({ stock: { ...state.stock, [sedeId]: sedeStock } }));
  },

  // Helper local
  getStockBySede: (sedeId) => get().stock[sedeId] || {},
}));