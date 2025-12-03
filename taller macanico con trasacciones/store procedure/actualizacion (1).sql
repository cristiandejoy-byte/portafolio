USE TallerMecanico2;

CREATE OR ALTER PROCEDURE SP_ActualizarCitaServicio
    @id_cita INT,
    @id_servicio INT,
    @costo_servicio DECIMAL(10,2),
    @id_repuesto INT = NULL,
    @cantidad INT = NULL
AS
BEGIN
    DECLARE @estado VARCHAR(20), 
            @costo_total DECIMAL(10,2), 
            @id_detalle INT;

    PRINT '--- INICIO SP_ActualizarCitaServicio ---';
    PRINT 'Cita a modificar: ' + CAST(@id_cita AS VARCHAR);

    BEGIN TRANSACTION;
    BEGIN TRY
        
        PRINT 'Paso 1: Validando existencia de la cita';
        IF NOT EXISTS (
            SELECT 1 FROM citaservicio WITH (NOLOCK)
            WHERE id_cita = @id_cita
        )
            THROW 50001, 'La cita no existe', 1;

        PRINT 'Paso 2: Validando estado de la cita';
        SELECT @estado = estado 
        FROM citaservicio WITH (ROWLOCK, UPDLOCK)  -- ?? Bloqueo sugerido
        WHERE id_cita = @id_cita;

        IF @estado IN ('CANCELADA','COMPLETADA')
            THROW 50002, 'No se puede modificar una cita cancelada o completada', 1;

        PRINT 'Paso 3: Insertando servicio adicional';
        INSERT INTO detallecita (id_cita, id_servicio, costo_estimado)
        VALUES (@id_cita, @id_servicio, @costo_servicio);

        SET @id_detalle = SCOPE_IDENTITY();
        PRINT 'Servicio agregado. ID detalle: ' + CAST(@id_detalle AS VARCHAR);

        PRINT 'Paso 4: Insertando repuesto (si aplica)';
        IF @id_repuesto IS NOT NULL AND @cantidad IS NOT NULL
        BEGIN
            INSERT INTO detallerepuesto (id_detalle_cita, id_repuesto, cantidad)
            VALUES (@id_detalle, @id_repuesto, @cantidad);

            PRINT 'Repuesto agregado: ' + CAST(@id_repuesto AS VARCHAR) + 
                  ' Cantidad: ' + CAST(@cantidad AS VARCHAR);
        END
        ELSE
        BEGIN
            PRINT 'No se agregó repuesto.';
        END

        PRINT 'Paso 5: Recalculando costo total';
        SELECT @costo_total = SUM(costo_estimado)
        FROM detallecita WITH (NOLOCK)
        WHERE id_cita = @id_cita;

        PRINT 'Nuevo costo calculado: $' + CAST(@costo_total AS VARCHAR);

        PRINT 'Paso 6: Actualizando factura';
        IF EXISTS (SELECT 1 FROM factura WITH (NOLOCK) WHERE id_cita = @id_cita)
        BEGIN
            UPDATE factura 
            SET monto_total = @costo_total 
            WHERE id_cita = @id_cita;

            PRINT 'Factura actualizada.';
        END
        ELSE
        BEGIN
            INSERT INTO factura (id_cita, monto_total, estado_pago)
            VALUES (@id_cita, @costo_total, 'PENDIENTE');

            PRINT 'Factura creada.';
        END

        COMMIT TRANSACTION;

        PRINT 'Cita actualizada correctamente.';
        PRINT 'Costo total final: $' + CAST(@costo_total AS VARCHAR);
        PRINT '--- FIN SP_ActualizarCitaServicio ---';

    END TRY
    BEGIN CATCH
        PRINT 'ERROR: ' + ERROR_MESSAGE();
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    END CATCH
END;
GO



SELECT * FROM citaservicio WHERE id_cita = 2;
SELECT * FROM factura WHERE id_cita = 2;


EXEC SP_ActualizarCitaServicio
    @id_cita = 2,
    @id_servicio = 2,
    @costo_servicio = 75000,
    @id_repuesto = 1,
    @cantidad = 2;

   