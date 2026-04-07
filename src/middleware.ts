import { auth } from '@/lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLogin = req.nextUrl.pathname === '/login';
  const isApiHealth = req.nextUrl.pathname === '/api/health';
  const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth');

  // Allow health check and auth routes without auth
  if (isApiHealth || isApiAuth) return;

  // Redirect to login if not authenticated
  if (!isLoggedIn && !isOnLogin) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }

  // Redirect to dashboard if already logged in and on login page
  if (isLoggedIn && isOnLogin) {
    return Response.redirect(new URL('/', req.nextUrl));
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
