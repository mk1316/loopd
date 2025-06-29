# Supabase Authentication Setup

This guide will help you set up Supabase authentication for your Loopd Digital Wellness application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Your Next.js application running

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "loopd-digital-wellness")
5. Enter a database password
6. Choose a region close to your users
7. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in your project root
2. Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the values with your actual Supabase project credentials.

## Step 4: Configure Email Templates (Optional)

If you want to customize email templates:

1. Go to **Authentication** → **Email Templates** in your Supabase dashboard
2. Update the "Confirm signup" template:
   - Change `{{ .ConfirmationURL }}` to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

## Step 5: Test the Authentication

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. You should be redirected to the login page
4. Create a new account or sign in with existing credentials

## Features Implemented

✅ **Server-side authentication** with Next.js App Router  
✅ **Route protection** - unauthenticated users are redirected to login  
✅ **Login/Signup forms** with email and password  
✅ **Email confirmation** for new accounts  
✅ **Logout functionality** integrated with the dashboard  
✅ **User information display** in the dashboard  
✅ **Middleware** for automatic session management  

## Authentication Flow

1. **Unauthenticated users** are redirected to `/login`
2. **New users** can sign up with email/password
3. **Email confirmation** is sent for new accounts
4. **Authenticated users** can access the dashboard
5. **Logout** clears the session and redirects to login

## Security Features

- **Server-side session validation** using `supabase.auth.getUser()`
- **Automatic token refresh** via middleware
- **Protected routes** that require authentication
- **Secure cookie handling** for session management

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Make sure your `.env.local` file exists and has the correct values
   - Restart your development server after adding environment variables

2. **"Could not authenticate user"**
   - Check that your Supabase project is active
   - Verify your email and password are correct
   - Check the Supabase dashboard for any authentication errors

3. **Email confirmation not working**
   - Verify your email template configuration
   - Check that the confirmation URL is correct
   - Ensure your Supabase project has email enabled

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [Next.js authentication guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- Check the Supabase dashboard for error logs

## Next Steps

After setting up authentication, you can:

1. **Add social login providers** (Google, GitHub, etc.)
2. **Implement user profiles** with additional user data
3. **Add role-based access control** for different user types
4. **Set up Row Level Security** for user-specific data
5. **Add password reset functionality**

## File Structure

```
src/
├── app/
│   ├── login/
│   │   ├── page.tsx          # Login/signup form
│   │   └── actions.ts        # Server actions for auth
│   ├── logout/
│   │   └── actions.ts        # Logout functionality
│   ├── auth/
│   │   └── confirm/
│   │       └── route.ts      # Email confirmation handler
│   └── page.tsx              # Protected dashboard
├── lib/
│   └── supabase/
│       ├── client.ts         # Browser client
│       ├── server.ts         # Server client
│       └── middleware.ts     # Auth middleware
└── middleware.ts             # Next.js middleware
``` 