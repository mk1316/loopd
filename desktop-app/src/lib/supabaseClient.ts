import { createBrowserClient } from '@supabase/ssr'

export function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      url: supabaseUrl ? 'present' : 'missing',
      key: supabaseAnonKey ? 'present' : 'missing'
    })
    throw new Error('Supabase configuration is missing. Please check your environment variables.')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
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
        'X-Client-Info': 'loopd-desktop-app',
      },
    },
  })
}