import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  
  // Public routes that don't require authentication - ALWAYS allow these
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password']
  
  // Landing page is always accessible - no redirects
  if (pathname === '/') {
    return response
  }
  
  // Allow other public routes for everyone
  if (publicRoutes.includes(pathname)) {
    // Redirect authenticated users away from auth pages to dashboard (but NOT from landing page)
    if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // Protect dashboard routes - require authentication
  if (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/pipeline') ||
      pathname.startsWith('/leads') ||
      pathname.startsWith('/tasks') ||
      pathname.startsWith('/billing') ||
      pathname.startsWith('/settings')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
