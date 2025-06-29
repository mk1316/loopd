"use client"

import { useState } from "react"
import { Clock, Smartphone, Monitor, Filter, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock timeline data
const timelineData = [
  {
    time: "6:30 AM",
    hour: 6.5,
    apps: [
      { name: "Clock", duration: "5m", category: "Utilities", device: "Mobile", color: "bg-gray-500" },
      { name: "Weather", duration: "3m", category: "Utilities", device: "Mobile", color: "bg-blue-500" },
    ],
  },
  {
    time: "7:00 AM",
    hour: 7,
    apps: [
      { name: "Instagram", duration: "15m", category: "Social Media", device: "Mobile", color: "bg-pink-500" },
      { name: "News", duration: "8m", category: "News & Reading", device: "Mobile", color: "bg-orange-500" },
    ],
  },
  {
    time: "8:00 AM",
    hour: 8,
    apps: [
      { name: "Spotify", duration: "45m", category: "Entertainment", device: "Mobile", color: "bg-green-500" },
      { name: "Messages", duration: "12m", category: "Communication", device: "Mobile", color: "bg-blue-400" },
    ],
  },
  {
    time: "9:00 AM",
    hour: 9,
    apps: [
      { name: "Slack", duration: "35m", category: "Work Tools", device: "Desktop", color: "bg-purple-500" },
      { name: "Gmail", duration: "20m", category: "Work Tools", device: "Desktop", color: "bg-red-500" },
      { name: "Chrome", duration: "25m", category: "Work Tools", device: "Desktop", color: "bg-yellow-500" },
    ],
  },
  {
    time: "10:00 AM",
    hour: 10,
    apps: [
      { name: "VS Code", duration: "55m", category: "Work Tools", device: "Desktop", color: "bg-blue-600" },
      { name: "Figma", duration: "30m", category: "Work Tools", device: "Desktop", color: "bg-purple-600" },
    ],
  },
  {
    time: "11:00 AM",
    hour: 11,
    apps: [
      { name: "VS Code", duration: "45m", category: "Work Tools", device: "Desktop", color: "bg-blue-600" },
      { name: "Slack", duration: "15m", category: "Work Tools", device: "Desktop", color: "bg-purple-500" },
    ],
  },
  {
    time: "12:00 PM",
    hour: 12,
    apps: [
      { name: "YouTube", duration: "25m", category: "Entertainment", device: "Desktop", color: "bg-red-600" },
      { name: "Instagram", duration: "20m", category: "Social Media", device: "Mobile", color: "bg-pink-500" },
      { name: "Food Delivery", duration: "8m", category: "Lifestyle", device: "Mobile", color: "bg-orange-600" },
    ],
  },
  {
    time: "1:00 PM",
    hour: 13,
    apps: [
      { name: "Netflix", duration: "30m", category: "Entertainment", device: "Desktop", color: "bg-red-700" },
      { name: "Twitter", duration: "15m", category: "Social Media", device: "Mobile", color: "bg-blue-500" },
    ],
  },
  {
    time: "2:00 PM",
    hour: 14,
    apps: [
      { name: "Slack", duration: "40m", category: "Work Tools", device: "Desktop", color: "bg-purple-500" },
      { name: "Notion", duration: "35m", category: "Work Tools", device: "Desktop", color: "bg-gray-600" },
    ],
  },
  {
    time: "3:00 PM",
    hour: 15,
    apps: [
      { name: "VS Code", duration: "50m", category: "Work Tools", device: "Desktop", color: "bg-blue-600" },
      { name: "GitHub", duration: "20m", category: "Work Tools", device: "Desktop", color: "bg-gray-700" },
    ],
  },
  {
    time: "4:00 PM",
    hour: 16,
    apps: [{ name: "Zoom", duration: "60m", category: "Work Tools", device: "Desktop", color: "bg-blue-400" }],
  },
  {
    time: "5:00 PM",
    hour: 17,
    apps: [
      { name: "Gmail", duration: "25m", category: "Work Tools", device: "Desktop", color: "bg-red-500" },
      { name: "Calendar", duration: "10m", category: "Work Tools", device: "Desktop", color: "bg-green-600" },
      { name: "Slack", duration: "20m", category: "Work Tools", device: "Desktop", color: "bg-purple-500" },
    ],
  },
  {
    time: "6:00 PM",
    hour: 18,
    apps: [
      { name: "Instagram", duration: "30m", category: "Social Media", device: "Mobile", color: "bg-pink-500" },
      { name: "TikTok", duration: "25m", category: "Social Media", device: "Mobile", color: "bg-black" },
    ],
  },
  {
    time: "7:00 PM",
    hour: 19,
    apps: [
      { name: "YouTube", duration: "45m", category: "Entertainment", device: "Desktop", color: "bg-red-600" },
      { name: "Spotify", duration: "60m", category: "Entertainment", device: "Mobile", color: "bg-green-500" },
    ],
  },
  {
    time: "8:00 PM",
    hour: 20,
    apps: [
      { name: "Netflix", duration: "90m", category: "Entertainment", device: "Desktop", color: "bg-red-700" },
      { name: "Messages", duration: "15m", category: "Communication", device: "Mobile", color: "bg-blue-400" },
    ],
  },
  {
    time: "9:00 PM",
    hour: 21,
    apps: [{ name: "Netflix", duration: "60m", category: "Entertainment", device: "Desktop", color: "bg-red-700" }],
  },
  {
    time: "10:00 PM",
    hour: 22,
    apps: [
      { name: "Instagram", duration: "20m", category: "Social Media", device: "Mobile", color: "bg-pink-500" },
      { name: "Reddit", duration: "35m", category: "Social Media", device: "Mobile", color: "bg-orange-500" },
      { name: "Kindle", duration: "25m", category: "News & Reading", device: "Mobile", color: "bg-gray-800" },
    ],
  },
  {
    time: "11:00 PM",
    hour: 23,
    apps: [
      { name: "Meditation", duration: "15m", category: "Health & Fitness", device: "Mobile", color: "bg-green-400" },
      { name: "Sleep Cycle", duration: "5m", category: "Health & Fitness", device: "Mobile", color: "bg-indigo-500" },
    ],
  },
]

const categories = [
  "All",
  "Work Tools",
  "Social Media",
  "Entertainment",
  "Communication",
  "Health & Fitness",
  "Utilities",
]
const devices = ["All", "Mobile", "Desktop"]

export default function TimelinePage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedDevice, setSelectedDevice] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState("today")

  const filteredTimelineData = timelineData
    .map((timeSlot) => ({
      ...timeSlot,
      apps: timeSlot.apps.filter((app) => {
        const matchesCategory = selectedCategory === "All" || app.category === selectedCategory
        const matchesDevice = selectedDevice === "All" || app.device === selectedDevice
        const matchesSearch = searchQuery === "" || app.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesDevice && matchesSearch
      }),
    }))
    .filter((timeSlot) => timeSlot.apps.length > 0)

  const getTotalTimeForHour = (apps: any[]) => {
    return apps.reduce((total, app) => {
      const minutes = Number.parseInt(app.duration.replace("m", ""))
      return total + minutes
    }, 0)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getTimeSlotIntensity = (totalMinutes: number) => {
    if (totalMinutes >= 60) return "high"
    if (totalMinutes >= 30) return "medium"
    return "low"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Daily Timeline</h2>
          <p className="text-gray-400">Track your app usage throughout the day</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/20">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="2-days-ago">2 Days Ago</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Search Apps</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Device</label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {devices.map((device) => (
                    <SelectItem key={device} value={device}>
                      {device}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline View
          </CardTitle>
          <CardDescription className="text-gray-400">Your app usage throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredTimelineData.map((timeSlot, index) => {
              const totalMinutes = getTotalTimeForHour(timeSlot.apps)
              const intensity = getTimeSlotIntensity(totalMinutes)

              return (
                <div key={timeSlot.time} className="relative">
                  {/* Timeline Line */}
                  {index !== filteredTimelineData.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-indigo-500/50 to-transparent" />
                  )}

                  {/* Time Marker */}
                  <div className="flex items-start gap-6">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${
                          intensity === "high"
                            ? "bg-red-500 border-red-400"
                            : intensity === "medium"
                              ? "bg-yellow-500 border-yellow-400"
                              : "bg-green-500 border-green-400"
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-400 mt-2 min-w-[60px] text-center">
                        {timeSlot.time}
                      </span>
                    </div>

                    {/* Apps for this time slot */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-400">Total: {formatDuration(totalMinutes)}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            intensity === "high"
                              ? "border-red-400/50 text-red-400"
                              : intensity === "medium"
                                ? "border-yellow-400/50 text-yellow-400"
                                : "border-green-400/50 text-green-400"
                          }`}
                        >
                          {intensity === "high"
                            ? "High Usage"
                            : intensity === "medium"
                              ? "Medium Usage"
                              : "Light Usage"}
                        </Badge>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {timeSlot.apps.map((app, appIndex) => (
                          <div
                            key={`${app.name}-${appIndex}`}
                            className="flex items-center gap-3 p-3 rounded-lg glass-effect hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg ${app.color} flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform`}
                            >
                              {app.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm truncate group-hover:text-gray-200 transition-colors">
                                {app.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">{app.duration}</span>
                                <span className="text-xs text-gray-500">•</span>
                                <div className="flex items-center gap-1">
                                  {app.device === "Mobile" ? (
                                    <Smartphone className="h-3 w-3 text-gray-500" />
                                  ) : (
                                    <Monitor className="h-3 w-3 text-gray-500" />
                                  )}
                                  <span className="text-xs text-gray-500">{app.device}</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs border-white/20 bg-white/5 text-gray-400">
                              {app.category}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="text-white text-lg">Most Active Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4:00 PM</div>
            <p className="text-sm text-gray-400">60 minutes of usage</p>
          </CardContent>
        </Card>

        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="text-white text-lg">Peak Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Work Tools</div>
            <p className="text-sm text-gray-400">6h 45m total usage</p>
          </CardContent>
        </Card>

        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="text-white text-lg">Device Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Desktop</span>
                <span className="text-white">65%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mobile</span>
                <span className="text-white">35%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
