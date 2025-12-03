use tallermecanico2;

create table reseñafiltro (
    id_reseña int identity(1,1) primary key,
    id_cita int not null,
    calificacion int check (calificacion between 1 and 5),
    comentario varchar(30),
    fecha_creacion datetime default getdate(),
    procesada bit default 0
);
go

alter table reseñafiltro
add mensaje_error varchar(30) null;

create trigger permitirreseña
on reseñafiltro
after insert
as
begin
    set nocount on;
    
    begin try 
        begin tran;
        
       
        insert into reseña (id_cita, calificacion, comentario)
        select 
            i.id_cita,
            i.calificacion,
            i.comentario
        from inserted i
        inner join citaservicio cs on i.id_cita = cs.id_cita
        inner join factura f on i.id_cita = f.id_cita 
        where cs.estado = 'completada' 
          and f.estado_pago = 'pagada'
          and i.procesada = 0
          and not exists (select 1 from reseña r where r.id_cita = i.id_cita);
        
        declare @insertadas int = @@rowcount;
        
        
        update reseñafiltro 
        set procesada = 1 
        where id_reseña in (
            select i.id_reseña 
            from inserted i
            where exists (select 1 from reseña r where r.id_cita = i.id_cita)
        );

        
        
        commit tran;
    end try
    begin catch 
        if @@trancount > 0
            rollback tran;
        
        declare @error varchar(50);
        set @error = error_message();
        raiserror('error al insertar los datos: %s', 16, 1, @error);
    end catch
end;

delete from reseña;
select * from reseña;
select * from reseñafiltro;
select * from citaservicio;
select * from factura;

-- ver qué citas están disponibles
select cs.id_cita, cs.estado, f.estado_pago
from citaservicio cs
left join factura f on cs.id_cita = f.id_cita;

insert into reseñafiltro (id_cita, calificacion, comentario)
values (1, 5, 'muy mal servicio ');



