import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
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
                        // Set secure cookie options
                        const secureOptions = {
                            ...options,
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax' as const,
                            maxAge: 60 * 60 * 24 * 7, // 7 days
                        }
                        supabaseResponse.cookies.set(name, value, secureOptions)
                    })
                },
            },
        }
    )

    try {
        // Refresh session if expired
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
            console.error('Middleware session error:', error)
        }

        // Get the current path
        const { pathname } = request.nextUrl

        // Public routes that don't require authentication
        const publicRoutes = ['/', '/login']
        const isPublicRoute = publicRoutes.includes(pathname)

        // If user is not authenticated and trying to access a protected route
        if (!session && !isPublicRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // If user is authenticated and trying to access login page or root, redirect to dashboard
        if (session && (pathname === '/login' || pathname === '/')) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }

        // Add security headers
        supabaseResponse.headers.set('X-Frame-Options', 'DENY')
        supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
        supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

        if (process.env.NODE_ENV === 'production') {
            supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        }

        return supabaseResponse
    } catch (error) {
        console.error('Middleware error:', error)
        return supabaseResponse
    }
} 