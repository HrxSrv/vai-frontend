"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Mic,
  MicOff,
  Send,
  MessageSquare,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Mock hooks and services - replace with your actual implementations
const useSession = () => ({
  currentSession: { id: "session-1" },
  startSession: async () => {},
  endSession: async () => {},
  logActivity: async () => {},
})

const useAuth = () => ({
  user: { id: "1", name: "John Doe", email: "john@example.com" },
})

const useSpeechRecognition = () => ({
  transcript: "",
  isListening: false,
  confidence: 0.8,
  startListening: async () => {},
  stopListening: async () => {},
  resetTranscript: () => {},
  error: null,
})

const useMediaRecorder = () => ({
  startRecording: async () => {},
  stopRecording: async () => new Blob(),
  isRecording: false,
  recordingTime: 0,
  videoRef: useRef<HTMLVideoElement>(null),
  error: null,
})

const useAvatarAnimation = () => ({
  animationState: "idle",
  setListening: () => {},
  setTalking: () => {},
})

const askAI = async (text: string) => ({
  response: `AI response to: "${text}". This is a simulated response from the AI service.`,
})

const getPresignedUrl = async () => ({ presignedPost: {}, uploadUrl: "" })
const uploadToS3 = async () => {}
const confirmUpload = async () => ({ finalUrl: "" })

interface ChatMessage {
  id: string
  sender: "user" | "ai"
  text: string
  timestamp: Date
}

interface Session {
  id: string
  name: string
  lastMessage: string
  timestamp: Date
  isActive: boolean
}

// Dummy session data
const dummySessions: Session[] = [
  {
    id: "session-1",
    name: "AI Assistant Chat",
    lastMessage: "How can I help you today?",
    timestamp: new Date(),
    isActive: true,
  },
  {
    id: "session-2",
    name: "Project Discussion",
    lastMessage: "Let me review the requirements...",
    timestamp: new Date(Date.now() - 3600000),
    isActive: false,
  },
  {
    id: "session-3",
    name: "Code Review",
    lastMessage: "The implementation looks good",
    timestamp: new Date(Date.now() - 7200000),
    isActive: false,
  },
  {
    id: "session-4",
    name: "Design Feedback",
    lastMessage: "I like the color scheme",
    timestamp: new Date(Date.now() - 86400000),
    isActive: false,
  },
]

