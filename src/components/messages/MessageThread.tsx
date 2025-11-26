import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, MoreVertical } from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { useMessages } from '../../hooks';
import * as messagesService from '../../api/messages';
import type { Conversation } from '../../types';
import { formatTime, shouldShowTimestamp } from '../../utils/messageHelpers';

interface MessageThreadProps {
  conversationId: string | null;
  conversation: Conversation | undefined;
  onSendMessage: (text: string) => Promise<void>;
  onBack?: () => void;
  onPlayerClick?: (playerId: string) => void;
}

interface MessageBubbleProps {
  message: {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
  };
  isOwnMessage: boolean;
  showTimestamp: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, showTimestamp }) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[70%] rounded-2xl px-4 py-2
          ${isOwnMessage
            ? 'bg-proph-yellow text-proph-black'
            : 'bg-proph-grey-light text-proph-white'
          }
        `}
      >
        <p className="text-sm">{message.text}</p>
        {showTimestamp && (
          <p
            className={`text-xs mt-1 ${
              isOwnMessage ? 'text-proph-black/60' : 'text-proph-grey-text'
            }`}
          >
            {formatTime(message.timestamp)}
          </p>
        )}
      </div>
    </div>
  );
};

export const MessageThread: React.FC<MessageThreadProps> = ({
  conversationId,
  conversation,
  onSendMessage,
  onBack,
  onPlayerClick,
}) => {
  const { user } = useAuth();
  const isCoach = user?.role === 'coach';
  const isPlayer = conversation?.otherUser.role === 'player';
  const canClickPlayer = isCoach && isPlayer && onPlayerClick;

  const handlePlayerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any parent click handlers
    if (canClickPlayer && conversation?.otherUser.id) {
      onPlayerClick(conversation.otherUser.id);
    }
  };
  const { messages, loading: messagesLoading, refetch: refetchMessages } = useMessages(conversationId);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Mark messages as read when conversation is opened and messages are loaded
  useEffect(() => {
    if (conversationId && !messagesLoading && conversation && conversation.unreadCount > 0 && messages.length > 0) {
      // Get unread message IDs (messages that haven't been read and aren't from the current user)
      // Backend requires message_ids array, so we need to extract IDs from the messages
      const unreadMessageIds = messages
        .filter(msg => {
          // Only include messages that are unread and not sent by the current user
          const isUnread = !msg.read;
          const isNotFromMe = String(msg.senderId) !== String(user?.id);
          // Exclude placeholder messages (id === 'last' or id === 'empty')
          const hasValidId = msg.id !== 'last' && msg.id !== 'empty' && msg.id !== 'undefined' && msg.id;
          return isUnread && isNotFromMe && hasValidId;
        })
        .map(msg => {
          // Backend message IDs are numbers, convert from string if needed
          const msgId = typeof msg.id === 'string' ? parseInt(msg.id, 10) : msg.id;
          return isNaN(msgId) || msgId <= 0 ? null : msgId;
        })
        .filter((id): id is number => id !== null);
      
      // Backend requires message_ids array - only call if we have valid message IDs
      if (unreadMessageIds.length > 0) {
        messagesService.markMessagesAsRead(undefined, unreadMessageIds).catch((err) => {
          // Silently handle errors - don't spam console
          // Only log if it's not the expected "message_ids required" error
          if (!err.message?.includes('message_ids') && !err.message?.includes('Message IDs')) {
            console.warn('Failed to mark messages as read:', err.message);
          }
        });
      }
      // If we don't have valid message IDs, skip the call entirely
      // The backend requires message_ids, so conversation_id alone won't work
    }
  }, [conversationId, conversation, messages, messagesLoading, user?.id]);

  // Auto-scroll to bottom on new message (within container only)
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Poll for new messages every 5 seconds when conversation is open
  useEffect(() => {
    if (!conversationId) return;
    
    const interval = setInterval(() => {
      refetchMessages();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [conversationId, refetchMessages]);

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-proph-grey-text">Select a conversation to start messaging</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversationId) return;

    const text = messageText.trim();
    setMessageText(''); // Clear input immediately for better UX

    try {
      await onSendMessage(text);
      // Refresh messages after sending
      await refetchMessages();
    } catch (error) {
      // Restore message text on error
      setMessageText(text);
    }
  };

  return (
    <div className="h-full flex flex-col bg-proph-black">
      {/* Header */}
      <div className="border-b border-proph-grey-text/20 p-4 flex items-center gap-3 flex-shrink-0">
        {/* Back button (mobile only) */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-proph-grey-light rounded-lg transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5 text-proph-white" />
          </button>
        )}

        {/* Other user info - clickable for coaches viewing players */}
        <div 
          className={`flex items-center gap-3 flex-1 min-w-0 ${canClickPlayer ? 'cursor-pointer' : ''}`}
          onClick={canClickPlayer ? handlePlayerClick : undefined}
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <img
              src={conversation.otherUser.avatar}
              alt={conversation.otherUser.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/IMG_1918.jpeg';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-bold text-proph-white truncate ${canClickPlayer ? 'hover:text-proph-yellow transition-colors' : ''}`}>
              {conversation.otherUser.name}
            </p>
            {conversation.otherUser.role === 'coach' && (
              <p className="text-xs text-proph-grey-text truncate">
                {conversation.otherUser.school || ''} {conversation.otherUser.school && conversation.otherUser.coachPosition ? '•' : ''} {conversation.otherUser.coachPosition || ''}
              </p>
            )}
          </div>
        </div>

        {/* Actions (future: video call, etc.) */}
        <button
          className="p-2 hover:bg-proph-grey-light rounded-lg transition-colors"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5 text-proph-grey-text" />
        </button>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-proph-grey-text">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-proph-grey-text">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={String(message.senderId) === String(user?.id)}
              showTimestamp={shouldShowTimestamp(
                message,
                messages[index - 1],
              )}
            />
          ))
        )}

        {/* Scroll to bottom anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-proph-grey-text/20 p-4 flex-shrink-0 bg-proph-black">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-proph-black border border-proph-grey-light rounded-lg px-4 py-3 text-proph-white placeholder-proph-grey-text focus:outline-none focus:border-proph-yellow focus:ring-1 focus:ring-proph-yellow"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="bg-proph-yellow text-proph-black font-bold px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-proph-yellow/90 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

