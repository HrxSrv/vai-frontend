import React, { useState, useEffect } from 'react';
import { Session } from '../../types';
import { getSessions, deleteSession } from '../../services/sessionService';
import { getSignedUrl, deleteRecording } from '../../services/mediaService';
import { formatDuration, formatDate } from '../../utils/formatters';
import { Button } from '@/components/ui/buttonSC';
import { Badge } from '@/components/ui/badge';
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
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SessionsListProps {
  onSessionSelect: (sessionId: string) => void;
  activeSessionId?: string;
  sidebarCollapsed?: boolean;
}

const SessionsList: React.FC<SessionsListProps> = ({ 
  onSessionSelect, 
  activeSessionId,
  sidebarCollapsed = false 
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [downloadingSession, setDownloadingSession] = useState<string | null>(null);
  const [deletingSession, setDeletingSession] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getSessions(page, 10);
        if (page === 1) {
          setSessions(response.sessions);
        } else {
          setSessions(prev => [...prev, ...response.sessions]);
        }
        
        setHasMore(response.pagination.page < response.pagination.pages);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessions();
  }, [page]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    
    try {
      setDeletingSession(sessionId);
      const session = sessions.find(s => s.id === sessionId);
      
      if (session?.recordingUrl) {
        await deleteRecording(sessionId);
      }
      
      await deleteSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (err) {
      console.error('Error deleting session:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setDeletingSession(null);
    }
  };

  const handleDownload = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const session = sessions.find(s => s.id === sessionId);
    if (!session?.recordingUrl) return;
    
    try {
      setDownloadingSession(sessionId);
      
      const signedUrl = await getSignedUrl(sessionId);
      
      const a = document.createElement('a');
      a.href = signedUrl;
      a.download = `session-${sessionId}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error downloading recording:', error);
    } finally {
      setDownloadingSession(null);
    }
  };

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1);
  };

  if (isLoading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        {!sidebarCollapsed && (
          <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
        )}
      </div>
    );
  }

  if (error && sessions.length === 0) {
    return (
      <div className="py-4">
        {!sidebarCollapsed && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={() => setPage(1)}>
            {sidebarCollapsed ? '↻' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        {!sidebarCollapsed && (
          <>
            <h3 className="text-sm font-medium mb-1">No sessions</h3>
            <p className="text-xs text-muted-foreground">
              Start a conversation
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-1 p-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "group relative rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted",
              activeSessionId === session.id && "bg-muted",
            )}
            onClick={() => onSessionSelect(session.id)}
          >
            <div className="flex items-start space-x-3">
              {/* Status indicator */}
              <div className="flex-shrink-0 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  session.status === 'active' 
                    ? 'bg-green-500' 
                    : 'bg-blue-500'
                }`} />
              </div>

              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  {/* Session info */}
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm truncate">
                      Session #{session.id?.slice(-6) || 'N/A'}
                    </p>
                    <Badge 
                      variant={session.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs h-5"
                    >
                      {session.status === 'active' ? (
                        <Clock className="h-2 w-2 mr-1" />
                      ) : (
                        <CheckCircle2 className="h-2 w-2 mr-1" />
                      )}
                      {session.status === 'active' ? 'Active' : 'Done'}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-1">
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {formatDuration ? formatDuration(session.totalDuration || 0) : '0:21'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {session.conversationCount || 1}
                    </span>
                  </div>

                  {/* Date and size */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatDate ? formatDate(session.startedAt || new Date().toISOString()) : formatSessionDate(session.startedAt || new Date().toISOString())}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {session.recordingSize ? `${formatFileSize(session.recordingSize)}MB` : '2.8MB'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions dropdown */}
            {!sidebarCollapsed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onSessionSelect(session.id)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Session
                  </DropdownMenuItem>
                  {session.recordingUrl && (
                    <DropdownMenuItem 
                      onClick={(e) => handleDownload(session.id, e)}
                      disabled={downloadingSession === session.id}
                    >
                      {downloadingSession === session.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Download
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={(e) => handleDelete(session.id, e)}
                    disabled={deletingSession === session.id}
                    className="text-destructive focus:text-destructive"
                  >
                    {deletingSession === session.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}

        {hasMore && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {!sidebarCollapsed && 'Loading...'}
                </>
              ) : (
                !sidebarCollapsed ? 'Load more' : '+'
              )}
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default SessionsList;