import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

config({ path: '.env.local' });

async function migrate() {
  try {
    console.log('🔄 Running database migration...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        code VARCHAR(8) UNIQUE NOT NULL,
        target_url TEXT NOT NULL,
        clicks INTEGER DEFAULT 0,
        last_clicked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ Table "links" created successfully');
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_links_code ON links(code)
    `;
    
    console.log('✅ Index "idx_links_code" created successfully');
    console.log('✅ Migration completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
