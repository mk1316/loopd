import { z } from 'zod'

const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL').optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required').optional(),
    NEXT_PUBLIC_SITE_URL: z.string().url('Invalid site URL').optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export function validateEnv() {
    try {
        const env = envSchema.parse(process.env)

        // Check if required Supabase variables are present
        if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn('Missing Supabase environment variables. Authentication may not work properly.')
            return { success: false, env, error: 'Missing Supabase configuration' }
        }

        return { success: true, env }
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.errors.map(err => err.path.join('.'))
            console.warn('Invalid environment variables:', missingVars)
            return { success: false, env: process.env, error: `Invalid environment variables: ${missingVars.join(', ')}` }
        }
        console.warn('Environment validation error:', error)
        return { success: false, env: process.env, error: 'Environment validation failed' }
    }
}

// Only validate on server-side and don't throw errors
if (typeof window === 'undefined') {
    validateEnv()
} 