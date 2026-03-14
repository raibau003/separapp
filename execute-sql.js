const SUPABASE_URL = 'https://srmhqcjbngrxmhnwfedq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybWhxY2pibmdyeG1obndmZWRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzUwNTEwNiwiZXhwIjoyMDg5MDgxMTA2fQ.lJb0isgNw5erUVcbM9y46t0VpEUvh6xOZDER13d73go';

const fs = require('fs');
const sql = fs.readFileSync('./EJECUTAR-ESTO-EN-SUPABASE.sql', 'utf8');

// Ejecutar SQL usando la API de Supabase
async function executeSql() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });

    const data = await response.json();
    console.log('Response:', response.status);
    console.log('Data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

executeSql();
