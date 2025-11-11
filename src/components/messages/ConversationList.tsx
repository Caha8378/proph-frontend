import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { Conversation } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { formatTimestamp } from '../../utils/messageHelpers';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string | null;
  onSelect: (conversationId: string) => void;
}

interface ConversationCardProps {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
}

const ConversationCard: React.FC<ConversationCardProps> = ({ conversation, selected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        p-4 border-b border-proph-grey-text/20 cursor-pointer transition-colors
        ${selected ? 'bg-proph-yellow/10' : 'hover:bg-proph-grey-light'}
      `}
    >
      {/* User Avatar + Name */}
      <div className="flex items-center gap-3 mb-2">
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
          <div className="flex items-center justify-between mb-1">
            <p className="font-bold text-proph-white truncate">
              {conversation.otherUser.name}
            </p>
            <span className="text-xs text-proph-grey-text flex-shrink-0 ml-2">
              {formatTimestamp(conversation.lastMessage.timestamp)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-proph-grey-text truncate">
              {conversation.lastMessage.text}
            </p>
            {conversation.lastMessage.text === 'No messages yet' && (
              <span className="text-xs text-proph-yellow font-semibold flex-shrink-0 ml-2">Your turn</span>
            )}
          </div>
        </div>
      </div>

      {/* Unread Badge */}
      {conversation.unreadCount > 0 && (
        <div className="flex justify-end">
          <span className="bg-proph-yellow text-proph-black text-xs font-bold px-2 py-0.5 rounded-full">
            {conversation.unreadCount}
          </span>
        </div>
      )}
    </div>
  );
};

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
}) => {
  // Sort conversations by most recent message
  const sortedConversations = [...conversations].sort((a, b) => {
    const aTime = new Date(a.lastMessage.timestamp).getTime();
    const bTime = new Date(b.lastMessage.timestamp).getTime();
    return bTime - aTime;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-proph-grey-text/20 flex-shrink-0">
        <h2 className="text-xl font-black text-proph-white">Messages</h2>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={MessageCircle}
              title="No messages yet"
              description="Start a conversation by applying to postings"
            />
          </div>
        ) : (
          <div>
            {sortedConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                selected={conversation.id === selectedId}
                onClick={() => onSelect(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

