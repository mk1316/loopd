"use client"

import { useState } from "react"
import { Bell, Shield, Palette, Download, Upload, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      goalReminders: true,
      blockNotifications: true,
      weeklyReports: true,
      achievementAlerts: true,
      emailNotifications: false,
    },
    blocking: {
      strictMode: false,
      allowEmergencyOverride: true,
      overridePrice: 2.0,
      waitTime: 60,
      blockDuringCalls: false,
    },
    appearance: {
      theme: "dark",
      accentColor: "indigo",
      compactMode: false,
      showAnimations: true,
    },
    privacy: {
      dataCollection: true,
      analytics: true,
      crashReports: true,
      shareUsageStats: false,
    },
    sync: {
      autoSync: true,
      syncFrequency: "realtime",
      cloudBackup: true,
      encryptData: true,
    },
  })

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-gray-400">Customize your Loopd experience</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10">
            <Upload className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button variant="outline" className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10">
            <Download className="h-4 w-4 mr-2" />
            Import Settings
          </Button>
        </div>
      </div>

      <Card className="card-dark">
        <CardContent className="p-6">
          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/5">
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="blocking"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Blocking
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Appearance
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Privacy
              </TabsTrigger>
              <TabsTrigger
                value="sync"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Sync & Backup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-indigo-400" />
                  Notification Preferences
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      key: "goalReminders",
                      label: "Goal Reminders",
                      description: "Get notified when approaching time limits",
                    },
                    {
                      key: "blockNotifications",
                      label: "Block Notifications",
                      description: "Show notifications when content is blocked",
                    },
                    {
                      key: "weeklyReports",
                      label: "Weekly Reports",
                      description: "Receive weekly usage and progress reports",
                    },
                    {
                      key: "achievementAlerts",
                      label: "Achievement Alerts",
                      description: "Get notified when you earn new achievements",
                    },
                    {
                      key: "emailNotifications",
                      label: "Email Notifications",
                      description: "Receive notifications via email",
                    },
                  ].map((item) => (
                    <Card key={item.key} className="glass-effect">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Label className="text-white font-medium">{item.label}</Label>
                            <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                          </div>
                          <Switch
                            checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                            onCheckedChange={(value) => updateSetting("notifications", item.key, value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="blocking" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-400" />
                  Blocking Behavior
                </h3>

                <div className="space-y-4">
                  <Card className="glass-effect">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-white font-medium">Strict Mode</Label>
                          <p className="text-sm text-gray-400 mt-1">Disable all override options for maximum focus</p>
                        </div>
                        <Switch
                          checked={settings.blocking.strictMode}
                          onCheckedChange={(value) => updateSetting("blocking", "strictMode", value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-white font-medium">Allow Emergency Override</Label>
                          <p className="text-sm text-gray-400 mt-1">Enable paid override for emergency access</p>
                        </div>
                        <Switch
                          checked={settings.blocking.allowEmergencyOverride}
                          onCheckedChange={(value) => updateSetting("blocking", "allowEmergencyOverride", value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label className="text-white font-medium">Override Price</Label>
                        <p className="text-sm text-gray-400 mt-1">Cost to bypass blocks (helps maintain commitment)</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white">$</span>
                        <Input
                          type="number"
                          step="0.50"
                          min="0.50"
                          max="10.00"
                          value={settings.blocking.overridePrice}
                          onChange={(e) =>
                            updateSetting("blocking", "overridePrice", Number.parseFloat(e.target.value))
                          }
                          className="bg-white/5 border-white/20 text-white w-24"
                        />
                        <span className="text-gray-400">per 15 minutes</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label className="text-white font-medium">Wait Time Override</Label>
                        <p className="text-sm text-gray-400 mt-1">Seconds to wait before allowing free override</p>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[settings.blocking.waitTime]}
                          onValueChange={(value) => updateSetting("blocking", "waitTime", value[0])}
                          max={300}
                          min={30}
                          step={30}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>30s</span>
                          <span className="text-white">{settings.blocking.waitTime}s</span>
                          <span>5min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Palette className="h-5 w-5 text-indigo-400" />
                  Appearance & Theme
                </h3>

                <div className="space-y-4">
                  <Card className="glass-effect">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label className="text-white font-medium">Theme</Label>
                        <p className="text-sm text-gray-400 mt-1">Choose your preferred color scheme</p>
                      </div>
                      <Select
                        value={settings.appearance.theme}
                        onValueChange={(value) => updateSetting("appearance", "theme", value)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-white/20">
                          <SelectItem value="dark" className="text-white hover:bg-white/10">
                            Dark
                          </SelectItem>
                          <SelectItem value="light" className="text-white hover:bg-white/10">
                            Light
                          </SelectItem>
                          <SelectItem value="auto" className="text-white hover:bg-white/10">
                            Auto
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label className="text-white font-medium">Accent Color</Label>
                        <p className="text-sm text-gray-400 mt-1">Primary color for buttons and highlights</p>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {["indigo", "purple", "blue", "green", "orange", "red"].map((color) => (
                          <button
                            key={color}
                            onClick={() => updateSetting("appearance", "accentColor", color)}
                            className={`w-8 h-8 rounded-full bg-${color}-500 hover:scale-110 transition-transform ${
                              settings.appearance.accentColor === color ? "ring-2 ring-white" : ""
                            }`}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-white font-medium">Compact Mode</Label>
                          <p className="text-sm text-gray-400 mt-1">Reduce spacing and padding for more content</p>
                        </div>
                        <Switch
                          checked={settings.appearance.compactMode}
                          onCheckedChange={(value) => updateSetting("appearance", "compactMode", value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-white font-medium">Show Animations</Label>
                          <p className="text-sm text-gray-400 mt-1">Enable smooth transitions and animations</p>
                        </div>
                        <Switch
                          checked={settings.appearance.showAnimations}
                          onCheckedChange={(value) => updateSetting("appearance", "showAnimations", value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-400" />
                  Privacy & Data
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      key: "dataCollection",
                      label: "Data Collection",
                      description: "Allow collection of usage data to improve the app",
                    },
                    { key: "analytics", label: "Analytics", description: "Help us understand how you use Loopd" },
                    {
                      key: "crashReports",
                      label: "Crash Reports",
                      description: "Automatically send crash reports to help fix bugs",
                    },
                    {
                      key: "shareUsageStats",
                      label: "Share Usage Statistics",
                      description: "Share anonymized usage statistics for research",
                    },
                  ].map((item) => (
                    <Card key={item.key} className="glass-effect">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Label className="text-white font-medium">{item.label}</Label>
                            <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                          </div>
                          <Switch
                            checked={settings.privacy[item.key as keyof typeof settings.privacy]}
                            onCheckedChange={(value) => updateSetting("privacy", item.key, value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="glass-effect">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white font-medium">Data Export</Label>
                        <p className="text-sm text-gray-400 mt-1">Download all your data in a portable format</p>
                      </div>
                      <Button variant="outline" className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10">
                        <Download className="h-4 w-4 mr-2" />
                        Export My Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-red-500/30">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-red-400 font-medium">Delete Account</Label>
                        <p className="text-sm text-gray-400 mt-1">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sync" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-indigo-400" />
                  Sync & Backup
                </h3>

                <div className="space-y-4">
                  <Card className="glass-effect">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-white font-medium">Auto Sync</Label>
                          <p className="text-sm text-gray-400 mt-1">Automatically sync data across all devices</p>
                        </div>
                        <Switch
                          checked={settings.sync.autoSync}
                          onCheckedChange={(value) => updateSetting("sync", "autoSync", value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label className="text-white font-medium">Sync Frequency</Label>
                        <p className="text-sm text-gray-400 mt-1">How often to sync data between devices</p>
                      </div>
                      <Select
                        value={settings.sync.syncFrequency}
                        onValueChange={(value) => updateSetting("sync", "syncFrequency", value)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-effect border-white/20">
                          <SelectItem value="realtime" className="text-white hover:bg-white/10">
                            Real-time
                          </SelectItem>
                          <SelectItem value="5min" className="text-white hover:bg-white/10">
                            Every 5 minutes
                          </SelectItem>
                          <SelectItem value="15min" className="text-white hover:bg-white/10">
                            Every 15 minutes
                          </SelectItem>
                          <SelectItem value="hourly" className="text-white hover:bg-white/10">
                            Hourly
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-white font-medium">Cloud Backup</Label>
                          <p className="text-sm text-gray-400 mt-1">Backup your data to the cloud for recovery</p>
                        </div>
                        <Switch
                          checked={settings.sync.cloudBackup}
                          onCheckedChange={(value) => updateSetting("sync", "cloudBackup", value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-white font-medium">Encrypt Data</Label>
                          <p className="text-sm text-gray-400 mt-1">Encrypt all synced and backed up data</p>
                        </div>
                        <Switch
                          checked={settings.sync.encryptData}
                          onCheckedChange={(value) => updateSetting("sync", "encryptData", value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white font-medium">Manual Backup</Label>
                          <p className="text-sm text-gray-400 mt-1">
                            Create a backup of your current settings and data
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Create Backup
                          </Button>
                          <Button
                            variant="outline"
                            className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Restore Backup
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
