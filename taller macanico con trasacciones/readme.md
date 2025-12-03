# 🚗 Sistema Transaccional – Taller Mecánico  
**Proyecto Académico – SQL Server**

Este proyecto implementa un **sistema transaccional completo** para la gestión de un taller mecánico, aplicando conceptos de bases de datos, integridad referencial, triggers, procedimientos almacenados, transacciones, manejo de errores y automatización de procesos internos.

Incluye módulos de clientes, vehículos, mecánicos, talleres, citas, servicios, repuestos, facturación, promociones y notificaciones.

---

## 📌 Objetivos del Proyecto
- Diseñar y construir una base de datos relacional robusta para un taller mecánico.
- Aplicar **triggers**, **funciones**, **procedimientos almacenados** y **transacciones**.
- Garantizar integridad de los datos mediante claves foráneas y validaciones.
- Automatizar procesos como:
  - Asignación de mecánicos.
  - Aplicación de promociones.
  - Cálculo de facturas y descuentos.
  - Registro de notificaciones al usuario.
- Implementar reglas de negocio reales del entorno automotriz.

---

## 🗂️ **Tecnologías Utilizadas**
- **SQL Server**
- **T-SQL**
- Triggers
- Funciones (scalar & table)
- Stored Procedures
- Subconsultas, joins, transacciones
- Manejo de errores (TRY/CATCH)

---

## 🏗️ **Estructura Principal de Tablas**
El sistema incluye más de 20 entidades principales, entre ellas:

- `usuario`
- `rol`
- `mecanico`
- `especialidad`
- `mecanicoespecialidad`
- `vehiculo`
- `taller`
- `citaservicio`
- `servicio`
- `detallecita`
- `repuesto`
- `detalleRepuesto`
- `factura`
- `promocion`
- `citapromocion`
- `reseña`, `reseñafiltro`
- `notificacion`
- `descuentoclientes`

Estas permiten modelar todos los procesos operativos de un taller automotriz real.

---

## ⚙️ **Funciones del Sistema**
### ✔ Gestión de usuarios y roles  
Registro de clientes, mecánicos, supervisores, administrativos, etc.

### ✔ Gestión de vehículos  
Cada cliente puede registrar múltiples vehículos.

### ✔ Gestión de mecánicos y especialidades  
Relación muchos-a-muchos con nivel de experiencia y certificaciones.

### ✔ Agendamiento de citas  
Con fecha, hora, taller, mecánico responsable y estado.

### ✔ Servicios y repuestos  
Cada cita puede tener múltiples servicios y repuestos asociados.

### ✔ Facturación  
Cálculo automático del total, promociones y descuentos.

### ✔ Promociones y descuentos  
Aplicación automática de beneficios según tipo de cliente, servicio o temporada.

### ✔ Triggers de automatización  
Ejemplos:
- Notificar al usuario cuando se cambia el estado de la cita.
- Validar calificaciones y mover registros a `reseñafiltro`.
- Aplicar descuento en la factura cuando corresponde.



## 📥 **Instalación**
1. Abrir **SQL Server Management Studio (SSMS)**.  
2. Ejecutar el archivo:
