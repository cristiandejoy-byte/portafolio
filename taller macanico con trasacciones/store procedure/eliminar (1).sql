
/*

DESCRIPCIÓN:
Elimina un cliente del sistema junto con sus vehículos, citas y 
facturas, tras validar que no tenga deudas ni servicios pendientes.

ESCENARIO:
Un cliente solicita eliminar su cuenta. El sistema verifica que no 
existan citas activas ni facturas pendientes y, al confirmar, borra 
toda su información relacionada.

*/

use TallerMecanico2;




CREATE  PROCEDURE SP_EliminarCliente2
    @id_usuario INT,
    @confirmar_eliminacion VARCHAR(2) = 'NO'
AS
BEGIN
    DECLARE @citas_pendientes INT, 
            @facturas_pendientes INT, 
            @vehiculos INT, 
            @rol VARCHAR(50);

    
    PRINT 'Validando usuario y dependencias...';

    BEGIN TRANSACTION;
    BEGIN TRY
        
        PRINT 'Paso 1: Verificando existencia del usuario';

        IF NOT EXISTS (SELECT 1 FROM usuario WITH (NOLOCK) WHERE id_usuario = @id_usuario)
            THROW 50001, 'El usuario no existe', 1;

        PRINT 'Paso 2: Consultando rol del usuario';

        SELECT @rol = R.nombre_rol 
        FROM usuario U WITH (ROWLOCK, UPDLOCK)   
        JOIN rol R ON U.id_rol = R.id_rol 
        WHERE U.id_usuario = @id_usuario;

        IF @rol IN ('Mecanico','Mecánico','Administrador')
            THROW 50002, 'No se puede eliminar un mecánico o administrador', 1;

        PRINT 'Paso 3: Validando citas pendientes';

        SELECT @citas_pendientes = COUNT(*) 
        FROM citaservicio WITH (NOLOCK)
        WHERE id_usuario = @id_usuario AND estado IN ('PROGRAMADA','EN_PROCESO');

        IF @citas_pendientes > 0 
            THROW 50003, 'El cliente tiene citas pendientes', 1;

        PRINT 'Paso 4: Validando facturas pendientes';

        SELECT @facturas_pendientes = COUNT(*)
        FROM factura F 
        JOIN citaservicio C ON F.id_cita = C.id_cita
        WHERE C.id_usuario = @id_usuario AND F.estado_pago = 'PENDIENTE';

        IF @facturas_pendientes > 0 
            THROW 50004, 'El cliente tiene facturas sin pagar', 1;

        PRINT 'Paso 5: Contando vehículos';

        SELECT @vehiculos = COUNT(*) 
        FROM vehiculo WITH (NOLOCK)
        WHERE id_usuario = @id_usuario;

        IF @confirmar_eliminacion != 'SI'
        BEGIN
            PRINT 'Confirmación requerida: volver a ejecutar con @confirmar_eliminacion = ''SI''';
            ROLLBACK TRANSACTION;
            RETURN;
        END

        PRINT 'Paso 6: Eliminando registros relacionados';

        DELETE DR FROM detallerepuesto DR
            JOIN detallecita DC ON DR.id_detalle_cita = DC.id_detalle_cita
            JOIN citaservicio C ON DC.id_cita = C.id_cita
        WHERE C.id_usuario = @id_usuario;

        DELETE DC FROM detallecita DC
            JOIN citaservicio C ON DC.id_cita = C.id_cita
        WHERE C.id_usuario = @id_usuario;

        DELETE CP FROM citapromocion CP
            JOIN citaservicio C ON CP.id_cita = C.id_cita
        WHERE C.id_usuario = @id_usuario;

        DELETE R FROM reseña R
            JOIN citaservicio C ON R.id_cita = C.id_cita
        WHERE C.id_usuario = @id_usuario;

        DELETE F FROM factura F
            JOIN citaservicio C ON F.id_cita = C.id_cita
        WHERE C.id_usuario = @id_usuario;

        DELETE FROM citaservicio WHERE id_usuario = @id_usuario;
        DELETE FROM vehiculo WHERE id_usuario = @id_usuario;
        DELETE FROM usuario WHERE id_usuario = @id_usuario;

        COMMIT TRANSACTION;

        PRINT 'Usuario eliminado exitosamente. Vehículos eliminados: ' + CAST(@vehiculos AS VARCHAR);
       

    END TRY
    BEGIN CATCH
        PRINT 'ERROR: ' + ERROR_MESSAGE();
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    END CATCH
END;
GO

select * from usuario;


EXEC SP_EliminarCliente2
    @id_usuario = 21,
    @confirmar_eliminacion = 'SI';

