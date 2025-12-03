import os
import time
import pandas as pd
import logging
import psycopg2
from psycopg2 import OperationalError
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError

# Configuración de logs
logging.basicConfig(
    filename="etl_secop.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# Variables de entorno para conexión DB
DB_USER = os.getenv("DB_USER", "SECOP")
DB_PASSWORD = os.getenv("DB_PASSWORD", "12345")
DB_NAME = os.getenv("DB_NAME", "secop_db")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

# Archivo y tamaño chunks
FILE_PATH = "SECOP_II_Procesos_de_Contratacion.csv"
CHUNK_SIZE = 5000  # Reducido aún más para mejor control

def wait_for_db(host, port, user, password, db_name, retries=10, delay=5):
    for attempt in range(retries):
        try:
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                dbname=db_name
            )
            conn.close()
            print("Base de datos lista.")
            return True
        except OperationalError:
            print(f"Intento {attempt + 1} fallido, esperando {delay} segundos...")
            time.sleep(delay)
    print("No se pudo conectar a la base de datos.")
    return False

engine = create_engine(
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

def limpiar_columnas_numericas(df, cols):
    for col in cols:
        if col in df.columns:
            df[col] = (
                df[col].astype(str)
                .str.replace("$", "", regex=False)
                .str.replace(",", "", regex=True)
                .str.strip()
            )
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    return df

def limpiar_columnas_fechas(df, cols):
    for col in cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")
    return df

def insertar_tabla_independiente(df, tabla):
    """Insertar datos en una transacción independiente"""
    if df.empty:
        return
        
    try:
        # Usar conexión independiente para cada tabla
        with engine.connect() as conn:
            with conn.begin():
                df.to_sql(tabla, conn, if_exists="append", index=False)
                logging.info(f"✅ Insertados {len(df)} registros en {tabla}")
                print(f"✅ Insertados {len(df)} registros en {tabla}")
    except Exception as e:
        logging.warning(f"⚠️  Error en {tabla}: {str(e)[:100]}...")
        print(f"⚠️  Error en {tabla} - continuando...")

def procesar_chunk(chunk, chunk_number):
    try:
        print(f"🔄 Procesando chunk {chunk_number}...")
        
        # Limpiar datos
        chunk = limpiar_columnas_numericas(chunk, [
            "Precio Base", "Valor Total Adjudicacion", "Proveedores Invitados",
            "Proveedores con Invitacion Directa", "Visualizaciones del Procedimiento",
            "Proveedores que Manifestaron Interes", "Respuestas al Procedimiento",
            "Respuestas Externas", "Conteo de Respuestas a Ofertas",
            "Proveedores Unicos con Respuestas", "Numero de Lotes",
            "Codigo Entidad", "PCI"
        ])

        chunk = limpiar_columnas_fechas(chunk, [
            "Fecha de Publicacion del Proceso", "Fecha de Ultima Publicación", "Fecha Adjudicacion",
            "Fecha de Publicacion (Fase Planeacion Precalificacion)",
            "Fecha de Publicacion (Fase Seleccion Precalificacion)",
            "Fecha de Publicacion (Manifestacion de Interes)",
            "Fecha de Publicacion (Fase Borrador)", "Fecha de Publicacion (Fase Seleccion)"
        ])

        # 1. ENTIDADES
        df_entidades = chunk[[
            "Nit Entidad", "Entidad", "Departamento Entidad", "Ciudad Entidad",
            "OrdenEntidad", "Entidad Centralizada"
        ]].drop_duplicates().dropna(subset=["Nit Entidad"])
        
        if not df_entidades.empty:
            df_entidades.columns = [
                "nit_entidad", "nombre_entidad", "departamento_entidad",
                "ciudad_entidad", "orden_entidad", "entidad_centralizada"
            ]
            insertar_tabla_independiente(df_entidades, "entidades")

        # 2. PROVEEDORES
        df_proveedores = chunk[[
            "NIT del Proveedor Adjudicado", "Nombre del Proveedor Adjudicado",
            "CodigoProveedor", "Departamento Proveedor", "Ciudad Proveedor"
        ]].drop_duplicates().dropna(subset=["NIT del Proveedor Adjudicado"])
        
        if not df_proveedores.empty:
            df_proveedores.columns = [
                "nit_proveedor_adjudicado", "nombre_proveedor_adjudicado",
                "codigo_proveedor", "departamento_proveedor", "ciudad_proveedor"
            ]
            insertar_tabla_independiente(df_proveedores, "proveedores")

        # 3. PROCESOS
        df_procesos = chunk[[
            "ID del Proceso", "Referencia del Proceso", "PCI", "ID del Portafolio",
            "Nombre del Procedimiento", "Descripción del Procedimiento", "Fase",
            "Fecha de Publicacion del Proceso", "Fecha de Ultima Publicación", "Precio Base",
            "Modalidad de Contratacion", "Justificación Modalidad de Contratación",
            "Duracion", "Unidad de Duracion", "Ciudad de la Unidad de Contratación",
            "Nombre de la Unidad de Contratación", "URLProceso", "Codigo Entidad",
            "Estado Resumen", "Nit Entidad"
        ]].drop_duplicates().dropna(subset=["ID del Proceso"])
        
        if not df_procesos.empty:
            df_procesos.columns = [
                "id_proceso", "referencia_proceso", "pci", "id_portafolio",
                "nombre_procedimiento", "descripcion_procedimiento", "fase",
                "fecha_publicacion_proceso", "fecha_ultima_publicacion", "precio_base",
                "modalidad_contratacion", "justificacion_modalidad", "duracion",
                "unidad_duracion", "ciudad_unidad_contratacion", "nombre_unidad_contratacion",
                "url_proceso", "codigo_entidad", "estado_resumen", "nit_entidad"
            ]
            insertar_tabla_independiente(df_procesos, "procesos")

        # 4. ADJUDICACIONES
        df_adjudicaciones = chunk[[
            "ID Adjudicacion", "Fecha Adjudicacion", "Valor Total Adjudicacion",
            "Nombre del Adjudicador", "ID del Proceso", "NIT del Proveedor Adjudicado"
        ]].drop_duplicates().dropna(subset=["ID Adjudicacion"])
        
        if not df_adjudicaciones.empty:
            df_adjudicaciones.columns = [
                "id_adjudicacion", "fecha_adjudicacion", "valor_total_adjudicacion",
                "nombre_adjudicador", "id_proceso", "nit_proveedor_adjudicado"
            ]
            insertar_tabla_independiente(df_adjudicaciones, "adjudicaciones")

        # 5. FECHAS
        df_fechas = chunk[[
            "ID del Proceso", "Fecha de Publicacion (Fase Planeacion Precalificacion)",
            "Fecha de Publicacion (Fase Seleccion Precalificacion)",
            "Fecha de Publicacion (Manifestacion de Interes)", "Fecha de Publicacion (Fase Borrador)",
            "Fecha de Publicacion (Fase Seleccion)"
        ]].drop_duplicates().dropna(subset=["ID del Proceso"])
        
        if not df_fechas.empty:
            df_fechas.columns = [
                "id_proceso", "fecha_planificacion_precalificacion", "fecha_seleccion_precalificacion",
                "fecha_manifestacion_interes", "fecha_borrador", "fecha_seleccion"
            ]
            insertar_tabla_independiente(df_fechas, "fechas")

        # 6. ESTADISTICAS
        df_estadisticas = chunk[[
            "ID del Proceso", "Proveedores Invitados", "Proveedores con Invitacion Directa",
            "Visualizaciones del Procedimiento", "Proveedores que Manifestaron Interes",
            "Respuestas al Procedimiento", "Respuestas Externas", "Conteo de Respuestas a Ofertas",
            "Proveedores Unicos con Respuestas", "Numero de Lotes", "Estado del Procedimiento"
        ]].drop_duplicates().dropna(subset=["ID del Proceso"])
        
        if not df_estadisticas.empty:
            df_estadisticas.columns = [
                "id_proceso", "proveedores_invitados", "proveedores_invitacion_directa",
                "visualizaciones", "proveedores_interesados", "respuestas", "respuestas_externas",
                "conteo_respuestas", "proveedores_unicos_respuestas", "numero_lotes", "estado_procedimiento"
            ]
            insertar_tabla_independiente(df_estadisticas, "estadisticas")

        # 7. TIPOS CONTRATO
        df_tipos_contrato = chunk[[
            "ID del Proceso", "Tipo de Contrato", "Subtipo de Contrato", "Categorias Adicionales"
        ]].drop_duplicates().dropna(subset=["ID del Proceso"])
        
        if not df_tipos_contrato.empty:
            df_tipos_contrato.columns = [
                "id_proceso", "tipo_contrato", "subtipo_contrato", "categorias_adicionales"
            ]
            insertar_tabla_independiente(df_tipos_contrato, "tipos_contrato")

    except Exception as e:
        logging.error(f"Error procesando chunk {chunk_number}: {e}")
        print(f"❌ Error procesando chunk {chunk_number}: {e}")

def main():
    if not wait_for_db(DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME):
        print("No se pudo conectar a la base de datos. Abortando.")
        return

    print("🚀 Inicio de ETL...")
    logging.info("Inicio de proceso ETL")

    try:
        total_chunks = 0
        for i, chunk in enumerate(pd.read_csv(FILE_PATH, chunksize=CHUNK_SIZE, low_memory=False)):
            total_chunks = i + 1
            procesar_chunk(chunk, total_chunks)

        logging.info("ETL finalizado exitosamente ✅")
        print(f"🎉 Proceso ETL finalizado correctamente ✅ - {total_chunks} chunks procesados")

    except Exception as e:
        logging.error(f"Error en la ejecución del ETL: {e}", exc_info=True)
        print(f"💥 Error crítico: {e}")

if __name__ == "__main__":
    main()
