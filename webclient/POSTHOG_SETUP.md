# PostHog Analytics Setup

This project is now configured with PostHog analytics including a reverse proxy to avoid tracking blockers. Follow these steps to complete the setup:

## 1. Get PostHog API Key

1. Go to [PostHog](https://app.posthog.com) and create an account
2. Create a new project
3. Go to Project Settings > API Keys
4. Copy your Project API Key

## 2. Configure Environment Variables

Create a `.env.local` file in the root of your project and add:

```env
# PostHog Configuration (using reverse proxy)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://www.loopd.dev/relay-rNY3

# Your existing Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 3. Reverse Proxy Configuration

This project includes a reverse proxy setup that routes PostHog requests through your domain (`www.loopd.dev`) to avoid tracking blockers:

- **Proxy Route**: `/relay-rNY3/*` → `https://us.i.posthog.com/*`
- **Static Assets**: `/relay-rNY3/static/*` → `https://us-assets.i.posthog.com/static/*`
- **Feature Flags**: `/relay-rNY3/flags` → `https://us.i.posthog.com/flags`

This configuration is already set up in `next.config.js` and will work automatically when deployed to Vercel.

## 4. What's Tracked

The following events are automatically tracked:

- **Page Views**: All page visits are tracked automatically
- **Button Clicks**: Navigation and CTA button clicks
- **User Actions**: Sign up, login, and feature usage
- **Custom Events**: You can add custom tracking using the `usePostHog` hook

## 5. Using PostHog in Components

```tsx
import { usePostHog } from '@/hooks/usePostHog';

export function MyComponent() {
  const posthog = usePostHog();
  
  const handleClick = () => {
    posthog.trackButtonClick('my_button', {
      location: 'homepage',
      user_type: 'new'
    });
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

## 6. Available Tracking Methods

- `posthog.trackButtonClick(buttonName, properties)`
- `posthog.trackPageView(pageName, properties)`
- `posthog.trackSignUp(method, properties)`
- `posthog.trackLogin(method, properties)`
- `posthog.trackFeatureUsage(featureName, properties)`

## 7. Development vs Production

- In development, PostHog runs in debug mode
- Test data is sent to your PostHog project
- You can disable tracking in development by modifying `src/lib/posthog.ts`
- The reverse proxy works in both development and production

## 8. Viewing Analytics

1. Go to your PostHog dashboard
2. Navigate to "Events" to see all tracked events
3. Create insights and funnels to analyze user behavior
4. Set up session recordings to see how users interact with your app

## 9. Privacy Considerations

- PostHog respects user privacy and GDPR compliance
- Users can opt out of tracking
- Consider adding a privacy policy mentioning PostHog usage
- The reverse proxy helps avoid tracking blockers while maintaining privacy 