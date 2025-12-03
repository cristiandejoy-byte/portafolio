use tallermecanico2;
go

create function serviciospormecanico
(
    @id_mecanico int,
    @fecha_inicio date,
    @fecha_fin date
)
returns table
as
return
(
    select 
        m.id_mecanico,
        u.nombre + ' ' + u.apellido as mecanico,
        count(dc.id_detalle_cita) as total_servicios,
        @fecha_inicio as desde,
        @fecha_fin as hasta
    from citaservicio c
    inner join mecanico m on c.id_mecanico_asignado = m.id_mecanico
    inner join usuario u on m.id_usuario = u.id_usuario
    inner join detallecita dc on c.id_cita = dc.id_cita
    where m.id_mecanico = @id_mecanico
      and c.fecha between @fecha_inicio and @fecha_fin
    group by m.id_mecanico, u.nombre, u.apellido
);
go

select * from citaservicio;

select * from dbo.serviciospormecanico(1, '2024-01-01', '2025-01-31');