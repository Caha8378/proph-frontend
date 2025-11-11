import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import * as messagesService from '../api/messages';
import * as playersService from '../api/players';
import * as coachesService from '../api/coaches';
import type { Conversation, Message } from '../types';

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseUnreadCountReturn {
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all conversations for the current user
 */
export const useConversations = (): UseConversationsReturn => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const backendConvs = await messagesService.getConversations();
      
      // Convert backend format to frontend format
      let frontendConvs = backendConvs.map(conv =>
        messagesService.convertBackendConversationToFrontend(conv)
      );
      
      // Enrich conversations with missing user data
      const enrichedConvs = await Promise.all(
        frontendConvs.map(async (conv) => {
          // If we don't have name or avatar, fetch the user's profile
          if ((conv.otherUser.name === 'Player' || conv.otherUser.name === 'Coach' || !conv.otherUser.avatar || conv.otherUser.avatar === '/defualt.webp') && conv.otherUser.id) {
            try {
              if (conv.otherUser.role === 'player') {
                // Fetch player profile
                const playerProfile = await playersService.getPlayerProfile(conv.otherUser.id);
                if (playerProfile) {
                  conv.otherUser.name = playerProfile.name || conv.otherUser.name;
                  // PlayerProfile has 'photo' field from conversion
                  conv.otherUser.avatar = (playerProfile as any).photo || (playerProfile as any).profile_image_url || conv.otherUser.avatar;
                  if ((playerProfile as any).classYear) {
                    conv.otherUser.gradYear = (playerProfile as any).classYear;
                  }
                  if (playerProfile.position) {
                    conv.otherUser.playerPosition = playerProfile.position;
                  }
                }
              } else if (conv.otherUser.role === 'coach') {
                // Fetch coach profile
                const coachProfile = await coachesService.getCoachProfile(conv.otherUser.id);
                if (coachProfile) {
                  conv.otherUser.name = coachProfile.name || conv.otherUser.name;
                  conv.otherUser.avatar = coachProfile.profile_image_url || conv.otherUser.avatar;
                  if (coachProfile.position_title) {
                    conv.otherUser.coachPosition = coachProfile.position_title;
                  }
                }
              }
            } catch (err) {
              // Silently fail - use defaults
              console.warn('Failed to fetch user profile for conversation:', err);
            }
          }
          return conv;
        })
      );
      
      setConversations(enrichedConvs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user?.id]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
  };
};

/**
 * Hook to fetch messages for a specific conversation
 */
export const useMessages = (conversationId: string | number | null): UseMessagesReturn => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!conversationId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const backendMessages = await messagesService.getMessages(conversationId);
      
      // Convert backend format to frontend format
      const frontendMessages = backendMessages.map(msg =>
        messagesService.convertBackendMessageToFrontend(msg)
      );
      
      setMessages(frontendMessages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId, user?.id]);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
  };
};

/**
 * Hook to fetch unread message count
 */
export const useUnreadCount = (): UseUnreadCountReturn => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = async () => {
    // Only fetch if user is authenticated
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const count = await messagesService.getUnreadCount();
      setUnreadCount(count);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch unread count');
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Only poll if user is authenticated
    if (!user) return;
    
    // Poll every 30 seconds for new unread messages
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return {
    unreadCount,
    loading,
    error,
    refetch: fetchUnreadCount,
  };
};

