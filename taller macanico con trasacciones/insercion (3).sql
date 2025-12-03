USE TallerMecanico;
GO

-- Insertar datos en tabla ROL
INSERT INTO rol (nombre_rol) VALUES 
('Administrador'),
('Cliente'),
('Mecánico'),
('Supervisor'),
('Recepcionista'),
('Jefe de Taller'),
('Asistente'),
('Contador'),
('Vendedor'),
('Gerente');

-- Insertar datos en tabla ESPECIALIDAD
INSERT INTO especialidad (nombre_especialidad) VALUES 
('Motor y Transmisión'),
('Frenos y Suspensión'),
('Sistema Eléctrico'),
('Aire Acondicionado'),
('Pintura y Carrocería'),
('Diagnóstico Computarizado'),
('Llantas y Alineación'),
('Sistema de Escape'),
('Lubricación'),
('Radiador y Refrigeración');

-- Insertar datos en tabla USUARIO
INSERT INTO usuario (nombre, apellido, correo, telefono, id_rol) VALUES 
('Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', '3001234567', 1),
('María', 'González', 'maria.gonzalez@email.com', '3009876543', 2),
('Juan', 'Pérez', 'juan.perez@email.com', '3005555555', 3),
('Ana', 'Martínez', 'ana.martinez@email.com', '3007777777', 2),
('Luis', 'García', 'luis.garcia@email.com', '3008888888', 3),
('Carmen', 'López', 'carmen.lopez@email.com', '3006666666', 4),
('Pedro', 'Hernández', 'pedro.hernandez@email.com', '3004444444', 5),
('Laura', 'Jiménez', 'laura.jimenez@email.com', '3002222222', 2),
('Miguel', 'Torres', 'miguel.torres@email.com', '3003333333', 3),
('Sofia', 'Vargas', 'sofia.vargas@email.com', '3001111111', 6);

-- Insertar datos en tabla MECANICO
INSERT INTO mecanico (id_usuario, experiencia, certificaciones) VALUES 
(3, '5 años de experiencia en motores diésel y gasolina', 'Certificación ASE, Curso Bosch'),
(5, '8 años especializado en sistemas eléctricos automotrices', 'Certificación Electrónica Automotriz'),
(9, '3 años en frenos y suspensión', 'Certificación Brembo, Curso Monroe'),
(1, '10 años como supervisor de taller', 'Gestión Automotriz, Liderazgo'),
(6, '6 años en diagnóstico computarizado', 'Certificación OBD-II, Scanner Automotriz'),
(10, '12 años como jefe de taller', 'Administración Talleres, ISO 9001'),
(7, '4 años en pintura y carrocería', 'Certificación PPG, Técnicas Pintura'),
(2, '7 años en aire acondicionado automotriz', 'Certificación R134a, Sistemas HVAC'),
(4, '2 años en llantas y alineación', 'Certificación Hunter, Balanceadora'),
(8, '9 años en lubricación y mantenimiento', 'Certificación Mobil 1, Valvoline');

-- Insertar datos en tabla MECANICOESPECIALIDAD
INSERT INTO mecanicoespecialidad (id_mecanico, id_especialidad) VALUES 
(1, 1), (1, 6),
(2, 3), (2, 6),
(3, 2), (3, 7),
(4, 1), (4, 9),
(5, 6), (5, 3),
(6, 1), (6, 2),
(7, 5), (7, 8),
(8, 4), (8, 10),
(9, 7), (9, 2),
(10, 9), (10, 1);

-- Insertar datos en tabla TALLER
INSERT INTO taller (nombre, direccion, contacto, id_mecanico_responsable) VALUES 
('Taller Centro', 'Carrera 10 #45-23, Centro', 'info@tallercentro.com', 6),
('AutoServicio Norte', 'Calle 100 #15-45, Norte', '601-2345678', 4),
('Mecánica Express', 'Avenida 68 #30-12, Engativá', 'contacto@mecexpress.com', 1),
('Taller Sur', 'Carrera 30 #8-45, Sur', '601-3456789', 2),
('AutoTech', 'Calle 26 #50-30, Zona Rosa', 'ventas@autotech.com', 5),
('Servicio Rápido', 'Carrera 7 #120-50, Usaquén', '601-4567890', 3),
('Taller Especializado', 'Avenida Boyacá #80-25', 'especializado@taller.com', 7),
('Centro Automotriz', 'Calle 63 #11-45, Chapinero', '601-5678901', 8),
('Mega Taller', 'Carrera 50 #20-30, Kennedy', 'info@megataller.com', 9),
('Taller Premium', 'Calle 85 #15-20, Zona Norte', 'premium@taller.com', 10);

