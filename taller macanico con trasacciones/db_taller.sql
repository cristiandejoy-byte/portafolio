
CREATE DATABASE TallerMecanico2;
GO

USE TallerMecanico2;
GO

-- TABLAS PRINCIPALES
CREATE TABLE rol(
    id_rol INT IDENTITY(1,1) PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL
);

CREATE TABLE usuario(
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    id_rol INT FOREIGN KEY REFERENCES rol(id_rol)
);

CREATE TABLE mecanico(
    id_mecanico INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT FOREIGN KEY REFERENCES usuario(id_usuario),
    experiencia TEXT,
    certificaciones TEXT
);

CREATE TABLE especialidad(
    id_especialidad INT IDENTITY(1,1) PRIMARY KEY,
    nombre_especialidad VARCHAR(100) NOT NULL
);

CREATE TABLE mecanicoespecialidad(
    id_mecanico INT FOREIGN KEY REFERENCES mecanico(id_mecanico),
    id_especialidad INT FOREIGN KEY REFERENCES especialidad(id_especialidad),
    PRIMARY KEY (id_mecanico, id_especialidad)
);

CREATE TABLE taller(
    id_taller INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    contacto VARCHAR(100),
    id_mecanico_responsable INT FOREIGN KEY REFERENCES mecanico(id_mecanico)
);

CREATE TABLE vehiculo(
    id_vehiculo INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT FOREIGN KEY REFERENCES usuario(id_usuario),
    tipo VARCHAR(50),
    marca VARCHAR(50),
    modelo VARCHAR(50),
    placa VARCHAR(20),
    anio INT
);

CREATE TABLE citaservicio(
    id_cita INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT FOREIGN KEY REFERENCES usuario(id_usuario),
    id_vehiculo INT FOREIGN KEY REFERENCES vehiculo(id_vehiculo),
    id_taller INT FOREIGN KEY REFERENCES taller(id_taller),
    fecha DATE,
    hora TIME,
    estado VARCHAR(20) DEFAULT 'PROGRAMADA',
    id_mecanico_asignado INT FOREIGN KEY REFERENCES mecanico(id_mecanico)
);

CREATE TABLE servicio(
    id_servicio INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tarifa_base DECIMAL(10, 2),
    id_especialidad INT FOREIGN KEY REFERENCES especialidad(id_especialidad)
);

CREATE TABLE detallecita(
    id_detalle_cita INT IDENTITY(1,1) PRIMARY KEY,
    id_cita INT FOREIGN KEY REFERENCES citaservicio(id_cita),
    id_servicio INT FOREIGN KEY REFERENCES servicio(id_servicio),
    costo_estimado DECIMAL(10, 2)
);

CREATE TABLE repuesto(
    id_repuesto INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    marca VARCHAR(50),
    referencia VARCHAR(50),
    precio DECIMAL(10, 2)
);

CREATE TABLE detallerepuesto(
    id_detalle_repuesto INT IDENTITY(1,1) PRIMARY KEY,
    id_detalle_cita INT FOREIGN KEY REFERENCES detallecita(id_detalle_cita),
    id_repuesto INT FOREIGN KEY REFERENCES repuesto(id_repuesto),
    cantidad INT
);

CREATE TABLE factura(
    id_factura INT IDENTITY(1,1) PRIMARY KEY,
    id_cita INT FOREIGN KEY REFERENCES citaservicio(id_cita),
    monto_total DECIMAL(10, 2),
    fecha_emision DATETIME DEFAULT GETDATE(),
    estado_pago VARCHAR(20) DEFAULT 'PENDIENTE',
    descuento_aplicado DECIMAL(5, 2) DEFAULT 0
);

CREATE TABLE promocion(
    id_promocion INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    descuento DECIMAL(5, 2),
    fecha_inicio DATE,
    fecha_fin DATE
);

CREATE TABLE citapromocion(
    id_cita INT FOREIGN KEY REFERENCES citaservicio(id_cita),
    id_promocion INT FOREIGN KEY REFERENCES promocion(id_promocion),
    PRIMARY KEY (id_cita, id_promocion)
);

CREATE TABLE promocion_estudiantes_uniminuto(
    id INT IDENTITY(1,1) PRIMARY KEY,
    id_promocion INT FOREIGN KEY REFERENCES promocion(id_promocion),
    nombre_estudiante VARCHAR(100),
    codigo_estudiante VARCHAR(20),
    programa_academico VARCHAR(100),
    semestre INT,
    correo_institucional VARCHAR(150),
    fecha_registro DATETIME DEFAULT GETDATE()
);

CREATE TABLE reseña(
    id_cita INT PRIMARY KEY FOREIGN KEY REFERENCES citaservicio(id_cita),
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
    comentario VARCHAR(MAX)
);

CREATE TABLE reseñafiltro(
    id_reseña INT IDENTITY(1,1) PRIMARY KEY,
    id_cita INT NOT NULL,
    calificacion INT CHECK (calificacion BETWEEN 1 AND 5),
    comentario VARCHAR(MAX),
    fecha_creacion DATETIME DEFAULT GETDATE(),
    procesada BIT DEFAULT 0,
    mensaje_error VARCHAR(300)
);

CREATE TABLE notificacion(
    id_notificacion INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario INT FOREIGN KEY REFERENCES usuario(id_usuario),
    mensaje VARCHAR(100) NOT NULL,
    fecha_notificacion DATETIME DEFAULT GETDATE(),
    leida BIT DEFAULT 0
);

CREATE TABLE descuentoclientes(
    id_factura INT,
    id_usuario INT,
    monto_original DECIMAL(10, 2),
    servicios_previos INT
);

PRINT 'Base de datos creada exitosamente';
GO