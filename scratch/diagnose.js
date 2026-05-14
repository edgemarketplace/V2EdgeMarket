import dotenv from 'dotenv';
dotenv.config();

console.log('--- Environment Check ---');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Present' : 'MISSING');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'MISSING');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Present' : 'MISSING');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Present' : 'MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'MISSING');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Present' : 'MISSING');
console.log('-------------------------');

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTables() {
  const { data, error } = await supabase.from('marketplaces').select('id').limit(1);
  if (error) {
    if (error.code === '42P01') {
      console.log('❌ TABLE MISSING: "marketplaces" table does not exist in Supabase.');
    } else {
      console.log('❌ SUPABASE ERROR:', error.message);
    }
  } else {
    console.log('✅ TABLE FOUND: "marketplaces" table exists.');
  }
}

checkTables();
