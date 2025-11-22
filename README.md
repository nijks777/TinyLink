# TinyLink

A modern, fast, and user-friendly URL shortener built with Next.js 16, TypeScript, and PostgreSQL.

## Features

- **URL Shortening**: Create short, memorable links from long URLs
- **Custom Codes**: Option to create custom short codes (6-8 alphanumeric characters)
- **Expiry Management**: Set link expiration (15/30/45 days or never)
- **Click Tracking**: Monitor how many times your links have been clicked
- **Link Management**: View, search, copy, and delete your shortened links
- **Automatic Cleanup**: Daily cron job removes expired links automatically
- **Reserved Routes**: Prevents conflicts with app routes
- **Health Checks**: Built-in health monitoring endpoint

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (via Vercel Postgres)
- **Deployment**: Vercel
- **Cron Jobs**: Vercel Cron

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Vercel Postgres)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nijks777/TinyLink.git
cd TinyLink
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NO_SSL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."

# Optional: For production cron job security
CRON_SECRET="your-secret-key"
```

### 4. Set up the database

Run the SQL schema to create the required table:

```sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  clicks INT DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_links_code ON links(code);
CREATE INDEX idx_links_expires_at ON links(expires_at);
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
TinyLink/
├── app/
│   ├── api/
│   │   ├── cron/           # Cron job endpoint
│   │   ├── healthz/        # Health check endpoint
│   │   └── links/          # Link CRUD operations
│   ├── links/              # Links management page
│   ├── [code]/             # Dynamic redirect route
│   ├── deleted/            # Deleted link confirmation
│   ├── globals.css         # Global styles with Tailwind v4
│   ├── layout.tsx          # Root layout with header
│   └── page.tsx            # Dashboard/create link page
├── components/
│   └── Dropdown.tsx        # Custom dropdown component
├── lib/
│   ├── db.ts              # Database operations
│   └── utils.ts           # Utility functions
├── vercel.json            # Vercel configuration with cron
└── .env                   # Environment variables (not in git)
```

## API Endpoints

### Links Management

- `POST /api/links` - Create a new short link
  ```json
  {
    "url": "https://example.com",
    "code": "custom", // optional
    "expiryDays": 30  // 0 for never
  }
  ```

- `GET /api/links` - Get all links
- `DELETE /api/links/[code]` - Delete a specific link

### Utility Endpoints

- `GET /healthz` - Health check endpoint
- `GET /api/cron` - Cron job endpoint (called by Vercel)

### Redirect

- `GET /[code]` - Redirect to target URL and track click

## Features in Detail

### Link Creation
- Paste any valid HTTP/HTTPS URL
- Optionally customize the short code (6-8 alphanumeric characters)
- Choose expiration: Never, 15, 30, or 45 days
- Automatic random code generation if custom code not provided

### Link Management
- View all links in a table with:
  - Short code
  - Target URL
  - Click count
  - Last clicked timestamp
  - Days before expiry
- Search links by code or URL
- Copy short links to clipboard
- Delete unwanted links

### Security Features
- Reserved route protection (prevents conflicts with /api, /links, etc.)
- Code validation (6-8 alphanumeric characters only)
- URL validation (HTTP/HTTPS only)
- Cron job authorization with CRON_SECRET in production

### Automatic Cleanup
- Daily cron job runs at midnight UTC
- Removes all expired links automatically
- Configured in `vercel.json`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The cron job will automatically be set up based on `vercel.json`.

### Environment Variables for Production

Make sure to set these in your Vercel project settings:
- All `POSTGRES_*` variables from your Vercel Postgres database
- `CRON_SECRET` for cron job security (optional but recommended)

## Database Schema

```sql
links table:
- id: Serial primary key
- code: VARCHAR(8) unique short code
- target_url: Full URL to redirect to
- clicks: Number of times the link was clicked
- last_clicked_at: Timestamp of last click
- created_at: Link creation timestamp
- expires_at: Expiration timestamp (NULL for never)
```

## License

MIT

## Author

Jalaj Sharma
- Phone: +917007752950
- ID: Naukri1125
