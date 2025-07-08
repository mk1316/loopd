"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Monitor, Smartphone, Apple, Shield, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react"
import { usePostHog } from "@/hooks/usePostHog"
import { Badge } from "@/components/ui/badge"

export default function DownloadsPage() {
  const router = useRouter()
  const posthog = usePostHog()

  // Track page view
  useEffect(() => {
    posthog.trackPageView('downloads', {
      page_name: "downloads",
    })
  }, [posthog])

  const handleDownload = (platform: string, version?: string) => {
    posthog.trackButtonClick('download', {
      platform,
      version: version || "latest",
      page_name: "downloads",
    })
  }

  const handleStoreClick = (store: string, platform: string) => {
    posthog.trackButtonClick('store_click', {
      store,
      platform,
      page_name: "downloads",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-button animate-glow">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Loopd</h1>
                  <p className="text-xs text-gray-400">Digital Wellness</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.push("/login?mode=signup")}
              className="gradient-button hover:scale-105 transition-all duration-300"
            >
              Get Early Access
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-orange-600/20 text-orange-300 border-orange-500/30 hover:bg-orange-600/30">
            🚀 Early Access Program
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Download Loopd Preview</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get early access to our digital wellness tools. Currently available for desktop platforms in pre-release testing.
          </p>
        </div>

        {/* Download Tabs */}
        <Tabs defaultValue="desktop" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-800/50 border border-white/10">
            <TabsTrigger value="desktop" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <Monitor className="h-4 w-4 mr-2" />
              Desktop (Preview)
            </TabsTrigger>
            <TabsTrigger value="mobile" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile (Coming Soon)
            </TabsTrigger>
          </TabsList>

          {/* Desktop Downloads */}
          <TabsContent value="desktop" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Windows */}
              <Card className="card-dark border-white/10 hover:border-white/20 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.351" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-white">Loopd for Windows</CardTitle>
                          <Badge className="bg-orange-600/20 text-orange-300 border-orange-500/30 text-xs">PREVIEW</Badge>
                        </div>
                        <CardDescription className="text-gray-400">Windows 10/11 (64-bit) • Pre-release testing</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Basic app blocking (In Development)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Website filtering (Planned)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Usage tracking (Coming Soon)</span>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full gradient-button hover:scale-105 transition-all duration-300"
                  >
                    <a
                      href="https://github.com/mk1316/loopd/releases/download/loopd-v0.1.0/loopd_0.1.0_x64_en-US.msi"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Preview for Windows
                    </a>
                  </Button>
                  <p className="text-xs text-gray-400 text-center">Version 0.1.0-preview • 7.51 MB • Experimental</p>
                </CardContent>
              </Card>

              {/* macOS */}
              <Card className="card-dark border-white/10 hover:border-white/20 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                        <Apple className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-white">Loopd for macOS</CardTitle>
                          <Badge className="bg-orange-600/20 text-orange-300 border-orange-500/30 text-xs">PREVIEW</Badge>
                        </div>
                        <CardDescription className="text-gray-400">macOS 12.0+ (Universal) • Pre-release testing</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Screen Time integration (Planned)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Focus mode automation (Coming Soon)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Menu bar quick access (In Development)</span>
                    </div>
                  </div>
                  <Button
                    className="w-full gradient-button hover:scale-105 transition-all duration-300"
                    onClick={() => handleDownload("macos")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Preview for macOS
                  </Button>
                  <p className="text-xs text-gray-400 text-center">Version 0.1.0-preview • 8.42 MB • Experimental</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mobile Downloads */}
          <TabsContent value="mobile" className="space-y-6">
            <Card className="card-dark border-gray-500/30 bg-gray-600/5">
              <CardHeader>
                <CardTitle className="text-gray-300">📱 Mobile Apps Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  We're currently focused on developing and testing our desktop applications. Mobile apps for iOS and Android 
                  are in the early planning stages and will be available in future releases.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center p-6 border border-gray-500/20 rounded-lg">
                    <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      {/* Android SVG icon */}
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.6 9.48c.32 0 .58.26.58.58v5.36c0 .32-.26.58-.58.58s-.58-.26-.58-.58V10.06c0-.32.26-.58.58-.58zm-11.2 0c.32 0 .58.26.58.58v5.36c0 .32-.26.58-.58.58s-.58-.26-.58-.58V10.06c0-.32.26-.58.58-.58zm10.13-2.13l1.13-1.96a.375.375 0 10-.65-.37l-1.15 1.99A7.02 7.02 0 0012 6.13c-1.13 0-2.21.26-3.13.73l-1.15-1.99a.375.375 0 10-.65.37l1.13 1.96C6.01 8.01 4.5 10.2 4.5 12.75v3.25c0 .41.34.75.75.75h13.5c.41 0 .75-.34.75-.75v-3.25c0-2.55-1.51-4.74-3.27-5.4zM9.25 17.25c0 .41.34.75.75.75s.75-.34.75-.75v-1.5a.75.75 0 00-1.5 0v1.5zm4.5 0c0 .41.34.75.75.75s.75-.34.75-.75v-1.5a.75.75 0 00-1.5 0v1.5z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Android</h3>
                    <p className="text-gray-400 text-sm">Coming Soon</p>
                    <Badge className="mt-2 bg-gray-600/20 text-gray-300 border-gray-500/30">PLANNED</Badge>
                  </div>
                  <div className="text-center p-6 border border-gray-500/20 rounded-lg">
                    <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Apple className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">iOS</h3>
                    <p className="text-gray-400 text-sm">Coming Soon</p>
                    <Badge className="mt-2 bg-gray-600/20 text-gray-300 border-gray-500/30">PLANNED</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Support Section */}
        <Card className="card-dark border-white/10 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Early Access Support</CardTitle>
            <CardDescription className="text-gray-400">
              Get help with early access testing and provide feedback to improve Loopd
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                🐛 Report Bugs
              </Button>
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                💬 Early Access Feedback
              </Button>
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                📧 Contact Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/10 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400 text-sm">© 2025 Loopd. All rights reserved. Pre-release development.</div>
        </div>
      </footer>
    </div>
  )
} 