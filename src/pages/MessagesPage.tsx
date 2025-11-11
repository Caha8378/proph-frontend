import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { Header } from '../components/layout/Header';
import { CoachBottomNav } from '../components/layout/CoachBottomNav';
import { BottomNav } from '../components/layout/BottomNav';
import { ConversationList } from '../components/messages/ConversationList';
import { MessageThread } from '../components/messages/MessageThread';
import { PlayerProfileModal } from '../components/player/PlayerProfileModal';
import { useConversations, useUnreadCount } from '../hooks';
import * as messagesService from '../api/messages';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { conversations, loading: conversationsLoading, refetch: refetchConversations } = useConversations();
  const { unreadCount } = useUnreadCount();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Poll for new conversations every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      refetchConversations();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, refetchConversations]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !selectedConversationId || !user) return;

    try {
      // Send message to backend
      await messagesService.sendMessage({
        conversation_id: parseInt(selectedConversationId, 10),
        message_text: text.trim(),
      });

      // Refresh conversations and messages
      await refetchConversations();
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId,
  );

  // Handler for opening player profile modal (coaches only)
  const handlePlayerClick = (playerId: string) => {
    if (user?.role === 'coach') {
      setSelectedPlayerId(playerId);
      setIsPlayerModalOpen(true);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-proph-black flex items-center justify-center">
        <p className="text-proph-grey-text">Please log in to view messages</p>
      </div>
    );
  }

  // Mobile layout: Show list OR thread
  if (isMobile) {
    return (
      <div className="min-h-screen bg-proph-black pb-20">
        <Header />
        <div className="h-[calc(100vh-3.5rem)]">
          {conversationsLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-proph-grey-text">Loading conversations...</p>
            </div>
          ) : !selectedConversationId ? (
            <ConversationList
              conversations={conversations}
              selectedId={null}
              onSelect={setSelectedConversationId}
            />
          ) : (
            <MessageThread
              conversationId={selectedConversationId}
              conversation={selectedConversation}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedConversationId(null)}
              onPlayerClick={handlePlayerClick}
            />
          )}
        </div>
        
        {/* Player Profile Modal (for coaches viewing players) */}
        <PlayerProfileModal
          playerId={selectedPlayerId}
          isOpen={isPlayerModalOpen}
          onClose={() => {
            setIsPlayerModalOpen(false);
            setSelectedPlayerId(null);
          }}
        />
        
        {user.role === 'coach' ? (
          <CoachBottomNav unreadMessagesCount={unreadCount} />
        ) : (
          <BottomNav />
        )}
      </div>
    );
  }

  // Desktop layout: Two columns
  return (
    <div className="min-h-screen bg-proph-black pb-20">
      <Header />
      <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left: Conversation List */}
      <aside className="w-80 border-r border-proph-grey-text/20 overflow-hidden flex-shrink-0">
        {conversationsLoading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-proph-grey-text">Loading conversations...</p>
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        )}
      </aside>

      {/* Right: Message Thread */}
      <main className="flex-1 overflow-hidden">
        {selectedConversation ? (
          <MessageThread
            conversationId={selectedConversationId}
            conversation={selectedConversation}
            onSendMessage={handleSendMessage}
            onPlayerClick={handlePlayerClick}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-proph-grey-text">
              Select a conversation to start messaging
            </p>
          </div>
        )}
      </main>
      </div>

      {/* Player Profile Modal (for coaches viewing players) */}
      <PlayerProfileModal
        playerId={selectedPlayerId}
        isOpen={isPlayerModalOpen}
        onClose={() => {
          setIsPlayerModalOpen(false);
          setSelectedPlayerId(null);
        }}
      />
      
      {user.role === 'coach' ? (
        <CoachBottomNav unreadMessagesCount={unreadCount} />
      ) : (
        <BottomNav />
      )}
    </div>
  );
};

