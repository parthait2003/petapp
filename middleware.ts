import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const authStatus = authCookie?.value; // Extract the value from the cookie object



  // You can add more logic here if needed, for example:
  if (authStatus !== 'true') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/owner', '/pet', '/veterinarian','/booking','/addbooking'],
};
