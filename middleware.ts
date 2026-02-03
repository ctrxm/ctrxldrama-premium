import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // No rate limiting - unlimited requests for all users
  return NextResponse.next();
}

// Configure which paths the proxy runs on
export const config = {
  matcher: '/api/:path*',
}
