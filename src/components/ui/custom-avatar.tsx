"use client"

import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { cn } from "@/lib/utils"

// Import placeholder images - replace these with your actual image imports
const AI_AVATAR_IMAGE = "/placeholder.svg?height=40&width=40"
const HUMAN_AVATAR_IMAGE = "/placeholder.svg?height=40&width=40"

interface CustomAvatarProps {
  isAI?: boolean
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  animationState?: "idle" | "listening" | "talking"
  className?: string
  size?: "sm" | "md" | "lg"
}

const CustomAvatar: React.FC<CustomAvatarProps> = ({
  isAI = false,
  user,
  animationState = "idle",
  className,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const getAnimationClasses = () => {
    switch (animationState) {
      case "listening":
        return "ring-2 ring-blue-500 ring-opacity-75 animate-pulse"
      case "talking":
        return "ring-2 ring-green-500 ring-opacity-75 animate-pulse"
      default:
        return ""
    }
  }

  const getAvatarImage = () => {
    if (isAI) {
      return AI_AVATAR_IMAGE
    }
    return user?.avatar || HUMAN_AVATAR_IMAGE
  }

  const getAvatarFallback = () => {
    if (isAI) {
      return "AI"
    }
    return user?.name?.[0]?.toUpperCase() || "U"
  }

  return (
    <Avatar className={cn(sizeClasses[size], getAnimationClasses(), "transition-all duration-300", className)}>
      <AvatarImage src={getAvatarImage() || "/placeholder.svg"} alt={isAI ? "AI Assistant" : user?.name || "User"} />
      <AvatarFallback
        className={cn(
          "text-xs font-medium",
          isAI
            ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
            : "bg-gradient-to-br from-blue-500 to-green-500 text-white",
        )}
      >
        {getAvatarFallback()}
      </AvatarFallback>
    </Avatar>
  )
}

export default CustomAvatar
