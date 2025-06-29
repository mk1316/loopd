"use client"

import { useState, useEffect } from "react"
import { Bell, Settings, Shield, Target, TrendingUp, Users, Zap, Clock, Sparkles, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import GoalsPage from "@/components/goals-page"
import InsightsPage from "@/components/insights-page"
import BlockListsPage from "@/components/block-lists-page"
import DevicesPage from "@/components/devices-page"
import SettingsPage from "@/components/settings-page"
import ProfileSettingsPage from "@/components/profile-settings-page"
import BillingPage from "@/components/billing-page"
import CommunityPage from "@/components/community-page"
import TimelinePage from "@/components/timeline-page"
import AppDetailsModal from "@/components/app-details-modal"
import { createClient } from "@/lib/supabase/client"
import { logout } from "./logout/actions"

// Mock data for demonstration
const usageData = [
  { category: "Social Media", time: 145, limit: 60, blocked: true, trend: "+15%" },
  { category: "Entertainment", time: 89, limit: 120, blocked: false, trend: "-8%" },
  { category: "Work Tools", time: 234, limit: 480, blocked: false, trend: "+12%" },
  { category: "News & Reading", time: 45, limit: 90, blocked: false, trend: "+3%" },
]

const recentActivity = [
  { app: "Instagram", time: "45 min", device: "Mobile", blocked: true, initial: "I" },
  { app: "YouTube", time: "32 min", device: "Desktop", blocked: false, initial: "Y" },
  { app: "Slack", time: "1h 23m", device: "Desktop", blocked: false, initial: "S" },
  { app: "Twitter", time: "28 min", device: "Mobile", blocked: true, initial: "T" },
]

const goals = [
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
  { id: 3, name: "News Reading", target: "1.5 hours/day", progress: 45, limit: 90, status: "on-track", completion: 50 },
]

const sidebarNavigation = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", icon: TrendingUp, isActive: true },
      { title: "Goals", icon: Target },
      { title: "Insights", icon: Zap },
      { title: "Timeline", icon: Calendar },
      { title: "Community", icon: Users },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Block Lists", icon: Shield },
      { title: "Devices", icon: Users },
      { title: "Settings", icon: Settings },
    ],
  },
]

