# Authentication Implementation

This document describes the authentication implementation in the webclient, which follows the same pattern as the desktop-app.

## Overview

The authentication system uses Supabase Auth with a React Context-based state management pattern. It provides:

- User authentication state management
- Protected routes
- Custom authentication forms
- Social login support (Google, Apple)
- Session persistence

## Components

### UserContext (`src/contexts/UserContext.tsx`)

Manages global authentication state using React Context:

- `user`: Current user object (null if not authenticated)
- `session`: Current session object
- `loading`: Loading state while checking authentication
- `signOut`: Function to sign out the user

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)

Protects routes from unauthenticated access:

- Redirects to `/login` if user is not authenticated
- Shows loading state while checking authentication
- Only renders children if user is authenticated

### CustomAuthForm (`src/components/CustomAuthForm.tsx`)

Enhanced authentication form with:

- Sign in/sign up toggle
- Real-time validation
- Social login buttons
- Error handling
- Loading states
- Password visibility toggle

### UserProfile (`src/components/UserProfile.tsx`)

Displays user information and logout button.

## Usage

### Protecting Routes

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  );
}
```

### Using User Context

```tsx
import { useUser } from '@/contexts/UserContext';

function MyComponent() {
  const { user, loading, signOut } = useUser();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Setup

1. **Environment Variables**: Ensure these are set in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=your_site_url
   ```

2. **Supabase Configuration**: Configure authentication providers in your Supabase dashboard:
   - Email/Password authentication
   - Google OAuth
   - Apple OAuth
   - Email confirmation settings

3. **Layout Integration**: The `UserProvider` is already wrapped around the app in `src/app/layout.tsx`

## Features

- **Session Persistence**: Sessions are automatically persisted and refreshed
- **Social Login**: Support for Google and Apple authentication
- **Email Confirmation**: Email verification for new accounts
- **Error Handling**: Comprehensive error messages and validation
- **Loading States**: Proper loading indicators throughout the auth flow
- **Responsive Design**: Works on all device sizes

## Security

- Uses Supabase's secure authentication system
- Sessions are managed server-side
- CSRF protection through Supabase
- Secure cookie handling
- Rate limiting through Supabase dashboard

## Migration from Previous Implementation

The new implementation replaces the previous server-action based authentication with a client-side context-based approach that provides:

- Better user experience with real-time state updates
- Consistent authentication state across the app
- Easier integration with protected routes
- Better error handling and loading states 