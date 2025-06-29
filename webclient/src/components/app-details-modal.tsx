"use client"

import { useState } from "react"
import { X, Clock, TrendingUp, TrendingDown, Shield, Smartphone, Monitor, Calendar, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AppDetailsModalProps {
  app: {
    name: string
    time: string
    device: string
    blocked: boolean
    initial: string
  }
  isOpen: boolean
  onClose: () => void
}

// Mock detailed app data
const getAppDetails = (appName: string) => {
  const baseData = {
    Instagram: {
      category: "Social Media",
      icon: "📷",
      totalTime: "2h 45m",
      dailyLimit: "1h 30m",
      weeklyTime: "18h 23m",
      monthlyTime: "76h 12m",
      trend: "+15%",
      blocked: true,
      color: "bg-pink-500",
      sessions: 23,
      avgSession: "7m 12s",
      peakHours: ["8-9 AM", "12-1 PM", "7-9 PM"],
      devices: [
        { name: "iPhone", time: "1h 45m", percentage: 64 },
        { name: "iPad", time: "1h 0m", percentage: 36 },
      ],
      weeklyData: [
        { day: "Mon", time: 95, limit: 90 },
        { day: "Tue", time: 120, limit: 90 },
        { day: "Wed", time: 85, limit: 90 },
        { day: "Thu", time: 165, limit: 90 },
        { day: "Fri", time: 145, limit: 90 },
        { day: "Sat", time: 180, limit: 90 },
        { day: "Sun", time: 155, limit: 90 },
      ],
    },
    YouTube: {
      category: "Entertainment",
      icon: "📺",
      totalTime: "1h 32m",
      dailyLimit: "2h 0m",
      weeklyTime: "12h 45m",
      monthlyTime: "52h 30m",
      trend: "-8%",
      blocked: false,
      color: "bg-red-500",
      sessions: 8,
      avgSession: "11m 30s",
      peakHours: ["6-8 PM", "9-11 PM"],
      devices: [{ name: "Desktop", time: "1h 32m", percentage: 100 }],
      weeklyData: [
        { day: "Mon", time: 75, limit: 120 },
        { day: "Tue", time: 92, limit: 120 },
        { day: "Wed", time: 68, limit: 120 },
        { day: "Thu", time: 110, limit: 120 },
        { day: "Fri", time: 92, limit: 120 },
        { day: "Sat", time: 135, limit: 120 },
        { day: "Sun", time: 98, limit: 120 },
      ],
    },
    Slack: {
      category: "Work Tools",
      icon: "💬",
      totalTime: "3h 54m",
      dailyLimit: "8h 0m",
      weeklyTime: "28h 15m",
      monthlyTime: "112h 45m",
      trend: "+12%",
      blocked: false,
      color: "bg-purple-500",
      sessions: 45,
      avgSession: "5m 12s",
      peakHours: ["9-11 AM", "2-4 PM", "7-8 PM"],
      devices: [
        { name: "Desktop", time: "2h 31m", percentage: 65 },
        { name: "iPhone", time: "1h 23m", percentage: 35 },
      ],
      weeklyData: [
        { day: "Mon", time: 234, limit: 480 },
        { day: "Tue", time: 267, limit: 480 },
        { day: "Wed", time: 198, limit: 480 },
        { day: "Thu", time: 289, limit: 480 },
        { day: "Fri", time: 234, limit: 480 },
        { day: "Sat", time: 45, limit: 480 },
        { day: "Sun", time: 67, limit: 480 },
      ],
    },
    Twitter: {
      category: "Social Media",
      icon: "🐦",
      totalTime: "1h 28m",
      dailyLimit: "45m",
      weeklyTime: "9h 45m",
      monthlyTime: "38h 20m",
      trend: "+22%",
      blocked: true,
      color: "bg-blue-500",
      sessions: 18,
      avgSession: "4m 53s",
      peakHours: ["7-8 AM", "12-1 PM", "6-7 PM"],
      devices: [{ name: "iPhone", time: "1h 28m", percentage: 100 }],
      weeklyData: [
        { day: "Mon", time: 88, limit: 45 },
        { day: "Tue", time: 95, limit: 45 },
        { day: "Wed", time: 72, limit: 45 },
        { day: "Thu", time: 88, limit: 45 },
        { day: "Fri", time: 88, limit: 45 },
        { day: "Sat", time: 105, limit: 45 },
        { day: "Sun", time: 92, limit: 45 },
      ],
    },
  }

  return baseData[appName as keyof typeof baseData] || baseData.Instagram
}

export default function AppDetailsModal({ app, isOpen, onClose }: AppDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!isOpen) return null

  const appDetails = getAppDetails(app.name)
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
              {appDetails.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{app.name}</h2>
              <p className="text-gray-400">{appDetails.category}</p>
            </div>
            {appDetails.blocked && (
              <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                <Shield className="h-3 w-3 mr-1" />
                Blocked
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
                Overview
              </TabsTrigger>
              <TabsTrigger value="usage" className="data-[state=active]:bg-white/10">
                Usage Patterns
              </TabsTrigger>
              <TabsTrigger value="devices" className="data-[state=active]:bg-white/10">
                Devices
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Quick Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="card-dark">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Today's Usage</CardTitle>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{appDetails.totalTime}</div>
                    <p className="text-xs text-gray-400">of {appDetails.dailyLimit} limit</p>
                  </CardContent>
                </Card>

                <Card className="card-dark">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Sessions</CardTitle>
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{appDetails.sessions}</div>
                    <p className="text-xs text-gray-400">Avg: {appDetails.avgSession}</p>
                  </CardContent>
                </Card>

                <Card className="card-dark">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Weekly Trend</CardTitle>
                    {appDetails.trend.startsWith("+") ? (
                      <TrendingUp className="h-4 w-4 text-red-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-400" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{appDetails.trend}</div>
                    <p className="text-xs text-gray-400">vs last week</p>
                  </CardContent>
                </Card>

                <Card className="card-dark">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">This Week</CardTitle>
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{appDetails.weeklyTime}</div>
                    <p className="text-xs text-gray-400">Total time</p>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Progress */}
              <Card className="card-dark">
                <CardHeader>
                  <CardTitle className="text-white">Daily Limit Progress</CardTitle>
                  <CardDescription className="text-gray-400">Current usage vs daily limit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">
                        {appDetails.totalTime} / {appDetails.dailyLimit}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        (Number.parseInt(appDetails.totalTime) / Number.parseInt(appDetails.dailyLimit)) * 100,
                        100,
                      )}
                      className="h-3"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Peak Hours */}
              <Card className="card-dark">
                <CardHeader>
                  <CardTitle className="text-white">Peak Usage Hours</CardTitle>
                  <CardDescription className="text-gray-400">When you use this app most</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {appDetails.peakHours.map((hour, index) => (
                      <Badge key={index} variant="outline" className="border-white/20 bg-white/5 text-gray-300">
                        {hour}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="space-y-6 mt-6">
              {/* Weekly Usage Chart */}
              <Card className="card-dark">
                <CardHeader>
                  <CardTitle className="text-white">Weekly Usage Pattern</CardTitle>
                  <CardDescription className="text-gray-400">Daily usage vs your set limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appDetails.weeklyData.map((day, index) => (
                      <div key={day.day} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">{day.day}</span>
                          <span className="text-white">
                            {formatTime(day.time)} / {formatTime(day.limit)}
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={Math.min((day.time / day.limit) * 100, 100)} className="h-2" />
                          {day.time > day.limit && (
                            <div
                              className="absolute right-0 top-0 h-2 bg-red-500 rounded-r-full"
                              style={{ width: `${Math.min(((day.time - day.limit) / day.limit) * 100, 50)}%` }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Insights */}
              <Card className="card-dark">
                <CardHeader>
                  <CardTitle className="text-white">Usage Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-blue-400 font-medium">📊 Pattern Detected</p>
                    <p className="text-gray-300 text-sm mt-1">
                      You tend to use {app.name} most during lunch hours and evenings
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-yellow-400 font-medium">⚠️ Limit Exceeded</p>
                    <p className="text-gray-300 text-sm mt-1">You've exceeded your daily limit 4 times this week</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-green-400 font-medium">✨ Suggestion</p>
                    <p className="text-gray-300 text-sm mt-1">
                      Try setting a 15-minute break reminder to reduce session length
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices" className="space-y-6 mt-6">
              {/* Device Usage */}
              <Card className="card-dark">
                <CardHeader>
                  <CardTitle className="text-white">Usage by Device</CardTitle>
                  <CardDescription className="text-gray-400">
                    How you use {app.name} across your devices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appDetails.devices.map((device, index) => (
                    <div key={device.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {device.name.includes("iPhone") || device.name.includes("Mobile") ? (
                            <Smartphone className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Monitor className="h-5 w-5 text-gray-400" />
                          )}
                          <span className="text-white font-medium">{device.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-medium">{device.time}</span>
                          <span className="text-gray-400 text-sm ml-2">({device.percentage}%)</span>
                        </div>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Device Insights */}
              <Card className="card-dark">
                <CardHeader>
                  <CardTitle className="text-white">Device Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-purple-400 font-medium">📱 Mobile Usage</p>
                    <p className="text-gray-300 text-sm mt-1">
                      Most of your {app.name} usage happens on mobile devices during commute hours
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-indigo-400 font-medium">💻 Desktop Focus</p>
                    <p className="text-gray-300 text-sm mt-1">
                      Desktop usage is more focused with longer, less frequent sessions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
