"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Clock, Target, AlertTriangle, CheckCircle, Calendar, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const mockGoals = [
  {
    id: 1,
    name: "Social Media Limit",
    category: "Social Media",
    timeLimit: 60,
    currentUsage: 145,
    status: "exceeded",
    apps: ["Instagram", "Twitter", "TikTok", "Facebook"],
    description: "Limit social media to 1 hour per day to improve focus and productivity",
    createdAt: "2024-01-15",
    streak: 0,
  },
  {
    id: 2,
    name: "Work Focus Time",
    category: "Productivity",
    timeLimit: 480,
    currentUsage: 234,
    status: "on-track",
    apps: ["Slack", "Notion", "VS Code", "Figma"],
    description: "Maintain at least 8 hours of productive work time daily",
    createdAt: "2024-01-10",
    streak: 12,
  },
  {
    id: 3,
    name: "Entertainment Balance",
    category: "Entertainment",
    timeLimit: 120,
    currentUsage: 89,
    status: "on-track",
    apps: ["YouTube", "Netflix", "Spotify", "Twitch"],
    description: "Keep entertainment under 2 hours per day for better work-life balance",
    createdAt: "2024-01-20",
    streak: 5,
  },
  {
    id: 4,
    name: "News Reading",
    category: "News & Reading",
    timeLimit: 90,
    currentUsage: 45,
    status: "on-track",
    apps: ["Reddit", "Medium", "Apple News", "Pocket"],
    description: "Stay informed but limit news consumption to 1.5 hours daily",
    createdAt: "2024-01-18",
    streak: 8,
  },
]

const categories = [
  "Social Media",
  "Entertainment",
  "Productivity",
  "News & Reading",
  "Gaming",
  "Shopping",
  "Communication",
  "Education",
]

export default function GoalsPage() {
  const [goals, setGoals] = useState(mockGoals)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [newGoal, setNewGoal] = useState({
    name: "",
    category: "",
    timeLimit: "",
    description: "",
  })

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getProgressPercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "exceeded":
        return (
          <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Exceeded
          </Badge>
        )
      case "on-track":
        return (
          <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            On Track
          </Badge>
        )
      case "warning":
        return (
          <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
            <Clock className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
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

  const handleCreateGoal = () => {
    if (newGoal.name && newGoal.category && newGoal.timeLimit) {
      const goal = {
        id: goals.length + 1,
        name: newGoal.name,
        category: newGoal.category,
        timeLimit: Number.parseInt(newGoal.timeLimit),
        currentUsage: 0,
        status: "on-track",
        apps: [],
        description: newGoal.description,
        createdAt: new Date().toISOString().split("T")[0],
        streak: 0,
      }
      setGoals([...goals, goal])
      setNewGoal({ name: "", category: "", timeLimit: "", description: "" })
      setIsCreateDialogOpen(false)
    }
  }

  const filteredGoals = goals.filter((goal) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return goal.status === "on-track"
    if (activeTab === "exceeded") return goal.status === "exceeded"
    return true
  })

  const stats = {
    total: goals.length,
    active: goals.filter((g) => g.status === "on-track").length,
    exceeded: goals.filter((g) => g.status === "exceeded").length,
    avgStreak: Math.round(goals.reduce((acc, g) => acc + g.streak, 0) / goals.length),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Goal Management</h2>
          <p className="text-gray-400">Create and manage your digital wellness goals</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-button hover:scale-105 transition-all duration-300 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a new time-based goal to help manage your digital habits.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="goal-name" className="text-gray-300">
                  Goal Name
                </Label>
                <Input
                  id="goal-name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="e.g., Social Media Limit"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-gray-300">
                  Category
                </Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/20">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="text-white hover:bg-white/10">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time-limit" className="text-gray-300">
                  Daily Time Limit (minutes)
                </Label>
                <Input
                  id="time-limit"
                  type="number"
                  value={newGoal.timeLimit}
                  onChange={(e) => setNewGoal({ ...newGoal, timeLimit: e.target.value })}
                  placeholder="60"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Describe why this goal is important to you..."
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateGoal} className="gradient-button text-white">
                Create Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Total Goals", value: stats.total, icon: Target, color: "text-blue-400" },
          { title: "Active Goals", value: stats.active, icon: CheckCircle, color: "text-green-400" },
          { title: "Exceeded", value: stats.exceeded, icon: AlertTriangle, color: "text-red-400" },
          { title: "Avg Streak", value: `${stats.avgStreak} days`, icon: Calendar, color: "text-purple-400" },
        ].map((stat, index) => (
          <Card
            key={stat.title}
            className="card-dark hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Goals Tabs */}
      <Card className="card-dark">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Your Goals</CardTitle>
              <CardDescription className="text-gray-400">Manage and track your digital wellness goals</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-white/5">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                All Goals ({stats.total})
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Active ({stats.active})
              </TabsTrigger>
              <TabsTrigger
                value="exceeded"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Exceeded ({stats.exceeded})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredGoals.map((goal, index) => (
                <Card
                  key={goal.id}
                  className="glass-effect hover:bg-white/10 transition-all duration-300 cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusDot(goal.status)} animate-pulse-slow`} />
                        <div>
                          <CardTitle className="text-white text-lg">{goal.name}</CardTitle>
                          <CardDescription className="text-gray-400 flex items-center gap-2">
                            {goal.category} • Created {new Date(goal.createdAt).toLocaleDateString()}
                            {goal.streak > 0 && (
                              <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                                🔥 {goal.streak} day streak
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(goal.status)}
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-300">{goal.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress Today</span>
                        <span className="text-white font-medium">
                          {formatTime(goal.currentUsage)} / {formatTime(goal.timeLimit)}
                        </span>
                      </div>
                      <div className="relative">
                        <Progress
                          value={getProgressPercentage(goal.currentUsage, goal.timeLimit)}
                          className="h-3 bg-white/10"
                        />
                        <div
                          className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-1000 ${
                            goal.status === "exceeded"
                              ? "bg-gradient-to-r from-red-500 to-red-600"
                              : "bg-gradient-to-r from-green-500 to-green-600"
                          }`}
                          style={{
                            width: `${Math.min(getProgressPercentage(goal.currentUsage, goal.timeLimit), 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {goal.apps.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Tracked Apps:</p>
                        <div className="flex flex-wrap gap-2">
                          {goal.apps.map((app, index) => (
                            <Badge key={index} className="bg-white/5 text-gray-300 border-white/20">
                              {app}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