export default function LoopDashboard() {
  const [activeView, setActiveView] = useState("Dashboard")
  const [animatedProgress, setAnimatedProgress] = useState<{ [key: string]: number }>({})
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [isAppModalOpen, setIsAppModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    // Animate progress bars on load
    const timer = setTimeout(() => {
      const progressValues: { [key: string]: number } = {}
      usageData.forEach((item, index) => {
        progressValues[`usage-${index}`] = Math.min((item.time / item.limit) * 100, 100)
      })
      goals.forEach((goal) => {
        progressValues[`goal-${goal.id}`] = goal.completion
      })
      setAnimatedProgress(progressValues)
    }, 500)

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => {
      clearTimeout(timer)
      clearInterval(timeInterval)
    }
  }, [])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "exceeded":
        return "text-red-400"
      case "on-track":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case "exceeded":
        return "bg-red-500"
      case "on-track":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleAppClick = (activity: any) => {
    setSelectedApp(activity)
    setIsAppModalOpen(true)
  }

  const handleLogout = async () => {
    await logout()
  }

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeView) {
      case "Goals":
        return <GoalsPage />
      case "Insights":
        return <InsightsPage />
      case "Timeline":
        return <TimelinePage />
      case "Block Lists":
        return <BlockListsPage />
      case "Devices":
        return <DevicesPage />
      case "Settings":
        return <SettingsPage />
      case "Profile Settings":
        return <ProfileSettingsPage />
      case "Billing":
        return <BillingPage />
      case "Community":
        return <CommunityPage />
      default:
        return (
          <div className="space-y-6">
            {/* Today's Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Total Screen Time",
                  value: "7h 33m",
                  change: "+12%",
                  icon: TrendingUp,
                  changeColor: "text-red-400",
                },
                {
                  title: "Active Blocks",
                  value: "3",
                  change: "2 categories",
                  icon: Shield,
                  changeColor: "text-gray-400",
                },
                {
                  title: "Goals Met",
                  value: "2/3",
                  change: "67% success",
                  icon: Target,
                  changeColor: "text-green-400",
                },
                {
                  title: "Focus Score",
                  value: "78",
                  change: "Good focus",
                  icon: Zap,
                  changeColor: "text-green-400",
                },
              ].map((stat, index) => (
                <Card
                  key={stat.title}
                  className="card-dark hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                      {stat.title}
                    </CardTitle>
                    <div className="p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300 origin-left">
                      {stat.value}
                    </div>
                    <p className={`text-xs mt-1 ${stat.changeColor}`}>{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Active Goals */}
              <Card className="card-dark animate-slide-up" style={{ animationDelay: "400ms" }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-indigo-400" />
                    Active Goals
                  </CardTitle>
                  <CardDescription className="text-gray-400">Track your progress towards daily limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goals.map((goal, index) => (
                    <div
                      key={goal.id}
                      className="p-4 rounded-xl glass-effect hover:bg-white/10 transition-all duration-300 cursor-pointer group animate-fade-in"
                      style={{ animationDelay: `${500 + index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusDot(goal.status)} animate-pulse-slow`} />
                          <div>
                            <p className="font-medium text-white group-hover:text-gray-200 transition-colors">
                              {goal.name}
                            </p>
                            <p className="text-sm text-gray-400">{goal.target}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">
                            {formatTime(goal.progress)} / {formatTime(goal.limit)}
                          </p>
                          <p className={`text-xs ${getStatusColor(goal.status)}`}>
                            {goal.status === "exceeded" ? "Exceeded" : "On Track"}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <Progress value={animatedProgress[`goal-${goal.id}`] || 0} className="h-2 bg-white/10" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="card-dark animate-slide-up" style={{ animationDelay: "500ms" }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-400" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-gray-400">Latest app usage across your devices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl glass-effect hover:bg-white/10 transition-all duration-300 cursor-pointer group animate-fade-in"
                      style={{ animationDelay: `${600 + index * 100}ms` }}
                      onClick={() => handleAppClick(activity)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm font-medium text-gray-300 group-hover:scale-110 transition-transform duration-300">
                          {activity.initial}
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-gray-200 transition-colors">
                            {activity.app}
                          </p>
                          <p className="text-sm text-gray-400">{activity.device}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{activity.time}</span>
                        {activity.blocked && (
                          <Badge className="bg-red-600 text-white text-xs hover:bg-red-700 transition-colors">
                            Blocked
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="card-dark animate-slide-up" style={{ animationDelay: "600ms" }}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-gray-400">Manage your digital wellness with one click</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button className="gradient-button hover:scale-105 transition-all duration-300 justify-start h-auto p-4 group animate-fade-in text-white">
                    <div className="text-left">
                      <div className="font-medium">Create New Goal</div>
                      <div className="text-sm opacity-80">Set time limits for apps</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105 transition-all duration-300 justify-start h-auto p-4 group animate-fade-in"
                    style={{ animationDelay: "100ms" }}
                  >
                    <div className="text-left">
                      <div className="font-medium">Import Block List</div>
                      <div className="text-sm opacity-80">Use pre-made lists</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105 transition-all duration-300 justify-start h-auto p-4 group animate-fade-in"
                    style={{ animationDelay: "200ms" }}
                    onClick={() => setActiveView("Timeline")}
                  >
                    <div className="text-left">
                      <div className="font-medium">View Timeline</div>
                      <div className="text-sm opacity-80">See daily usage pattern</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen">
      <SidebarProvider>
        <Sidebar className="sidebar-dark">
          <SidebarHeader className="border-b border-white/10 p-4">
            <div className="flex items-center gap-3 animate-slide-up">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-button animate-glow">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Loopd</h2>
                <p className="text-xs text-gray-400">Digital Wellness</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {sidebarNavigation.map((group, groupIndex) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel className="text-gray-400 font-medium text-sm px-3 py-2">
                  {group.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item, itemIndex) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={activeView === item.title}
                          onClick={() => setActiveView(item.title)}
                          className="text-gray-300 hover:text-white hover:bg-white/10 data-[active=true]:bg-gradient-to-r data-[active=true]:from-indigo-600 data-[active=true]:to-purple-600 data-[active=true]:text-white transition-all duration-300 animate-fade-in mx-2 rounded-lg"
                          style={{ animationDelay: `${(groupIndex * 3 + itemIndex) * 100}ms` }}
                        >
                          <button className="flex items-center gap-3 w-full px-3 py-2">
                            <item.icon className="h-4 w-4" />
                            {item.title}
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4 glass-effect">
            <SidebarTrigger className="-ml-1 text-gray-400 hover:text-white transition-colors" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-white/20" />
            <div className="flex flex-1 items-center justify-between">
              <div className="animate-slide-up">
                <h1 className="text-xl font-bold text-white">{activeView}</h1>
                <p className="text-sm text-gray-400">
                  Welcome back, {user?.email?.split('@')[0] || 'User'} • {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Notifications</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full hover:scale-110 transition-transform duration-300"
                    >
                      <Avatar className="h-10 w-10 ring-2 ring-indigo-400/50">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                        <AvatarFallback className="gradient-button text-white font-bold">
                          {user?.email ? getUserInitials(user.email) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-effect border-white/20" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal text-white">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs leading-none text-gray-400">{user?.email || 'user@example.com'}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem
                      className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setActiveView("Profile Settings")}
                    >
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setActiveView("Billing")}
                    >
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/20" />
                    <DropdownMenuItem
                      className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={handleLogout}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">{renderContent()}</main>
        </SidebarInset>
      </SidebarProvider>
      {selectedApp && (
        <AppDetailsModal app={selectedApp} isOpen={isAppModalOpen} onClose={() => setIsAppModalOpen(false)} />
      )}
    </div>
  )
}
