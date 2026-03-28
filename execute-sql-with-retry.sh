#!/bin/bash

# Script que reintentar ejecutar SQL con backoff exponencial
# Útil cuando el proyecto Supabase está activándose

PROJECT_ID="srmhqcjbngrxmhnwfedq"
DB_HOST="db.${PROJECT_ID}.supabase.co"
DB_PORT="5432"
MAX_RETRIES=10
RETRY_DELAY=5

echo "🔄 Ejecutando SQL con reintentos automáticos..."
echo "   Máximo de reintentos: $MAX_RETRIES"
echo "   Delay inicial: ${RETRY_DELAY}s"
echo ""

for attempt in $(seq 1 $MAX_RETRIES); do
    echo "[Intento $attempt/$MAX_RETRIES] Ejecutando..."

    cd /Users/javiercorrea/separapp
    python3 execute-sql.py

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ ¡SQL ejecutado correctamente!"
        echo "📚 La base de datos está lista"
        exit 0
    fi

    if [ $attempt -lt $MAX_RETRIES ]; then
        echo "⏳ Esperando ${RETRY_DELAY}s antes del siguiente intento..."
        sleep $RETRY_DELAY
        # Aumentar delay exponencialmente (max 60s)
        RETRY_DELAY=$((RETRY_DELAY * 2))
        if [ $RETRY_DELAY -gt 60 ]; then
            RETRY_DELAY=60
        fi
    fi
done

echo ""
echo "❌ No se pudo ejecutar SQL después de $MAX_RETRIES intentos"
echo ""
echo "📌 Próximos pasos manuales:"
echo "   1. Abre: https://supabase.com/dashboard/project/${PROJECT_ID}/sql/new"
echo "   2. Copia todo el contenido de: EJECUTAR-ESTO-EN-SUPABASE.sql"
echo "   3. Pégalo en el editor SQL"
echo "   4. Haz clic en 'Run'"
echo ""
exit 1
