-- Tabla entidades: almacena las entidades que participan en la contratación pública
CREATE TABLE IF NOT EXISTS entidades (
    nit_entidad VARCHAR(50) PRIMARY KEY,
    nombre_entidad VARCHAR(255) NOT NULL,
    departamento_entidad VARCHAR(100),
    ciudad_entidad VARCHAR(100),
    orden_entidad VARCHAR(100),
    entidad_centralizada VARCHAR(100)
);

-- Tabla proveedores: información de los proveedores adjudicados
CREATE TABLE IF NOT EXISTS proveedores (
    nit_proveedor_adjudicado VARCHAR(50) PRIMARY KEY,
    nombre_proveedor_adjudicado VARCHAR(255) NOT NULL,
    codigo_proveedor VARCHAR(50),
    departamento_proveedor VARCHAR(100),
    ciudad_proveedor VARCHAR(100)
);

-- Tabla procesos: procesos de contratación
CREATE TABLE IF NOT EXISTS procesos (
    id_proceso VARCHAR(255) PRIMARY KEY,
    referencia_proceso VARCHAR(255),
    pci BIGINT,
    id_portafolio VARCHAR(255),
    nombre_procedimiento VARCHAR(255),
    descripcion_procedimiento TEXT,
    fase VARCHAR(50),
    fecha_publicacion_proceso DATE,
    fecha_ultima_publicacion DATE,
    precio_base NUMERIC(30, 2),
    modalidad_contratacion VARCHAR(255),
    justificacion_modalidad TEXT,
    duracion VARCHAR(50),
    unidad_duracion VARCHAR(50),
    ciudad_unidad_contratacion VARCHAR(255),
    nombre_unidad_contratacion VARCHAR(255),
    url_proceso VARCHAR(255),
    codigo_entidad BIGINT,
    estado_resumen VARCHAR(255),
    nit_entidad VARCHAR(50),

    CONSTRAINT fk_procesos_entidades FOREIGN KEY (nit_entidad) REFERENCES entidades(nit_entidad)
);

-- Tabla fechas: fechas relevantes para diferentes fases del proceso
CREATE TABLE IF NOT EXISTS fechas (
    id_fecha SERIAL PRIMARY KEY,
    id_proceso VARCHAR(255),

    fecha_planificacion_precalificacion DATE,
    fecha_seleccion_precalificacion DATE,
    fecha_manifestacion_interes DATE,
    fecha_borrador DATE,
    fecha_seleccion DATE,

    CONSTRAINT fk_fechas_procesos FOREIGN KEY (id_proceso) REFERENCES procesos(id_proceso)
);

-- Tabla estadisticas: métricas relacionadas con los procesos
CREATE TABLE IF NOT EXISTS estadisticas (
    id_estadistica SERIAL PRIMARY KEY,
    id_proceso VARCHAR(255),

    proveedores_invitados INT,
    proveedores_invitacion_directa INT,
    visualizaciones INT,
    proveedores_interesados INT,
    respuestas INT,
    respuestas_externas INT,
    conteo_respuestas INT,
    proveedores_unicos_respuestas INT,
    numero_lotes INT,
    estado_procedimiento VARCHAR(255),

    CONSTRAINT fk_estadisticas_procesos FOREIGN KEY (id_proceso) REFERENCES procesos(id_proceso)
);

-- Tabla adjudicaciones: información de adjudicación de contratos
CREATE TABLE IF NOT EXISTS adjudicaciones (
    id_adjudicacion VARCHAR(255) PRIMARY KEY,
    fecha_adjudicacion DATE,
    valor_total_adjudicacion NUMERIC(30, 2),
    nombre_adjudicador VARCHAR(255),
    id_proceso VARCHAR(255),
    nit_proveedor_adjudicado VARCHAR(50),

    CONSTRAINT fk_adjudicaciones_procesos FOREIGN KEY (id_proceso) REFERENCES procesos(id_proceso),
    CONSTRAINT fk_adjudicaciones_proveedores FOREIGN KEY (nit_proveedor_adjudicado) REFERENCES proveedores(nit_proveedor_adjudicado)
);

-- Tabla tipos_contrato: tipos y subtipos de contrato en procesos
CREATE TABLE IF NOT EXISTS tipos_contrato (
    id_tipo_contrato SERIAL PRIMARY KEY,
    id_proceso VARCHAR(255),
    tipo_contrato VARCHAR(255),
    subtipo_contrato VARCHAR(255),
    categorias_adicionales VARCHAR(255),

    CONSTRAINT fk_tiposcontrato_procesos FOREIGN KEY (id_proceso) REFERENCES procesos(id_proceso)
);
