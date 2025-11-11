# API Services Summary

## Overview

The `src/api/` folder contains all API service functions that communicate with your Express backend. All services use the configured axios client (`client.ts`) which automatically:
- Attaches JWT tokens to requests
- Handles 401 errors (redirects to login)
- Uses the correct base URL from environment variables

## File Structure

```
src/api/
├── client.ts          # Axios instance with interceptors
├── index.ts           # Central export file
├── auth.ts            # Authentication services
├── players.ts         # Player profile services
├── coaches.ts         # Coach profile services
├── postings.ts       # Posting CRUD services
├── applications.ts    # Application management
├── messages.ts        # Messaging services
└── notifications.ts   # Notification services
```

## Import Examples

### Option 1: Import from Central Index (Recommended)

```typescript
// Import everything you need from the central index
import { 
  login, 
  signup, 
  getPostings, 
  applyToPosting,
  getMyApplications 
} from '../api';

// Or import specific services
import * as authService from '../api/auth';
import * as postingsService from '../api/postings';
```

### Option 2: Import from Individual Files

```typescript
// Import specific functions from individual files
import { login, signup } from '../api/auth';
import { getPostings, createPosting } from '../api/postings';
import { applyToPosting } from '../api/applications';
```

### Option 3: Import with Type Aliases

```typescript
// Import functions and types
import { 
  login, 
  type LoginResponse, 
  type User 
} from '../api/auth';

import { 
  getPostings, 
  type Posting, 
  type PostingFilters 
} from '../api/postings';
```

## Service Breakdown

### 🔐 Authentication (`auth.ts`)

**Functions:**
- `login(email, password)` - Login user, stores token in localStorage
- `signup(email, password, accountType)` - Register new user
- `logout()` - Clear token and user from localStorage
- `verifyEmail(token)` - Verify email with token
- `resendVerification()` - Resend verification email
- `getCurrentUser()` - Get user from localStorage
- `getAuthToken()` - Get token from localStorage

**Example:**
```typescript
import { login, signup, logout } from '../api/auth';

// Login
try {
  const response = await login('user@example.com', 'password123');
  console.log('Logged in:', response.user);
} catch (error) {
  console.error('Login failed:', error.message);
}

// Signup
try {
  await signup('newuser@example.com', 'password123', 'player');
  // User registered, but needs to verify email before login
} catch (error) {
  console.error('Signup failed:', error.message);
}

// Logout
logout();
```

### 👤 Players (`players.ts`)

**Functions:**
- `getPlayerProfile(playerId?)` - Get current player's profile or specific player
- `updatePlayerProfile(playerId, data)` - Update player profile
- `searchPlayers(filters)` - Search players with filters

**Example:**
```typescript
import { getPlayerProfile, searchPlayers } from '../api/players';

// Get current player's profile
const profile = await getPlayerProfile();

// Get specific player
const player = await getPlayerProfile('123');

// Search players
const results = await searchPlayers({
  graduationYear: 2025,
  level: 'D1',
  position: 'PG'
});
```

### 🎓 Coaches (`coaches.ts`)

**Functions:**
- `getCoachProfile(coachId?)` - Get current coach's profile or specific coach
- `updateCoachProfile(coachId, data)` - Update coach profile

**Example:**
```typescript
import { getCoachProfile, updateCoachProfile } from '../api/coaches';

// Get current coach profile
const profile = await getCoachProfile();

// Update profile
await updateCoachProfile(123, {
  bio: 'Updated bio text',
  position_title: 'Head Coach'
});
```

### 📋 Postings (`postings.ts`)

**Functions:**
- `getPostings(filters?)` - Get all active postings (public)
- `getPostingById(postingId)` - Get single posting detail
- `createPosting(data)` - Create new posting (coach only)
- `getMyPostings()` - Get coach's own postings
- `deactivatePosting(postingId)` - Deactivate posting (coach only)

**Example:**
```typescript
import { 
  getPostings, 
  getPostingById, 
  createPosting,
  getMyPostings 
} from '../api/postings';

// Get all postings with filters
const postings = await getPostings({
  division: 'D1',
  state: 'CA',
  position: 'Guard'
});

// Get single posting
const posting = await getPostingById(123);

// Create posting (coach only)
const newPosting = await createPosting({
  position_title: 'Point Guard',
  division: 'D1',
  school: 'Duke University',
  graduation_year_min: 2025,
  graduation_year_max: 2026
});

// Get my postings (coach only)
const myPostings = await getMyPostings();
```

