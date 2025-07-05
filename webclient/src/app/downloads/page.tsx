"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Monitor, Smartphone, Apple, Shield, CheckCircle, ExternalLink } from "lucide-react"
import { usePostHog } from "@/hooks/usePostHog"

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
              Get Started
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Download Loopd</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get started with digital wellness on all your devices. Seamless sync across platforms.
          </p>
        </div>

        {/* Download Tabs */}
        <Tabs defaultValue="desktop" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-800/50 border border-white/10">
            <TabsTrigger value="desktop" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
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
                        <CardTitle className="text-white">Loopd for Windows</CardTitle>
                        <CardDescription className="text-gray-400">Windows 10/11 (64-bit)</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>System-level app blocking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Website filtering</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Detailed usage analytics</span>
                    </div>
                  </div>
                  <Button
                    className="w-full gradient-button hover:scale-105 transition-all duration-300"
                    onClick={() => handleDownload("windows")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download for Windows
                  </Button>
                  <p className="text-xs text-gray-400 text-center">Version 2.1.0 • 45.2 MB</p>
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
                        <CardTitle className="text-white">Loopd for macOS</CardTitle>
                        <CardDescription className="text-gray-400">macOS 12.0+ (Universal)</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Screen Time integration</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Focus mode automation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Menu bar quick access</span>
                    </div>
                  </div>
                  <Button
                    className="w-full gradient-button hover:scale-105 transition-all duration-300"
                    onClick={() => handleDownload("macos")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download for macOS
                  </Button>
                  <p className="text-xs text-gray-400 text-center">Version 2.1.0 • 52.8 MB</p>
                </CardContent>
              </Card>
            </div>

            {/* System Requirements */}
            <Card className="card-dark border-white/10">
              <CardHeader>
                <CardTitle className="text-white">System Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Windows</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• Windows 10 version 1903 or later</li>
                      <li>• 4 GB RAM minimum</li>
                      <li>• 100 MB available disk space</li>
                      <li>• Internet connection required</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">macOS</h4>
                    <ul className="space-y-1 text-sm text-gray-300">
                      <li>• macOS 12.0 (Monterey) or later</li>
                      <li>• 4 GB RAM minimum</li>
                      <li>• 150 MB available disk space</li>
                      <li>• Internet connection required</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile Downloads */}
          <TabsContent value="mobile" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Android */}
              <Card className="card-dark border-white/10 hover:border-white/20 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5743-6.1185-9.4396" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-white">Loopd for Android</CardTitle>
                      <CardDescription className="text-gray-400">Android 8.0+ (API level 26)</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Digital Wellbeing integration</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>App usage controls</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Notification management</span>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
                    onClick={() => handleStoreClick("google_play", "android")}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                    Get it on Google Play
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span>4.6★ Rating</span>
                    <span>•</span>
                    <span>100K+ Downloads</span>
                  </div>
                </CardContent>
              </Card>

              {/* iOS */}
              <Card className="card-dark border-white/10 hover:border-white/20 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Apple className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Loopd for iOS</CardTitle>
                      <CardDescription className="text-gray-400">iPhone & iPad • iOS 15.0+</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Screen Time integration</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>App usage tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Focus mode shortcuts</span>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-black hover:bg-gray-800 text-white transition-all duration-300"
                    onClick={() => handleStoreClick("app_store", "ios")}
                  >
                    <Apple className="h-4 w-4 mr-2" />
                    Download on App Store
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span>4.8★ Rating</span>
                    <span>•</span>
                    <span>50K+ Downloads</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Features */}
            <Card className="card-dark border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Mobile Features</CardTitle>
                <CardDescription className="text-gray-400">
                  Comprehensive digital wellness tools designed for mobile devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Real-time app usage tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Smart notification filtering</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Focus mode automation</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Weekly wellness reports</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Cross-device synchronization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">Mindful usage reminders</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Support Section */}
        <Card className="card-dark border-white/10 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Need Help?</CardTitle>
            <CardDescription className="text-gray-400">
              Get support and learn how to make the most of Loopd
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                📚 User Guide
              </Button>
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                💬 Community Forum
              </Button>
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                📧 Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/10 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400 text-sm">© 2025 Loopd. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
} 