const ChatWindow: React.FC<{ sessionId?: string }> = ({ sessionId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [sessionInitialized, setSessionInitialized] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const [displayedTranscript, setDisplayedTranscript] = useState("")
  const [isTypingTranscript, setIsTypingTranscript] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sessions, setSessions] = useState<Session[]>(dummySessions)
  const [activeSessionId, setActiveSessionId] = useState("session-1")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const { user } = useAuth()
  const { currentSession, startSession, endSession, logActivity } = useSession()

  const {
    transcript,
    isListening,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError,
  } = useSpeechRecognition()

  const {
    startRecording,
    stopRecording,
    isRecording,
    recordingTime,
    videoRef,
    error: recordingError,
  } = useMediaRecorder()

  const userAvatar = useAvatarAnimation()
  const aiAvatar = useAvatarAnimation()

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (chatStarted && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, chatStarted])

  // Animated transcript typing effect
  useEffect(() => {
    if (transcript !== displayedTranscript) {
      setIsTypingTranscript(true)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      if (!transcript) {
        setDisplayedTranscript("")
        setIsTypingTranscript(false)
        return
      }

      let currentIndex = 0
      const targetText = transcript

      const typeCharacter = () => {
        if (currentIndex <= targetText.length) {
          setDisplayedTranscript(targetText.slice(0, currentIndex))
          currentIndex++
          typingTimeoutRef.current = setTimeout(typeCharacter, 30)
        } else {
          setIsTypingTranscript(false)
        }
      }

      typeCharacter()
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [transcript, displayedTranscript])

  // Handle window close to end session
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (chatStarted && currentSession) {
        e.preventDefault()
        handleEndSession()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [chatStarted, currentSession])

  const handleMicToggle = async () => {
    // Start session on first mic click
    if (!chatStarted) {
      setChatStarted(true)
      if (!sessionInitialized) {
        try {
          await startSession()
          setSessionInitialized(true)
        } catch (error) {
          console.error("Failed to start session:", error)
        }
      }
    }

    if (isListening) {
      await stopListening()
      userAvatar.setListening(false)
    } else {
      if (!isRecording) {
        await startRecording()
      }
      await startListening()
      userAvatar.setListening(true)
    }
  }

  const handleSubmit = async () => {
    if (!displayedTranscript.trim() || isSubmitting || !currentSession) return

    try {
      setIsSubmitting(true)
      userAvatar.setListening(false)

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "user",
        text: displayedTranscript,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])

      if (isListening) {
        await stopListening()
      }

      const response = await askAI(displayedTranscript)

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response.response,
        timestamp: new Date(),
      }

      setTimeout(() => {
        setMessages((prev) => [...prev, aiMessage])
        aiAvatar.setTalking(true)
        setTimeout(() => {
          aiAvatar.setTalking(false)
        }, 2000)
      }, 300)

      resetTranscript()
    } catch (error) {
      console.error("Error submitting message:", error)
      await logActivity("error_occurred", { context: "message_submit", error })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEndSession = async () => {
    if (!currentSession) return

    try {
      setIsUploading(true)

      if (isListening) {
        await stopListening()
        userAvatar.setListening(false)
      }

      const recordingUrl = null
      let recordedBlob = null

      if (isRecording) {
        recordedBlob = await stopRecording()
        // Handle S3 upload logic here
      }

      await endSession(recordingUrl, recordedBlob?.size || 0)
      setSessionInitialized(false)
      setChatStarted(false)
      setMessages([])
    } catch (error) {
      console.error("Error ending session:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleNewSession = () => {
    const newSession: Session = {
      id: `session-${Date.now()}`,
      name: "New Chat",
      lastMessage: "",
      timestamp: new Date(),
      isActive: true,
    }

    // Update sessions
    setSessions((prev) => [newSession, ...prev.map((s) => ({ ...s, isActive: false }))])
    setActiveSessionId(newSession.id)

    // Reset chat state
    setChatStarted(false)
    setMessages([])
    setSessionInitialized(false)
  }

  const handleSessionSelect = (sessionId: string) => {
    setSessions((prev) => prev.map((s) => ({ ...s, isActive: s.id === sessionId })))
    setActiveSessionId(sessionId)
    // In real implementation, load session messages here
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    if (sessionId === activeSessionId && sessions.length > 1) {
      const remainingSessions = sessions.filter((s) => s.id !== sessionId)
      if (remainingSessions.length > 0) {
        handleSessionSelect(remainingSessions[0].id)
      }
    }
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold">Please log in</h2>
              <p className="text-muted-foreground">You need to be logged in to use the AI chat feature.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "border-r bg-muted/10 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-80",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {!sidebarCollapsed && <h2 className="font-semibold text-lg">Chat Sessions</h2>}
            <Button variant="ghost" size="icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <Button onClick={handleNewSession} className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {!sidebarCollapsed && "New Chat"}
            </Button>
          </div>

          {/* Sessions List */}
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group relative rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted",
                    session.isActive && "bg-muted",
                  )}
                  onClick={() => handleSessionSelect(session.id)}
                >
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{session.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {session.lastMessage || "No messages yet"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{session.timestamp.toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {!sidebarCollapsed && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSession(session.id)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">{isListening ? "Listening..." : "Ready to help"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                <span className="h-2 w-2 rounded-full bg-white mr-2"></span>
                Recording {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
              </Badge>
            )}
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Welcome Screen */}
        {!chatStarted && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-md">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold">Welcome to AI Chat</h1>
                <p className="text-muted-foreground text-lg">
                  Press the microphone button to start your conversation with the AI assistant
                </p>
              </div>

              <Button size="lg" className="h-16 w-16 rounded-full" onClick={handleMicToggle} disabled={isUploading}>
                <Mic className="h-6 w-6" />
              </Button>

              <p className="text-sm text-muted-foreground">Click to start your first session</p>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        {chatStarted && (
          <>
            {/* Video Preview */}
            {isRecording && (
              <div className="h-48 bg-black relative">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white font-medium">Uploading recording...</div>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Start speaking to interact with the AI</p>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex gap-3", message.sender === "user" ? "justify-end" : "justify-start")}
                    >
                      {message.sender === "ai" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-3",
                          message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                        )}
                      >
                        <p className="leading-relaxed">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                      </div>

                      {message.sender === "user" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end gap-3">
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={handleMicToggle}
                    disabled={isUploading}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>

                  <Card className="flex-1">
                    <CardContent className="p-4 min-h-[60px] max-h-[120px] overflow-y-auto">
                      {displayedTranscript ? (
                        <div className="space-y-2">
                          <p>
                            {displayedTranscript}
                            {isTypingTranscript && <span className="animate-pulse">|</span>}
                          </p>
                          {isListening && confidence && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Confidence: {Math.round(confidence * 100)}%</span>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "w-1 h-3 rounded-full transition-colors",
                                      i < Math.round(confidence * 5) ? "bg-green-500" : "bg-muted",
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground italic">
                          {isListening ? (
                            <span className="flex items-center gap-2">
                              Listening...
                              <div className="flex gap-1">
                                {[...Array(3)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-1 h-1 bg-primary rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                  />
                                ))}
                              </div>
                            </span>
                          ) : (
                            "Press the microphone to start speaking"
                          )}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={handleSubmit}
                    disabled={!displayedTranscript.trim() || isSubmitting || isUploading}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex-1">
                    {(speechError || recordingError) && (
                      <p className="text-destructive text-sm">{speechError || recordingError}</p>
                    )}
                  </div>

                  <Button variant="outline" onClick={handleEndSession} disabled={isUploading}>
                    {isUploading ? "Uploading..." : "End Session"}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatWindow
