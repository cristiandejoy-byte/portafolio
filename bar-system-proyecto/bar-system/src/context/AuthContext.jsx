// bar-system/src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

// Re-exporta SEDES desde su propio archivo para que todos los imports
// existentes (import { SEDES } from '../../context/AuthContext') sigan
// funcionando, y Vite Fast Refresh deje de quejarse.
export { SEDES } from './sedes.js';
import { SEDES } from './sedes.js';

const AuthContext = createContext(null);

const API = 'http://localhost:3001/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bar_user')); } catch { return null; }
  });
  const [selectedSede, setSelectedSede] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bar_sede')); } catch { return null; }
  });

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Usuario o contraseña incorrectos.');

    const safeUser = data.user;
    setUser(safeUser);
    localStorage.setItem('bar_user', JSON.stringify(safeUser));

    // Si no es admin → asignar sede automáticamente
    if (safeUser.rol !== 'ADMINISTRADOR') {
      const sede = SEDES.find(s => s.id === safeUser.sedeId) || SEDES[0];
      setSelectedSede(sede);
      localStorage.setItem('bar_sede', JSON.stringify(sede));
    }

    return safeUser;
  }, []);

  const chooseSede = useCallback((sede) => {
    setSelectedSede(sede);
    localStorage.setItem('bar_sede', JSON.stringify(sede));
  }, []);

  const logout = useCallback(async () => {
    try {
      const u = JSON.parse(localStorage.getItem('bar_user'));
      if (u) {
        await fetch(`${API}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u.username, sedeId: u.sedeId }),
        }).catch(() => {});
      }
    } catch (_) {}

    setUser(null);
    setSelectedSede(null);
    localStorage.removeItem('bar_user');
    localStorage.removeItem('bar_sede');
  }, []);

  const isAdmin  = user?.rol === 'ADMINISTRADOR';
  const isCajero = user?.rol === 'CAJERO';
  const isMesero = user?.rol === 'MESERO';

  return (
    <AuthContext.Provider value={{
      user, selectedSede, isAdmin, isCajero, isMesero,
      login, logout, chooseSede,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
