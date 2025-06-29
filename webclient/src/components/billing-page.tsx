"use client"

import { useState } from "react"
import { CreditCard, Download, Calendar, Check, Star, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const currentPlan = {
  name: "Pro",
  price: 9.99,
  billing: "monthly",
  nextBilling: "2024-02-15",
  features: ["Unlimited devices", "Advanced analytics", "Custom block lists", "Priority support", "Data export"],
}

const plans = [
  {
    name: "Free",
    price: 0,
    billing: "forever",
    description: "Perfect for getting started with digital wellness",
    features: ["Up to 2 devices", "Basic blocking", "Simple analytics", "Community support"],
    limitations: ["Limited block lists", "Basic insights only"],
    popular: false,
  },
  {
    name: "Pro",
    price: 9.99,
    billing: "monthly",
    description: "Advanced features for serious digital wellness",
    features: [
      "Unlimited devices",
      "Advanced analytics",
      "Custom block lists",
      "Priority support",
      "Data export",
      "Goal templates",
      "Detailed insights",
    ],
    popular: true,
  },
  {
    name: "Family",
    price: 19.99,
    billing: "monthly",
    description: "Perfect for families wanting to stay connected and focused",
    features: [
      "Up to 6 family members",
      "All Pro features",
      "Family dashboard",
      "Parental controls",
      "Shared goals",
      "Family insights",
      "Priority support",
    ],
    popular: false,
  },
]

const billingHistory = [
  {
    id: 1,
    date: "2024-01-15",
    amount: 9.99,
    plan: "Pro Monthly",
    status: "paid",
    invoice: "INV-2024-001",
  },
  {
    id: 2,
    date: "2023-12-15",
    amount: 9.99,
    plan: "Pro Monthly",
    status: "paid",
    invoice: "INV-2023-012",
  },
  {
    id: 3,
    date: "2023-11-15",
    amount: 9.99,
    plan: "Pro Monthly",
    status: "paid",
    invoice: "INV-2023-011",
  },
]

const usageStats = {
  devicesUsed: 3,
  devicesLimit: "unlimited",
  blockListsCreated: 8,
  blockListsLimit: "unlimited",
  dataExports: 2,
  dataExportsLimit: "unlimited",
}

export default function BillingPage() {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan.name)
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: "**** **** **** 4242",
    expiryDate: "12/26",
    cardType: "Visa",
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getPlanPrice = (plan: (typeof plans)[0]) => {
    if (plan.price === 0) return "Free"
    if (billingCycle === "yearly") {
      return `$${(plan.price * 10).toFixed(2)}/year`
    }
    return `$${plan.price}/month`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Billing & Subscription</h2>
          <p className="text-gray-400">Manage your subscription and billing information</p>
        </div>
        <Button variant="outline" className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10">
          <Download className="h-4 w-4 mr-2" />
          Download Invoice
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Plan */}
        <Card className="card-dark lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              Current Plan
            </CardTitle>
            <CardDescription className="text-gray-400">Your active subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-white">{currentPlan.name}</h3>
              <p className="text-3xl font-bold text-indigo-400">
                ${currentPlan.price}
                <span className="text-sm text-gray-400">/{currentPlan.billing}</span>
              </p>
              <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Active</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Next billing</span>
                <span className="text-white">{formatDate(currentPlan.nextBilling)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Payment method</span>
                <span className="text-white">
                  {paymentMethod.cardType} {paymentMethod.cardNumber.slice(-4)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-white">Included features:</h4>
              <ul className="space-y-1">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="outline" className="w-full border-white/20 bg-white/5 text-gray-300 hover:bg-white/10">
              Manage Subscription
            </Button>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card className="card-dark lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Usage Statistics</CardTitle>
            <CardDescription className="text-gray-400">Your current usage vs plan limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Devices</span>
                  <span className="text-sm text-white">
                    {usageStats.devicesUsed} / {usageStats.devicesLimit}
                  </span>
                </div>
                <Progress
                  value={usageStats.devicesLimit === "unlimited" ? 30 : (usageStats.devicesUsed / 5) * 100}
                  className="h-2 bg-white/10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Block Lists</span>
                  <span className="text-sm text-white">
                    {usageStats.blockListsCreated} / {usageStats.blockListsLimit}
                  </span>
                </div>
                <Progress
                  value={usageStats.blockListsLimit === "unlimited" ? 40 : (usageStats.blockListsCreated / 10) * 100}
                  className="h-2 bg-white/10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Data Exports</span>
                  <span className="text-sm text-white">
                    {usageStats.dataExports} / {usageStats.dataExportsLimit}
                  </span>
                </div>
                <Progress
                  value={usageStats.dataExportsLimit === "unlimited" ? 20 : (usageStats.dataExports / 5) * 100}
                  className="h-2 bg-white/10"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="glass-effect">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600/20 rounded-lg">
                      <Zap className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Premium Features</p>
                      <p className="text-sm text-gray-400">All advanced features unlocked</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-600/20 rounded-lg">
                      <Shield className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Priority Support</p>
                      <p className="text-sm text-gray-400">24/7 premium support access</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans and Billing */}
      <Card className="card-dark">
        <CardContent className="p-6">
          <Tabs defaultValue="plans" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/5">
              <TabsTrigger
                value="plans"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Plans
              </TabsTrigger>
              <TabsTrigger
                value="payment"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Payment Method
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-white/10 text-gray-300 data-[state=active]:text-white"
              >
                Billing History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plans" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Choose Your Plan</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${billingCycle === "monthly" ? "text-white" : "text-gray-400"}`}>
                    Monthly
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                    className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
                  >
                    {billingCycle === "monthly" ? "Switch to Yearly" : "Switch to Monthly"}
                  </Button>
                  <span className={`text-sm ${billingCycle === "yearly" ? "text-white" : "text-gray-400"}`}>
                    Yearly
                  </span>
                  {billingCycle === "yearly" && (
                    <Badge className="bg-green-600/20 text-green-400 border-green-600/30">Save 17%</Badge>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {plans.map((plan, index) => (
                  <Card
                    key={plan.name}
                    className={`glass-effect hover:bg-white/10 transition-all duration-300 cursor-pointer animate-fade-in relative ${
                      plan.popular ? "ring-2 ring-indigo-500/50" : ""
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-indigo-600 text-white">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="text-center space-y-2">
                        <CardTitle className="text-white">{plan.name}</CardTitle>
                        <div className="text-3xl font-bold text-white">{getPlanPrice(plan)}</div>
                        <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {plan.limitations && (
                        <div className="pt-2 border-t border-white/10">
                          <p className="text-xs text-gray-400 mb-2">Limitations:</p>
                          <ul className="space-y-1">
                            {plan.limitations.map((limitation, i) => (
                              <li key={i} className="text-xs text-gray-500">
                                • {limitation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button
                        className={`w-full ${
                          plan.name === currentPlan.name
                            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                            : plan.popular
                              ? "gradient-button text-white"
                              : "border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                        disabled={plan.name === currentPlan.name}
                      >
                        {plan.name === currentPlan.name ? "Current Plan" : `Upgrade to ${plan.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-indigo-400" />
                  Payment Method
                </h3>

                <Card className="glass-effect">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <CreditCard className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {paymentMethod.cardType} ending in {paymentMethod.cardNumber.slice(-4)}
                          </p>
                          <p className="text-sm text-gray-400">Expires {paymentMethod.expiryDate}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10">
                        Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle className="text-white">Add New Payment Method</CardTitle>
                    <CardDescription className="text-gray-400">Add a backup payment method</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber" className="text-gray-300">
                          Card Number
                        </Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate" className="text-gray-300">
                          Expiry Date
                        </Label>
                        <Input id="expiryDate" placeholder="MM/YY" className="bg-white/5 border-white/20 text-white" />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-gray-300">
                          CVV
                        </Label>
                        <Input id="cvv" placeholder="123" className="bg-white/5 border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName" className="text-gray-300">
                          Cardholder Name
                        </Label>
                        <Input id="cardName" placeholder="John Doe" className="bg-white/5 border-white/20 text-white" />
                      </div>
                    </div>
                    <Button className="gradient-button text-white">Add Payment Method</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-400" />
                  Billing History
                </h3>

                <div className="space-y-3">
                  {billingHistory.map((bill) => (
                    <Card key={bill.id} className="glass-effect hover:bg-white/10 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white/5 rounded-lg">
                              <CreditCard className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{bill.plan}</p>
                              <p className="text-sm text-gray-400">
                                {formatDate(bill.date)} • {bill.invoice}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium text-white">${bill.amount}</p>
                              <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                                {bill.status}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
