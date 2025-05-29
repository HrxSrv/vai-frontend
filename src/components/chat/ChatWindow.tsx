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
import { Button } from "@/components/ui/buttonSC"
import { Card, CardContent } from "@/components/ui/cardSC"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Import your actual hooks and services
import { useSession } from "../../context/SessionContext"
import { useAuth } from "../../context/AuthContext"
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition"
import { useMediaRecorder } from "../../hooks/useMediaRecorder"
import { useAvatarAnimation } from "../../hooks/useAvatarAnimation"
import { askAI } from "../../services/aiService"
import { getPresignedUrl, uploadToS3, confirmUpload } from "../../services/mediaService"
import { getConversations } from "../../services/conversationService" // Add this import
// Import the new CustomAvatar component
import CustomAvatar from "@/components/ui/custom-avatar"

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
interface ChatWindowProps {
  sessionId?: string;
  initialSessionData?: Record<string, unknown>; // Replace `any` with proper type if available
}
interface ConversationData {
  metadata: {
    tokenCount: { input: number; output: number }
    speechDuration: number
    processingTime: number
    geminiModel: string
  }
  _id: string
  sessionId: string
  userId: string
  question: string
  aiResponse: string
  transcriptionConfidence: number
  responseTime: number
  timestamp: string
  createdAt: string
  updatedAt: string
  id: string
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

const ChatWindow: React.FC<ChatWindowProps> = ({ sessionId }) => {
  console.log(sessionId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [sessionInitialized, setSessionInitialized] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sessions, setSessions] = useState<Session[]>(dummySessions)
  const [activeSessionId, setActiveSessionId] = useState("session-1")
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState("")
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
const [conversationsLoaded, setConversationsLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

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
    error: recordingError,
  } = useMediaRecorder()

  const userAvatar = useAvatarAnimation()
  const aiAvatar = useAvatarAnimation()


  const convertConversationsToMessages = (conversations: ConversationData[]): ChatMessage[] => {
  const messages: ChatMessage[] = []
  
  conversations.forEach((conv) => {
    // Add user message
    messages.push({
      id: `user-${conv.id}`,
      sender: "user",
      text: conv.question,
      timestamp: new Date(conv.timestamp)
    })
    
    // Add AI response
    messages.push({
      id: `ai-${conv.id}`,
      sender: "ai", 
      text: conv.aiResponse,
      timestamp: new Date(conv.createdAt)
    })
  })
  
  return messages
}


const loadExistingConversations = async (sessionId: string) => {
  if (conversationsLoaded) return
  
  try {
    setIsLoadingConversations(true)
    const response = await getConversations(sessionId)
    
    if (response?.success && response.conversations?.length > 0) {
      const existingMessages = convertConversationsToMessages(response.conversations)
      setMessages(existingMessages)
      setChatStarted(true)
      setConversationsLoaded(true)
      
      // Initialize session when loading existing conversations
      if (!currentSession && !sessionInitialized) {
        try {
          await startSession()
          setSessionInitialized(true)
        } catch (error) {
          console.error("Failed to initialize session:", error)
        }
      }
    } else {
      console.log("No conversations found or unexpected response structure:", response)
      setConversationsLoaded(true)
    }
  } catch (error) {
    console.error("Failed to load conversations:", error)
    setConversationsLoaded(true)
  } finally {
    setIsLoadingConversations(false)
  }
}



  // Clean transcript function to remove trailing numbers and extra spaces
  const cleanTranscript = (text: string) => {
    return text
      .replace(/\s+\d+$/, "") // Remove trailing numbers (like " 0", " 1", etc.)
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim()
  }

  // Get user camera stream when recording starts
  useEffect(() => {
    const setupVideoStream = async () => {
      if (isRecording && !videoStream) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 1280 }, 
              height: { ideal: 720 },
              facingMode: "user" 
            }, 
            audio: false 
          })
          setVideoStream(stream)
          
