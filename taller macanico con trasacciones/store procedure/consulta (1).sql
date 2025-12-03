
/*
DESCRIPCIÓN: Consulta la disponibilidad de talleres en una fecha específica,
             mostrando los servicios disponibles y mecánicos especializados.
             
ESCENARIO: Un cliente llama para preguntar qué talleres tienen disponibilidad
           para un servicio específico en una fecha determinada. El sistema
           muestra los talleres disponibles, sus servicios, tarifas y los
           mecánicos especializados que pueden atender.
*/
use TallerMecanico2;


go


CREATE PROCEDURE SP_ConsultarDisponibilidad2
    @fecha_consulta DATE,
    @id_especialidad INT = NULL
AS
BEGIN
    DECLARE @fecha_actual DATE = CAST(GETDATE() AS DATE);

    
    PRINT 'Fecha solicitada: ' + CONVERT(VARCHAR, @fecha_consulta, 103);

    BEGIN TRY
        
        PRINT 'Paso 1: Validar que la fecha no sea pasada';
        IF @fecha_consulta < @fecha_actual
        BEGIN
            PRINT 'La fecha ingresada ya pasó.';
            RETURN;
        END;

        PRINT 'Paso 2: Validar especialidad si fue enviada';
        IF @id_especialidad IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM especialidad WITH (ROWLOCK, UPDLOCK) 
            WHERE id_especialidad = @id_especialidad
        )
        BEGIN
            PRINT 'La especialidad seleccionada no existe.';
            RETURN;
        END;

        PRINT 'Paso 3: Consultando disponibilidad de talleres...';

        SELECT 
            T.id_taller AS 'ID Taller',
            T.nombre AS 'Taller',
            T.direccion AS 'Dirección',
            U.nombre + ' ' + U.apellido AS 'Mecánico Responsable',
            U.telefono AS 'Teléfono',

            (SELECT COUNT(*) FROM citaservicio CS WITH (NOLOCK)
             WHERE CS.id_taller = T.id_taller
               AND CS.fecha = @fecha_consulta
               AND CS.estado IN ('PROGRAMADA', 'EN_PROCESO')
            ) AS 'Citas Programadas',

            3 - (SELECT COUNT(*) FROM citaservicio CS WITH (NOLOCK)
                 WHERE CS.id_taller = T.id_taller
                   AND CS.fecha = @fecha_consulta
                   AND CS.estado IN ('PROGRAMADA', 'EN_PROCESO')
            ) AS 'Cupos Disponibles',

            CASE 
                WHEN (SELECT COUNT(*) FROM citaservicio CS WITH (NOLOCK)
                      WHERE CS.id_taller = T.id_taller
                        AND CS.fecha = @fecha_consulta
                        AND CS.estado IN ('PROGRAMADA','EN_PROCESO')) < 3 
                THEN 'DISPONIBLE'
                ELSE 'SIN CUPOS'
            END AS 'Estado'

        FROM taller T
        INNER JOIN mecanico M ON T.id_mecanico_responsable = M.id_mecanico
        INNER JOIN usuario U ON M.id_usuario = U.id_usuario
        WHERE (SELECT COUNT(*) FROM citaservicio CS WITH (NOLOCK)
               WHERE CS.id_taller = T.id_taller
                 AND CS.fecha = @fecha_consulta
                 AND CS.estado IN ('PROGRAMADA','EN_PROCESO')) < 3
        ORDER BY 'Cupos Disponibles' DESC;

     
         

    END TRY

    BEGIN CATCH
        PRINT 'ERROR en la consulta: ' + ERROR_MESSAGE();
    END CATCH
END;
GO


--  uso general
EXEC SP_ConsultarDisponibilidad 
    @fecha_consulta = '2025-11-25',
    @id_especialidad = 213122312;



SELECT * FROM taller;


SELECT * FROM servicio;


SELECT M.id_mecanico, U.nombre, U.apellido, U.telefono
FROM mecanico M
INNER JOIN usuario U ON M.id_usuario = U.id_usuario;


SELECT * FROM citaservicio;
