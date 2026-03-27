#!/usr/bin/env python3
"""
Script para inicializar la base de datos de Supabase para SeparApp
"""

import requests
import json
import sys

# Configuración
PROJECT_ID = "srmhqcjbngrxmhnwfedq"
SUPABASE_URL = f"https://{PROJECT_ID}.supabase.co"
ANON_KEY = "sb_publishable_WbaUHBidVdi04zrBPJZ8Ug_AdD6rMNC"

# Leer el SQL
try:
    with open("EJECUTAR-ESTO-EN-SUPABASE.sql", "r") as f:
        sql_content = f.read()
except FileNotFoundError:
    print("❌ Error: No se encontró EJECUTAR-ESTO-EN-SUPABASE.sql")
    sys.exit(1)

print("🚀 Inicializando base de datos SeparApp...")
print(f"📍 Proyecto: {PROJECT_ID}")
print(f"🔗 URL: {SUPABASE_URL}")

# Dividir SQL en statements
statements = [
    s.strip()
    for s in sql_content.split(";")
    if s.strip() and not s.strip().startswith("--")
]

print(f"\n📋 Total de statements: {len(statements)}")

# Función para ejecutar SQL
def execute_sql(sql_stmt):
    """Intenta ejecutar SQL via Supabase"""
    headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    # Intentar usar REST API (nota: DDL puede no funcionar)
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/sql",
            headers=headers,
            json={"query": sql_stmt},
            timeout=10
        )

        if response.status_code in [200, 201, 204]:
            return True, response.text
        else:
            return False, response.text
    except Exception as e:
        return False, str(e)

# Ejecutar statements
print("\n⏳ Ejecutando SQL...\n")

success_count = 0
failed_count = 0
failed_statements = []

for i, stmt in enumerate(statements):
    success, response = execute_sql(stmt)

    if success:
        success_count += 1
        print(f"✅ [{i+1}/{len(statements)}] Ejecutado")
    else:
        failed_count += 1
        failed_statements.append((stmt[:50], response[:100]))
        print(f"❌ [{i+1}/{len(statements)}] Error")

print(f"\n📊 Resultados: {success_count} exitosos, {failed_count} fallidos")

if failed_count > 0:
    print("\n⚠️  Algunos statements fallaron. Esto es normal para DDL via REST API.")
    print("\n📝 Próximos pasos:")
    print("1. Abre: https://supabase.com/dashboard/project/srmhqcjbngrxmhnwfedq/sql/new")
    print("2. Copia el contenido de: EJECUTAR-ESTO-EN-SUPABASE.sql")
    print("3. Pégalo en el SQL Editor y ejecuta")
    print("4. Luego ejecuta: npm start")
else:
    print("✅ ¡Base de datos inicializada correctamente!")

sys.exit(0 if failed_count == 0 else 1)
