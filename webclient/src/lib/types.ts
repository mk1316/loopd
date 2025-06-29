export interface App {
  id: string
  name: string
  icon: string
  time: string
  limit: string
  category: string
  color: string
  lastUsed: Date
  device: "Mobile" | "Desktop" | "Tablet"
}

export interface Goal {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  category: string
  deadline: Date
  status: "active" | "completed" | "paused"
  priority: "low" | "medium" | "high"
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
}

export interface TimelineEntry {
  id: string
  hour: number
  apps: App[]
  totalTime: number
  intensity: "low" | "medium" | "high"
}

export interface BlockList {
  id: string
  name: string
  description: string
  websites: string[]
  apps: string[]
  isActive: boolean
  schedule?: {
    days: string[]
    startTime: string
    endTime: string
  }
  devices: string[]
  createdAt: Date
}

export interface Device {
  id: string
  name: string
  type: "mobile" | "desktop" | "tablet"
  os: string
  isOnline: boolean
  lastSeen: Date
  protectionEnabled: boolean
  ipAddress: string
  location: string
}
