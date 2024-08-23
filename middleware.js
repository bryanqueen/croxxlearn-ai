
import { NextResponse } from 'next/server';

// This function will run on every request
export function middleware(request) {
  const token = request.cookies.get('authToken'); // Replace with the name of your auth token cookie

  if (!token) {
    // If no token, redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Continue to the requested page
  return NextResponse.next();
}

// Define the paths that should trigger this middleware
export const config = {
  matcher: ['/chatbot', '/welcome', '/another-protected-route'], // Add other protected routes here
};
