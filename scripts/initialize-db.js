#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Credenciales de Supabase
const PROJECT_ID = 'srmhqcjbngrxmhnwfedq';
const SUPABASE_URL = 'https://srmhqcjbngrxmhnwfedq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'NEED_TO_SET';

// Leer archivo SQL
const sqlPath = path.join(__dirname, '..', 'EJECUTAR-ESTO-EN-SUPABASE.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

console.log('🚀 Iniciando configuración de base de datos...');
console.log(`📍 Proyecto: ${PROJECT_ID}`);
console.log(`🔗 URL: ${SUPABASE_URL}`);

// Split SQL por ; y ejecutar cada sentencia
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

console.log(`\n📋 Total de statements: ${statements.length}`);

// Función para ejecutar SQL via Supabase RPC
async function executeSql(sqlStatement) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      query: sqlStatement,
    });

    const options = {
      hostname: 'srmhqcjbngrxmhnwfedq.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Prefer': 'return=representation',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(data);
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Ejecutar todas las sentencias
async function run() {
  console.log('\n⏳ Ejecutando SQL...\n');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await executeSql(stmt);
      success++;
      console.log(`✅ [${i + 1}/${statements.length}] Ejecutado`);
    } catch (error) {
      failed++;
      console.log(`❌ [${i + 1}/${statements.length}] Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Resultados: ${success} exitosos, ${failed} fallidos`);

  if (failed === 0) {
    console.log('✅ ¡Base de datos inicializada correctamente!');
    process.exit(0);
  } else {
    console.log('⚠️ Algunos statements fallaron. Revisa la salida arriba.');
    process.exit(1);
  }
}

run().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
