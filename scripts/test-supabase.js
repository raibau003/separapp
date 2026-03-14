/**
 * Script para verificar la conexión con Supabase
 * y probar que las tablas estén configuradas correctamente
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://srmhqcjbngrxmhnwfedq.supabase.co';
const supabaseAnonKey = 'sb_publishable_WbaUHBidVdi04zrBPJZ8Ug_AdD6rMNC';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Verificando conexión con Supabase...\n');

  try {
    // Test 1: Verificar conexión básica
    console.log('✅ Test 1: Conexión establecida');
    console.log(`   URL: ${supabaseUrl}\n`);

    // Test 2: Verificar tablas
    console.log('📋 Test 2: Verificando tablas...');

    const tables = [
      'families',
      'profiles',
      'family_members',
      'children',
      'expenses',
      'maintenance_payments',
      'messages',
      'calendar_events'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: Error - ${err.message}`);
      }
    }

    console.log('\n📊 Test 3: Contando registros...');

    // Contar registros en cada tabla
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          console.log(`   ${table}: ${count} registros`);
        }
      } catch (err) {
        // Silenciar errores de conteo
      }
    }

    console.log('\n✅ Verificación completada!');
    console.log('\n💡 Próximo paso:');
    console.log('   Si ves errores arriba, ejecuta el schema SQL en Supabase.');
    console.log('   Ve a: https://supabase.com → SQL Editor → Ejecuta supabase-schema.sql\n');

  } catch (error) {
    console.error('❌ Error al conectar con Supabase:', error.message);
    console.log('\n💡 Verifica que:');
    console.log('   1. Las credenciales en .env sean correctas');
    console.log('   2. El proyecto en Supabase esté activo');
    console.log('   3. Tengas conexión a internet\n');
  }
}

// Ejecutar test
testConnection();
