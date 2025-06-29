import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Error code mapping for OTP verification
const getOtpErrorMessage = (error: any): string => {
    if (!error) return 'Could not verify your email'

    const errorCode = error.code || error.name

    switch (errorCode) {
        case 'otp_expired':
        case 'Token has expired or is invalid':
            return 'This confirmation link has expired. Please request a new one.'

        case 'flow_state_expired':
        case 'Email link is invalid or has expired':
            return 'This confirmation link is invalid or has expired.'

        case 'flow_state_not_found':
            return 'This confirmation link is no longer valid. Please request a new one.'

        case 'bad_otp':
            return 'Invalid confirmation code. Please check your email and try again.'

        case 'too_many_requests':
        case 'over_request_rate_limit':
            return 'Too many verification attempts. Please try again later.'

        case 'unexpected_failure':
            return 'Service temporarily unavailable. Please try again.'

        default:
            return error.message || 'Could not verify your email'
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type') as EmailOtpType | null
        const next = searchParams.get('next') ?? '/'

        if (!token_hash || !type) {
            console.error('Missing token_hash or type in auth confirmation')
            redirect('/login?message=' + encodeURIComponent('Invalid confirmation link'))
        }

        const supabase = await createClient()

        const { data, error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (error) {
            console.error('OTP verification error:', { code: error.code, message: error.message })
            const errorMessage = getOtpErrorMessage(error)
            redirect('/login?message=' + encodeURIComponent(errorMessage))
        }

        if (data.user) {
            // Successfully verified - redirect to the intended page or dashboard
            redirect(next)
        } else {
            redirect('/login?message=' + encodeURIComponent('Verification failed. Please try again.'))
        }
    } catch (error) {
        console.error('Auth confirmation error:', error)
        redirect('/login?message=' + encodeURIComponent('An unexpected error occurred. Please try again.'))
    }
} 