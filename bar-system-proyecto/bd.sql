
-- =============================================
-- BAR SYSTEM — Base de datos MySQL
-- Ejecutar en MySQL Workbench o terminal MySQL
-- =============================================

CREATE DATABASE IF NOT EXISTS bar_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bar_system;

-- ─────────────────────────────────────────────
-- SEDES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sedes (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  nombre    VARCHAR(100) NOT NULL,
  ciudad    VARCHAR(100),
  activo    BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sedes (nombre, ciudad) VALUES
  ('Bogotá',   'Bogotá'),
  ('Cali',     'Cali'),
  ('Medellín', 'Medellín');

-- ─────────────────────────────────────────────
-- USUARIOS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  username  VARCHAR(50)  NOT NULL UNIQUE,
  nombre    VARCHAR(100) NOT NULL,
  password  VARCHAR(255) NOT NULL,
  email     VARCHAR(100),
  rol       ENUM('ADMINISTRADOR','CAJERO','MESERO') NOT NULL,
  sedeId    INT NULL,
  activo    BOOLEAN DEFAULT TRUE,
  createdAt DATE DEFAULT (CURRENT_DATE),
  FOREIGN KEY (sedeId) REFERENCES sedes(id) ON DELETE SET NULL
);

-- Contraseña por defecto: "123456" (hash bcrypt generado)
INSERT INTO usuarios (username, nombre, password, email, rol, sedeId, activo, createdAt) VALUES
  ('admin',      'Carlos Rodríguez', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@revolcon.co',   'ADMINISTRADOR', NULL, TRUE,  '2026-02-01'),
  ('cajero_bog', 'Mariana López',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mlop@revolcon.co',    'CAJERO',        1,    FALSE, '2026-02-03'),
  ('mesero_bog', 'Andrés Gómez',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'agom@revolcon.co',    'MESERO',        1,    TRUE,  '2026-02-03'),
  ('cajero_cal', 'Valentina Torres', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vtor@revolcon.co',    'CAJERO',        2,    TRUE,  '2026-02-04'),
  ('mesero_cal', 'Diego Martínez',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'dmar@revolcon.co',    'MESERO',        2,    TRUE,  '2026-02-04'),
  ('mesero_med', 'Laura Jiménez',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ljim@revolcon.co',    'MESERO',        3,    FALSE, '2026-02-10'),
  ('cajero_med', 'Felipe Sánchez',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'fsan@revolcon.co',    'CAJERO',        3,    TRUE,  '2026-02-10');

-- ─────────────────────────────────────────────
-- PRODUCTOS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS productos (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  nombre      VARCHAR(150) NOT NULL,
  categoria   VARCHAR(80)  NOT NULL,
  precio      DECIMAL(10,2) NOT NULL,
  descripcion VARCHAR(255),
  activo      BOOLEAN DEFAULT TRUE,
  createdAt   DATE DEFAULT (CURRENT_DATE)
);

INSERT INTO productos (nombre, categoria, precio, descripcion, activo) VALUES
  ('Cerveza Club Colombia',   'Cervezas',         7500,  '330 ml botella',              TRUE),
  ('Cerveza Heineken',        'Cervezas',         9000,  '330 ml botella importada',    TRUE),
  ('Cerveza Águila Light',    'Cervezas',         6500,  '330 ml baja en calorías',     TRUE),
  ('Aguardiente Antioqueño',  'Licores',         45000,  '375 ml botella',              TRUE),
  ('Ron Medellín Añejo',      'Licores',         55000,  '375 ml, 8 años',              TRUE),
  ('Whisky Red Label',        'Licores',         85000,  '375 ml Johnnie Walker',       TRUE),
  ('Mojito Clásico',          'Cócteles',        18000,  'Ron blanco, menta, limón',    TRUE),
  ('Margarita',               'Cócteles',        20000,  'Tequila, triple sec, limón',  TRUE),
  ('Piña Colada',             'Cócteles',        19000,  'Ron, leche de coco, piña',    TRUE),
  ('Negroni',                 'Cócteles',        22000,  'Gin, Campari, vermut rojo',   TRUE),
  ('Coca-Cola',               'Gaseosas & Jugos', 4000,  '350 ml lata',                 TRUE),
  ('Agua mineral Cristal',    'Gaseosas & Jugos', 3000,  '600 ml botella',              TRUE),
  ('Jugo de Naranja Natural', 'Gaseosas & Jugos', 6000,  '300 ml vaso',                 TRUE),
  ('Nachos con Guacamole',    'Snacks',          14000,  'Porción para 2',              TRUE),
  ('Tabla de Quesos',         'Snacks',          28000,  '4 variedades + uvas',         TRUE),
  ('Shot de Tequila Silver',  'Shots',           12000,  '30 ml',                       TRUE),
  ('Shot de Aguardiente',     'Shots',            8000,  '30 ml Antioqueño',            TRUE),
  ('Shot de Whisky',          'Shots',           15000,  '30 ml Johnnie Walker Red',    FALSE);

-- ─────────────────────────────────────────────
-- STOCK POR SEDE
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  sedeId      INT NOT NULL,
  productoId  INT NOT NULL,
  cantidad    INT DEFAULT 0,
  minimo      INT DEFAULT 8,
  updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sedeId)     REFERENCES sedes(id)    ON DELETE CASCADE,
  FOREIGN KEY (productoId) REFERENCES productos(id) ON DELETE CASCADE,
  UNIQUE KEY uq_sede_producto (sedeId, productoId)
);

-- Stock inicial para las 3 sedes
INSERT INTO stock (sedeId, productoId, cantidad, minimo) VALUES
  -- Bogotá (sede 1)
  (1,1,4,8),(1,2,15,8),(1,3,25,8),(1,4,12,8),(1,5,30,8),
  (1,6,10,8),(1,7,2,5),(1,8,20,5),(1,9,18,5),(1,10,14,5),
  (1,11,40,10),(1,12,35,10),(1,13,22,5),(1,14,15,5),(1,15,8,3),
  (1,16,0,5),(1,17,25,5),(1,18,12,5),
  -- Cali (sede 2)
  (2,1,20,8),(2,2,18,8),(2,3,30,8),(2,4,15,8),(2,5,25,8),
  (2,6,8,8),(2,7,12,5),(2,8,16,5),(2,9,10,5),(2,10,9,5),
  (2,11,45,10),(2,12,40,10),(2,13,18,5),(2,14,12,5),(2,15,6,3),
  (2,16,5,5),(2,17,20,5),(2,18,8,5),
  -- Medellín (sede 3)
  (3,1,10,8),(3,2,22,8),(3,3,15,8),(3,4,8,8),(3,5,18,8),
  (3,6,5,8),(3,7,7,5),(3,8,14,5),(3,9,11,5),(3,10,6,5),
  (3,11,38,10),(3,12,30,10),(3,13,20,5),(3,14,10,5),(3,15,4,3),
  (3,16,3,5),(3,17,15,5),(3,18,7,5);

-- ─────────────────────────────────────────────
-- AUDITORÍA (HU-023)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auditoria (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  tipo      VARCHAR(50)  NOT NULL,
  usuario   VARCHAR(50)  NOT NULL,
  sedeId    INT NULL,
  ip        VARCHAR(45),
  detalle   TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

SELECT 'Base de datos bar_system creada exitosamente ✅' AS resultado;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;