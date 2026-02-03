import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Rate limiting removed - unlimited requests
  return NextResponse.next();
}

// Configure which paths the proxy runs on
export const config = {
  matcher: '/api/:path*',
}
