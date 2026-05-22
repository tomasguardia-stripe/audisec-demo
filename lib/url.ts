import { NextRequest } from 'next/server';

export function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}
