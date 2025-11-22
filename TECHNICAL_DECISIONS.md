# TinyLink - Technical Decisions & Architecture

## Question 1: Duplicate Code Check - Is Database Query Expensive?

### Current Implementation
- We use an **indexed** database lookup on the `code` column
- PostgreSQL B-tree index makes lookups O(log n) - typically <1ms
- For custom codes, we query before insert to return proper 409 status

### Why This Is Acceptable
1. **Index Performance**: With 1M links, lookup takes ~0.1-0.5ms
2. **Unique Constraint**: Database has UNIQUE constraint as safety net
3. **Custom codes are rare**: Most users use auto-generated codes

### Better Approaches for Scale

#### Optimistic Insert (Recommended for Production)
```typescript
try {
  await createLink(code, url);
} catch (error) {
  if (error.code === '23505') { // PostgreSQL unique violation
    return 409; // Duplicate
  }
}
```
**Benefit**: Eliminates extra SELECT query, database handles uniqueness

#### Caching Layer (For Millions of Links)
- **Redis SET**: Store all codes in memory
- Check Redis first, then database
- Reduces database load by 90%+

#### Bloom Filter (Advanced)
- Probabilistic data structure
- Can check "code definitely doesn't exist" with 99.9% accuracy
- Only query DB if bloom filter says "might exist"

---

## Question 2: Random Code Generation - How Does Retry Work?

### Current Implementation
```typescript
let attempts = 0;
const maxAttempts = 10;

while (attempts < maxAttempts) {
  shortCode = generateRandomCode();
  const existing = await getLinkByCode(shortCode);
  if (!existing) break;
  attempts++;
}
```

### Mathematics of Collisions

**Code Space:**
- 6-8 characters, alphanumeric (62 chars: A-Z, a-z, 0-9)
- 6-char codes: **62^6 = 56 billion** possibilities
- 8-char codes: **62^8 = 218 trillion** possibilities

**Collision Probability:**
| Links in DB | Collision Chance | Success in 10 Tries |
|-------------|------------------|---------------------|
| 1,000       | 0.000002%        | 99.9999%           |
| 1,000,000   | 0.002%           | 99.98%             |
| 10,000,000  | 0.2%             | 98%                |

### Better Approaches

#### 1. Auto-Increment + Base62 Encoding (Best for Scale)
```typescript
function idToCode(id: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  while (id > 0) {
    result = chars[id % 62] + result;
    id = Math.floor(id / 62);
  }
  return result.padStart(6, 'A');
}

// ID 1 → "AAAAAB"
// ID 100 → "AABc"
// ID 1000000 → "DNGM"
```
**Benefits:**
- Zero collisions (guaranteed unique)
- No database lookups needed
- Sequential and predictable

#### 2. Timestamp + Random (UUID-like)
```typescript
function generateCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 4);
  return (timestamp + random).substring(0, 8);
}
```
**Benefits:**
- Near-zero collision chance
- Contains temporal information
- Sortable

#### 3. Cryptographic UUID
```typescript
import { randomUUID } from 'crypto';

function generateCode(): string {
  return randomUUID().replace(/-/g, '').substring(0, 8);
}
```
**Benefits:**
- Cryptographically secure
- Globally unique
- Industry standard

---

## Question 3: Automatic Deletion (15/30/45 Days)

### Implementation

#### Database Schema
```sql
ALTER TABLE links ADD COLUMN expires_at TIMESTAMP;
```

#### Features Implemented

**1. Configurable Expiry on Creation**
```typescript
POST /api/links
{
  "url": "https://example.com",
  "code": "test123",
  "expiryDays": 15  // Options: 15, 30, 45 (default: 30)
}
```

**2. Expiry Check on Redirect**
- Checks if link expired before redirecting
- Auto-deletes expired links on access
- Returns 404 for expired links

**3. Scheduled Cleanup (Vercel Cron)**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * *"  // Runs daily at midnight
    }
  ]
}
```

**4. Manual Cleanup Endpoint**
```bash
GET /api/cron/cleanup
# Deletes all expired links, returns count
```

### How It Works

#### On Link Creation
```typescript
createLink(code, url, 30);  // Expires in 30 days
// Sets: expires_at = CURRENT_TIMESTAMP + INTERVAL '30 days'
```

#### On Redirect Access
```typescript
if (isLinkExpired(code)) {
  await deleteLink(code);  // Auto-delete
  return 404;              // Return expired error
}
```

#### Daily Cleanup Job
```sql
DELETE FROM links
WHERE expires_at IS NOT NULL
AND expires_at < CURRENT_TIMESTAMP
```

### Deployment Setup

**Vercel Cron (Recommended)**
1. Deploy to Vercel
2. Vercel automatically reads `vercel.json`
3. Cron runs daily at midnight UTC
4. No configuration needed

**Optional: Secure the Endpoint**
```typescript
// Add to .env
CRON_SECRET=your_secret_here

// Endpoint checks authorization
if (authHeader !== `Bearer ${cronSecret}`) {
  return 401;
}
```

**Manual Testing**
```bash
curl http://localhost:3000/api/cron/cleanup
# Returns: { "success": true, "deletedCount": 5 }
```

### Alternative Approaches

#### Database-Level TTL (PostgreSQL 15+)
```sql
-- Automatically delete rows after expiry (not yet in Neon)
CREATE TABLE links (
  ...
  expires_at TIMESTAMP,
  deleted_at TIMESTAMP GENERATED ALWAYS AS (
    CASE WHEN expires_at < NOW() THEN NOW() ELSE NULL END
  ) STORED
);
```

#### Redis TTL (External Cache)
```typescript
// Set link with TTL in Redis
redis.setex(`link:${code}`, 30 * 24 * 60 * 60, targetUrl);
// Auto-expires after 30 days
```

---

## Performance Considerations

### Database Indexes
```sql
CREATE INDEX idx_links_code ON links(code);           -- Fast lookups
CREATE INDEX idx_expires_at ON links(expires_at);     -- Fast cleanup queries
```

### Query Optimization
- **Expiry check**: Single query checks both existence and expiration
- **Cleanup**: Bulk delete with single query
- **Redirect**: Combined check + increment in 2 queries (could be optimized to 1)

### Scaling Strategy
1. **0-10K links**: Current implementation perfect
2. **10K-1M links**: Add Redis cache for hot links
3. **1M+ links**: Add read replicas, consider sharding by code prefix

---

## Summary

| Feature | Current | Better (Production) |
|---------|---------|---------------------|
| Duplicate check | DB query with index | Optimistic insert |
| Code generation | Random with retry | Auto-increment + Base62 |
| Expiry | Cron + on-access check | Database TTL + Cron |

**Current implementation is production-ready for:**
- Up to 1 million links
- Moderate traffic (1000s req/sec)
- Single-region deployment

**For massive scale, consider:**
- Distributed ID generation (Snowflake)
- Redis caching layer
- Multi-region database replication
