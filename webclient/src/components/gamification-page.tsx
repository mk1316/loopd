"use client"

import { useState } from "react"
import { Trophy, Flame, Target, Users, Gift, Crown, Medal, Award, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data for gamification
const userStats = {
  level: 12,
  xp: 2450,
  xpToNext: 3000,
  totalPoints: 15680,
  rank: 156,
  totalUsers: 50000,
  currentStreak: 23,
  longestStreak: 45,
}

const achievements = [
  {
    id: 1,
    name: "First Steps",
    description: "Complete your first goal",
    icon: "🎯",
    earned: true,
    earnedDate: "2024-01-15",
    rarity: "common",
    points: 100,
  },
  {
    id: 2,
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "⚔️",
    earned: true,
    earnedDate: "2024-01-22",
    rarity: "uncommon",
    points: 250,
  },
  {
    id: 3,
    name: "Focus Master",
    description: "Achieve 4+ hours of focus time in a day",
    icon: "🧠",
    earned: true,
    earnedDate: "2024-01-28",
    rarity: "rare",
    points: 500,
  },
  {
    id: 4,
    name: "Social Media Slayer",
    description: "Stay under social media limit for 30 days",
    icon: "🗡️",
    earned: false,
    progress: 23,
    target: 30,
    rarity: "epic",
    points: 1000,
  },
  {
    id: 5,
    name: "Digital Zen Master",
    description: "Complete a 7-day digital detox",
    icon: "🧘",
    earned: false,
    progress: 0,
    target: 7,
    rarity: "legendary",
    points: 2500,
  },
  {
    id: 6,
    name: "Early Bird",
    description: "Start productive work before 8 AM for 14 days",
    icon: "🌅",
    earned: true,
    earnedDate: "2024-02-01",
    rarity: "uncommon",
    points: 300,
  },
]

const leaderboard = [
  { rank: 1, name: "Sarah Chen", points: 28450, streak: 67, avatar: "SC" },
  { rank: 2, name: "Mike Johnson", points: 26890, streak: 45, avatar: "MJ" },
  { rank: 3, name: "Emma Davis", points: 24120, streak: 52, avatar: "ED" },
  { rank: 4, name: "Alex Kim", points: 22340, streak: 38, avatar: "AK" },
  { rank: 5, name: "You", points: 15680, streak: 23, avatar: "YU", isCurrentUser: true },
  { rank: 6, name: "David Wilson", points: 14230, streak: 29, avatar: "DW" },
  { rank: 7, name: "Lisa Brown", points: 13890, streak: 31, avatar: "LB" },
]

const challenges = [
  {
    id: 1,
    name: "Focus February",
    description: "Achieve 100 hours of focus time this month",
    type: "monthly",
    progress: 67,
    target: 100,
    timeLeft: "12 days",
    reward: 1500,
    participants: 2847,
  },
  {
    id: 2,
    name: "Social Media Detox",
    description: "Stay under 30 minutes of social media daily for a week",
    type: "weekly",
    progress: 4,
    target: 7,
    timeLeft: "3 days",
    reward: 750,
    participants: 1203,
  },
  {
    id: 3,
    name: "Morning Productivity",
    description: "Start work before 9 AM every day this week",
    type: "daily",
    progress: 5,
    target: 7,
    timeLeft: "2 days",
    reward: 400,
    participants: 856,
  },
]

const rewards = [
  {
    id: 1,
    name: "Custom Theme",
    description: "Unlock exclusive gradient themes",
    cost: 1000,
    type: "cosmetic",
    icon: "🎨",
  },
  {
    id: 2,
    name: "Advanced Analytics",
    description: "7 days of premium analytics",
    cost: 2500,
    type: "feature",
    icon: "📊",
  },
  {
    id: 3,
    name: "Priority Support",
    description: "Skip the queue for 30 days",
    cost: 1500,
    type: "service",
    icon: "🚀",
  },
  {
    id: 4,
    name: "Achievement Showcase",
    description: "Display achievements on profile",
    cost: 800,
    type: "cosmetic",
    icon: "🏆",
  },
]

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400 border-gray-600/30"
      case "uncommon":
        return "text-green-400 border-green-600/30"
      case "rare":
        return "text-blue-400 border-blue-600/30"
      case "epic":
        return "text-purple-400 border-purple-600/30"
      case "legendary":
        return "text-yellow-400 border-yellow-600/30"
      default:
        return "text-gray-400 border-gray-600/30"
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-600/20"
      case "uncommon":
        return "bg-green-600/20"
      case "rare":
        return "bg-blue-600/20"
      case "epic":
        return "bg-purple-600/20"
      case "legendary":
        return "bg-yellow-600/20"
      default:
        return "bg-gray-600/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Achievements & Rewards</h2>
          <p className="text-gray-400">Track your progress and earn rewards for your digital wellness journey</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Points</p>
            <p className="text-xl font-bold text-yellow-400">{userStats.totalPoints.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Current Streak</p>
            <p className="text-xl font-bold text-orange-400 flex items-center gap-1">
              <Flame className="h-5 w-5" />
              {userStats.currentStreak}
            </p>
          </div>
        </div>
      </div>

      {/* User Level Card */}
      <Card className="card-dark">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full gradient-button flex items-center justify-center text-white font-bold text-xl animate-glow">
                  {userStats.level}
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Level {userStats.level}</h3>
                <p className="text-gray-400">Digital Wellness Enthusiast</p>
                <p className="text-sm text-gray-500">
                  Rank #{userStats.rank.toLocaleString()} of {userStats.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Progress to Level {userStats.level + 1}</span>
                <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-600/30">
                  {Math.round((userStats.xp / userStats.xpToNext) * 100)}%
                </Badge>
              </div>
              <Progress value={(userStats.xp / userStats.xpToNext) * 100} className="w-48 h-3 bg-white/10" />
              <p className="text-xs text-gray-500">
                {userStats.xp} / {userStats.xpToNext} XP
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gamification Tabs */}
      <Card className="card-dark">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/5">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Achievements
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Leaderboard
              </TabsTrigger>
              <TabsTrigger
                value="rewards"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Rewards
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Active Challenges */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-400" />
                  Active Challenges
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {challenges.map((challenge, index) => (
                    <Card
                      key={challenge.id}
                      className="glass-effect hover:bg-white/10 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-sm">{challenge.name}</CardTitle>
                          <Badge
                            className={`${challenge.type === "daily" ? "bg-green-600/20 text-green-400" : challenge.type === "weekly" ? "bg-blue-600/20 text-blue-400" : "bg-purple-600/20 text-purple-400"} border-0`}
                          >
                            {challenge.type}
                          </Badge>
                        </div>
                        <CardDescription className="text-gray-400 text-xs">{challenge.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-white">
                              {challenge.progress}/{challenge.target}
                            </span>
                          </div>
                          <Progress value={(challenge.progress / challenge.target) * 100} className="h-2 bg-white/10" />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">{challenge.participants} participants</span>
                          <span className="text-yellow-400 font-medium">+{challenge.reward} pts</span>
                        </div>
                        <div className="text-center">
                          <span className="text-xs text-gray-500">{challenge.timeLeft} remaining</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-400" />
                  Recent Achievements
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {achievements
                    .filter((a) => a.earned)
                    .slice(0, 4)
                    .map((achievement, index) => (
                      <Card
                        key={achievement.id}
                        className="glass-effect hover:bg-white/10 transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{achievement.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-white">{achievement.name}</h4>
                                <Badge
                                  className={`${getRarityBg(achievement.rarity)} ${getRarityColor(achievement.rarity)} border text-xs`}
                                >
                                  {achievement.rarity}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  Earned {new Date(achievement.earnedDate!).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-yellow-400 font-medium">+{achievement.points} pts</span>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-indigo-400" />
                    Achievement Collection
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {achievements.filter((a) => a.earned).length} of {achievements.length} earned
                    </span>
                    <Progress
                      value={(achievements.filter((a) => a.earned).length / achievements.length) * 100}
                      className="w-24 h-2 bg-white/10"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {achievements.map((achievement, index) => (
                    <Card
                      key={achievement.id}
                      className={`glass-effect hover:bg-white/10 transition-all duration-300 animate-fade-in ${achievement.earned ? "ring-2 ring-yellow-500/30" : "opacity-75"}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-3xl">{achievement.icon}</div>
                            <Badge
                              className={`${getRarityBg(achievement.rarity)} ${getRarityColor(achievement.rarity)} border`}
                            >
                              {achievement.rarity}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-medium text-white mb-1">{achievement.name}</h4>
                            <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                          </div>

                          {achievement.earned ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Medal className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm text-green-400">Completed</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                  {new Date(achievement.earnedDate!).toLocaleDateString()}
                                </span>
                                <span className="text-yellow-400 font-medium">+{achievement.points} pts</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {achievement.progress !== undefined && (
                                <>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Progress</span>
                                    <span className="text-white">
                                      {achievement.progress}/{achievement.target}
                                    </span>
                                  </div>
                                  <Progress
                                    value={(achievement.progress / achievement.target!) * 100}
                                    className="h-2 bg-white/10"
                                  />
                                </>
                              )}
                              <div className="text-right">
                                <span className="text-xs text-yellow-400 font-medium">+{achievement.points} pts</span>
                              </div>
                            </div>
                          )}
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
                <p className="text-gray-400">Compete with other users and climb the ranks</p>

                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <Card
                      key={user.rank}
                      className={`glass-effect hover:bg-white/10 transition-all duration-300 animate-fade-in ${user.isCurrentUser ? "ring-2 ring-indigo-500/50" : ""}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              {user.rank <= 3 ? (
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    user.rank === 1 ? "bg-yellow-500" : user.rank === 2 ? "bg-gray-400" : "bg-amber-600"
                                  }`}
                                >
                                  <Crown className="h-4 w-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                                  {user.rank}
                                </div>
                              )}
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                                <AvatarFallback className="gradient-button text-white font-bold">
                                  {user.avatar}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <p className={`font-medium ${user.isCurrentUser ? "text-indigo-400" : "text-white"}`}>
                                {user.name}
                                {user.isCurrentUser && <span className="text-xs text-gray-400 ml-2">(You)</span>}
                              </p>
                              <p className="text-sm text-gray-400 flex items-center gap-1">
                                <Flame className="h-3 w-3 text-orange-400" />
                                {user.streak} day streak
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-yellow-400">{user.points.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">points</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rewards" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Gift className="h-5 w-5 text-indigo-400" />
                    Reward Marketplace
                  </h3>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">{userStats.totalPoints.toLocaleString()} points</span>
                  </div>
                </div>
                <p className="text-gray-400">Spend your points on exclusive rewards and premium features</p>

                <div className="grid gap-4 md:grid-cols-2">
                  {rewards.map((reward, index) => (
                    <Card
                      key={reward.id}
                      className="glass-effect hover:bg-white/10 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-3xl">{reward.icon}</div>
                            <Badge
                              className={`${
                                reward.type === "cosmetic"
                                  ? "bg-pink-600/20 text-pink-400 border-pink-600/30"
                                  : reward.type === "feature"
                                    ? "bg-blue-600/20 text-blue-400 border-blue-600/30"
                                    : "bg-green-600/20 text-green-400 border-green-600/30"
                              }`}
                            >
                              {reward.type}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-medium text-white mb-2">{reward.name}</h4>
                            <p className="text-sm text-gray-400 mb-4">{reward.description}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-yellow-400">
                              {reward.cost.toLocaleString()} pts
                            </span>
                            <Button
                              className={`${userStats.totalPoints >= reward.cost ? "gradient-button text-white" : "bg-gray-600 text-gray-400 cursor-not-allowed"}`}
                              disabled={userStats.totalPoints < reward.cost}
                            >
                              {userStats.totalPoints >= reward.cost ? "Redeem" : "Not enough points"}
                            </Button>
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