### 📝 Applications (`applications.ts`)

**Functions:**
- `applyToPosting(postingId, message?)` - Apply to posting (player only)
- `getMyApplications()` - Get player's applications
- `getPostingApplications(postingId)` - Get applications for posting (coach only)
- `updateApplicationStatus(applicationId, status)` - Update status (coach only)
- `acceptApplication(applicationId)` - Accept application (coach only)

**Example:**
```typescript
import { 
  applyToPosting, 
  getMyApplications,
  acceptApplication 
} from '../api/applications';

// Apply to posting (player)
const application = await applyToPosting(123, 'I am very interested!');

// Get my applications (player)
const myApplications = await getMyApplications();

// Accept application (coach)
await acceptApplication(456);
```

### 💬 Messages (`messages.ts`)

**Functions:**
- `getConversations()` - Get all conversations for current user
- `getMessages(conversationId)` - Get messages in conversation
- `sendMessage(recipientUserId, messageText)` - Send message

**Example:**
```typescript
import { 
  getConversations, 
  getMessages, 
  sendMessage 
} from '../api/messages';

// Get all conversations
const conversations = await getConversations();

// Get messages for a conversation
const messages = await getMessages(123);

// Send a message
await sendMessage(456, 'Hello! I am interested in your program.');
```

### 🔔 Notifications (`notifications.ts`)

**Functions:**
- `hasUnread()` - Check if user has unread notifications
- `getNotifications()` - Get all notifications
- `markAsRead(eventId)` - Mark notification as read

**Example:**
```typescript
import { hasUnread, getNotifications } from '../api/notifications';

// Check for unread
const hasUnreadNotifications = await hasUnread();

// Get all notifications
const notifications = await getNotifications();
```

## Using in React Components

### Example 1: Using in a Component

```typescript
import { useState, useEffect } from 'react';
import { getPostings } from '../api/postings';
import type { Posting } from '../api/postings';

function PostingFeed() {
  const [postings, setPostings] = useState<Posting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostings = async () => {
      try {
        const data = await getPostings({ division: 'D1' });
        setPostings(data);
      } catch (error) {
        console.error('Failed to fetch postings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostings();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {postings.map(posting => (
        <div key={posting.id}>{posting.position_title}</div>
      ))}
    </div>
  );
}
```

### Example 2: Using Custom Hooks (Recommended)

```typescript
import { usePostings } from '../hooks';

function PostingFeed() {
  const { postings, loading, error, refetch } = usePostings({ 
    division: 'D1' 
  });

  if (error) return <div>Error: {error}</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {postings.map(posting => (
        <div key={posting.id}>{posting.position_title}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Example 3: Handling Form Submissions

```typescript
import { useState } from 'react';
import { applyToPosting } from '../api/applications';

function ApplyForm({ postingId }: { postingId: number }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await applyToPosting(postingId, message);
      alert('Application submitted!');
      setMessage('');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Why are you interested?"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
```

## Error Handling

All API functions throw errors that you can catch:

```typescript
import { getPostings } from '../api/postings';

try {
  const postings = await getPostings();
} catch (error: any) {
  // Error message from backend or default message
  console.error(error.message);
  
  // You can also check error.response for more details
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  }
}
```

## TypeScript Types

All services export TypeScript interfaces for type safety:

```typescript
import type { 
  Posting, 
  CreatePostingData,
  PostingFilters 
} from '../api/postings';

import type { 
  Application 
} from '../api/applications';

import type { 
  User,
  LoginResponse 
} from '../api/auth';
```

## Notes

- **JWT Token**: Automatically attached to all requests via axios interceptor
- **401 Errors**: Automatically handled - token cleared, redirects to `/signup`
- **Base URL**: Uses `import.meta.env.VITE_API_URL` (from `.env` file)
- **Error Messages**: All functions throw errors with meaningful messages
- **Type Safety**: Full TypeScript support with exported interfaces

