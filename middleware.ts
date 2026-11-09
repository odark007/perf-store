import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getLockedStoreSlug, resolveStoreSlug, STORE_COOKIE } from '@/lib/stores/config';

const STORE_COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30,
};

// Root segments that must never be treated as a storefront path.
const RESERVED_ROOTS = new Set(['admin', 'auth', 'api', '_next']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  // A deployment can be locked to a single tenant (e.g. the Royal Perfume Hub
  // Netlify site). In that mode the storefront lives at the domain root and the
  // admin panel lives at /admin, without a /<store> prefix in the URL.
  const lockedSlug = getLockedStoreSlug();

  let storeSlug: string | null = null;
  let rewriteUrl: URL | null = null;

  if (lockedSlug) {
    if (first && resolveStoreSlug(first) && first !== lockedSlug) {
      // Foreign tenant prefix on a locked domain -> strip it.
      const url = request.nextUrl.clone();
      url.pathname = `/${segments.slice(1).join('/')}`;
      return NextResponse.redirect(url);
    }

    storeSlug = lockedSlug;

    if (first === 'admin') {
      // A locked site must not expose another tenant's admin.
      if (segments[1] && resolveStoreSlug(segments[1]) && segments[1] !== lockedSlug) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
      }

      // /admin -> /admin/<locked>/dashboard
      // /admin/foo -> /admin/<locked>/foo
      if (segments[1] !== lockedSlug) {
        const url = request.nextUrl.clone();
        const rest = segments.slice(1);
        url.pathname = `/admin/${lockedSlug}${rest.length ? `/${rest.join('/')}` : '/dashboard'}`;
        rewriteUrl = url;
      } else if (segments.length === 2) {
        // /admin/<locked> has no page of its own.
        const url = request.nextUrl.clone();
        url.pathname = `/admin/${lockedSlug}/dashboard`;
        rewriteUrl = url;
      }
    } else if (first !== lockedSlug && !(first && RESERVED_ROOTS.has(first))) {
      // Root-level storefront routes -> /<locked>/...
      const url = request.nextUrl.clone();
      url.pathname = `/${lockedSlug}${pathname === '/' ? '' : pathname}`;
      rewriteUrl = url;
    }
  } else {
    // Multi-store deployment: detect the tenant from /<store>/... or /admin/<store>/...
    if (first && resolveStoreSlug(first)) {
      storeSlug = first;
    } else if (first === 'admin' && segments[1] && resolveStoreSlug(segments[1])) {
      storeSlug = segments[1];
    }
  }

  const buildResponse = () =>
    rewriteUrl ? NextResponse.rewrite(rewriteUrl) : NextResponse.next();

  let response = buildResponse();

  if (storeSlug) {
    response.cookies.set(STORE_COOKIE, storeSlug, STORE_COOKIE_OPTIONS);
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Rebuild so a rewrite is never lost while auth cookies are refreshed.
          response = buildResponse();
          if (storeSlug) {
            response.cookies.set(STORE_COOKIE, storeSlug, STORE_COOKIE_OPTIONS);
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    // Logged in on the bare /admin (resolved to the active store) → allow through.
    // Logged in on /admin/<store>/... → allow through (access is enforced by the store layout).
  }

  // 2. Protect Auth Pages (Don't show login if already logged in)
  if (pathname.startsWith('/auth/login')) {
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
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.[a-zA-Z0-9]+$).*)',
  ],
};
