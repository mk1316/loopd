"use client";

import { useState } from "react"
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Target,
  BarChart3,
  Users,
  Smartphone,
  Monitor,
  Clock,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X,
} from "lucide-react"

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show landing page if user is authenticated
  if (user) {
    return null;
  }

  const handleNavigation = (page: string, source?: string) => {
    // Simple analytics tracking (you can replace with your analytics service)
    console.log("navigation_click", {
      destination: page,
      source: source || "landing_page",
      page_name: "landing",
    })
    
    if (page === "signin") {
      router.push('/login');
    } else if (page === "signup") {
      router.push('/login?mode=signup');
    } else if (page === "downloads") {
      // Handle downloads navigation
      console.log("Downloads clicked");
    }
  }

  const handleCTAClick = (action: string, location: string) => {
    // Simple analytics tracking (you can replace with your analytics service)
    console.log("cta_click", {
      action,
      location,
      page_name: "landing",
    })
    router.push('/login?mode=signup');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 bg-slate-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-button animate-glow">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Loopd</h1>
                <p className="text-xs text-gray-400">Digital Wellness</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => handleNavigation("downloads", "nav")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Downloads
              </button>
              <button
                onClick={() => handleNavigation("signin", "nav")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <Button
                onClick={() => handleCTAClick("get_started", "nav")}
                className="gradient-button hover:scale-105 transition-all duration-300"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => handleNavigation("downloads", "mobile_nav")}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Downloads
                </button>
                <button
                  onClick={() => handleNavigation("signin", "mobile_nav")}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Sign In
                </button>
                <Button
                  onClick={() => handleCTAClick("get_started", "mobile_nav")}
                  className="gradient-button hover:scale-105 transition-all duration-300 w-full"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
            ✨ Transform Your Digital Habits
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Take Control of Your
            <span className="block gradient-text">Digital Life</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Break free from digital distractions and build healthier screen time habits with intelligent blocking,
            insightful analytics, and personalized wellness coaching.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              onClick={() => handleCTAClick("start_free_trial", "hero")}
              className="gradient-button hover:scale-105 transition-all duration-300 text-lg px-8 py-4"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleNavigation("downloads", "hero")}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white transition-all duration-300 text-lg px-8 py-4"
            >
              Download Now
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need for Digital Wellness</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive tools to help you understand, control, and optimize your digital habits
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Smart Blocking",
                description: "Intelligent app and website blocking that adapts to your schedule and goals",
              },
              {
                icon: BarChart3,
                title: "Detailed Analytics",
                description: "Comprehensive insights into your digital habits with actionable recommendations",
              },
              {
                icon: Target,
                title: "Goal Setting",
                description: "Set and track personalized digital wellness goals with guided coaching",
              },
              {
                icon: Clock,
                title: "Time Management",
                description: "Advanced scheduling and time-boxing features to maximize productivity",
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description: "Monitor your digital wellness journey with detailed progress reports",
              },
              {
                icon: Users,
                title: "Community Support",
                description: "Connect with others on similar journeys and share accountability",
              },
            ].map((feature, index) => (
              <Card key={index} className="card-dark border-white/10 hover:border-white/20 transition-all duration-300">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-button mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Available Everywhere You Need It</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Seamless synchronization across all your devices for consistent digital wellness
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-button flex-shrink-0">
                  <Monitor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Desktop Applications</h3>
                  <p className="text-gray-300">
                    Native apps for Windows and macOS with deep system integration and powerful blocking capabilities.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-button flex-shrink-0">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Mobile Apps</h3>
                  <p className="text-gray-300">
                    iOS and Android apps with Screen Time integration and comprehensive mobile wellness features.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl" />
              <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">500K+</div>
                    <div className="text-gray-300">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">50M+</div>
                    <div className="text-gray-300">Hours Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">4.8★</div>
                    <div className="text-gray-300">App Store Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                    <div className="text-gray-300">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Loved by Users Worldwide</h2>
            <p className="text-xl text-gray-300">See how Loopd has transformed digital habits for thousands of users</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Product Manager",
                content: "Loopd helped me reclaim 3 hours of productive time daily. The insights are incredible!",
                rating: 5,
              },
              {
                name: "Marcus Johnson",
                role: "Student",
                content: "Finally broke my social media addiction. My grades improved dramatically in just one month.",
                rating: 5,
              },
              {
                name: "Emily Rodriguez",
                role: "Entrepreneur",
                content: "The family features are amazing. We've created much healthier screen time habits at home.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="card-dark border-white/10">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your Digital Life?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who have already taken control of their digital wellness
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              onClick={() => handleCTAClick("start_free_trial", "bottom_cta")}
              className="gradient-button hover:scale-105 transition-all duration-300 text-lg px-8 py-4"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleNavigation("downloads", "bottom_cta")}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white transition-all duration-300 text-lg px-8 py-4"
            >
              Download Now
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-button">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Loopd</h3>
                  <p className="text-xs text-gray-400">Digital Wellness</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Empowering individuals and families to build healthier relationships with technology through intelligent
                tools and insights.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <button
                    onClick={() => handleNavigation("downloads", "footer")}
                    className="hover:text-white transition-colors"
                  >
                    Downloads
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="mailto:support@loopd.com" className="hover:text-white transition-colors">
                    Email Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 Loopd. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 