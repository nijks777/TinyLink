// Generate random alphanumeric code (6-8 characters)
export function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * 3) + 6; // Random length between 6-8
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

// Validate URL format
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Reserved codes that cannot be used (to avoid route conflicts)
const RESERVED_CODES = [
  'api',
  'links',
  'deleted',
  'admin',
  'dashboard',
  '_next',
  'static',
];

// Validate code format: [A-Za-z0-9]{6,8} and not reserved
export function validateCode(code: string): boolean {
  const codeRegex = /^[A-Za-z0-9]{6,8}$/;

  // Check format
  if (!codeRegex.test(code)) return false;

  // Check if code is reserved (case-insensitive)
  if (RESERVED_CODES.includes(code.toLowerCase())) return false;

  return true;
}
