import React, { useState } from 'react';
import { 
  History, 
  PieChart, 
  MessageSquare, 
  Clock, 
  Zap, 
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/cardSC';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/buttonSC';
import { Separator } from '@/components/ui/separator';
import SessionsList from '../components/dashboard/SessionsList';
import { getAnalytics } from '../services/aiService';

import { useNavigate } from 'react-router-dom';
interface Analytics {
  totalConversations: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  averageQuestionLength: number;
  averageResponseLength: number;
}

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const navigate = useNavigate();
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // navigate('/login'); // Uncomment when navigation is available
    }
  }, [isAuthenticated, isLoading]);

  // Load analytics data
  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoadingAnalytics(true);
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated]);

  const handleSessionSelect = async (sessionId: string) => {
  try {
    // const sessionConversationInfo = await getConversations(sessionId);
    // console.log({sessionConversationInfo});
    
    // Navigate to chat with session data
    // Option 1: Using URL params
    // navigate(`/chat/${sessionId}`);
    
    // Option 2: Using state (if you prefer not to expose sessionId in URL)
    console.log('Navigating to chat with sessionId:', sessionId);
    navigate('/chat', { 
      state: { 
        sessionId, 
      } 
    });
    
  } catch (error) {
    console.error('Failed to fetch session:', error);
  }
};


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Welcome back, {user?.name}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Users className="h-4 w-4 mr-1" />
            Active User
          </Badge>
        </div>
        <Separator />
      </div>

      {/* Quick Actions */}
      {/* <div className="flex flex-wrap gap-3">
        <Button className="bg-red-600 hover:bg-red-700">
          <MessageSquare className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Reports
        </Button>
      </div> */}

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingAnalytics ? '...' : analytics?.totalConversations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingAnalytics ? '...' : `${(analytics?.averageResponseTime.toFixed(2)) || 0}ms`}
            </div>
            <p className="text-xs text-muted-foreground">
              -5ms from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingAnalytics ? '...' : analytics?.totalTokensUsed?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +2.1k from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Question Length</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingAnalytics ? '...' : `${analytics?.averageQuestionLength.toFixed(0) || 0} chars`}
            </div>
            <p className="text-xs text-muted-foreground">
              +8 chars from average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-2">
          <Card className='h-full max-h-[415px]'>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Sessions
              </CardTitle>
              <CardDescription>
                Your latest AI conversations and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionsList onSessionSelect={handleSessionSelect} />
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usage Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Questions Asked</span>
                <Badge variant="secondary">
                  {analytics?.totalConversations.toFixed(0) || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Response Length</span>
                <Badge variant="outline">
                  {analytics?.averageResponseLength.toFixed(0) || 0} chars
                </Badge>
              </div>
              <Separator />
              <div className="text-center">
                <Button variant="ghost" size="sm" className="w-full">
                  View Detailed Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-base text-red-900 dark:text-red-100">
                Upgrade to Pro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700 dark:text-red-200 mb-4">
                Get unlimited conversations and priority support.
              </p>
              <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;