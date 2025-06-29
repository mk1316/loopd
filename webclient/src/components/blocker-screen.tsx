"use client"

import { useState } from "react"
import { Shield, Clock, CreditCard, Coffee, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BlockerScreenProps {
  blockedApp?: string
  category?: string
  timeSpent?: number
  timeLimit?: number
  reason?: string
}

export default function BlockerScreen({
  blockedApp = "Instagram",
  category = "Social Media",
  timeSpent = 145,
  timeLimit = 60,
  reason = "You've exceeded your daily limit for Social Media",
}: BlockerScreenProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [waitTime, setWaitTime] = useState(60)
  const [isWaiting, setIsWaiting] = useState(false)

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const handleWaitOverride = () => {
    setIsWaiting(true)
    const timer = setInterval(() => {
      setWaitTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsWaiting(false)
          // In a real app, this would unblock the content
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handlePaymentOverride = () => {
    setShowPaymentDialog(true)
  }

  const processPayment = () => {
    // In a real app, this would integrate with Stripe or similar
    setShowPaymentDialog(false)
    // Simulate successful payment and unblock
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main Blocker Card */}
        <Card className="bg-slate-900 border-slate-800 text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl text-slate-50">Access Blocked</CardTitle>
            <CardDescription className="text-slate-400">{reason}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Usage Stats */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">App</span>
                <Badge className="bg-indigo-600 text-white">{blockedApp}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Category</span>
                <span className="text-sm text-slate-50">{category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Time Used Today</span>
                <span className="text-sm font-medium text-slate-50">{formatTime(timeSpent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Daily Limit</span>
                <span className="text-sm font-medium text-slate-50">{formatTime(timeLimit)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-slate-50">{Math.round((timeSpent / timeLimit) * 100)}%</span>
                </div>
                <Progress value={(timeSpent / timeLimit) * 100} className="h-2 bg-slate-700" />
              </div>
            </div>

            {/* Override Options */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-300">Emergency Override Options</h3>

              {/* Wait Timer Option */}
              <Button
                variant="outline"
                className="w-full bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-50 h-auto p-4"
                onClick={handleWaitOverride}
                disabled={isWaiting}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Wait Timer</div>
                      <div className="text-xs opacity-80">
                        {isWaiting ? `${waitTime}s remaining` : "Wait 60 seconds to continue"}
                      </div>
                    </div>
                  </div>
                  {isWaiting && (
                    <div className="text-right">
                      <div className="text-lg font-bold">{waitTime}</div>
                    </div>
                  )}
                </div>
              </Button>

              {/* Payment Option */}
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-auto p-4"
                onClick={handlePaymentOverride}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Pay to Bypass</div>
                      <div className="text-xs opacity-80">$2.00 for 15 minutes access</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">$2.00</div>
                  </div>
                </div>
              </Button>
            </div>

            {/* Motivational Section */}
            <div className="bg-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-slate-300">Stay Focused</span>
              </div>
              <p className="text-xs text-slate-400">
                You set this limit to help achieve your goals. Consider taking a break or switching to a productive
                activity.
              </p>
            </div>

            {/* Alternative Activities */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300">Suggested Activities</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-50 hover:bg-slate-800">
                  <Coffee className="h-4 w-4 mr-2" />
                  Take a break
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-50 hover:bg-slate-800">
                  📚 Read a book
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-50 hover:bg-slate-800">
                  🚶 Go for a walk
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-50 hover:bg-slate-800">
                  💪 Exercise
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-slate-50">
            <DialogHeader>
              <DialogTitle>Emergency Override Payment</DialogTitle>
              <DialogDescription className="text-slate-400">
                Pay $2.00 to bypass this block for 15 minutes. This helps reinforce your commitment to your goals.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Override Duration</span>
                  <span className="text-slate-50">15 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-slate-50 font-medium">$2.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Method</span>
                  <span className="text-slate-50">•••• 4242</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                By proceeding, you acknowledge that this payment is intended to help you maintain awareness of your
                digital habits and goals.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button onClick={processPayment} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Pay $2.00 & Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
