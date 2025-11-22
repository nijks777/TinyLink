import { NextRequest, NextResponse } from 'next/server';
import { createLink, getAllLinks, getLinkByCode } from '@/lib/db';
import { generateRandomCode, validateUrl, validateCode } from '@/lib/utils';

// POST /api/links - Create a new link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, code, expiryDays = 30 } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!validateUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Generate or validate code
    let shortCode = code;
    
    if (shortCode) {
      // Validate custom code
      if (!validateCode(shortCode)) {
        return NextResponse.json(
          { error: 'Code must be 6-8 alphanumeric characters' },
          { status: 400 }
        );
      }

      // Check if code already exists
      const existing = await getLinkByCode(shortCode);
      if (existing) {
        return NextResponse.json(
          { error: 'Code already exists' },
          { status: 409 }
        );
      }
    } else {
      // Generate random code and ensure it's unique
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        shortCode = generateRandomCode();
        const existing = await getLinkByCode(shortCode);
        if (!existing) break;
        attempts++;
      }

      if (attempts === maxAttempts) {
        return NextResponse.json(
          { error: 'Failed to generate unique code' },
          { status: 500 }
        );
      }
    }

    // Create the link with expiry days (default: 30, options: 15, 30, 45)
    const link = await createLink(shortCode, url, expiryDays);

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/links - Get all links
export async function GET() {
  try {
    const links = await getAllLinks();
    return NextResponse.json(links, { status: 200 });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
