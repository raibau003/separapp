#!/usr/bin/env python3
"""
Ejecuta SQL en Supabase usando la REST API
Requiere autenticación con service role key
"""

import requests
import json
import sys

SUPABASE_URL = "https://srmhqcjbngrxmhnwfedq.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybWhxY2piZ25ncnhtaG53ZmVkcSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MzUwNzAzMzIsImV4cCI6MTg5Mjc0NjMzMn0.4DsY4KLMFx5-_CqFh5Kqo6cPLVc5CsY5CqFh5Kqo6cQ"

print("🔗 Conectando a Supabase vía REST API...")
print(f"   URL: {SUPABASE_URL}")

# Leer SQL
with open("EJECUTAR-ESTO-EN-SUPABASE.sql", "r") as f:
    sql_content = f.read()

# Split por ';' pero ignorar comentarios
statements = [
    s.strip()
    for s in sql_content.split(";")
    if s.strip() and not s.strip().startswith("--")
]

print(f"📋 Total de statements a ejecutar: {len(statements)}\n")

# Headers con autenticación
headers = {
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "apikey": SERVICE_ROLE_KEY,
}

success_count = 0
failed_statements = []

for i, statement in enumerate(statements):
    try:
        # Usar el endpoint de RPC si existe función exec_sql
        # O ejecutar vía query REST
        print(f"⏳ [{i+1}/{len(statements)}] Ejecutando...", end="")

        # Intentar vía REST query endpoint (si existe)
        # Supabase no tiene un endpoint directo para raw SQL en la REST API
        # Necesitaríamos una Edge Function o usar psycopg2 directo
        # Alternativa: usar curl con el servicio PostgreSQL

        print(f" ⚠️  Saltado (no soportado por REST API)")

    except Exception as e:
        print(f" ❌ Error: {str(e)[:60]}")
        failed_statements.append((i+1, statement[:50], str(e)))

print(f"\n❌ REST API de Supabase no soporta SQL raw directamente")
print(f"\n📌 Alternativas:")
print(f"   1. Ejecutar manualmente en: https://supabase.com/dashboard/project/srmhqcjbngrxmhnwfedq/sql/new")
print(f"   2. Usar Edge Function (más complicado)")
print(f"   3. Esperar DNS propagation y reintentar psycopg2")

sys.exit(1)
