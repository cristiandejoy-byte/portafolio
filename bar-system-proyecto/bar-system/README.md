# 🍺 El Último Revolcón — Sistema de Gestión de Bar

**Nexus Software Factory** | Sprint 1 & 2 | React + Vite + Zustand

---

## 📦 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend framework | React 19 + Vite 8 |
| Routing | React Router DOM 7 |
| Estado global | Zustand |
| Formularios | React Hook Form + Zod |
| Iconos | Lucide React |
| Estilos | CSS Modules (variables CSS, sin frameworks) |
| Build tool | Vite |

---

## 🗂️ Estructura del proyecto

```
src/
├── App.jsx                          # Rutas y guardas
├── main.jsx                         # Entry point
├── index.css                        # Sistema de diseño (tokens CSS)
│
├── context/
│   ├── AuthContext.jsx              # HU-003/004: Auth, roles, sedes
│   └── SidebarContext.jsx           # Estado sidebar compartido
│
├── hooks/
│   └── useInactivityLogout.js       # HU-003: Auto-logout 5 min
│
├── store/
│   └── index.js                     # Zustand: usuarios + inventario
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx            # Shell protegido
│   │   ├── Sidebar.jsx              # Navegación colapsable por rol
│   │   └── Topbar.jsx               # Barra superior con breadcrumb
│   └── common/
│       ├── Modal.jsx                # Modal reutilizable (ESC + click-outside)
│       └── Toast.jsx                # Notificaciones snackbar
│
└── pages/
    ├── auth/
    │   ├── LoginPage.jsx            # HU-003: Login con roles
    │   └── SedeSelectPage.jsx       # HU-004: Selección de sede (admin)
    ├── dashboard/
    │   └── DashboardPage.jsx        # Stats, alertas, resumen sedes
    ├── admin/
    │   ├── UsuariosPage.jsx         # HU-005/006/007/008: CRUD usuarios
    │   ├── ProductosPage.jsx        # HU-009: Maestra global productos
    │   ├── AuditoriaPage.jsx        # HU-024: Log auditoría + CSV export
    │   └── PerfilPage.jsx           # Perfil y cambio de contraseña
    └── inventory/
        └── InventarioPage.jsx       # HU-010/011/012/013: Stock por sede
```

---

## 🚀 Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
# → http://localhost:5173

# 3. Build de producción
npm run build
```

---

## 👤 Credenciales de prueba

| Rol | Usuario | Contraseña | Acceso |
|---|---|---|---|
| **Administrador** | `admin` | `admin123` | Todas las funciones + selección de sede |
| **Cajero (Bogotá)** | `cajero_bog` | `cajero123` | Dashboard + Perfil |
| **Mesero (Bogotá)** | `mesero_bog` | `mesero123` | Dashboard + Perfil |
| **Cajero (Cali)** | `cajero_cal` | `cajero123` | Dashboard + Perfil |

---

## ✅ Historias de usuario implementadas

### Sprint 1 — Autenticación y Gestión de Usuarios

| HU | Descripción | Estado |
|---|---|---|
| HU-003 | Login con usuario/contraseña + redirección por rol + auto-logout 5 min | ✅ |
| HU-004 | Administrador elige sede al iniciar sesión | ✅ |
| HU-005 | Crear usuarios con rol y sede asignada | ✅ |
| HU-006 | Editar datos de usuarios existentes | ✅ |
| HU-007 | Desactivar usuario (sin eliminar) | ✅ |
| HU-008 | Listado con filtros por rol, sede y estado | ✅ |

### Sprint 2 — Inventario

| HU | Descripción | Estado |
|---|---|---|
| HU-009 | CRUD maestra global de productos (nombre, precio, categoría) | ✅ |
| HU-010 | Configurar stock inicial por producto por sede | ✅ |
| HU-011 | Consultar inventario en tiempo real con alertas visuales | ✅ |
| HU-012 | Descuento automático de inventario al cerrar venta | ✅ |
| HU-013 | Ajuste manual de stock con motivo (registrado en auditoría) | ✅ |

### Bonus

| Feature | Descripción |
|---|---|
| HU-024 | Log de auditoría con filtros por tipo, usuario, fecha — exporta CSV |
| Perfil | Cambio de nombre y contraseña para cualquier usuario |
| Auto-logout | Hook `useInactivityLogout` — 5 min sin actividad cierra sesión |
| Topbar | Breadcrumb + info de sede + avatar de usuario |
| 404 | Página de error para rutas inexistentes |

---

## 🎨 Sistema de diseño

- **Tema**: Dark elegante con acentos dorados (`#c8a96e`)
- **Tipografía**: Playfair Display (display) + DM Sans (body) + DM Mono (código)
- **Tokens CSS**: Variables globales en `index.css` para colores, espaciados, radios y sombras
- **Componentes**: Modal, Toast, Sidebar colapsable, Topbar, tablas con hover, badges, stat cards

---

## 🔒 Seguridad implementada

- Guardas de ruta por rol (`RequireAuth`, `RequireAdmin`, `RequireSede`)
- Auto-logout por inactividad (5 minutos)
- Contraseñas nunca en texto plano (en demo: hash simulado; en producción: bcrypt en backend)
- Auditoría de ajustes de inventario persistida en `localStorage`

---

## 📋 Próximos sprints (pendientes)

- **Sprint 3**: Módulo de pedidos (Mesero) y cierre de ventas (Cajero)
- **Sprint 4**: Reportes CSV de ventas, dashboard analytics, seguridad JWT real
- **Sprint 5**: Pruebas E2E, carga, regresión
- **Sprint 6**: Deploy producción, manual de usuario

---

*© 2026 Nexus Software Factory · Proyecto El Último Revolcón · Confidencial*
