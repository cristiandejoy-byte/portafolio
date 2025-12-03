use tallermecanico2;
go

create trigger descuentuniminuto
on factura
after insert, update 
as
begin
    set nocount on;
    
    begin try
   
        if update(estado_pago)
        begin
            insert into notificacion (id_usuario, mensaje, fecha_notificacion)
            select 
                cs.id_usuario,
                '¡felicidades! has completado 3 servicios pagos. en tu próximo servicio tendrás 50% de descuento.',
                getdate()
            from inserted i
            inner join citaservicio cs on i.id_cita = cs.id_cita
            inner join usuario u on cs.id_usuario = u.id_usuario
            where i.estado_pago = 'pagada'  
                and exists (
                    select 1 
                    from promocion_estudiantes_uniminuto peu
                    where peu.correo_institucional = u.correo
                )
                and (
                    select count(*) 
                    from factura f2
                    inner join citaservicio cs2 on f2.id_cita = cs2.id_cita
                    where cs2.id_usuario = u.id_usuario
                        and f2.estado_pago = 'pagada'
                        and f2.id_factura <= i.id_factura
                ) = 3;
        end
        
    
        if not exists (select 1 from deleted)  
        begin
           
            insert into notificacion (id_usuario, mensaje, fecha_notificacion)
            select 
                cs.id_usuario,
                ' se ha aplicado 50% de descuento en tu 4 servicio.',
                getdate()
            from inserted i
            inner join citaservicio cs on i.id_cita = cs.id_cita
            inner join usuario u on cs.id_usuario = u.id_usuario
            where exists (
                    select 1 
                    from promocion_estudiantes_uniminuto peu
                    where peu.correo_institucional = u.correo
                )
                and (
                    select count(*) 
                    from factura f2
                    inner join citaservicio cs2 on f2.id_cita = cs2.id_cita
                    where cs2.id_usuario = u.id_usuario
                        and f2.estado_pago = 'pagada'
                        and f2.id_factura < i.id_factura
                ) = 3;
                
            
            update f
            set monto_total = f.monto_total * 0.5,
                descuento_aplicado = 50.00
            from factura f
            inner join inserted i on f.id_factura = i.id_factura
            inner join citaservicio cs on i.id_cita = cs.id_cita
            inner join usuario u on cs.id_usuario = u.id_usuario
            where (f.descuento_aplicado is null or f.descuento_aplicado = 0)
                and exists (
                    select 1 
                    from promocion_estudiantes_uniminuto peu
                    where peu.correo_institucional = u.correo
                )
                and (
                    select count(*) 
                    from factura f2
                    inner join citaservicio cs2 on f2.id_cita = cs2.id_cita
                    where cs2.id_usuario = u.id_usuario
                        and f2.estado_pago = 'pagada'
                        and f2.id_factura < i.id_factura
                ) = 3;
                commit tran;
        end
            
    end try

		begin catch 
		if @@TRANCOUNT > 0
		rollback tran;
		declare @error varchar(50);
		set @error = ERROR_MESSAGE();

		raiserror('error :',1,16,@error)

    end catch
end;
go

select * from promocion_estudiantes_uniminuto;
select * from factura;
select * from usuario;
select * from citaservicio;
select * from notificacion;


-- verificar si el estudiante tien 3 servicios pagos
select * from factura f
inner join citaservicio cs on f.id_cita = cs.id_cita
where cs.id_usuario = 23
order by f.fecha_emision;

-- ver notificaciones

select * from notificacion
where id_usuario = 23
order by fecha_notificacion desc;


-- se inserta el 4 servicio
insert into citaservicio (id_usuario, id_vehiculo, id_taller, fecha, hora, estado)
values (23, 1, 1, getdate(), '14:00', 'programada');

declare @id_cita_4to int = scope_identity();

insert into factura (id_cita, monto_total, estado_pago, fecha_emision)
values (@id_cita_4to, 200000, 'pendiente', getdate());