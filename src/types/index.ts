export type Division = 'D1' | 'D2' | 'D3' | 'NAIA';

export interface School {
  id: string;
  name: string;
  logo: string;
  division: Division;
  location: string;
  conference?: string;
}

export interface Posting {
  id: string;
  coachId?: string; // coach-side ownership
  school: School;
  position: string;
  requirements: {
    height?: string;
    classYear?: number;
    class?: number[]; // coach-side multi-year targeting (e.g., [2025,2026])
    gpa?: number;
  };
  deadline: string;
  applicantCount: number;
  matchScore?: number;
  description: string;
  coachName: string;
  createdAt: string;
  status?: 'active' | 'expired' | 'filled' | 'draft';
  is_general?: boolean; // General interest posting (open to all players)
  can_delete?: boolean; // Whether coach can delete this posting
}

export interface PlayerProfile {
  id: string; // This is user_id (used for API calls)
  userId?: number; // Explicit user_id field
  profileId?: number; // player_profiles.id (if needed)
  name: string;
  position: string;
  photo: string;
  school: string;
  height: string;
  weight?: number;
  age: number;
  location: string;
  classYear: number;
  evaluation: {
    level: string;
    comparisons: string[];
  };
  stats: {
    ppg: number;
    rpg: number;
    apg: number;
    fgPercentage?: number;
    threePtPercentage?: number;
    ftPercentage?: number;
    steals: number;
    blocks: number;
    // Raw stats for frontend calculation
    fga?: number;
    fgm?: number;
    fta?: number;
    ftm?: number;
    threepa?: number;
    threepm?: number;
  };
  // Academic info (optional, for card display)
  gpa?: number;
  sat?: number;
  act?: number;
  highlightVideoLink?: string;
  // Contact info (optional, for card display)
  email?: string;
  phoneNumber?: string;
  // Verification fields
  statsIntegrityCertified?: boolean;
  highStatConfirmations?: {
    [statName: string]: boolean;
  };
  verificationUrl?: string;
  verificationStatus?: 'pending_auto_check' | 'needs_manual_review' | 'verified';
  verified?: boolean;
}

export interface Application {
  id: string;
  posting: Posting;
  player: PlayerProfile;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  applicationMessage?: string; // Message from player when applying
  note?: string;
  reviewedAt?: string;
  coachNotes?: string;
  matchScore?: number;
}

export interface Connection {
  id: string;
  coach: {
    id: string;
    name: string;
    school: School;
    position: string;
    photo?: string;
  };
  player: PlayerProfile;
  connectedAt: string;
}

export interface Coach {
  id: string;
  name: string;
  school: School;
  position: string;
  photo?: string;
  email?: string;
  phone?: string;
  verified: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    role: 'player' | 'coach';
    // If coach
    school?: string;
    coachPosition?: string;
    // If player
    gradYear?: number;
    playerPosition?: string;
  };
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
  createdAt: string;
}

// Re-export API types for convenience
export type {
  User as ApiUser,
  LoginResponse,
  RegisterResponse,
} from '../api/auth';

export type {
  PlayerProfile as ApiPlayerProfile,
  PlayerSearchFilters,
} from '../api/players';

export type {
  CoachProfile as ApiCoachProfile,
} from '../api/coaches';

export type {
  Posting as ApiPosting,
  CreatePostingData,
  PostingFilters,
} from '../api/postings';

export type {
  Application as ApiApplication,
} from '../api/applications';

export type {
  Message as ApiMessage,
  Conversation as ApiConversation,
  SendMessageData,
} from '../api/messages';

export type {
  Notification as ApiNotification,
} from '../api/notifications';
