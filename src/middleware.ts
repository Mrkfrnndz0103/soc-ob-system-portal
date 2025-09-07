import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('adminUser')?.value;
  
  // Protect dashboard and admin routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !currentUser) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (request.nextUrl.pathname.startsWith('/masterfile') && !currentUser) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect authenticated users from login page
  if (request.nextUrl.pathname === '/login' && currentUser) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};