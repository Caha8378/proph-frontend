import apiClient from './client';
import type { Conversation as FrontendConversation, Message as FrontendMessage } from '../types';

// Re-export frontend types for convenience
export type Message = FrontendMessage;
export type Conversation = FrontendConversation;
export type SendMessageData = SendMessageRequest;

// Backend response types
export interface BackendMessage {
  id: number;
  conversation_id: number;
  sender_user_id: number;
  message_text: string;
  sent_at: string; // This is the timestamp field from the database
  read_at?: string | null;
  // Additional fields that may be returned from the backend query
  sender_name?: string;
  sender_image?: string;
  sender_role?: 'player' | 'coach';
  [key: string]: any;
}

export interface BackendConversation {
  conversation_id: number;
  conversation_started?: string;
  // Other user info (already determined by backend)
  other_user_id: number;
  other_user_name?: string;
  other_user_image?: string;
  other_user_role: 'player' | 'coach';
  // School info (if other user is coach)
  school_name?: string;
  school_logo?: string;
  // Last message preview
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  [key: string]: any;
}

export interface SendMessageRequest {
  conversation_id?: number;
  recipient_user_id?: number;
  message_text: string;
}

export interface CreateConversationRequest {
  player_user_id: number;
  initial_message?: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

/**
 * Get all conversations for current user
 * Backend endpoint: GET /messages/conversations
 */
export const getConversations = async (): Promise<BackendConversation[]> => {
  try {
    const response = await apiClient.get<BackendConversation[]>('/messages/conversations');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch conversations');
  }
};

/**
 * Get messages for a specific conversation
 * Backend endpoint: GET /messages/conversations/:conversationId
 * Backend returns: { conversation_id, participant, messages: [...] }
 */
export interface ConversationMessagesResponse {
  conversation_id: number;
  participant: {
    user_id: number;
    name: string;
    image: string;
    role: 'player' | 'coach';
    school_name?: string;
  } | null;
  messages: BackendMessage[];
}

export const getMessages = async (conversationId: string | number): Promise<BackendMessage[]> => {
  try {
    const response = await apiClient.get<ConversationMessagesResponse>(`/messages/conversations/${conversationId}`);
    // Backend returns { conversation_id, participant, messages }
    const messages = response.data.messages || [];
    // Ensure conversation_id is set on each message if missing
    const conversationIdNum = typeof conversationId === 'string' ? parseInt(conversationId, 10) : conversationId;
    return messages.map(msg => ({
      ...msg,
      conversation_id: msg.conversation_id || conversationIdNum,
    }));
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch messages');
  }
};

/**
 * Send a message
 * Backend endpoint: POST /messages/messages
 * Body: { conversation_id?: number, recipient_user_id?: number, message_text: string }
 */
export const sendMessage = async (
  data: SendMessageRequest
): Promise<BackendMessage> => {
  try {
    const response = await apiClient.post<BackendMessage>('/messages/messages', {
      conversation_id: data.conversation_id,
      recipient_user_id: data.recipient_user_id,
      message_text: data.message_text,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to send message');
  }
};

/**
 * Create a new conversation (coach accepts application)
 * Backend endpoint: POST /messages/conversations
 * Body: { player_user_id: number, initial_message?: string }
 */
export const createConversation = async (
  data: CreateConversationRequest
): Promise<BackendConversation> => {
  try {
    const response = await apiClient.post<BackendConversation>('/messages/conversations', {
      player_user_id: data.player_user_id,
      initial_message: data.initial_message,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to create conversation');
  }
};

/**
 * Mark messages as read
 * Backend endpoint: PATCH /messages/messages/read
 * Body: { conversation_id: number } or { message_ids: number[] }
 * Backend requires at least one of these fields
 */
export const markMessagesAsRead = async (
  conversationId?: number,
  messageIds?: number[]
): Promise<void> => {
  try {
    const body: any = {};
    if (conversationId) {
      body.conversation_id = conversationId;
    }
    if (messageIds && messageIds.length > 0) {
      body.message_ids = messageIds;
    }
    
    // Backend requires at least one field - if neither is provided, don't make the call
    if (!body.conversation_id && (!body.message_ids || body.message_ids.length === 0)) {
      console.warn('markMessagesAsRead: No conversation_id or message_ids provided, skipping API call');
      return;
    }
    
    await apiClient.patch('/messages/messages/read', body);
  } catch (error: any) {
    // Don't throw error if backend requires message_ids but we only have conversation_id
    // This might be a backend requirement change
    const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to mark messages as read';
    if (errorMessage.includes('message_ids') || errorMessage.includes('Message IDs')) {
      console.warn('markMessagesAsRead: Backend requires message_ids, but we only have conversation_id. Skipping.');
      return;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Get unread message count
 * Backend endpoint: GET /messages/unread-count
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await apiClient.get<UnreadCountResponse>('/messages/unread-count');
    return response.data.unread_count || 0;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to fetch unread count');
  }
};

/**
 * Convert backend message to frontend format
 */
export function convertBackendMessageToFrontend(
  backendMessage: BackendMessage
): FrontendMessage {
  // Ensure sent_at is available - use current time as fallback if missing
  // Check both sent_at and any alternative field names that might be used
  const timestamp = backendMessage.sent_at 
    || (backendMessage as any).sentAt 
    || (backendMessage as any).timestamp
    || new Date().toISOString();
  
  return {
    id: String(backendMessage.id),
    conversationId: String(backendMessage.conversation_id),
    senderId: String(backendMessage.sender_user_id),
    text: backendMessage.message_text,
    timestamp: timestamp,
    read: !!backendMessage.read_at,
  };
}

/**
 * Convert backend conversation to frontend format
 * Backend already determines the "other user" and returns it in a flat structure
 */
export function convertBackendConversationToFrontend(
  backendConv: BackendConversation
): FrontendConversation {
  // Backend already provides other_user_id, other_user_name, other_user_image, other_user_role
  const otherUserId = backendConv.other_user_id;
  const otherUserName = backendConv.other_user_name || (backendConv.other_user_role === 'coach' ? 'Coach' : 'Player');
  const otherUserAvatar = backendConv.other_user_image || '/defualt.webp';
  const isOtherUserCoach = backendConv.other_user_role === 'coach';
  
  // Build last message
  const lastMessage: FrontendMessage = backendConv.last_message ? {
    id: 'last',
    conversationId: String(backendConv.conversation_id),
    senderId: String(otherUserId), // Backend doesn't provide sender_id in last_message, use otherUserId as placeholder
    text: backendConv.last_message,
    timestamp: backendConv.last_message_at || new Date().toISOString(),
    read: false,
  } : {
    id: 'empty',
    conversationId: String(backendConv.conversation_id),
    senderId: String(otherUserId),
    text: 'No messages yet',
    timestamp: backendConv.last_message_at || backendConv.conversation_started || new Date().toISOString(),
    read: true,
  };
  
  // For coaches, prefer school_logo over other_user_image
  const coachAvatar = isOtherUserCoach && backendConv.school_logo 
    ? backendConv.school_logo 
    : otherUserAvatar;
  
  return {
    id: String(backendConv.conversation_id),
    otherUser: {
      id: String(otherUserId),
      name: otherUserName,
      avatar: coachAvatar,
      role: backendConv.other_user_role,
      // Coach fields
      school: isOtherUserCoach ? backendConv.school_name : undefined,
      coachPosition: undefined, // Backend doesn't provide this in conversations query
      // Player fields
      gradYear: undefined, // Backend doesn't provide this in conversations query
      playerPosition: undefined, // Backend doesn't provide this in conversations query
    },
    messages: [], // Will be populated separately
    lastMessage,
    unreadCount: backendConv.unread_count || 0,
    createdAt: backendConv.last_message_at || backendConv.conversation_started || new Date().toISOString(),
  };
}

