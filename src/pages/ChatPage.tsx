import React from 'react';
import {  useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/chat/ChatWindow';
// import { getConversations } from '@/services/conversationService';

const ChatPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // const [isLoadingSession, setIsLoadingSession] = React.useState(false);
  const sessionId = location.state?.sessionId;
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Load session data if sessionId is provided
  
  // if (isLoading || isLoadingSession) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
  //       <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent"></div>
  //     </div>
  //   );
  // }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="w-full mx-auto">
      <ChatWindow 
        sessionId={sessionId}
      />
    </div>
  );
};

export default ChatPage;