          // Set the video element source
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        } catch (error) {
          console.error("Error accessing camera:", error)
        }
      } else if (!isRecording && videoStream) {
        // Stop all tracks when not recording
        videoStream.getTracks().forEach(track => track.stop())
        setVideoStream(null)
        
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }
    }

    setupVideoStream()
  }, [isRecording, videoStream])

  // Cleanup video stream on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [videoStream])

  // Prevent initial scroll by ensuring container starts at top
  useEffect(() => {
    if (containerRef.current && !chatStarted) {
      containerRef.current.scrollTop = 0
    }
  }, [chatStarted])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (chatStarted && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, chatStarted])

  // Track browser events - only when session is active
  useEffect(() => {
    if (!currentSession) return

    const handleVisibilityChange = async () => {
      await logActivity("page_visibility_change", {
        isVisible: !document.hidden,
      })
    }

    const handleFocus = async () => {
      await logActivity("focus_gain")
    }

    const handleBlur = async () => {
      await logActivity("focus_loss")
    }

    const handleTabSwitch = async () => {
      await logActivity("tab_switch")
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)
    window.addEventListener("beforeunload", handleTabSwitch)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("beforeunload", handleTabSwitch)
    }
  }, [currentSession, logActivity])

  // Initialize session only once
  useEffect(() => {
  const initSession = async () => {
    if (sessionInitialized) return

    if (sessionId) {
      // If sessionId is provided, load existing conversations
      console.log(sessionId)
      setSessionInitialized(true)
      await loadExistingConversations(sessionId)
      return
    }

    if (!currentSession && !sessionInitialized) {
      try {
        setSessionInitialized(true)
        await startSession()
      } catch (error) {
        console.error("Failed to initialize session:", error)
        setSessionInitialized(false)
      }
    }
  }

  initSession()
}, [sessionId]) // Add sessionId as dependency

  useEffect(() => {
    if (currentSession && !sessionInitialized) {
      setSessionInitialized(true)
    }
  }, [currentSession, sessionInitialized])

  const handleMicToggle = async () => {
    if (!chatStarted) {
      setChatStarted(true)

      // Initialize session if not already done
      if (!sessionInitialized) {
        try {
          await startSession()
          setSessionInitialized(true)
        } catch (error) {
          console.error("Failed to initialize session:", error)
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
    // Clean the transcript and check if it's different from last processed
    const cleanedTranscript = cleanTranscript(transcript)

    if (!cleanedTranscript || isSubmitting || !currentSession || cleanedTranscript === lastProcessedTranscript) {
      return
    }

    try {
      setIsSubmitting(true)
      userAvatar.setListening(false)

      // Store the current transcript to prevent duplicates
      setLastProcessedTranscript(cleanedTranscript)

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "user",
        text: cleanedTranscript,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])

      if (isListening) {
        await stopListening()
      }

      // Reset transcript immediately after capturing
      resetTranscript()

      try {
        const response = await askAI(cleanedTranscript, currentSession.id, confidence, isListening ? 0 : undefined)

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: response.response || "Sorry, I couldn't process that request.",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMessage])

        aiAvatar.setTalking(true)
        setTimeout(() => {
          aiAvatar.setTalking(false)
        }, 2000)
      } catch (apiError) {
        console.error("API Error:", apiError)

        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, errorMessage])

        await logActivity("error_occurred", {
          context: "api_call",
          error:  apiError instanceof Error
      ? apiError.toString()
      : String(apiError),
        })
      }
    } catch (error) {
      console.error("Error submitting message:", error)
      await logActivity("error_occurred", { context: "message_submit", error })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEndSession = async () => {
    if (!currentSession) return

    let recordedBlob = null

    try {
      setIsUploading(true)

      if (isListening) {
        await stopListening()
        userAvatar.setListening(false)
      }

      let recordingUrl = null

      if (isRecording) {
        recordedBlob = await stopRecording()

        if (recordedBlob) {
          const fileName = `session_${currentSession.id}_${Date.now()}.webm`

          const presignedData = await getPresignedUrl(currentSession.id, "video/webm", recordedBlob.size)

          await logActivity("upload_start")

          const file = new File([recordedBlob], fileName, {
            type: "video/webm",
          })

          await uploadToS3(presignedData.presignedPost, file)

          const uploadResult = await confirmUpload(
            currentSession.id,
            presignedData.uploadUrl,
            recordedBlob.size,
            fileName,
          )

          recordingUrl = uploadResult.finalUrl || presignedData.uploadUrl

          await logActivity("upload_complete", {
            fileSize: recordedBlob.size,
            fileName: fileName,
            recordingUrl: recordingUrl,
          })
        }
      }

      await endSession(recordingUrl, recordedBlob?.size || 0)
      setSessionInitialized(false)
      setChatStarted(false)
      setLastProcessedTranscript("")
    } catch (error) {
      console.error("Error ending session:", error)
      await logActivity("error_occurred", { context: "end_session", error })
    } finally {
      setIsUploading(false)
      setMessages([])
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
  setLastProcessedTranscript("")
  setConversationsLoaded(false) // Add this line
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

  // Clean transcript for display (remove trailing numbers and extra spaces)
  const displayTranscript = cleanTranscript(transcript)

  if (!user) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-4">Please log in to start a chat</h2>
            <p className="text-muted-foreground">You need to be logged in to use the AI chat feature.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex h-screen bg-background w-full">
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
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CustomAvatar isAI animationState={aiAvatar.animationState} />
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-sm text-muted-foreground">{isListening ? "Listening..." : "Ready to help"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isRecording && recordingTime > 0 && (
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
      {isLoadingConversations ? (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h1 className="text-3xl font-bold">Loading Conversation...</h1>
          <p className="text-muted-foreground text-lg">
            Retrieving your previous messages
          </p>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  </div>
)}


        {/* Chat Interface */}
        {chatStarted && (
          <>
            {/* Video Preview - Circular Frame */}
            <div
              className={cn(
                "relative overflow-hidden transition-all duration-500 ease-in-out flex items-center justify-center bg-gray-900",
                isRecording ? "h-48" : "h-0",
              )}
            >
              {isRecording && (
                <div className="relative">
                  {/* Circular video container */}
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Recording indicator */}
                  {recordingTime > 0 && (
                    <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                      {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
                    </div>
                  )}
                </div>
              )}

              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-lg font-medium animate-pulse">Uploading recording...</div>
                </div>
              )}
            </div>

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
                      className={cn("flex mb-4", message.sender === "user" ? "justify-end" : "justify-start")}
                    >
                      {message.sender === "ai" && (
                        <div className="mr-2">
                          <CustomAvatar isAI animationState={aiAvatar.animationState} />
                        </div>
                      )}

                      <div
                        className={cn(
                          "max-w-[80%] p-3 rounded-lg",
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none",
                        )}
                      >
                        <p className="leading-relaxed">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                      </div>

                      {message.sender === "user" && (
                        <div className="ml-2">
                          <CustomAvatar user={user} animationState={userAvatar.animationState} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4 bg-muted/10">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-3">
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    className={cn(
                      "rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300",
                      isListening && "animate-pulse",
                    )}
                    onClick={handleMicToggle}
                    disabled={isUploading}
                    aria-label={isListening ? "Stop listening" : "Start listening"}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </Button>

                  <div className="flex-1 bg-background rounded-xl p-4 min-h-[60px] max-h-[120px] overflow-y-auto border shadow-sm">
                    {displayTranscript ? (
                      <div className="space-y-2">
                        <p>{displayTranscript}</p>
                        {isListening}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">
                        {isListening ? (
                          <span className="flex items-center space-x-2">
                            <span>Listening...</span>
                            <div className="flex space-x-1">
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
                      </span>
                    )}
                  </div>

                  <Button
                    variant="default"
                    className={cn(
                      "rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300",
                      !displayTranscript.trim() && "opacity-50",
                    )}
                    onClick={handleSubmit}
                    disabled={!displayTranscript.trim() || isSubmitting || isUploading}
                    aria-label="Send message"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background"></div>
                    ) : (
                      <Send size={20} />
                    )}
                  </Button>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex-1 space-y-1">
                    {(speechError || recordingError) && (
                      <p className="text-destructive text-sm">{speechError || recordingError}</p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleEndSession}
                    disabled={isUploading}
                    className="transition-all duration-300"
                  >
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