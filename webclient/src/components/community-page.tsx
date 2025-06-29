"use client"

import { useState } from "react"
import { Trophy, Star, Flame, Users, Medal, Crown, Zap, Target, Calendar, Gift } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data for achievements and gamification
const achievements = [
  {
    id: 1,
    name: "First Steps",
    description: "Complete your first goal",
    icon: Target,
    rarity: "common",
    progress: 100,
    unlocked: true,
    unlockedDate: "2024-01-15",
    points: 50,
  },
  {
    id: 2,
    name: "Week Warrior",
    description: "Maintain goals for 7 consecutive days",
    icon: Calendar,
    rarity: "uncommon",
    progress: 85,
    unlocked: false,
    points: 150,
  },
  {
    id: 3,
    name: "Focus Master",
    description: "Achieve 90+ focus score for 5 days",
    icon: Zap,
    rarity: "rare",
    progress: 60,
    unlocked: false,
    points: 300,
  },
  {
    id: 4,
    name: "Digital Detox",
    description: "Go 24 hours without social media",
    icon: Medal,
    rarity: "epic",
    progress: 0,
    unlocked: false,
    points: 500,
  },
  {
    id: 5,
    name: "Zen Master",
    description: "Perfect week - all goals met",
    icon: Crown,
    rarity: "legendary",
    progress: 0,
    unlocked: false,
    points: 1000,
  },
]

const streaks = [
  { name: "Daily Goals", current: 12, best: 28, active: true },
  { name: "Focus Sessions", current: 0, best: 15, active: false },
  { name: "Social Media Limit", current: 5, best: 21, active: true },
  { name: "Screen Time Goal", current: 8, best: 18, active: true },
]

const leaderboard = [
  { rank: 1, name: "Sarah Chen", points: 2850, streak: 45, change: 0 },
  { rank: 2, name: "Mike Johnson", points: 2720, streak: 32, change: 1 },
  { rank: 3, name: "Alex Kim", points: 2650, streak: 28, change: -1 },
  { rank: 4, name: "Emma Davis", points: 2580, streak: 25, change: 2 },
  { rank: 5, name: "You", points: 2420, streak: 12, change: 0 },
]

