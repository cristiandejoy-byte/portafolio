Descripción del Proyecto y Ejecución

Este proyecto está desarrollado en Python y utiliza Docker para levantar la base de datos PostgreSQL y ejecutar el proceso ETL. La carpeta del proyecto es mi_proyecto_secop - copia ubicada en el Escritorio.

Requisitos Previos

1. Tener instalado Python 3.10+ 
2. Tener instalado Docker Desktop 
3. Verificar que los comandos docker --version y docker compose version funcionan correctamente.


Instrucciones de Ejecución

Para ejecutar el proyecto, siga los siguientes pasos:
1. Abrir CMD o PowerShell en Windows y navegar a la carpeta del proyecto: powershell cd "%USERPROFILE%\Desktop\mi_proyecto_secop\mi_proyecto_secop - copia" 
2. Levantar la base de datos PostgreSQL: powershell docker compose up -d db 
3. Ejecutar el ETL (cargar datos a la base): powershell docker compose run --rm etl Esto ejecuta el script etl_script.py dentro de un contenedor Python que procesa el CSV y carga los datos a Postgres. 
4. Ver contenedores activos: powershell docker ps

Comandos Útiles de Docker

•	Ver logs de la base de datos: powershell docker logs -f postgres_secop_db
•	Ver logs del ETL: powershell docker logs -f
•	Entrar a PostgreSQL dentro del contenedor: powershell docker exec -it postgres_secop_db psql -U SECOP -d secop_db
•	Parar todo: powershell docker compose down
•	Parar y borrar datos (incluyendo volúmenes): powershell docker compose down -v
