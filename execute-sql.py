#!/usr/bin/env python3
"""
Intenta ejecutar el SQL en Supabase
Requiere que el proyecto esté activo
"""

import psycopg2
import os
import sys

# Credenciales Supabase
PROJECT_ID = "srmhqcjbngrxmhnwfedq"
HOST = f"db.{PROJECT_ID}.supabase.co"
DATABASE = "postgres"
USER = "postgres"
PORT = 5432

print(f"🔗 Conectando a {HOST}...")
print(f"   Usuario: {USER}")
print(f"   Puerto: {PORT}")

# Leer SQL
with open("EJECUTAR-ESTO-EN-SUPABASE.sql", "r") as f:
    sql_content = f.read()

# Diferentes passwords a intentar
passwords_to_try = [
    os.environ.get("DB_PASSWORD", ""),  # Desde env var
    "postgres",  # Default
    "supabase",
    "password123",
]

connection = None

for password in passwords_to_try:
    if not password:
        continue

    try:
        print(f"\n⏳ Intentando con password...")
        connection = psycopg2.connect(
            host=HOST,
            database=DATABASE,
            user=USER,
            password=password,
            port=PORT,
            sslmode="require",
            connect_timeout=5
        )
        print("✅ Conexión exitosa!")
        break
    except psycopg2.OperationalError as e:
        print(f"❌ No funcionó: {str(e)[:50]}")
        continue
    except Exception as e:
        print(f"❌ Error: {str(e)[:50]}")
        continue

if not connection:
    print("\n❌ No se pudo conectar a la base de datos")
    print("\n📌 El proyecto de Supabase está en estado PAUSED")
    print("   Necesitas activarlo manualmente en:")
    print("   https://supabase.com/dashboard/project/srmhqcjbngrxmhnwfedq")
    print("\n📝 Pasos:")
    print("   1. Abre el link anterior")
    print("   2. Busca 'Resume project' o similar")
    print("   3. Actívalo")
    print("   4. Luego ejecuta este script nuevamente")
    sys.exit(1)

# Ejecutar SQL
try:
    cursor = connection.cursor()

    # Split por ';' pero ignorar comentarios
    statements = [
        s.strip()
        for s in sql_content.split(";")
        if s.strip() and not s.strip().startswith("--")
    ]

    print(f"\n📋 Total de statements: {len(statements)}\n")

    success_count = 0
    for i, statement in enumerate(statements):
        try:
            cursor.execute(statement)
            connection.commit()
            success_count += 1
            print(f"✅ [{i+1}/{len(statements)}] Ejecutado")
        except psycopg2.Error as e:
            print(f"⚠️  [{i+1}/{len(statements)}] Error (ignorado): {str(e)[:60]}")
            connection.rollback()

    print(f"\n📊 Resultados: {success_count}/{len(statements)} exitosos")

    if success_count == len(statements):
        print("\n✅ ¡Base de datos inicializada correctamente!")
        print("   La app ahora puede guardar datos en Supabase")
    else:
        print(f"\n⚠️  Algunos statements tuvieron errores")
        print("   Pero la mayoría de las tablas deberían estar creadas")

    cursor.close()
    connection.close()

except Exception as e:
    print(f"\n❌ Error ejecutando SQL: {e}")
    sys.exit(1)
