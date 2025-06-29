"use client"

import { useState } from "react"
import { User, Camera, Save, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState({
    firstName: "Alex",
    lastName: "Kim",
    email: "alex@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    timezone: "America/Los_Angeles",
    bio: "Digital wellness enthusiast focused on maintaining healthy technology habits.",
    website: "https://alexkim.dev",
    company: "Tech Startup Inc.",
    jobTitle: "Product Manager",
    dateOfBirth: "1990-05-15",
  })

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    showPassword: false,
  })

  const [preferences, setPreferences] = useState({
    emailUpdates: true,
    marketingEmails: false,
    weeklyDigest: true,
    profileVisibility: "private",
    dataSharing: false,
  })

  const updateProfile = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  const updateSecurity = (key: string, value: any) => {
    setSecurity((prev) => ({ ...prev, [key]: value }))
  }

  const updatePreferences = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveProfile = () => {
    // Save profile logic here
    console.log("Saving profile:", profile)
  }

  const handleChangePassword = () => {
    // Change password logic here
    console.log("Changing password")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          <p className="text-gray-400">Manage your personal information and account preferences</p>
        </div>
        <Button onClick={handleSaveProfile} className="gradient-button text-white">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Picture */}
        <Card className="card-dark lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Profile Picture</CardTitle>
            <CardDescription className="text-gray-400">Update your profile photo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 ring-4 ring-indigo-400/50">
                <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Profile" />
                <AvatarFallback className="gradient-button text-white text-2xl font-bold">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="card-dark lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-400" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-gray-400">Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-300">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => updateProfile("firstName", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-300">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => updateProfile("lastName", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => updateProfile("email", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => updateProfile("phone", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-gray-300">
                  Date of Birth
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => updateProfile("dateOfBirth", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-300">
                Location
              </Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => updateProfile("location", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-gray-300">
                Timezone
              </Label>
              <Select value={profile.timezone} onValueChange={(value) => updateProfile("timezone", value)}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-effect border-white/20">
                  <SelectItem value="America/Los_Angeles" className="text-white hover:bg-white/10">
                    Pacific Time
                  </SelectItem>
                  <SelectItem value="America/Denver" className="text-white hover:bg-white/10">
                    Mountain Time
                  </SelectItem>
                  <SelectItem value="America/Chicago" className="text-white hover:bg-white/10">
                    Central Time
                  </SelectItem>
                  <SelectItem value="America/New_York" className="text-white hover:bg-white/10">
                    Eastern Time
                  </SelectItem>
                  <SelectItem value="Europe/London" className="text-white hover:bg-white/10">
                    GMT
                  </SelectItem>
                  <SelectItem value="Europe/Paris" className="text-white hover:bg-white/10">
                    CET
                  </SelectItem>
                  <SelectItem value="Asia/Tokyo" className="text-white hover:bg-white/10">
                    JST
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-300">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => updateProfile("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                className="bg-white/5 border-white/20 text-white"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Information */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-white">Professional Information</CardTitle>
          <CardDescription className="text-gray-400">Your work and professional details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-gray-300">
                Company
              </Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => updateProfile("company", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-gray-300">
                Job Title
              </Label>
              <Input
                id="jobTitle"
                value={profile.jobTitle}
                onChange={(e) => updateProfile("jobTitle", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website" className="text-gray-300">
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={profile.website}
              onChange={(e) => updateProfile("website", e.target.value)}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-white">Security Settings</CardTitle>
          <CardDescription className="text-gray-400">Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-gray-300">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={security.showPassword ? "text" : "password"}
                value={security.currentPassword}
                onChange={(e) => updateSecurity("currentPassword", e.target.value)}
                className="bg-white/5 border-white/20 text-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={() => updateSecurity("showPassword", !security.showPassword)}
              >
                {security.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-300">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={security.newPassword}
                onChange={(e) => updateSecurity("newPassword", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={security.confirmPassword}
                onChange={(e) => updateSecurity("confirmPassword", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-medium">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
            </div>
            <Switch
              checked={security.twoFactorEnabled}
              onCheckedChange={(value) => updateSecurity("twoFactorEnabled", value)}
            />
          </div>

          <Button onClick={handleChangePassword} className="gradient-button text-white">
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Preferences */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-white">Privacy Preferences</CardTitle>
          <CardDescription className="text-gray-400">Control your privacy and communication settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Email Updates</Label>
                <p className="text-sm text-gray-400">Receive important account updates via email</p>
              </div>
              <Switch
                checked={preferences.emailUpdates}
                onCheckedChange={(value) => updatePreferences("emailUpdates", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Marketing Emails</Label>
                <p className="text-sm text-gray-400">Receive promotional content and feature announcements</p>
              </div>
              <Switch
                checked={preferences.marketingEmails}
                onCheckedChange={(value) => updatePreferences("marketingEmails", value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Weekly Digest</Label>
                <p className="text-sm text-gray-400">Get a weekly summary of your digital wellness progress</p>
              </div>
              <Switch
                checked={preferences.weeklyDigest}
                onCheckedChange={(value) => updatePreferences("weeklyDigest", value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Profile Visibility</Label>
              <Select
                value={preferences.profileVisibility}
                onValueChange={(value) => updatePreferences("profileVisibility", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-effect border-white/20">
                  <SelectItem value="public" className="text-white hover:bg-white/10">
                    Public
                  </SelectItem>
                  <SelectItem value="friends" className="text-white hover:bg-white/10">
                    Friends Only
                  </SelectItem>
                  <SelectItem value="private" className="text-white hover:bg-white/10">
                    Private
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-medium">Data Sharing</Label>
                <p className="text-sm text-gray-400">Allow anonymized data to be used for research</p>
              </div>
              <Switch
                checked={preferences.dataSharing}
                onCheckedChange={(value) => updatePreferences("dataSharing", value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
