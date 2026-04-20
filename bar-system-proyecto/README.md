# 🍹 Bar Management System — El Último Revolcón

> Sistema web multisede para gestión de pedidos, inventario y ventas desarrollado por **Nexus Software Factory**.

![Estado](https://img.shields.io/badge/Estado-En%20desarrollo-yellow)
![Sprint](https://img.shields.io/badge/Sprint%20actual-5%20%2F%206-blue)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MySQL-green)
![Metodología](https://img.shields.io/badge/Metodología-Scrum-orange)

---

## 📋 Descripción

Sistema de gestión integral para el bar **El Último Revolcón**, diseñado para operar en múltiples sedes con roles diferenciados. Permite a meseros tomar pedidos, cajeros procesar ventas y administradores controlar inventario, usuarios y reportes desde una sola plataforma.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React · JavaScript · CSS |
| Backend | Node.js · Express |
| Base de datos | MySQL |
| Autenticación | JWT · BCrypt |
| Control de versiones | Git · GitHub |
| Almacenamiento docs | OneDrive |

---

## 👥 Roles del Sistema

| Rol | Acceso |
|-----|--------|
| **Administrador** | Gestión de usuarios, inventario, reportes, auditoría y todas las sedes |
| **Cajero** | Visualización de pedidos abiertos, cierre de ventas y resumen de caja |
| **Mesero** | Consulta de menú, creación y seguimiento de pedidos por mesa |

---

## 📦 Módulos

### ✅ Completados
- **Infraestructura** — Estructura de carpetas, repositorio, esquema inicial de BD
- **Autenticación** — Login por rol, selección de sede (admin), sesión con JWT

### 🔄 En progreso
- **Gestión de Usuarios** — CRUD de usuarios con rol y sede asignada

### ⏳ Pendientes
- **Inventario** — Maestra global de productos, stock por sede, ajustes manuales
- **Pedidos** — Toma de pedidos, modificación en tiempo real, envío a caja
- **Ventas** — Cierre de venta, descuento automático de inventario, resumen de caja
- **Reportes** — Dashboard de indicadores, exportación CSV por sede y fecha
- **Seguridad** — Auditoría de acciones, encriptación, log filtrable
- **QA** — Pruebas de integración, carga y regresión
- **Despliegue** — Deploy en producción, manual de usuario, capacitación

---

## 🗂️ Estructura del Proyecto

```
bar-management-system/
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Vistas por módulo
│   │   ├── services/       # Llamadas a la API
│   │   └── context/        # Estado global (Auth, Sede)
│   └── package.json
│
├── backend/                # API REST Node.js + Express
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio por módulo
│   │   ├── routes/         # Definición de endpoints
│   │   ├── middlewares/    # Auth JWT, validaciones
│   │   ├── models/         # Modelos de BD (MySQL)
│   │   └── utils/          # Helpers, auditoría
│   └── package.json
│
├── database/
│   ├── schema.sql          # Esquema inicial de la BD
│   └── seeds.sql           # Datos de prueba
│
└── docs/                   # Documentación del proyecto
    ├── arquitectura.md
    └── backlog.xlsx
```

---

## ⚙️ Instalación y ejecución local

### Requisitos previos
- Node.js v18+
- MySQL 8+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/bar-management-system.git
cd bar-management-system
```

### 2. Configurar la base de datos
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seeds.sql
```

### 3. Configurar variables de entorno
```bash
# backend/.env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bar_management
DB_USER=root
DB_PASSWORD=tu_password
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=5m
PORT=3001
```

### 4. Instalar dependencias y ejecutar

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (nueva terminal)
cd frontend
npm install
npm start
```

La aplicación estará disponible en `http://localhost:3000`

---

## 🔐 Seguridad

- Contraseñas hasheadas con **BCrypt**
- Autenticación stateless con **JWT** (expiración: 5 min de inactividad)
- Comunicación sobre **HTTPS** en producción
- Tabla de **auditoría** que registra cada acción crítica con usuario, IP, acción y timestamp

---

## 📊 Planificación del Proyecto

| Sprint | Período | Módulos | Estado |
|--------|---------|---------|--------|
| Sprint 0 | 02/02 – 13/02/2026 | Infraestructura | ✅ Completado |
| Sprint 1 | 16/02 – 27/02/2026 | Autenticación · Usuarios | ✅ Completado |
| Sprint 2 | 02/03 – 13/03/2026 | Inventario | ✅ Completado |
| Sprint 3 | 16/03 – 27/03/2026 | Pedidos · Ventas | ⏳ Pendiente |
| Sprint 4 | 30/03 – 10/04/2026 | Reportes · Seguridad · Auditoría | ⏳ Pendiente|
| Sprint 5 | 13/04 – 24/04/2026 | QA — Pruebas integrales | ⏳ Pendiente |
| Sprint 6 | 27/04 – 12/05/2026 | Despliegue · Entrega | ⏳ Pendiente |

**Total:** 30 historias de usuario · 280 horas estimadas · Fin: 12/05/2026

---

## 🧪 Pruebas (Sprint 5)

```bash
# Pruebas de integración
npm run test:integration

# Pruebas de carga (15 meseros + 1 cajero + 1 admin simultáneos)
npm run test:load

# Pruebas de regresión
npm run test:regression
```

**Criterios de calidad:**
- Tiempo de respuesta < 1 segundo bajo carga normal
- 0 bugs críticos antes del Sprint 6
- Flujo completo Mesero → Cajero → Inventario validado end-to-end

---

## 👨‍💻 Equipo — Nexus Software Factory

| Rol | Responsabilidad |
|-----|----------------|
| Tech Lead | Arquitectura, estándares de código |
| Backend Dev | API REST, lógica de negocio, BD |
| Frontend Dev | Interfaz React, consumo de API |
| QA Engineer | Pruebas de integración, carga y regresión |
| DevOps / DB Admin | Infraestructura, despliegue, BD |
| Analista Funcional | Requisitos, manual de usuario, capacitación |

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos y comerciales por **Nexus Software Factory**.

---

*Desarrollado con ❤️ por Nexus Software Factory — 2026*
