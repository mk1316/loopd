"use client";

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { usePostHog } from '@/hooks/usePostHog';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Shield,
  Target,
  BarChart3,
  Smartphone,
  Monitor,
  Clock,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Mail,
  Send,
  Download,
  UserCheck,
  Zap,
  Sparkles,
  Eye,
  Lock,
  Activity,
  Layers,
  Globe,
  Timer,
} from "lucide-react"

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const posthog = usePostHog();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  // Track mouse for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border-2 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 animate-pulse"></div>
          </div>
          <p className="text-white/60 text-sm tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  // Don't show landing page if user is authenticated
  if (user) {
    return null;
  }

  const handleNavigation = (page: string, source?: string) => {
    posthog.trackButtonClick('navigation', {
      destination: page,
      source: source || "landing_page",
      page_name: "landing",
    })

    if (page === "signin") {
      router.push('/login');
    } else if (page === "signup") {
      router.push('/login?mode=signup');
    } else if (page === "downloads") {
      posthog.trackButtonClick('downloads', {
        source: source || "landing_page",
        page_name: "landing",
      });
      router.push('/downloads');
    }
  }

  const handleCTAClick = (action: string, location: string) => {
    posthog.trackButtonClick('cta', {
      action,
      location,
      page_name: "landing",
    })
    if (action === "join_early_access") {
      window.open('https://docs.google.com/forms/d/e/1FAIpQLSfmRxMLMF9_Ab-S3blcXHacRx8WL1MOvrtI6AP8kml6Ga-f_A/viewform?usp=dialog', '_blank');
    } else {
      router.push('/login?mode=signup');
    }
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    posthog.trackButtonClick('contact_form', {
      action: 'submit',
      page_name: "landing",
    })

    const formData = new FormData();
    formData.append('name', contactForm.name);
    formData.append('email', contactForm.email);
    formData.append('message', contactForm.message);
    formData.append('formType', 'general_contact');

    fetch('https://formspree.io/f/YOUR_FORMSPREE_ENDPOINT', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        alert('Thank you for your message! We\'ll get back to you soon.');
        setContactForm({ name: '', email: '', message: '' });
      } else {
        alert('Sorry, there was an error sending your message. Please try again or email us directly at support@loopd.com');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Sorry, there was an error sending your message. Please try again or email us directly at support@loopd.com');
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-[120px] transition-transform duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(236,72,153,0.2) 50%, transparent 70%)',
            left: mousePosition.x - 400,
            top: mousePosition.y - 400,
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-[80px] animate-pulse delay-500" />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-semibold tracking-tight">Loopd</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => handleNavigation("downloads", "nav")}
                className="text-white/60 hover:text-white text-sm font-medium transition-colors"
              >
                Downloads
              </button>
              <button
                onClick={() => handleNavigation("signin", "nav")}
                className="text-white/60 hover:text-white text-sm font-medium transition-colors"
              >
                Sign In
              </button>
              <Button
                onClick={() => handleCTAClick("join_early_access", "nav")}
                className="relative group bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 rounded-full px-6"
              >
                <span className="relative z-10">Join Waitlist</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white/60 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/5">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => handleNavigation("downloads", "mobile_nav")}
                  className="text-white/60 hover:text-white transition-colors text-left py-2"
                >
                  Downloads
                </button>
                <button
                  onClick={() => handleNavigation("signin", "mobile_nav")}
                  className="text-white/60 hover:text-white transition-colors text-left py-2"
                >
                  Sign In
                </button>
                <Button
                  onClick={() => handleCTAClick("join_early_access", "mobile_nav")}
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-full w-full mt-2"
                >
                  Join Waitlist
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 animate-fade-in">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm text-white/70">Early Access Now Open</span>
              <ArrowRight className="h-3 w-3 text-white/40" />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-slide-up">
              <span className="text-white">Reclaim Your</span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Digital Focus
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
              Intelligent tracking and mindful blocking to help you build healthier digital habits.
              Take control of your screen time without sacrificing productivity.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Button
                size="lg"
                onClick={() => handleCTAClick("join_early_access", "hero")}
                className="group relative bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-base font-medium"
              >
                <UserCheck className="mr-2 h-5 w-5" />
                Apply for Early Access
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleNavigation("downloads", "hero")}
                className="rounded-full px-8 py-6 text-base font-medium bg-transparent border-white/20 text-white hover:bg-white/5 hover:text-white"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Preview
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Privacy First</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Lightweight</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Cross-Platform</span>
              </div>
            </div>
          </div>

          {/* Hero Visual - Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-2 shadow-2xl">
              <div className="rounded-xl bg-gradient-to-br from-[#12121a] to-[#0a0a0f] p-6 md:p-8">
                {/* Mock Dashboard */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Stats Row */}
                  <div className="col-span-12 md:col-span-4">
                    <div className="rounded-xl bg-white/5 p-5 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white/50 text-sm">Today's Focus Time</span>
                        <Timer className="h-4 w-4 text-violet-400" />
                      </div>
                      <div className="text-3xl font-bold text-white">4h 32m</div>
                      <div className="flex items-center gap-1 mt-1 text-emerald-400 text-sm">
                        <TrendingUp className="h-3 w-3" />
                        <span>+23% from yesterday</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <div className="rounded-xl bg-white/5 p-5 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white/50 text-sm">Apps Blocked</span>
                        <Shield className="h-4 w-4 text-fuchsia-400" />
                      </div>
                      <div className="text-3xl font-bold text-white">12</div>
                      <div className="text-white/40 text-sm mt-1">Saving ~2.5h daily</div>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <div className="rounded-xl bg-white/5 p-5 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white/50 text-sm">Weekly Goal</span>
                        <Target className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div className="text-3xl font-bold text-white">78%</div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                        <div className="bg-gradient-to-r from-cyan-400 to-violet-400 h-1.5 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Chart Area */}
                  <div className="col-span-12 md:col-span-8">
                    <div className="rounded-xl bg-white/5 p-5 border border-white/5 h-48">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/70 text-sm font-medium">Activity Overview</span>
                        <div className="flex gap-2">
                          <span className="text-xs text-white/40 px-2 py-1 rounded bg-white/5">Week</span>
                        </div>
                      </div>
                      {/* Simplified Chart Bars */}
                      <div className="flex items-end justify-between h-28 gap-2">
                        {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div
                              className="w-full bg-gradient-to-t from-violet-600/80 to-fuchsia-500/60 rounded-t-lg transition-all duration-500 hover:from-violet-500 hover:to-fuchsia-400"
                              style={{ height: `${height}%` }}
                            />
                            <span className="text-[10px] text-white/30">
                              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top Apps */}
                  <div className="col-span-12 md:col-span-4">
                    <div className="rounded-xl bg-white/5 p-5 border border-white/5 h-48">
                      <span className="text-white/70 text-sm font-medium">Top Apps Today</span>
                      <div className="mt-4 space-y-3">
                        {[
                          { name: 'VS Code', time: '2h 15m', color: 'from-blue-500 to-cyan-500' },
                          { name: 'Chrome', time: '1h 45m', color: 'from-amber-500 to-orange-500' },
                          { name: 'Slack', time: '45m', color: 'from-purple-500 to-pink-500' },
                        ].map((app, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${app.color}`} />
                              <span className="text-white/70 text-sm">{app.name}</span>
                            </div>
                            <span className="text-white/40 text-sm">{app.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent"> Stay Focused</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Powerful features designed with simplicity in mind
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Large Feature Card */}
            <div className="lg:col-span-2 group">
              <div className="relative h-full rounded-3xl bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-white/10 p-8 overflow-hidden hover:border-violet-500/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl transform translate-x-20 -translate-y-20 group-hover:translate-x-10 group-hover:-translate-y-10 transition-transform duration-700" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs mb-4">
                    <Activity className="h-3 w-3" />
                    IN DEVELOPMENT
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-3">Intelligent Usage Tracking</h3>
                  <p className="text-white/50 mb-6 max-w-lg">
                    Automatically categorize and track your app usage across all devices. Get insights that actually help you understand where your time goes.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Auto-categorization', 'Real-time tracking', 'Cross-device sync'].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-sm border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Feature Cards */}
            <div className="group">
              <div className="relative h-full rounded-3xl bg-gradient-to-br from-cyan-600/10 to-blue-600/10 border border-white/10 p-6 overflow-hidden hover:border-cyan-500/30 transition-all duration-500">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-2xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Smart Blocking</h3>
                  <p className="text-white/50 text-sm">
                    Context-aware blocking that adapts to your schedule and focus sessions.
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="relative h-full rounded-3xl bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-white/10 p-6 overflow-hidden hover:border-emerald-500/30 transition-all duration-500">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-2xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Goal Setting</h3>
                  <p className="text-white/50 text-sm">
                    Set daily and weekly limits with gentle nudges to keep you on track.
                  </p>
                </div>
              </div>
            </div>

            <div className="group">
              <div className="relative h-full rounded-3xl bg-gradient-to-br from-amber-600/10 to-orange-600/10 border border-white/10 p-6 overflow-hidden hover:border-amber-500/30 transition-all duration-500">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-2xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Deep Analytics</h3>
                  <p className="text-white/50 text-sm">
                    Beautiful visualizations that reveal patterns in your digital behavior.
                  </p>
                </div>
              </div>
            </div>

            {/* Wide Feature Card */}
            <div className="lg:col-span-2 group">
              <div className="relative h-full rounded-3xl bg-gradient-to-br from-fuchsia-600/10 to-pink-600/10 border border-white/10 p-8 overflow-hidden hover:border-fuchsia-500/30 transition-all duration-500">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-fuchsia-500/20 to-transparent rounded-full blur-3xl transform -translate-x-20 -translate-y-20" />
                <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs mb-4">
                      <Sparkles className="h-3 w-3" />
                      COMING SOON
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-3">Focus Sessions</h3>
                    <p className="text-white/50">
                      Pomodoro-style focus sessions with automatic distraction blocking. Build deep work habits that stick.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Clock className="h-8 w-8 text-fuchsia-400" />
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Eye className="h-8 w-8 text-pink-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Works Where
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"> You Work</span>
              </h2>
              <p className="text-white/50 text-lg mb-8">
                Native applications built for performance. No browser extensions, no slowdowns - just seamless integration with your workflow.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Monitor className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">Desktop Apps</h3>
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">PREVIEW</Badge>
                    </div>
                    <p className="text-white/50 text-sm">Windows and macOS apps with deep system integration for accurate tracking and powerful blocking.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">Mobile Apps</h3>
                      <Badge className="bg-white/10 text-white/50 border-white/10 text-[10px]">COMING SOON</Badge>
                    </div>
                    <p className="text-white/50 text-sm">iOS and Android apps planned with Screen Time integration for complete mobile wellness.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">Cloud Sync</h3>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">AVAILABLE</Badge>
                    </div>
                    <p className="text-white/50 text-sm">Your data syncs seamlessly across all devices. Optional - works fully offline too.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-3xl blur-3xl" />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
                <div className="grid grid-cols-2 gap-4">
                  {/* Platform Stats */}
                  {[
                    { label: 'Active Testers', value: '500+', icon: UserCheck, gradient: 'from-violet-500 to-fuchsia-500' },
                    { label: 'Hours Tracked', value: '10K+', icon: Clock, gradient: 'from-cyan-500 to-blue-500' },
                    { label: 'Focus Sessions', value: '2.5K+', icon: Target, gradient: 'from-emerald-500 to-teal-500' },
                    { label: 'Time Saved', value: '800h+', icon: Zap, gradient: 'from-amber-500 to-orange-500' },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3`}>
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-white/40 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 relative">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-white/50">
              Questions, feedback, or just want to say hi? We'd love to hear from you.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-3xl blur-2xl" />
            <Card className="relative rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <CardContent className="p-8">
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="contact-name" className="text-white/70 text-sm">Name</Label>
                    <Input
                      id="contact-name"
                      type="text"
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-violet-500/50 focus:ring-violet-500/20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-email" className="text-white/70 text-sm">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="your@email.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-violet-500/50 focus:ring-violet-500/20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-message" className="text-white/70 text-sm">Message</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Tell us what's on your mind..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-violet-500/50 focus:ring-violet-500/20 min-h-[120px]"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl py-6"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>

                <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/10">
                  <span className="text-white/30 text-sm">Or email us directly:</span>
                  <a href="mailto:support@loopd.com" className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
                    support@loopd.com
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 rounded-3xl blur-3xl" />
            <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 md:p-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Take Control?
              </h2>
              <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
                Join hundreds of early adopters building healthier digital habits with Loopd.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  onClick={() => handleCTAClick("join_early_access", "bottom_cta")}
                  className="group bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-base font-medium"
                >
                  <UserCheck className="mr-2 h-5 w-5" />
                  Apply for Early Access
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleNavigation("downloads", "bottom_cta")}
                  className="rounded-full px-8 py-6 text-base font-medium bg-transparent border-white/20 text-white hover:bg-white/5 hover:text-white"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Preview
                </Button>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/40">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Free during beta</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Loopd</span>
            </div>
            <p className="text-white/30 text-sm">© 2025 Loopd. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-white/40 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-white/40 hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
