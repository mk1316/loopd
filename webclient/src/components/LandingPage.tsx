"use client";

import { useState } from "react"
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { usePostHog } from '@/hooks/usePostHog';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  AlertTriangle,
  Mail,
  MessageSquare,
  Send,
  Download,
  UserCheck,
  Zap,
  Heart,
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
    
    // Submit to Formspree (replace with your endpoint)
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
                onClick={() => handleCTAClick("join_early_access", "nav")}
                className="gradient-button hover:scale-105 transition-all duration-300"
              >
                Join Early Access
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
                  onClick={() => handleCTAClick("join_early_access", "mobile_nav")}
                  className="gradient-button hover:scale-105 transition-all duration-300 w-full"
                >
                  Join Early Access
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
          <Badge className="mb-6 bg-orange-600/20 text-orange-300 border-orange-500/30 hover:bg-orange-600/30">
            🚀 Early Access Program - Limited Spots Available
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
            Help Shape the Future of
            <span className="block gradient-text leading-[1.15] pb-1">Digital Wellness</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            We're building intelligent tools to help you take control of your digital life. 
            Join our exclusive early access program and be among the first to experience and influence the future of digital wellness.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              onClick={() => handleCTAClick("join_early_access", "hero")}
              className="gradient-button hover:scale-105 transition-all duration-300 text-lg px-8 py-4"
            >
              <UserCheck className="mr-2 h-5 w-5" />
              Apply for Early Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleNavigation("downloads", "hero")}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white transition-all duration-300 text-lg px-8 py-4"
            >
              <Download className="mr-2 h-5 w-5" />
              Preview Downloads
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Exclusive early access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Direct influence on features</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Priority support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Join Early Access?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Be part of something special. Our early access program offers exclusive benefits and direct influence on the product.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "First Access",
                description: "Be among the first to experience new features and capabilities before anyone else",
                color: "text-yellow-400",
              },
              {
                icon: Heart,
                title: "Direct Influence",
                description: "Your feedback directly shapes feature priorities and product direction",
                color: "text-red-400",
              },
              {
                icon: Star,
                title: "Exclusive Community",
                description: "Join our private early access community and connect with like-minded digital wellness enthusiasts",
                color: "text-blue-400",
              },
            ].map((benefit, index) => (
              <Card key={index} className="card-dark border-white/10 hover:border-white/20 transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className={`text-4xl mb-4 ${benefit.color}`}>
                    <benefit.icon className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What We're Building</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A comprehensive digital wellness platform that adapts to your lifestyle and goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Smart Blocking",
                description: "Intelligent app and website blocking that adapts to your schedule and goals (In Development)",
                status: "in_dev",
              },
              {
                icon: BarChart3,
                title: "Detailed Analytics",
                description: "Comprehensive insights into your digital habits with actionable recommendations (Coming Soon)",
                status: "planned",
              },
              {
                icon: Target,
                title: "Goal Setting",
                description: "Set and track personalized digital wellness goals with guided coaching (Planned)",
                status: "planned",
              },
              {
                icon: Clock,
                title: "Time Management",
                description: "Advanced scheduling and time-boxing features to maximize productivity (In Development)",
                status: "in_dev",
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description: "Monitor your digital wellness journey with detailed progress reports (Coming Soon)",
                status: "planned",
              },
              {
                icon: Users,
                title: "Community Support",
                description: "Connect with others on similar journeys and share accountability (Planned)",
                status: "planned",
              },
            ].map((feature, index) => (
              <Card key={index} className="card-dark border-white/10 hover:border-white/20 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-button">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge 
                      className={`text-xs ${
                        feature.status === 'in_dev' 
                          ? 'bg-orange-600/20 text-orange-300 border-orange-500/30' 
                          : 'bg-gray-600/20 text-gray-300 border-gray-500/30'
                      }`}
                    >
                      {feature.status === 'in_dev' ? 'IN DEV' : 'PLANNED'}
                    </Badge>
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
      <section className="py-24 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Platform Availability</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're working on bringing Loopd to all your devices. Here's our current development status:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-button flex-shrink-0">
                  <Monitor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-white">Desktop Applications</h3>
                    <Badge className="bg-orange-600/20 text-orange-300 border-orange-500/30 text-xs">PREVIEW</Badge>
                  </div>
                  <p className="text-gray-300">
                    Native apps for Windows and macOS are currently in pre-release testing. Deep system integration and 
                    powerful blocking capabilities are being developed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-button flex-shrink-0">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-white">Mobile Apps</h3>
                    <Badge className="bg-gray-600/20 text-gray-300 border-gray-500/30 text-xs">COMING SOON</Badge>
                  </div>
                  <p className="text-gray-300">
                    iOS and Android apps are in early planning stages. We're designing comprehensive mobile wellness 
                    features with Screen Time integration.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-xl font-semibold text-white mb-3">Why Join Early Access?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-blue-400" />
                    </div>
                    <p className="text-gray-300 text-sm">Be among the first to experience new features before anyone else</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-purple-400" />
                    </div>
                    <p className="text-gray-300 text-sm">Your feedback directly shapes our product roadmap and priorities</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                    </div>
                    <p className="text-gray-300 text-sm">Join our exclusive community of digital wellness enthusiasts</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-xl p-6 border border-orange-500/20">
                <h3 className="text-xl font-semibold text-white mb-3">Current Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Desktop Apps</span>
                    <Badge className="bg-orange-600/20 text-orange-300 border-orange-500/30 text-xs">Pre-Release</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Mobile Apps</span>
                    <Badge className="bg-gray-600/20 text-gray-300 border-gray-500/30 text-xs">Planned</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Early Access</span>
                    <Badge className="bg-green-600/20 text-green-300 border-green-500/30 text-xs">Open</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24">
        <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Let's Connect</h2>
            <p className="text-lg text-gray-300">
              Have feedback, questions, or want to get in touch? We'd love to hear from you.
            </p>
          </div>

          <Card className="card-dark border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white text-xl">Send us a Message</CardTitle>
              <CardDescription className="text-gray-300">
                We'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="contact-name" className="text-white">Name</Label>
                  <Input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="bg-slate-800 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email" className="text-white">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="bg-slate-800 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact-message" className="text-white">Message</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us about your interest in Loopd, feedback, or questions..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="bg-slate-800 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 min-h-[120px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-button hover:scale-105 transition-all duration-300"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="mx-3 text-gray-500 text-xs">or</span>
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Secondary Contact Option */}
              <div className="flex items-center justify-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <a href="mailto:support@loopd.com" className="font-medium text-white hover:underline">
                  support@loopd.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Help Shape the Future?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join our early access program and be part of building the next generation of digital wellness tools
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              onClick={() => handleCTAClick("join_early_access", "bottom_cta")}
              className="gradient-button hover:scale-105 transition-all duration-300 text-lg px-8 py-4"
            >
              <UserCheck className="mr-2 h-5 w-5" />
              Apply for Early Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => handleNavigation("downloads", "bottom_cta")}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white transition-all duration-300 text-lg px-8 py-4"
            >
              <Download className="mr-2 h-5 w-5" />
              Preview Downloads
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Exclusive early access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Direct developer feedback</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-10 md:gap-48 w-full">
            <div className="flex items-center gap-3 justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-button">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Loopd</h3>
                <p className="text-xs text-gray-400">Digital Wellness</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm text-center">© 2025 Loopd. All rights reserved.</p>
            <div className="flex space-x-6 justify-center">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 