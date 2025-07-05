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
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useUser } from "@/contexts/UserContext"

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

function LoopDashboard() {
  const [activeView, setActiveView] = useState("Dashboard")
  const [animatedProgress, setAnimatedProgress] = useState<{ [key: string]: number }>({})
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [isAppModalOpen, setIsAppModalOpen] = useState(false)
  const { user, signOut } = useUser()

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
    await signOut()
  }

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase()
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
            {/* Welcome Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="card-dark animate-slide-up">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Today's Usage</CardTitle>
                  <Clock className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">4h 23m</div>
                  <p className="text-xs text-gray-400">+12% from yesterday</p>
                </CardContent>
              </Card>
              <Card className="card-dark animate-slide-up" style={{ animationDelay: "100ms" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Goals Met</CardTitle>
                  <Target className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">2/3</div>
                  <p className="text-xs text-gray-400">+1 from yesterday</p>
                </CardContent>
              </Card>
              <Card className="card-dark animate-slide-up" style={{ animationDelay: "200ms" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Apps Blocked</CardTitle>
                  <Shield className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">3</div>
                  <p className="text-xs text-gray-400">Active blocks</p>
                </CardContent>
              </Card>
              <Card className="card-dark animate-slide-up" style={{ animationDelay: "300ms" }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Focus Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">87%</div>
                  <p className="text-xs text-gray-400">+5% from yesterday</p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Overview */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="card-dark animate-slide-up" style={{ animationDelay: "400ms" }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-400" />
                    App Usage Today
                  </CardTitle>
                  <CardDescription className="text-gray-400">Track your daily app usage and limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usageData.map((item, index) => (
                      <div key={item.category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-white">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">{formatTime(item.time)} / {formatTime(item.limit)}</span>
                            <span className={`text-xs ${item.blocked ? 'text-red-400' : 'text-green-400'}`}>
                              {item.trend}
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={animatedProgress[`usage-${index}`] || 0}
                          className="h-2"
                          style={{
                            '--progress-background': 'rgba(255, 255, 255, 0.1)',
                            '--progress-foreground': item.blocked ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)',
                          } as React.CSSProperties}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-dark animate-slide-up" style={{ animationDelay: "500ms" }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-indigo-400" />
                    Goal Progress
                  </CardTitle>
                  <CardDescription className="text-gray-400">Your daily wellness goals and progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusDot(goal.status)}`} />
                          <div>
                            <p className="text-sm font-medium text-white">{goal.name}</p>
                            <p className="text-xs text-gray-400">Target: {goal.target}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${getStatusColor(goal.status)}`}>
                            {goal.completion}%
                          </p>
                          <p className="text-xs text-gray-400">{formatTime(goal.progress)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="card-dark animate-slide-up" style={{ animationDelay: "600ms" }}>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-gray-400">Your latest app usage and blocking events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => handleAppClick(activity)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs">
                            {activity.initial}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">
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
                </div>
              </CardContent>
            </Card>

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
                  Welcome back, {user?.email?.split('@')[0]} • {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                          {user?.email ? getUserInitials(user.email) : ''}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-effect border-white/20" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal text-white">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs leading-none text-gray-400">{user?.email}</p>
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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <LoopDashboard />
    </ProtectedRoute>
  );
} 