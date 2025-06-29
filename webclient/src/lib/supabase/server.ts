import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables:', {
            url: supabaseUrl ? 'present' : 'missing',
            key: supabaseAnonKey ? 'present' : 'missing'
        })
        throw new Error('Supabase configuration is missing. Please check your environment variables.')
    }

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            // Auto refresh the session
            autoRefreshToken: true,
            // Don't persist session on server-side
            persistSession: false,
            // Detect session in URL (for magic links)
            detectSessionInUrl: false,
        },
        cookies: {
            getAll() {
                return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        // Set secure cookie options for production
                        const secureOptions = {
                            ...options,
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax' as const,
                            maxAge: 60 * 60 * 24 * 7, // 7 days
                        }
                        cookieStore.set(name, value, secureOptions)
                    })
                } catch (error) {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                    console.warn('Failed to set cookies in server component:', error)
                }
            },
        },
        global: {
            headers: {
                'X-Client-Info': 'loopd-digital-wellness-server',
            },
        },
    })
} 