-- Insertar datos en tabla SERVICIO
INSERT INTO servicio (nombre, descripcion, tarifa_base, id_especialidad) VALUES 
('Cambio de Aceite', 'Cambio completo de aceite motor y filtro', 45000.00, 9),
('Alineación y Balanceo', 'Alineación de dirección y balanceo de llantas', 80000.00, 7),
('Revisión de Frenos', 'Inspección completa sistema de frenos', 35000.00, 2),
('Diagnóstico Computarizado', 'Escaneo completo de sistemas electrónicos', 60000.00, 6),
('Mantenimiento A/C', 'Limpieza y carga de gas aire acondicionado', 120000.00, 4),
('Sincronización Motor', 'Ajuste de tiempo de encendido y válvulas', 150000.00, 1),
('Cambio Pastillas Freno', 'Reemplazo de pastillas delanteras o traseras', 180000.00, 2),
('Reparación Sistema Eléctrico', 'Diagnóstico y reparación de fallas eléctricas', 90000.00, 3),
('Pintura Parcial', 'Retoque de pintura en panel específico', 200000.00, 5),
('Limpieza Inyectores', 'Limpieza ultrasónica de inyectores', 85000.00, 1);

-- Insertar datos en tabla REPUESTO
INSERT INTO repuesto (nombre, marca, referencia, precio) VALUES 
('Aceite Motor 5W-30', 'Mobil 1', 'MOB-5W30-4L', 85000.00),
('Filtro de Aceite', 'Mann Filter', 'W67/2', 25000.00),
('Pastillas Freno Delanteras', 'Bendix', 'DB1678', 120000.00),
('Batería 12V 60Ah', 'MAC', 'MAC-60AH', 180000.00),
('Llanta 185/60R15', 'Michelin', 'MIC-185-60-15', 280000.00),
('Bujías Iridium', 'NGK', 'NGK-IR6T11', 45000.00),
('Filtro Aire Motor', 'K&N', 'KN-33-2304', 65000.00),
('Amortiguador Delantero', 'Monroe', 'MON-58640', 150000.00),
('Radiador Completo', 'Denso', 'DEN-2213304', 320000.00),
('Kit Embrague', 'LUK', 'LUK-623-3054', 450000.00);

-- Insertar datos en tabla VEHICULO
INSERT INTO vehiculo (id_usuario, tipo, marca, modelo, placa, anio) VALUES 
(2, 'Sedán', 'Toyota', 'Corolla', 'ABC123', 2020),
(4, 'Hatchback', 'Chevrolet', 'Spark', 'DEF456', 2019),
(8, 'SUV', 'Mazda', 'CX-5', 'GHI789', 2021),
(2, 'Pickup', 'Ford', 'Ranger', 'JKL012', 2018),
(4, 'Sedán', 'Nissan', 'Sentra', 'MNO345', 2022),
(8, 'Hatchback', 'Renault', 'Sandero', 'PQR678', 2017),
(2, 'SUV', 'Hyundai', 'Tucson', 'STU901', 2020),
(4, 'Sedán', 'Kia', 'Rio', 'VWX234', 2019),
(8, 'Camioneta', 'Chevrolet', 'D-Max', 'YZA567', 2021),
(2, 'Hatchback', 'Volkswagen', 'Gol', 'BCD890', 2018);

