// Security configuration for Supabase Auth
export const SECURITY_CONFIG = {
    // Password requirements
    password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
    },

    // Session settings
    session: {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        refreshThreshold: 60 * 60, // 1 hour before expiry
    },

    // Rate limiting (implemented in Supabase dashboard)
    rateLimiting: {
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60, // 15 minutes
    },

    // Cookie settings
    cookies: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },

    // Security headers
    headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    },

    // Allowed redirect URLs (configure in Supabase dashboard)
    allowedRedirectUrls: [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.NEXT_PUBLIC_SITE_URL,
    ].filter(Boolean),
}

// Validation functions
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < SECURITY_CONFIG.password.minLength) {
        errors.push(`Password must be at least ${SECURITY_CONFIG.password.minLength} characters long`)
    }

    if (SECURITY_CONFIG.password.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
    }

    if (SECURITY_CONFIG.password.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
    }

    if (SECURITY_CONFIG.password.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number')
    }

    if (SECURITY_CONFIG.password.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character')
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
} 