import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

config({ path: '.env.local' });

async function addExpiryColumn() {
  try {
    console.log('🔄 Adding expires_at column...');
    
    await sql`
      ALTER TABLE links 
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP
    `;
    
    console.log('✅ Column added successfully');
    
    // Set default expiry for existing links (30 days from created_at)
    await sql`
      UPDATE links 
      SET expires_at = created_at + INTERVAL '30 days'
      WHERE expires_at IS NULL
    `;
    
    console.log('✅ Updated existing links with 30-day expiry');
    console.log('✅ Migration completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addExpiryColumn();