-- Insertar datos en tabla PROMOCION
INSERT INTO promocion (nombre, descripcion, descuento, fecha_inicio, fecha_fin) VALUES 
('Descuento Estudiantes UNIMINUTO', 'Descuento especial para estudiantes', 15.00, '2024-01-01', '2024-12-31'),
('Promoción Cambio Aceite', 'Descuento en cambio de aceite', 10.00, '2024-09-01', '2024-09-30'),
('Black Friday Automotriz', 'Mega descuentos en servicios', 25.00, '2024-11-24', '2024-11-30'),
('Mantenimiento Preventivo', 'Descuento en paquete mantenimiento', 20.00, '2024-10-01', '2024-10-31'),
('Temporada Frenos', 'Promoción especial en frenos', 18.00, '2024-08-01', '2024-08-31'),
('Cliente Frecuente', 'Descuento para clientes recurrentes', 12.00, '2024-01-01', '2024-12-31'),
('Fin de Año', 'Promoción de cierre de año', 30.00, '2024-12-01', '2024-12-31'),
('Verano 2024', 'Descuento temporada de verano', 15.00, '2024-06-01', '2024-08-31'),
('Aire Acondicionado', 'Promoción especial A/C', 22.00, '2024-03-01', '2024-05-31'),
('Nuevos Clientes', 'Bienvenida para nuevos clientes', 25.00, '2024-01-01', '2024-12-31');

-- Insertar datos en tabla PROMOCION_ESTUDIANTES_UNIMINUTO
INSERT INTO promocion_estudiantes_uniminuto (id_promocion, nombre_estudiante, codigo_estudiante, programa_academico, semestre, correo_institucional) VALUES 
(1, 'Andrés Castillo', '000123456', 'Ingeniería de Sistemas', 8, 'acastillo@uniminuto.edu.co'),
(1, 'Diana Morales', '000234567', 'Administración de Empresas', 6, 'dmorales@uniminuto.edu.co'),
(1, 'Roberto Silva', '000345678', 'Ingeniería Industrial', 7, 'rsilva@uniminuto.edu.co'),
(1, 'Patricia Ruiz', '000456789', 'Contaduría Pública', 5, 'pruiz@uniminuto.edu.co'),
(1, 'Alejandro Méndez', '000567890', 'Ingeniería Civil', 9, 'amendez@uniminuto.edu.co'),
(1, 'Valentina Cruz', '000678901', 'Psicología', 4, 'vcruz@uniminuto.edu.co'),
(1, 'Sebastián Ortega', '000789012', 'Comunicación Social', 3, 'sortega@uniminuto.edu.co'),
(1, 'Isabella Ramírez', '000890123', 'Ingeniería Ambiental', 8, 'iramirez@uniminuto.edu.co'),
(1, 'Daniel Herrera', '000901234', 'Derecho', 6, 'dherrera@uniminuto.edu.co'),
(1, 'Camila Torres', '000012345', 'Mercadeo', 5, 'ctorres@uniminuto.edu.co');

-- Insertar datos en tabla CITASERVICIO
INSERT INTO citaservicio (id_usuario, id_vehiculo, id_taller, fecha, hora, estado) VALUES 
(2, 1, 1, '2024-09-20', '08:00:00', 'PROGRAMADA'),
(4, 2, 2, '2024-09-21', '10:30:00', 'PROGRAMADA'),
(8, 3, 3, '2024-09-22', '14:00:00', 'EN_PROCESO'),
(2, 4, 4, '2024-09-23', '09:15:00', 'COMPLETADA'),
(4, 5, 5, '2024-09-24', '11:45:00', 'PROGRAMADA'),
(8, 6, 6, '2024-09-25', '15:30:00', 'PROGRAMADA'),
(2, 7, 7, '2024-09-26', '13:00:00', 'EN_PROCESO'),
(4, 8, 8, '2024-09-27', '16:15:00', 'COMPLETADA'),
(8, 9, 9, '2024-09-28', '08:45:00', 'PROGRAMADA'),
(2, 10, 10, '2024-09-29', '12:30:00', 'PROGRAMADA');

