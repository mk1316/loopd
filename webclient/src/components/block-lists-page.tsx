"use client"

import { useState } from "react"
import {
  Plus,
  Shield,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  Smartphone,
  Monitor,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockBlockLists = [
  {
    id: "1",
    name: "Social Media Focus",
    description: "Block major social media platforms during work hours",
    category: "Social Media",
    websites: ["facebook.com", "instagram.com", "twitter.com", "tiktok.com", "snapchat.com"],
    apps: ["Instagram", "Twitter", "TikTok", "Facebook", "Snapchat"],
    isActive: true,
    schedule: {
      days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      startTime: "09:00",
      endTime: "17:00"
    },
    devices: ["Desktop", "Mobile"],
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "News & Politics",
    description: "Limit news consumption to reduce anxiety",
    category: "News",
    websites: ["reddit.com", "news.ycombinator.com", "cnn.com", "bbc.com"],
    apps: ["Reddit", "Apple News", "CNN"],
    isActive: false,
    schedule: {
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      startTime: "00:00",
      endTime: "23:59"
    },
    devices: ["Desktop", "Mobile", "Tablet"],
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    name: "Entertainment Block",
    description: "Block streaming and gaming during study time",
    category: "Entertainment",
    websites: ["youtube.com", "netflix.com", "twitch.tv", "hulu.com"],
    apps: ["YouTube", "Netflix", "Twitch", "Hulu"],
    isActive: true,
    schedule: {
      days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      startTime: "19:00",
      endTime: "23:00"
    },
    devices: ["Desktop", "Tablet"],
    createdAt: new Date("2024-01-20"),
  },
]

const presetLists = [
  {
    name: "Productivity Booster",
    description: "Common distracting websites and apps",
    category: "Productivity",
    websites: ["facebook.com", "instagram.com", "youtube.com", "reddit.com"],
    apps: ["Facebook", "Instagram", "YouTube", "Reddit"],
  },
  {
    name: "Study Mode",
    description: "Block entertainment during study sessions",
    category: "Education",
    websites: ["netflix.com", "hulu.com", "twitch.tv", "gaming.com"],
    apps: ["Netflix", "Hulu", "Twitch", "Steam"],
  },
  {
    name: "Digital Detox",
    description: "Complete social media and entertainment block",
    category: "Wellness",
    websites: ["facebook.com", "instagram.com", "twitter.com", "youtube.com", "tiktok.com"],
    apps: ["Facebook", "Instagram", "Twitter", "YouTube", "TikTok"],
  },
]

export default function BlockListsPage() {
  const [blockLists, setBlockLists] = useState(mockBlockLists)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("custom")
  const [newList, setNewList] = useState({
    name: "",
    description: "",
    category: "",
    websites: "",
    apps: "",
  })

  const filteredLists = blockLists.filter(
    (list) =>
      list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateList = () => {
    if (!newList.name || !newList.category) return

    const list = {
      id: (blockLists.length + 1).toString(),
      name: newList.name,
      description: newList.description,
      category: newList.category,
      websites: newList.websites
        .split(",")
        .map((w) => w.trim())
        .filter((a) => a),
      apps: newList.apps
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a),
      isActive: false,
      schedule: {
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        startTime: "00:00",
        endTime: "23:59"
      },
      devices: ["Desktop", "Mobile"],
      createdAt: new Date(),
    }
    setBlockLists([...blockLists, list])
    setNewList({ name: "", description: "", category: "", websites: "", apps: "" })
    setIsCreateDialogOpen(false)
  }

  const toggleListStatus = (id: string) => {
    setBlockLists((lists) => lists.map((list) => (list.id === id ? { ...list, isActive: !list.isActive } : list)))
  }

  const importPresetList = (preset: (typeof presetLists)[0]) => {
    const list = {
      id: (blockLists.length + 1).toString(),
      ...preset,
      isActive: false,
      schedule: {
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        startTime: "00:00",
        endTime: "23:59"
      },
      devices: ["Desktop", "Mobile"],
      createdAt: new Date(),
    }
    setBlockLists([...blockLists, list])
    setIsImportDialogOpen(false)
  }

  const stats = {
    total: blockLists.length,
    active: blockLists.filter((l) => l.isActive).length,
    totalBlocked: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Block Lists</h2>
          <p className="text-gray-400">Manage websites and apps you want to block</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-white/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Block List</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Choose from our preset block lists or import your own
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <h3 className="font-medium text-white">Preset Lists</h3>
                <div className="space-y-3">
                  {presetLists.map((preset, index) => (
                    <Card key={index} className="glass-effect hover:bg-white/10 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{preset.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">{preset.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className="bg-white/10 text-gray-300">{preset.category}</Badge>
                              <span className="text-xs text-gray-400">
                                {preset.websites.length + preset.apps.length} items
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => importPresetList(preset)}
                            className="gradient-button text-white"
                          >
                            Import
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-button text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create List
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-white/20 text-white">
              <DialogHeader>
                <DialogTitle>Create Block List</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Create a custom list of websites and apps to block
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="list-name">List Name</Label>
                  <Input
                    id="list-name"
                    value={newList.name}
                    onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                    placeholder="e.g., Social Media Focus"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newList.category}
                    onValueChange={(value) => setNewList({ ...newList, category: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="glass-effect border-white/20">
                      {["Social Media", "Entertainment", "News", "Productivity", "Gaming", "Shopping"].map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-white hover:bg-white/10">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newList.description}
                    onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                    placeholder="Describe the purpose of this block list"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="websites">Websites (comma-separated)</Label>
                  <Textarea
                    id="websites"
                    value={newList.websites}
                    onChange={(e) => setNewList({ ...newList, websites: e.target.value })}
                    placeholder="facebook.com, instagram.com, twitter.com"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="apps">Apps (comma-separated)</Label>
                  <Textarea
                    id="apps"
                    value={newList.apps}
                    onChange={(e) => setNewList({ ...newList, apps: e.target.value })}
                    placeholder="Facebook, Instagram, Twitter"
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="blocking-level">Blocking Level</Label>
                  <Select value="progressive" onValueChange={() => { }}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select blocking level" />
                    </SelectTrigger>
                    <SelectContent className="glass-effect border-white/20">
                      <SelectItem value="soft" className="text-white hover:bg-white/10">
                        Soft Block (Warning only)
                      </SelectItem>
                      <SelectItem value="progressive" className="text-white hover:bg-white/10">
                        Progressive (Warning → Block)
                      </SelectItem>
                      <SelectItem value="hard" className="text-white hover:bg-white/10">
                        Hard Block (Immediate)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Location-Based Rules</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Home", "Office", "Travel"].map((location) => (
                      <Badge
                        key={location}
                        className="bg-white/5 text-gray-300 border-white/20 cursor-pointer hover:bg-white/10"
                      >
                        {location}
                      </Badge>
                    ))}
                  </div>
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
                <Button onClick={handleCreateList} className="gradient-button text-white">
                  Create List
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Total Lists", value: stats.total, icon: Shield, color: "text-blue-400" },
          { title: "Active Lists", value: stats.active, icon: Globe, color: "text-green-400" },
          { title: "Blocked Today", value: stats.totalBlocked, icon: Filter, color: "text-red-400" },
        ].map((stat, index) => (
          <Card
            key={stat.title}
            className="card-dark hover:scale-105 transition-all duration-300 animate-slide-up"
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

      {/* Search and Filter */}
      <Card className="card-dark">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search block lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white"
              />
            </div>
            <Button variant="outline" className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Block Lists */}
      <div className="space-y-4">
        {filteredLists.map((list, index) => (
          <Card
            key={list.id}
            className="glass-effect hover:bg-white/10 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${list.isActive ? "bg-green-500" : "bg-gray-500"} animate-pulse-slow`}
                  />
                  <div>
                    <CardTitle className="text-white">{list.name}</CardTitle>
                    <CardDescription className="text-gray-400 flex items-center gap-2">
                      {list.category} • Created {new Date(list.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={list.isActive} onCheckedChange={() => toggleListStatus(list.id)} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-effect border-white/20">
                      <DropdownMenuItem className="text-white hover:bg-white/10">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-white/10">
                        <Upload className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-300">{list.description}</p>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Websites ({list.websites.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {list.websites.slice(0, 3).map((website, i) => (
                      <Badge key={i} className="bg-white/5 text-gray-300 border-white/20 text-xs">
                        {website}
                      </Badge>
                    ))}
                    {list.websites.length > 3 && (
                      <Badge className="bg-white/5 text-gray-400 border-white/20 text-xs">
                        +{list.websites.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Apps ({list.apps.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {list.apps.slice(0, 3).map((app, i) => (
                      <Badge key={i} className="bg-white/5 text-gray-300 border-white/20 text-xs">
                        {app}
                      </Badge>
                    ))}
                    {list.apps.length > 3 && (
                      <Badge className="bg-white/5 text-gray-400 border-white/20 text-xs">
                        +{list.apps.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">
                    Schedule: <span className="text-white">
                      {list.schedule.days.length === 7 ? "All day" : `${list.schedule.startTime} - ${list.schedule.endTime}`}
                    </span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Devices:</span>
                    {list.devices.map((device, i) => (
                      <Badge key={i} className="bg-white/5 text-gray-300 border-white/20 text-xs">
                        {device === "Desktop" && <Monitor className="h-3 w-3 mr-1" />}
                        {device === "Mobile" && <Smartphone className="h-3 w-3 mr-1" />}
                        {device === "Tablet" && <Monitor className="h-3 w-3 mr-1" />}
                        {device}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
