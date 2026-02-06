import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function createClient(): SupabaseClient | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        // During build time or when env vars are missing, return null
        // This allows static pages to build without Supabase
        if (typeof window === 'undefined') {
            return null
        }
        console.warn('Missing Supabase environment variables - auth features disabled')
        return null
    }

    // Return cached client if available
    if (supabaseClient) {
        return supabaseClient
    }

    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            // Auto refresh the session
            autoRefreshToken: true,
            // Persist the session in localStorage
            persistSession: true,
            // Detect session in URL (for magic links)
            detectSessionInUrl: true,
            // Flow type for OAuth
            flowType: 'pkce',
        },
        global: {
            headers: {
                'X-Client-Info': 'loopd-digital-wellness',
            },
        },
    })

    return supabaseClient
} 