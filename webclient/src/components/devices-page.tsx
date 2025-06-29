"use client"

import { useState } from "react"
import {
  Plus,
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

const mockDevices = [
  {
    id: 1,
    name: "MacBook Pro",
    type: "Desktop",
    os: "macOS",
    version: "14.2",
    isOnline: true,
    isProtected: true,
    lastSeen: "2 minutes ago",
    screenTime: 453,
    blockedAttempts: 12,
    location: "Home Office",
    ipAddress: "192.168.1.100",
    syncStatus: "synced",
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    type: "Mobile",
    os: "iOS",
    version: "17.2",
    isOnline: true,
    isProtected: true,
    lastSeen: "1 minute ago",
    screenTime: 287,
    blockedAttempts: 8,
    location: "Home",
    ipAddress: "192.168.1.101",
    syncStatus: "synced",
  },
  {
    id: 3,
    name: "iPad Air",
    type: "Tablet",
    os: "iPadOS",
    version: "17.2",
    isOnline: false,
    isProtected: true,
    lastSeen: "2 hours ago",
    screenTime: 156,
    blockedAttempts: 3,
    location: "Living Room",
    ipAddress: "192.168.1.102",
    syncStatus: "pending",
  },
  {
    id: 4,
    name: "Work Laptop",
    type: "Desktop",
    os: "Windows",
    version: "11",
    isOnline: true,
    isProtected: false,
    lastSeen: "5 minutes ago",
    screenTime: 512,
    blockedAttempts: 0,
    location: "Office",
    ipAddress: "10.0.0.50",
    syncStatus: "error",
  },
]

export default function DevicesPage() {
  const [devices, setDevices] = useState(mockDevices)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newDevice, setNewDevice] = useState({
    name: "",
    type: "",
    os: "",
  })

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "Mobile":
        return Smartphone
      case "Tablet":
        return Tablet
      case "Desktop":
      default:
        return Monitor
    }
  }

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case "synced":
        return <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Synced</Badge>
      case "pending":
        return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">Pending</Badge>
      case "error":
        return <Badge className="bg-red-600/20 text-red-400 border-red-600/30">Error</Badge>
      default:
        return <Badge className="bg-gray-600/20 text-gray-400 border-gray-600/30">Unknown</Badge>
    }
  }

  const toggleDeviceProtection = (id: number) => {
    setDevices((devices) =>
      devices.map((device) => (device.id === id ? { ...device, isProtected: !device.isProtected } : device)),
    )
  }

  const handleAddDevice = () => {
    if (newDevice.name && newDevice.type && newDevice.os) {
      const device = {
        id: devices.length + 1,
        name: newDevice.name,
        type: newDevice.type,
        os: newDevice.os,
        version: "Latest",
        isOnline: false,
        isProtected: false,
        lastSeen: "Never",
        screenTime: 0,
        blockedAttempts: 0,
        location: "Unknown",
        ipAddress: "Pending",
        syncStatus: "pending",
      }
      setDevices([...devices, device])
      setNewDevice({ name: "", type: "", os: "" })
      setIsAddDialogOpen(false)
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const stats = {
    total: devices.length,
    online: devices.filter((d) => d.isOnline).length,
    protected: devices.filter((d) => d.isProtected).length,
    totalScreenTime: devices.reduce((acc, d) => acc + d.screenTime, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Device Management</h2>
          <p className="text-gray-400">Monitor and control Loopd across all your devices</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-button text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-effect border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription className="text-gray-400">
                Add a new device to your Loopd network for monitoring and protection
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  placeholder="e.g., My MacBook Pro"
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="device-type">Device Type</Label>
                <Select value={newDevice.type} onValueChange={(value) => setNewDevice({ ...newDevice, type: value })}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/20">
                    <SelectItem value="Desktop" className="text-white hover:bg-white/10">
                      Desktop
                    </SelectItem>
                    <SelectItem value="Mobile" className="text-white hover:bg-white/10">
                      Mobile
                    </SelectItem>
                    <SelectItem value="Tablet" className="text-white hover:bg-white/10">
                      Tablet
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="device-os">Operating System</Label>
                <Select value={newDevice.os} onValueChange={(value) => setNewDevice({ ...newDevice, os: value })}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select OS" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-white/20">
                    <SelectItem value="macOS" className="text-white hover:bg-white/10">
                      macOS
                    </SelectItem>
                    <SelectItem value="Windows" className="text-white hover:bg-white/10">
                      Windows
                    </SelectItem>
                    <SelectItem value="iOS" className="text-white hover:bg-white/10">
                      iOS
                    </SelectItem>
                    <SelectItem value="Android" className="text-white hover:bg-white/10">
                      Android
                    </SelectItem>
                    <SelectItem value="iPadOS" className="text-white hover:bg-white/10">
                      iPadOS
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button onClick={handleAddDevice} className="gradient-button text-white">
                Add Device
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Total Devices", value: stats.total, icon: Monitor, color: "text-blue-400" },
          { title: "Online Now", value: stats.online, icon: Wifi, color: "text-green-400" },
          { title: "Protected", value: stats.protected, icon: Shield, color: "text-purple-400" },
          {
            title: "Total Screen Time",
            value: formatTime(stats.totalScreenTime),
            icon: Clock,
            color: "text-orange-400",
          },
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

      {/* Devices List */}
      <div className="space-y-4">
        {devices.map((device, index) => {
          const DeviceIcon = getDeviceIcon(device.type)
          return (
            <Card
              key={device.id}
              className="glass-effect hover:bg-white/10 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <DeviceIcon className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        {device.name}
                        {device.isOnline ? (
                          <Wifi className="h-4 w-4 text-green-400" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-gray-400" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-gray-400 flex items-center gap-2">
                        {device.os} {device.version} • {device.location} • Last seen {device.lastSeen}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSyncStatusBadge(device.syncStatus)}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Protection</span>
                      <Switch checked={device.isProtected} onCheckedChange={() => toggleDeviceProtection(device.id)} />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glass-effect border-white/20">
                        <DropdownMenuItem className="text-white hover:bg-white/10">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-white/10">
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Screen Time Today</span>
                      <span className="text-sm font-medium text-white">{formatTime(device.screenTime)}</span>
                    </div>
                    <Progress value={(device.screenTime / 600) * 100} className="h-2 bg-white/10" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Blocked Attempts</span>
                      <span className="text-sm font-medium text-red-400">{device.blockedAttempts}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded ${
                            i < Math.min(device.blockedAttempts, 5) ? "bg-red-500" : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">IP Address</span>
                      <span className="text-sm font-medium text-white">{device.ipAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${device.isOnline ? "bg-green-500" : "bg-gray-500"} animate-pulse-slow`}
                      />
                      <span className="text-xs text-gray-400">{device.isOnline ? "Online" : "Offline"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
