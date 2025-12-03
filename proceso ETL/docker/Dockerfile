FROM python:3.11-slim

WORKDIR /app

# Copia solo los archivos necesarios desde la carpeta fase4 relativa a la raíz
COPY fase4/requirements.txt .
COPY fase4/etl_script.py .
COPY fase4/SECOP_II_Procesos_de_Contratacion.csv .

# Instala las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Variables de entorno para conectar con la DB (se pueden sobrescribir en docker-compose)
ENV DB_USER=SECOP
ENV DB_PASSWORD=12345
ENV DB_NAME=secop_db
ENV DB_HOST=db
ENV DB_PORT=5432

# Comando que se ejecutará al iniciar el contenedor creando la base de datos
CMD ["python", "etl_script.py"]
