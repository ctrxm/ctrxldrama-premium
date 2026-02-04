import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ymcjoloqemofuhiomdgk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

async function runMigration() {
  console.log('Starting Supabase schema migration...\n');
  console.log('Project:', projectRef);
  
  const schemaPath = path.join(__dirname, '..', 'supabase-features-schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  console.log('Schema file loaded:', schema.length, 'bytes\n');
  
  const statements = schema
    .split(/;[\s]*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.match(/^--/));
  
  console.log(`Found ${statements.length} SQL statements\n`);
  
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  
  if (!dbPassword) {
    console.log('SUPABASE_DB_PASSWORD not set.');
    console.log('\nPlease run the migration manually:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Copy contents of supabase-features-schema.sql');
    console.log('3. Paste and run in SQL Editor');
    console.log('\nOr provide SUPABASE_DB_PASSWORD (from Settings > Database)');
    return;
  }
  
  const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!\n');
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 50).replace(/\n/g, ' ').trim();
      
      try {
        await client.query(statement);
        console.log(`[${i + 1}/${statements.length}] OK: ${preview}...`);
        successCount++;
      } catch (err) {
        const errorMsg = err.message || 'Unknown error';
        if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
          console.log(`[${i + 1}/${statements.length}] Skip: ${preview}...`);
          skipCount++;
        } else {
          console.log(`[${i + 1}/${statements.length}] Error: ${errorMsg.substring(0, 60)}`);
          errorCount++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('Migration Summary');
    console.log('='.repeat(50));
    console.log(`Success: ${successCount}`);
    console.log(`Skipped: ${skipCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total: ${statements.length}`);
    
    if (errorCount === 0) {
      console.log('\nMigration completed successfully!');
    }
    
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);
