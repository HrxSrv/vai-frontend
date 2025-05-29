"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Session } from "../../types"
import { getSessions, deleteSession } from "../../services/sessionService"
import { getSignedUrl, deleteRecording } from "../../services/mediaService"
import { formatDuration, formatDate } from "../../utils/formatters"
import { Button } from "@/components/ui/buttonSC"
import { Card, CardContent } from "@/components/ui/cardSC"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  MoreVertical,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  Download,
  Timer,
  HardDrive,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SessionsListProps {
  onSessionSelect: (sessionId: string) => void
}

const SessionsList: React.FC<SessionsListProps> = ({ onSessionSelect }) => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [downloadingSession, setDownloadingSession] = useState<string | null>(null)
  const [deletingSession, setDeletingSession] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await getSessions(page, 10)
        if (page === 1) {
          setSessions(response.sessions)
        } else {
          setSessions((prev) => [...prev, ...response.sessions])
        }

        setHasMore(response.pagination.page < response.pagination.pages)
      } catch (err) {
        console.error("Error fetching sessions:", err)
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError(String(err))
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [page])

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1)
    }
  }

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return

    try {
      setDeletingSession(sessionId)
      const session = sessions.find((s) => s.id === sessionId)

      if (session?.recordingUrl) {
        await deleteRecording(sessionId)
      }

      await deleteSession(sessionId)
      setSessions((prev) => prev.filter((session) => session.id !== sessionId))
    } catch (err) {
      console.error("Error deleting session:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    } finally {
      setDeletingSession(null)
    }
  }

  const handleDownload = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId)
    if (!session?.recordingUrl) return

    try {
      setDownloadingSession(sessionId)

      const signedUrl = await getSignedUrl(sessionId)

      const a = document.createElement("a")
      a.href = signedUrl
      a.download = `session-${sessionId}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading recording:", error)
    } finally {
      setDownloadingSession(null)
    }
  }

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1)
  }

  if (isLoading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground">Loading sessions...</span>
      </div>
    )
  }

  if (error && sessions.length === 0) {
    return (
      <div className="py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={() => setPage(1)}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-base font-medium mb-2">No sessions found</h3>
        <p className="text-sm text-muted-foreground">Start a new conversation to create your first session</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[300px] pr-2">
      <div className="space-y-3">
        {sessions.map((session) => (
          <Card key={session.id} className="group hover:bg-accent/50 transition-colors border border-border">
            <CardContent className="p-3 sm:p-4">
              {/* Mobile Layout */}
              <div className="block sm:hidden">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        session.status === "active" ? "bg-green-500 dark:bg-green-400" : "bg-[#0070f3]"
                      }`}
                    ></div>
                    <span className="text-sm font-medium">#{session.id?.slice(-6) || "N/A"}</span>
                    <Badge variant={session.status === "active" ? "default" : "secondary"} className="text-xs ml-auto">
                      {session.status === "active" ? (
                        <>
                          <Clock className="h-2 w-2 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-2 w-2 mr-1" />
                          Complete
                        </>
                      )}
                    </Badge>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSessionSelect(session.id)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Session
                      </DropdownMenuItem>
                      {session.recordingUrl && (
                        <DropdownMenuItem
                          onClick={() => handleDownload(session.id)}
                          disabled={downloadingSession === session.id}
                        >
                          {downloadingSession === session.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Download Recording
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDelete(session.id)}
                        disabled={deletingSession === session.id}
                        className="text-destructive focus:text-destructive"
                      >
                        {deletingSession === session.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        {deletingSession === session.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="cursor-pointer" onClick={() => onSessionSelect(session.id)}>
                  <div className="text-xs text-muted-foreground mb-2">
                    {formatDate
                      ? formatDate(session.startedAt || new Date().toISOString())
                      : formatSessionDate(session.startedAt || new Date().toISOString())}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {formatDuration ? formatDuration(session.totalDuration || 0) : "0:21"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {session.conversationCount || 1}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {session.recordingSize ? `${formatFileSize(session.recordingSize)}MB` : "2.8MB"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between">
                {/* Left Section - Main Info */}
                <div
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                  onClick={() => onSessionSelect(session.id)}
                >
                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        session.status === "active" ? "bg-green-500 dark:bg-green-400" : "bg-[#0070f3]"
                      }`}
                    ></div>
                  </div>

                  {/* Session ID and Date */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium">#{session.id?.slice(-6) || "N/A"}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate
                          ? formatDate(session.startedAt || new Date().toISOString())
                          : formatSessionDate(session.startedAt || new Date().toISOString())}
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {formatDuration ? formatDuration(session.totalDuration || 0) : "0:21"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {session.conversationCount || 1}
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {session.recordingSize ? `${formatFileSize(session.recordingSize)}MB` : "2.8MB"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section - Status & Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Status Badge */}
                  <Badge variant={session.status === "active" ? "default" : "secondary"} className="text-xs">
                    {session.status === "active" ? (
                      <>
                        <Clock className="h-2 w-2 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-2 w-2 mr-1" />
                        Complete
                      </>
                    )}
                  </Badge>

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSessionSelect(session.id)}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Session
                      </DropdownMenuItem>
                      {session.recordingUrl && (
                        <DropdownMenuItem
                          onClick={() => handleDownload(session.id)}
                          disabled={downloadingSession === session.id}
                        >
                          {downloadingSession === session.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Download Recording
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDelete(session.id)}
                        disabled={deletingSession === session.id}
                        className="text-destructive focus:text-destructive"
                      >
                        {deletingSession === session.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        {deletingSession === session.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Chevron */}
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer"
                    onClick={() => onSessionSelect(session.id)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {hasMore && (
          <div className="pt-4">
            <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

export default SessionsList