-- Insertar datos en tabla CITAPROMOCION
INSERT INTO citapromocion (id_cita, id_promocion) VALUES 
(1, 1), (1, 6),
(2, 2), (2, 10),
(3, 3), (3, 8),
(4, 4), (4, 6),
(5, 5), (5, 1),
(6, 6), (6, 9),
(7, 7), (7, 4),
(8, 8), (8, 2),
(9, 9), (9, 3),
(10, 10), (10, 5);

-- Insertar datos en tabla DETALLECITA
INSERT INTO detallecita (id_cita, id_servicio, costo_estimado) VALUES 
(1, 1, 45000.00),
(2, 2, 80000.00),
(3, 3, 35000.00),
(4, 4, 60000.00),
(5, 5, 120000.00),
(6, 6, 150000.00),
(7, 7, 180000.00),
(8, 8, 90000.00),
(9, 9, 200000.00),
(10, 10, 85000.00);

-- Insertar datos en tabla DETALLEREPUESTO
INSERT INTO detallerepuesto (id_detalle_cita, id_repuesto, cantidad) VALUES 
(1, 1, 1), (1, 2, 1),
(2, 5, 2), (2, 8, 2),
(3, 3, 1), (3, 7, 1),
(4, 6, 4), (4, 4, 1),
(5, 9, 1), (5, 10, 1),
(6, 1, 1), (6, 2, 1),
(7, 3, 1), (7, 6, 4),
(8, 4, 1), (8, 7, 1),
(9, 8, 2), (9, 9, 1),
(10, 1, 1), (10, 6, 4);

-- Insertar datos en tabla FACTURA
INSERT INTO factura (id_cita, monto_total, fecha_emision, estado_pago) VALUES 
(1, 110000.00, '2024-09-20 10:00:00', 'PENDIENTE'),
(2, 640000.00, '2024-09-21 12:00:00', 'PAGADA'),
(3, 155000.00, '2024-09-22 16:00:00', 'PENDIENTE'),
(4, 240000.00, '2024-09-23 11:00:00', 'PAGADA'),
(5, 770000.00, '2024-09-24 13:00:00', 'PENDIENTE'),
(6, 260000.00, '2024-09-25 17:00:00', 'PAGADA'),
(7, 360000.00, '2024-09-26 15:00:00', 'PENDIENTE'),
(8, 270000.00, '2024-09-27 18:00:00', 'PAGADA'),
(9, 820000.00, '2024-09-28 10:00:00', 'PENDIENTE'),
(10, 265000.00, '2024-09-29 14:00:00', 'PAGADA');

-- Insertar datos en tabla RESEÑA
INSERT INTO reseña (id_cita, calificacion, comentario) VALUES 
(4, 5, 'Excelente servicio, muy profesionales y rápidos'),
(8, 4, 'Buen trabajo, aunque tardaron un poco más de lo esperado'),
(1, 5, 'Muy satisfecho con el cambio de aceite'),
(2, 3, 'El servicio estuvo bien pero el precio un poco alto'),
(3, 4, 'Buenos mecánicos, explicaron bien el problema'),
(5, 5, 'Perfecta atención, volveré sin duda'),
(6, 4, 'Trabajo de calidad, instalaciones limpias'),
(7, 2, 'Tuvieron que repetir el trabajo, no quedó bien la primera vez'),
(9, 5, 'Excepcional servicio de pintura, quedó como nuevo'),
(10, 4, 'Buen diagnóstico y solución rápida del problema');



UPDATE citaservicio SET id_mecanico_asignado = 1 WHERE id_cita = 1;
UPDATE citaservicio SET id_mecanico_asignado = 2 WHERE id_cita = 2;
UPDATE citaservicio SET id_mecanico_asignado = 3 WHERE id_cita = 3;
UPDATE citaservicio SET id_mecanico_asignado = 1 WHERE id_cita = 4;
UPDATE citaservicio SET id_mecanico_asignado = 2 WHERE id_cita = 5;


INSERT INTO factura (id_cita, fecha_emision, monto_total)
VALUES
(1, '2024-09-20', 200000),
(2, '2024-09-21', 350000),
(3, '2024-09-22', 150000),
(4, '2024-09-23', 500000),
(5, '2024-09-24', 300000);