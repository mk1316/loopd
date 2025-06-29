import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export function generateMockData() {
  return {
    usageData: [
      { category: "Social Media", time: 145, limit: 60, blocked: true, trend: "+15%" },
      { category: "Entertainment", time: 89, limit: 120, blocked: false, trend: "-8%" },
      { category: "Work Tools", time: 234, limit: 480, blocked: false, trend: "+12%" },
      { category: "News & Reading", time: 45, limit: 90, blocked: false, trend: "+3%" },
    ],
    recentActivity: [
      { app: "Instagram", time: "45 min", device: "Mobile", blocked: true, initial: "I" },
      { app: "YouTube", time: "32 min", device: "Desktop", blocked: false, initial: "Y" },
      { app: "Slack", time: "1h 23m", device: "Desktop", blocked: false, initial: "S" },
      { app: "Twitter", time: "28 min", device: "Mobile", blocked: true, initial: "T" },
    ],
    goals: [
      {
        id: 1,
        name: "Social Media Limit",
        target: "1 hour/day",
        progress: 145,
        limit: 60,
        status: "exceeded",
        completion: 241,
      },
      {
        id: 2,
        name: "Focus Work Time",
        target: "6 hours/day",
        progress: 234,
        limit: 480,
        status: "on-track",
        completion: 49,
      },
      {
        id: 3,
        name: "News Reading",
        target: "1.5 hours/day",
        progress: 45,
        limit: 90,
        status: "on-track",
        completion: 50
      },
    ]
  }
}
