"use client";

import { PostHogProvider } from "@/components/PostHogProvider";
import { UserProvider } from "@/contexts/UserContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </PostHogProvider>
  );
} 