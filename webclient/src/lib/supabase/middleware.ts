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