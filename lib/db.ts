import { sql } from '@vercel/postgres';

export interface Link {
  id: number;
  code: string;
  target_url: string;
  clicks: number;
  last_clicked_at: Date | null;
  created_at: Date;
}

// Get all links ordered by created_at DESC
export async function getAllLinks(): Promise<Link[]> {
  const { rows } = await sql<Link>`
    SELECT * FROM links ORDER BY created_at DESC
  `;
  return rows;
}

// Get a single link by code
export async function getLinkByCode(code: string): Promise<Link | null> {
  const { rows } = await sql<Link>`
    SELECT * FROM links WHERE code = ${code}
  `;
  return rows[0] || null;
}

// Create a new link
export async function createLink(code: string, targetUrl: string): Promise<Link> {
  const { rows } = await sql<Link>`
    INSERT INTO links (code, target_url)
    VALUES (${code}, ${targetUrl})
    RETURNING *
  `;
  return rows[0];
}

// Delete a link by code
export async function deleteLink(code: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM links WHERE code = ${code}
  `;
  return result.rowCount !== null && result.rowCount > 0;
}

// Increment click count and update last_clicked_at
export async function incrementClicks(code: string): Promise<void> {
  await sql`
    UPDATE links 
    SET clicks = clicks + 1, last_clicked_at = CURRENT_TIMESTAMP
    WHERE code = ${code}
  `;
}
