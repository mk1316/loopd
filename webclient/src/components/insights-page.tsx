"use client"

import { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Award,
  Brain,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

// Mock data for insights
const weeklyData = [
  { day: "Mon", screenTime: 420, focusTime: 180, distractions: 12 },
  { day: "Tue", screenTime: 380, focusTime: 220, distractions: 8 },
  { day: "Wed", screenTime: 450, focusTime: 160, distractions: 15 },
  { day: "Thu", screenTime: 320, focusTime: 280, distractions: 6 },
  { day: "Fri", screenTime: 390, focusTime: 200, distractions: 10 },
  { day: "Sat", screenTime: 480, focusTime: 120, distractions: 18 },
  { day: "Sun", screenTime: 360, focusTime: 240, distractions: 7 },
]

const categoryBreakdown = [
  { category: "Work Tools", time: 234, percentage: 31, color: "from-green-500 to-emerald-600" },
  { category: "Social Media", time: 145, percentage: 19, color: "from-red-500 to-pink-600" },
  { category: "Entertainment", time: 89, percentage: 12, color: "from-orange-500 to-amber-600" },
  { category: "Communication", time: 76, percentage: 10, color: "from-blue-500 to-cyan-600" },
  { category: "News & Reading", time: 45, percentage: 6, color: "from-purple-500 to-violet-600" },
  { category: "Other", time: 164, percentage: 22, color: "from-gray-500 to-slate-600" },
]

const achievements = [
  {
    id: 1,
    title: "Focus Master",
    description: "Maintained focus for 4+ hours",
    icon: "🎯",
    earned: true,
    date: "2024-01-20",
  },
  {
    id: 2,
    title: "Social Media Warrior",
    description: "Stayed under social media limit for 7 days",
    icon: "⚔️",
    earned: false,
    progress: 5,
    target: 7,
  },
  {
    id: 3,
    title: "Early Bird",
    description: "Started productive work before 9 AM",
    icon: "🌅",
    earned: true,
    date: "2024-01-19",
  },
  {
    id: 4,
    title: "Consistency King",
    description: "Met all goals for 30 days straight",
    icon: "👑",
    earned: false,
    progress: 12,
    target: 30,
  },
]

const insights = [
  {
    type: "positive",
    title: "Great Focus Today!",
    description: "You spent 78% more time on productive tasks compared to yesterday.",
    icon: TrendingUp,
    color: "text-green-400",
  },
  {
    type: "warning",
    title: "Social Media Usage High",
    description: "You've exceeded your social media limit by 85 minutes today.",
    icon: TrendingDown,
    color: "text-red-400",
  },
  {
    type: "neutral",
    title: "Peak Productivity Hours",
    description: "Your most productive hours are between 9 AM - 11 AM.",
    icon: Clock,
    color: "text-blue-400",
  },
  {
    type: "positive",
    title: "Weekly Improvement",
    description: "Your focus score improved by 23% compared to last week.",
    icon: Target,
    color: "text-green-400",
  },
]

const aiInsights = [
  {
    type: "prediction",
    title: "Productivity Peak Prediction",
    description:
      "Based on your patterns, you'll be most productive tomorrow between 10 AM - 12 PM. Consider scheduling important tasks then.",
    icon: Brain,
    color: "text-purple-400",
    confidence: 87,
  },
  {
    type: "recommendation",
    title: "Smart Block Suggestion",
    description: "AI suggests blocking Instagram during 2-4 PM when you typically get distracted from work tasks.",
    icon: Zap,
    color: "text-blue-400",
    confidence: 92,
  },
  {
    type: "habit",
    title: "Habit Formation Alert",
    description:
      "You're 3 days away from forming a new habit of checking social media less in the morning. Keep it up!",
    icon: Target,
    color: "text-green-400",
    confidence: 78,
  },
]

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const totalScreenTime = weeklyData.reduce((acc, day) => acc + day.screenTime, 0)
  const avgScreenTime = Math.round(totalScreenTime / weeklyData.length)
  const totalFocusTime = weeklyData.reduce((acc, day) => acc + day.focusTime, 0)
  const avgFocusTime = Math.round(totalFocusTime / weeklyData.length)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Insights & Analytics</h2>
          <p className="text-gray-400">Understand your digital habits and track your progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10">
            <Calendar className="h-4 w-4 mr-2" />
            Last 7 Days
          </Button>
          <Button variant="outline" className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10">
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Avg Screen Time",
            value: formatTime(avgScreenTime),
            change: "-12%",
            changeType: "positive",
            icon: Clock,
          },
          {
            title: "Avg Focus Time",
            value: formatTime(avgFocusTime),
            change: "+23%",
            changeType: "positive",
            icon: Target,
          },
          {
            title: "Focus Score",
            value: "78",
            change: "+5",
            changeType: "positive",
            icon: Zap,
          },
          {
            title: "Goals Met",
            value: "67%",
            change: "+15%",
            changeType: "positive",
            icon: Award,
          },
        ].map((metric, index) => (
          <Card
            key={metric.title}
            className="card-dark hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{metric.title}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                  <p
                    className={`text-xs ${
                      metric.changeType === "positive" ? "text-green-400" : "text-red-400"
                    } flex items-center gap-1`}
                  >
                    {metric.changeType === "positive" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {metric.change} vs last week
                  </p>
                </div>
                <div className="p-2 bg-white/5 rounded-lg">
                  <metric.icon className="h-6 w-6 text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights Tabs */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            Detailed Analytics
          </CardTitle>
          <CardDescription className="text-gray-400">
            Dive deep into your digital habits and productivity patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/5">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Categories
              </TabsTrigger>
              <TabsTrigger
                value="trends"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Trends
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* AI-Powered Insights */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-400" />
                  AI-Powered Insights
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {aiInsights.map((insight, index) => (
                    <Card
                      key={index}
                      className="glass-effect hover:bg-white/10 transition-all duration-300 cursor-pointer animate-fade-in relative"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white/5 rounded-lg">
                            <insight.icon className={`h-5 w-5 ${insight.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-white">{insight.title}</h4>
                              <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-600/30 text-xs">
                                {insight.confidence}% confident
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">{insight.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-400" />
                  AI-Powered Insights
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {insights.map((insight, index) => (
                    <Card
                      key={index}
                      className="glass-effect hover:bg-white/10 transition-all duration-300 cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white/5 rounded-lg">
                            <insight.icon className={`h-5 w-5 ${insight.color}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{insight.title}</h4>
                            <p className="text-sm text-gray-400 mt-1">{insight.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Weekly Chart Placeholder */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Weekly Activity</h3>
                <Card className="glass-effect">
                  <CardContent className="p-6">
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Interactive chart would be rendered here</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Showing screen time, focus time, and distractions over the past week
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-indigo-400" />
                  Time by Category
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="glass-effect">
                    <CardContent className="p-6">
                      <div className="h-48 flex items-center justify-center">
                        <div className="text-center">
                          <PieChart className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400">Pie chart visualization</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="space-y-3">
                    {categoryBreakdown.map((category, index) => (
                      <Card
                        key={category.category}
                        className="glass-effect hover:bg-white/10 transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">{category.category}</span>
                            <span className="text-sm text-gray-400">{formatTime(category.time)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Progress value={category.percentage} className="h-2 bg-white/10" />
                            </div>
                            <span className="text-sm text-gray-400 w-12">{category.percentage}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Usage Trends</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {weeklyData.map((day, index) => (
                    <Card
                      key={day.day}
                      className="glass-effect hover:bg-white/10 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <h4 className="font-medium text-white mb-2">{day.day}</h4>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-400">Screen Time</p>
                              <p className="text-sm font-medium text-white">{formatTime(day.screenTime)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Focus Time</p>
                              <p className="text-sm font-medium text-green-400">{formatTime(day.focusTime)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Distractions</p>
                              <p className="text-sm font-medium text-red-400">{day.distractions}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-400" />
                  Your Achievements
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {achievements.map((achievement, index) => (
                    <Card
                      key={achievement.id}
                      className={`glass-effect hover:bg-white/10 transition-all duration-300 animate-fade-in ${
                        achievement.earned ? "ring-2 ring-green-500/30" : ""
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-white">{achievement.title}</h4>
                              {achievement.earned && (
                                <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Earned</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                            {achievement.earned ? (
                              <p className="text-xs text-green-400">
                                Earned on {new Date(achievement.date!).toLocaleDateString()}
                              </p>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-400">Progress</span>
                                  <span className="text-white">
                                    {achievement.progress}/{achievement.target}
                                  </span>
                                </div>
                                <Progress
                                  value={(achievement.progress! / achievement.target!) * 100}
                                  className="h-2 bg-white/10"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
