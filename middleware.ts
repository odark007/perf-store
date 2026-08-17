import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { STORES, STORE_COOKIE } from '@/lib/stores/config';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Detect store slug from the URL pathname: /<store>/... or /admin/<store>/...
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  const storeSlug =
    (segments[0] && STORES[segments[0]] && segments[0]) ||
    (segments[0] === 'admin' && segments[1] && STORES[segments[1]] ? segments[1] : null);

  if (storeSlug) {
    response.cookies.set(STORE_COOKIE, storeSlug, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Protect Admin Routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Not logged in? Redirect to login
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    // Logged in on the bare /admin (store chooser) → allow through.
    // Logged in on /admin/<store>/... → allow through (store scope validated in page).
  }

  // 2. Protect Auth Pages (Don't show login if already logged in)
  if (request.nextUrl.pathname.startsWith('/auth/login')) {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes - handled separately or protected inside the route)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};