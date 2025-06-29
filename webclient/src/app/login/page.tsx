"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createSupabaseClient } from '@/lib/supabaseClient';

const supabase = createSupabaseClient();

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google', 'github']} // Add or remove providers as needed
        theme="dark"
      />
    </div>
  );
} 