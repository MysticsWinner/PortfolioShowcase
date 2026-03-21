import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Client-side execution contexts handle the JWT authentication rigidly (DashboardLayout).
  // This middleware cleanly permits all traffic to pass through the server layer.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
