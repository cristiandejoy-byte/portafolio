/*

DESCRIPCIÓN: Inserta una nueva cita de servicio validando la disponibilidad del taller, la existencia del cliente y vehículo. 
ESCENARIO: Un cliente solicita agendar una cita para mantenimiento de su vehículo. El sistema valida que no exista otra cita a la misma hora en el mismo taller y que el vehículo pertenezca al cliente. 
*/
USE TallerMecanico2;
go
CREATE  PROCEDURE SP_InsertarCita2
    @id_usuario INT,
    @id_vehiculo INT,
    @id_taller INT,
    @fecha DATE,
    @hora TIME,
    @id_servicio INT,
    @costo_estimado DECIMAL(10,2)
AS
BEGIN
    DECLARE @id_cita_nueva INT;
    DECLARE @Error NVARCHAR(200);

    PRINT '--- INICIO SP_InsertarCita ---';
    PRINT 'Validando datos de entrada...';

    BEGIN TRANSACTION;

    BEGIN TRY

        PRINT 'Paso 1: Validar que el usuario exista';
        IF NOT EXISTS (SELECT 1 FROM usuario WITH (NOLOCK) WHERE id_usuario = @id_usuario)
        BEGIN
            SET @Error = 'El cliente no existe.';
            THROW 50001, @Error, 1;
        END;

        PRINT 'Paso 2: Validar que el vehículo exista';
        IF NOT EXISTS (SELECT 1 FROM vehiculo WITH (NOLOCK) WHERE id_vehiculo = @id_vehiculo)
        BEGIN
            SET @Error = 'El vehículo no existe.';
            THROW 50002, @Error, 1;
        END;

        PRINT 'Paso 3: Validar que el vehículo pertenezca al cliente';
        IF NOT EXISTS (
            SELECT 1 FROM vehiculo WITH (ROWLOCK, UPDLOCK)  -- ?? bloqueo sugerido
            WHERE id_vehiculo = @id_vehiculo AND id_usuario = @id_usuario
        )
        BEGIN
            SET @Error = 'El vehículo no pertenece al cliente.';
            THROW 50003, @Error, 1;
        END;

        PRINT 'Paso 4: Validar que el taller exista';
        IF NOT EXISTS (SELECT 1 FROM taller WITH (NOLOCK) WHERE id_taller = @id_taller)
        BEGIN
            SET @Error = 'El taller no existe.';
            THROW 50004, @Error, 1;
        END;

        PRINT 'Paso 5: Validar cupo del taller';
        IF (SELECT COUNT(*) FROM citaservicio WITH (NOLOCK)
            WHERE id_taller = @id_taller AND fecha = @fecha AND hora = @hora 
              AND estado IN ('PROGRAMADA', 'EN_PROCESO')) >= 3
        BEGIN
            SET @Error = 'El taller no tiene cupo en esa hora.';
            THROW 50005, @Error, 1;
        END;

        PRINT 'Paso 6: Validar que el servicio exista';
        IF NOT EXISTS (SELECT 1 FROM servicio WITH (NOLOCK) WHERE id_servicio = @id_servicio)
        BEGIN
            SET @Error = 'El servicio no existe.';
            THROW 50006, @Error, 1;
        END;

        PRINT 'Paso 7: Validar fecha no pasada';
        IF @fecha < CAST(GETDATE() AS DATE)
        BEGIN
            SET @Error = 'No se pueden agendar citas en fechas anteriores.';
            THROW 50007, @Error, 1;
        END;

        PRINT 'Paso 8: Insertando cita principal';
        INSERT INTO citaservicio (id_usuario, id_vehiculo, id_taller, fecha, hora, estado)
        VALUES (@id_usuario, @id_vehiculo, @id_taller, @fecha, @hora, 'PROGRAMADA');

        SET @id_cita_nueva = SCOPE_IDENTITY();

        PRINT 'Paso 9: Insertando detalle de la cita';
        INSERT INTO detallecita (id_cita, id_servicio, costo_estimado)
        VALUES (@id_cita_nueva, @id_servicio, @costo_estimado);

        COMMIT TRANSACTION;

        PRINT 'Cita registrada correctamente.';
        PRINT 'ID nueva cita: ' + CAST(@id_cita_nueva AS VARCHAR);
        PRINT 'Fecha: ' + CONVERT(VARCHAR, @fecha, 103) + ' Hora: ' + CONVERT(VARCHAR, @hora, 108);
       

    END TRY
    BEGIN CATCH
        PRINT 'ERROR: ' + ERROR_MESSAGE();
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

EXEC SP_InsertarCita2 
    @id_usuario = 2,
    @id_vehiculo = 1,
    @id_taller = 5,
    @fecha = '2026-11-15',
    @hora = '21:00:00',
    @id_servicio = 1,
    @costo_estimado = 150000.00;

SELECT * FROM citaservicio;

SELECT * FROM vehiculo;