const challenges = [
  {
    id: 1,
    name: "Mindful Monday",
    description: "Limit social media to 30 minutes",
    difficulty: "Easy",
    points: 100,
    timeLeft: "2 days",
    participants: 1247,
    completed: false,
  },
  {
    id: 2,
    name: "Focus Friday",
    description: "Achieve 95+ focus score",
    difficulty: "Medium",
    points: 250,
    timeLeft: "5 days",
    participants: 892,
    completed: false,
  },
  {
    id: 3,
    name: "Weekend Warrior",
    description: "No entertainment apps on weekends",
    difficulty: "Hard",
    points: 500,
    timeLeft: "1 day",
    participants: 456,
    completed: true,
  },
]

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("achievements")

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400 bg-gray-600/20"
      case "uncommon":
        return "text-green-400 bg-green-600/20"
      case "rare":
        return "text-blue-400 bg-blue-600/20"
      case "epic":
        return "text-purple-400 bg-purple-600/20"
      case "legendary":
        return "text-yellow-400 bg-yellow-600/20"
      default:
        return "text-gray-400 bg-gray-600/20"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400 bg-green-600/20"
      case "Medium":
        return "text-yellow-400 bg-yellow-600/20"
      case "Hard":
        return "text-red-400 bg-red-600/20"
      default:
        return "text-gray-400 bg-gray-600/20"
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-300" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Community</h2>
          <p className="text-gray-400">Track achievements, compete with friends, and join challenges</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Points</p>
            <p className="text-2xl font-bold text-white">2,420</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Current Level</p>
            <p className="text-2xl font-bold text-indigo-400">12</p>
          </div>
        </div>
      </div>

      {/* Gamification Tabs */}
      <Card className="card-dark">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/5">
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Achievements
              </TabsTrigger>
              <TabsTrigger
                value="streaks"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Streaks
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Leaderboard
              </TabsTrigger>
              <TabsTrigger
                value="challenges"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Challenges
              </TabsTrigger>
            </TabsList>

            <TabsContent value="achievements" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-indigo-400" />
                  Your Achievements
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  {achievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`glass-effect hover:bg-white/10 transition-all duration-300 ${achievement.unlocked ? "ring-2 ring-indigo-400/50" : "opacity-75"}`}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-3 rounded-xl ${achievement.unlocked ? "bg-indigo-600/20" : "bg-gray-600/20"}`}
                              >
                                <achievement.icon
                                  className={`h-6 w-6 ${achievement.unlocked ? "text-indigo-400" : "text-gray-400"}`}
                                />
                              </div>
                              <div>
                                <h4 className="font-medium text-white">{achievement.name}</h4>
                                <p className="text-sm text-gray-400">{achievement.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={`${getRarityColor(achievement.rarity)} border-0 mb-2`}>
                                {achievement.rarity}
                              </Badge>
                              <p className="text-sm font-medium text-white">+{achievement.points} pts</p>
                            </div>
                          </div>
                          {!achievement.unlocked && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">Progress</span>
                                <span className="text-sm text-white">{achievement.progress}%</span>
                              </div>
                              <Progress value={achievement.progress} className="h-2 bg-white/10" />
                            </div>
                          )}
                          {achievement.unlocked && achievement.unlockedDate && (
                            <p className="text-xs text-green-400">
                              Unlocked on {new Date(achievement.unlockedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="streaks" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                  Current Streaks
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  {streaks.map((streak, index) => (
                    <Card key={index} className="glass-effect hover:bg-white/10 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${streak.active ? "bg-orange-600/20" : "bg-gray-600/20"}`}
                              >
                                <Flame className={`h-5 w-5 ${streak.active ? "text-orange-400" : "text-gray-400"}`} />
                              </div>
                              <div>
                                <h4 className="font-medium text-white">{streak.name}</h4>
                                <p className="text-sm text-gray-400">
                                  {streak.active ? "Active streak" : "Streak broken"}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={`${streak.active ? "bg-orange-600/20 text-orange-400" : "bg-gray-600/20 text-gray-400"} border-0`}
                            >
                              {streak.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">Current</p>
                              <p className="text-2xl font-bold text-white">{streak.current}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Best</p>
                              <p className="text-2xl font-bold text-indigo-400">{streak.best}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-400" />
                  Global Leaderboard
                </h3>

                <Card className="glass-effect">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {leaderboard.map((user, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${user.name === "You" ? "bg-indigo-600/20 ring-2 ring-indigo-400/50" : "hover:bg-white/5"}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8">{getRankIcon(user.rank)}</div>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                              <AvatarFallback className="bg-white/10 text-white">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className={`font-medium ${user.name === "You" ? "text-indigo-400" : "text-white"}`}>
                                {user.name}
                              </p>
                              <p className="text-sm text-gray-400">{user.streak} day streak</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium text-white">{user.points.toLocaleString()}</p>
                              <p className="text-xs text-gray-400">points</p>
                            </div>
                            {user.change !== 0 && (
                              <div className={`text-sm ${user.change > 0 ? "text-green-400" : "text-red-400"}`}>
                                {user.change > 0 ? "↑" : "↓"} {Math.abs(user.change)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="challenges" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-indigo-400" />
                  Active Challenges
                </h3>

                <div className="space-y-4">
                  {challenges.map((challenge) => (
                    <Card
                      key={challenge.id}
                      className={`glass-effect hover:bg-white/10 transition-all duration-300 ${challenge.completed ? "ring-2 ring-green-400/50" : ""}`}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-white">{challenge.name}</h4>
                              <p className="text-sm text-gray-400">{challenge.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${getDifficultyColor(challenge.difficulty)} border-0`}>
                                {challenge.difficulty}
                              </Badge>
                              {challenge.completed && (
                                <Badge className="bg-green-600/20 text-green-400 border-0">Completed</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Gift className="h-4 w-4 text-indigo-400" />
                                <span className="text-sm font-medium text-white">+{challenge.points} pts</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-400">{challenge.participants} participants</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-400">{challenge.timeLeft} left</span>
                              <Button
                                size="sm"
                                className={challenge.completed ? "bg-green-600 hover:bg-green-700" : "gradient-button"}
                                disabled={challenge.completed}
                              >
                                {challenge.completed ? "Completed" : "Join Challenge"}
                              </Button>
                            </div>
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
