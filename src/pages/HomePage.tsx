"use client";

import type React from "react";
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
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/buttonSC";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/cardSC";
import { Badge } from "@/components/ui/badge";
import DotBackgroundDemo from "@/components/ui/dot-bacground";
import { CardDemo } from "@/components/ui/ai-card";
import { useAuth } from "@/context/AuthContext";
import  {BackgroundBeams}  from "@/components/ui/background-beams";
import { GridSmallBackgroundDemo } from "@/components/ui/grid-background-demo";
// Mock auth for demo
import { Link } from "react-router-dom"; // Adjust based on your routing setup
const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Voice-First AI",
      description:
        "Natural conversations that feel human. Just speak and get intelligent responses instantly.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "Complete Recording",
      description:
        "Every session captured in HD. Review, analyze, and share your AI interactions.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Smart History",
      description:
        "Intelligent conversation tracking with searchable transcripts and insights.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description:
        "Bank-level encryption and privacy. Your data stays yours, always.",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]"></div>
        <BackgroundBeams />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-32">
          <div className="text-center space-y-4 sm:space-y-6 md:space-y-8">
            {/* Badge */}
            <Badge
              variant="secondary"
              className="mb-2 sm:mb-4 px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm"
            >
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Now with GPT-4 Voice Integration
            </Badge>

            {/* Main Heading */}
            <div className="space-y-2 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight">
                Talk to{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  AI
                </span>
                <br />
                Like Never Before
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
                Experience the future of AI interaction. Natural voice
                conversations with intelligent responses, complete session
                recording, and seamless workflow integration.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-6 sm:mt-8 md:mt-10">
              <Button
                size="lg"
                className="group w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg"
              >
                <Mic className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <Link to ="/chat">{isAuthenticated ? "Start Chatting" : "Login to Chat"}</Link>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Popover>
                <PopoverTrigger>
                  {" "}
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg group"
                  >
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Watch Demo
                  </Button>
                </PopoverTrigger>
                <PopoverContent>Go to <a href="https://youtu.be/j61KV2f3pAo" target="_blank">Youtube</a></PopoverContent>
              </Popover>
            </div>

            {/* Social Proof */}
            <div className="pt-8 sm:pt-12 flex flex-col items-center space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {/* {[1,2,3,4,5].map(i => (
              <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary border-2 border-background"></div>
            ))} */}
                </div>
                <span>Trusted by 10,000+ users worldwide</span>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-xs sm:text-sm text-muted-foreground ml-2">
                  4.9/5 rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
            <Badge variant="outline" className="mb-2 sm:mb-4">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              Everything you need for
              <br className="hidden sm:block" />
              <span className="text-primary"> voice AI interactions</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Built for professionals, creators, and teams who demand the best
              AI conversation experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:shadow-xl"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                ></div>
                <CardHeader className="relative">
                  <div
                    className={`inline-flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${feature.gradient} items-center justify-center text-white mb-3 sm:mb-4`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl sm:text-2xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}

      <section className="relative isolate py-16 sm:py-20 md:py-24">
        <div className="absolute inset-0 -z-10 ">
          <DotBackgroundDemo />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
            {/* Card Section */}
            <div className="flex-shrink-0 w-full max-w-md mx-auto lg:mx-0">
              <CardDemo />
            </div>

            {/* Technical Content Section */}
            <div className="flex-1 space-y-4 sm:space-y-6 md:space-y-8 w-full">
              {/* API Stats */}
              <div className="bg-gradient-to-r from-gray-200/30 to-gray-300/30 dark:from-gray-900/30 dark:to-black/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-300 dark:border-purple-500/20">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
                  Analytics
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                      1.2M
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      Requests/day
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-pink-600 dark:text-pink-400">
                      127ms
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      Avg Response
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                      99.9%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      Uptime
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Status */}
              <div className="backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-300 dark:border-gray-600 bg-white/20 dark:bg-transparent">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
                  Network Status
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                        Primary Server
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-mono">
                      Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                        CDN Network
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-mono">
                      Optimal
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 dark:bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                        Database Cluster
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 font-mono">
                      Syncing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
<div className="relative min-h-screen">
  {/* Grid Background Layer */}
  <div className="absolute inset-0">
    <GridSmallBackgroundDemo />
  </div>
  
  {/* Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/10 dark:via-black/5 dark:to-black/10"></div>
  
  {/* Content Layer */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <Badge 
        variant="secondary" 
        className="mb-2 sm:mb-4 bg-white/30 dark:bg-white/20 text-gray-800 dark:text-white border-white/40 dark:border-white/20"
      >
        <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        Join the Voice AI Revolution
      </Badge>
      
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
        Ready to transform <br className="hidden sm:block" />
        <span className="sm:hidden"> </span>your AI experience?
      </h2>
      
      <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
        Join thousands of professionals already using voice AI to boost productivity, enhance creativity, and streamline their workflows.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-6 sm:pt-8">
        <Button 
          size="lg" 
          variant="secondary" 
          className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg group"
        >
          <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          {isAuthenticated ? "Go to Dashboard" : "Start Free Today"}
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        
        <Popover>
          <PopoverTrigger>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg border-gray-300 dark:border-white/30 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-white"
            >
              <Headphones className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Schedule Demo
            </Button>
          </PopoverTrigger>
          <PopoverContent>Coming Soon....</PopoverContent>
        </Popover>
      </div>
      
      {/* Features List */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6 pt-8 sm:pt-12 text-gray-700 dark:text-white/90">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          <span className="text-sm sm:text-base">Free 14-day trial</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          <span className="text-sm sm:text-base">No credit card required</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          <span className="text-sm sm:text-base">Cancel anytime</span>
        </div>
      </div>
    </div>
  </div>
</div>
      </section>
      
    </div>
  );
};

export default HomePage;
