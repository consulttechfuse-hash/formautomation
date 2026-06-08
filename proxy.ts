import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Do not run on static files, API routes, or auth pages
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname === '/invite-signup' ||
    pathname === '/verify-invite'
  ) {
    return supabaseResponse
  }

  // Refresh session if expired
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user && pathname !== '/') {
    // Redirect unauthenticated users to sign-in
    const redirectUrl = new URL('/sign-in', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user) {
    // Get user role from user_roles table
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = userRole?.role || 'client'

    // Define role-based redirects
    const roleHomepages: Record<string, string> = {
      owner: '/owner/dashboard',
      admin: '/admin/dashboard',
      agent: '/agent/dashboard',
      client: '/client/dashboard',
    }

    const homepage = roleHomepages[role] || '/client/dashboard'
    
    // If user is at root, redirect to their role homepage
    if (pathname === '/') {
      return NextResponse.redirect(new URL(homepage, request.url))
    }

    // Check if user is accessing wrong portal
    if (pathname.startsWith('/owner') && role !== 'owner') {
      return NextResponse.redirect(new URL(homepage, request.url))
    }
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(homepage, request.url))
    }
    if (pathname.startsWith('/agent') && role !== 'agent') {
      return NextResponse.redirect(new URL(homepage, request.url))
    }
    if (pathname.startsWith('/client') && (role === 'owner' || role === 'admin' || role === 'agent')) {
      return NextResponse.redirect(new URL(homepage, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
