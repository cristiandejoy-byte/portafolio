use TallerMecanico2;
go
create function mecanicomasproductividad
(
    @anio int,
    @mes int
)
returns varchar(30)
as
begin
    declare @resultado varchar(30);

    ;with ingresos as (
        select 
            m.id_mecanico,
            u.nombre + ' ' + u.apellido as mecanico,
            sum(f.monto_total) as total_ingresos
        from factura f
        inner join citaservicio c on f.id_cita = c.id_cita
        inner join mecanico m on c.id_mecanico_asignado = m.id_mecanico
        inner join usuario u on m.id_usuario = u.id_usuario
        where year(f.fecha_emision) = @anio
          and month(f.fecha_emision) = @mes
        group by m.id_mecanico, u.nombre, u.apellido
    )
    select top 1 
        @resultado = mecanico + ' | total facturado: $' + cast(total_ingresos as varchar(50))
    from ingresos
    order by total_ingresos desc;

    return @resultado;
end;
go

select top 5 * from citaservicio;

select dbo.mecanicomasproductividad(2024, 9) as mecanicomasproductividad;



