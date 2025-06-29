"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Clock, Target, AlertTriangle } from "lucide-react"
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

const mockGoals = [
  {
    id: 1,
    name: "Social Media Limit",
    category: "Social Media",
    timeLimit: 60,
    currentUsage: 145,
    status: "exceeded",
    apps: ["Instagram", "Twitter", "TikTok"],
    description: "Limit social media to 1 hour per day to improve focus",
  },
  {
    id: 2,
    name: "Work Focus Time",
    category: "Productivity",
    timeLimit: 480,
    currentUsage: 234,
    status: "on-track",
    apps: ["Slack", "Notion", "VS Code"],
    description: "Maintain at least 8 hours of productive work time",
  },
  {
    id: 3,
    name: "Entertainment Balance",
    category: "Entertainment",
    timeLimit: 120,
    currentUsage: 89,
    status: "on-track",
    apps: ["YouTube", "Netflix", "Spotify"],
    description: "Keep entertainment under 2 hours per day",
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
]

export default function GoalManagement() {
  const [goals, setGoals] = useState(mockGoals)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
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
        return "bg-red-500"
      case "on-track":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "exceeded":
        return (
          <Badge variant="destructive" className="bg-red-600 text-white">
            Exceeded
          </Badge>
        )
      case "on-track":
        return <Badge className="bg-green-600 text-white">On Track</Badge>
      case "warning":
        return <Badge className="bg-yellow-600 text-white">Warning</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
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
      }
      setGoals([...goals, goal])
      setNewGoal({ name: "", category: "", timeLimit: "", description: "" })
      setIsCreateDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Goal Management</h2>
          <p className="text-slate-400">Create and manage your digital wellness goals</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-slate-50">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription className="text-slate-400">
                Set up a new time-based goal to help manage your digital habits.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="goal-name" className="text-slate-300">
                  Goal Name
                </Label>
                <Input
                  id="goal-name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="e.g., Social Media Limit"
                  className="bg-slate-800 border-slate-700 text-slate-50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-slate-300">
                  Category
                </Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-50">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="text-slate-50 hover:bg-slate-700">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time-limit" className="text-slate-300">
                  Daily Time Limit (minutes)
                </Label>
                <Input
                  id="time-limit"
                  type="number"
                  value={newGoal.timeLimit}
                  onChange={(e) => setNewGoal({ ...newGoal, timeLimit: e.target.value })}
                  placeholder="60"
                  className="bg-slate-800 border-slate-700 text-slate-50"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-slate-300">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Describe why this goal is important to you..."
                  className="bg-slate-800 border-slate-700 text-slate-50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateGoal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Create Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-600 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-50">
                  {goals.filter((g) => g.status === "on-track").length}
                </p>
                <p className="text-sm text-slate-400">Goals On Track</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-600 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-50">
                  {goals.filter((g) => g.status === "exceeded").length}
                </p>
                <p className="text-sm text-slate-400">Goals Exceeded</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-50">{goals.length}</p>
                <p className="text-sm text-slate-400">Total Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <Card key={goal.id} className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(goal.status)}`} />
                  <div>
                    <CardTitle className="text-slate-50">{goal.name}</CardTitle>
                    <CardDescription className="text-slate-400">{goal.category}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(goal.status)}
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-50">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">{goal.description}</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-slate-50 font-medium">
                    {formatTime(goal.currentUsage)} / {formatTime(goal.timeLimit)}
                  </span>
                </div>
                <Progress
                  value={getProgressPercentage(goal.currentUsage, goal.timeLimit)}
                  className="h-2 bg-slate-800"
                />
              </div>

              {goal.apps.length > 0 && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">Tracked Apps:</p>
                  <div className="flex flex-wrap gap-2">
                    {goal.apps.map((app, index) => (
                      <Badge key={index} variant="secondary" className="bg-slate-800 text-slate-300">
                        {app}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
