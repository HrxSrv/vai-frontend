"use client"

import React from "react"
import { 
  Mic, 
  Video, 
  Database, 
  User, 
  Shield,  
  ArrowRight, 
  Play,
  Sparkles,
  Zap,
  Heart,
  Star,
  CheckCircle2,

  Headphones,
} from "lucide-react"
import { Button } from "@/components/ui/buttonSC"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/cardSC"
import { Badge } from "@/components/ui/badge"
import DotBackgroundDemo from "@/components/ui/dot-bacground"
import {CardDemo} from "@/components/ui/ai-card"
import { useAuth } from "@/context/AuthContext"
import { BackgroundBeams } from "@/components/ui/background-beams"
// Mock auth for demo

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Voice-First AI",
      description: "Natural conversations that feel human. Just speak and get intelligent responses instantly.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "Complete Recording",
      description: "Every session captured in HD. Review, analyze, and share your AI interactions.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Smart History",
      description: "Intelligent conversation tracking with searchable transcripts and insights.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and privacy. Your data stays yours, always.",
      gradient: "from-orange-500 to-red-500"
    }
  ]


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]"></div>
        <BackgroundBeams/>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Now with GPT-4 Voice Integration
            </Badge>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                Talk to{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  AI
                </span>
                <br />
                Like Never Before
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Experience the future of AI interaction. Natural voice conversations with intelligent responses, 
                complete session recording, and seamless workflow integration.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
              <Button size="lg" className="group px-8 py-6 text-lg">
                <Mic className="h-5 w-5 mr-2" />
                {isAuthenticated ? "Start Chatting" : "Start Free Trial"}
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg group">
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-12 flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {/* {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary border-2 border-background"></div>
                  ))} */}
                </div>
                <span>Trusted by 10,000+ users worldwide</span>
              </div>
              <div className="flex items-center space-x-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="mb-4">
              <Zap className="h-4 w-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything you need for
              <br />
              <span className="text-primary">voice AI interactions</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built for professionals, creators, and teams who demand the best AI conversation experience.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-xl">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <CardHeader className="relative">
                  <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} items-center justify-center text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      

      <section className="relative isolate py-24">
  <div className="absolute inset-0 -z-10 ">
    <DotBackgroundDemo />
  </div>
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col lg:flex-row items-start gap-12">
      {/* Card Section */}
      <div className="flex-shrink-0">
        <CardDemo />
      </div>
      
      {/* Technical Content Section */}
      <div className="flex-1 space-y-8">
        {/* Performance Metrics */}
        {/* <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            System Performance
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">CPU Usage</span>
                <span className="text-green-400 font-mono">23.4%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full w-[23%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Memory</span>
                <span className="text-blue-400 font-mono">67.8%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full w-[68%]"></div>
              </div>
            </div>
          </div>
        </div> */}

        {/* API Stats */}
        <div className="bg-gradient-to-r from-gray-200/30 to-gray-300/30 dark:from-gray-900/30 dark:to-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-300 dark:border-purple-500/20">
  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Analytics</h3>
  <div className="grid grid-cols-3 gap-4">
    <div className="text-center">
      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">1.2M</div>
      <div className="text-sm text-gray-600 dark:text-gray-300">Requests/day</div>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">127ms</div>
      <div className="text-sm text-gray-600 dark:text-gray-300">Avg Response</div>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">99.9%</div>
      <div className="text-sm text-gray-600 dark:text-gray-300">Uptime</div>
    </div>
  </div>
</div>

{/* Network Status */}
<div className="backdrop-blur-sm rounded-xl p-6 border border-gray-300 dark:border-gray-600 bg-white/20 dark:bg-transparent">
  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Network Status</h3>
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-gray-700 dark:text-gray-300">Primary Server</span>
      </div>
      <span className="text-green-600 dark:text-green-400 text-sm font-mono">Online</span>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-gray-700 dark:text-gray-300">CDN Network</span>
      </div>
      <span className="text-green-600 dark:text-green-400 text-sm font-mono">Optimal</span>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-yellow-500 dark:bg-yellow-400 rounded-full animate-pulse"></div>
        <span className="text-gray-700 dark:text-gray-300">Database Cluster</span>
      </div>
      <span className="text-yellow-600 dark:text-yellow-400 text-sm font-mono">Syncing</span>
    </div>
  </div>
</div>

      </div>
    </div>
  </div>
</section>

      {/* Final CTA Section */}
     <section className="py-24 relative overflow-hidden">
  <div className="absolute inset-0 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10"></div>
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <div className="space-y-8">
      <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/20">
        <Heart className="h-4 w-4 mr-2" />
        Join the Voice AI Revolution
      </Badge>

      <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
        Ready to transform
        <br />
        your AI experience?
      </h2>

      <p className="text-xl md:text-2xl text-gray-700 dark:text-white/90 max-w-3xl mx-auto leading-relaxed">
        Join thousands of professionals already using voice AI to boost productivity, 
        enhance creativity, and streamline their workflows.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
        <Button size="lg" variant="secondary" className="px-8 py-6 text-lg group">
          <User className="h-5 w-5 mr-2" />
          {isAuthenticated ? "Go to Dashboard" : "Start Free Today"}
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-white/30 hover:bg-white/10">
          <Headphones className="h-5 w-5 mr-2" />
          Schedule Demo
        </Button>
      </div>

      {/* Features List */}
      <div className="grid sm:grid-cols-3 gap-6 pt-12 text-gray-700 dark:text-white/90">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span>Free 14-day trial</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span>No credit card required</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span>Cancel anytime</span>
        </div>
      </div>
    </div>
  </div>
</section>

    </div>
  )
}

export default HomePage