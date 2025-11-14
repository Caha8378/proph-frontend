# API Routes Used in Frontend

This document lists all API routes that are actually used in the frontend codebase. Use this to identify unused backend routes that can be cleaned up.

## Authentication Routes (`/auth/*`)

| Method | Route | Description | File |
|--------|-------|-------------|------|
| POST | `/auth/login` | Login user | `src/api/auth.ts` |
| POST | `/auth/register` | Register new user (general) | `src/api/auth.ts` |
| POST | `/auth/register/player` | Register player profile | `src/pages/onboarding/PlayerOnboarding.tsx` |
| POST | `/auth/register/coach` | Register coach profile | `src/api/coaches.ts` |
| GET | `/auth/verify-email/:token` | Verify email with token | `src/api/auth.ts` |
| POST | `/auth/resend-verification` | Resend verification email | `src/api/auth.ts` |
| POST | `/auth/upload-image` | Upload profile image | `src/api/auth.ts` |

## Player Routes (`/players/*`, `/player/*`)

| Method | Route | Description | File |
|--------|-------|-------------|------|
| GET | `/players/me/profile` | Get current player's profile | `src/api/players.ts` |
| GET | `/players/:playerId` | Get specific player by ID | `src/api/players.ts` |
| PUT | `/players/me/profile` | Update player profile | `src/api/players.ts` |
| GET | `/players/search` | Search players with filters | `src/api/players.ts` |
| GET | `/players` | Get all players (with pagination) | `src/api/players.ts` |
| GET | `/player/getEditInfo` | Get player edit info | `src/api/players.ts` |
| PUT | `/player/profile/edit` | Update player profile (edit endpoint) | `src/api/players.ts` |
| GET | `/player/getCount` | Get total player cards count | `src/api/players.ts` |

## Coach Routes (`/coaches/*`)

| Method | Route | Description | File |
|--------|-------|-------------|------|
| GET | `/coaches/me/profile` | Get current coach's profile | `src/api/coaches.ts` |
| GET | `/coaches/:coachId` | Get specific coach by ID | `src/api/coaches.ts` |
| PUT | `/coaches/me/profile` | Update coach profile | `src/api/coaches.ts` |
| GET | `/coaches/me/team` | Get my team (all coaches from same school) | `src/api/coaches.ts` |
| GET | `/coaches/schools/search?q={query}` | Search for schools | `src/api/schools.ts` |

## Posting Routes (`/postings/*`, `/recruitment/*`)

| Method | Route | Description | File |
|--------|-------|-------------|------|
| GET | `/postings` | Get all active postings (with filters) | `src/api/postings.ts` |
| GET | `/postings/feed/search` | Search postings with filters | `src/api/postings.ts` |
| GET | `/postings/school/:schoolId` | Get all postings for a specific school | `src/api/postings.ts` |
| GET | `/postings/:postingId` | Get single posting by ID | `src/api/postings.ts` |
| POST | `/postings` | Create new posting (coach only) | `src/api/postings.ts` |
| PUT | `/postings/:id` | Update existing posting (coach only) | `src/api/postings.ts` |
| DELETE | `/postings/:postingId` | Delete/deactivate posting (coach only) | `src/api/postings.ts` |
| GET | `/api/postings/:postingId/can-apply` | Check if player is eligible to apply | `src/api/postings.ts` |
| GET | `/recruitment/my-postings` | Get coach's own postings for their school | `src/api/postings.ts` |
| GET | `/postings/feed/recommended` | Get recommended postings for current player | `src/api/postings.ts` |

## Application Routes (`/applications/*`)

| Method | Route | Description | File |
|--------|-------|-------------|------|
| POST | `/applications` | Apply to a posting (player only) | `src/api/applications.ts` |
| GET | `/applications/my` | Get player's own applications | `src/api/applications.ts` |
| GET | `/applications/posting/:postingId` | Get applications for a specific posting (coach only) | `src/api/applications.ts` |
| PUT | `/applications/:applicationId/status` | Update application status (coach only) | `src/api/applications.ts` |
| POST | `/applications/:applicationId/accept` | Accept application and create connection (coach only) | `src/api/applications.ts` |
| DELETE | `/applications/:applicationId` | Withdraw application (player only) | `src/api/applications.ts` |
| GET | `/applications/info` | Get application info (pending count for coach's school) | `src/api/applications.ts` |
| GET | `/applications/pending` | Get pending applications grouped by posting (coach only) | `src/api/applications.ts` |

## Message Routes (`/messages/*`)

| Method | Route | Description | File |
|--------|-------|-------------|------|
| GET | `/messages/conversations` | Get all conversations for current user | `src/api/messages.ts` |
| GET | `/messages/conversations/:conversationId` | Get messages for a specific conversation | `src/api/messages.ts` |
| POST | `/messages/messages` | Send a message | `src/api/messages.ts` |
| POST | `/messages/conversations` | Create a new conversation (coach accepts application) | `src/api/messages.ts` |
| PATCH | `/messages/messages/read` | Mark messages as read | `src/api/messages.ts` |
| GET | `/messages/unread-count` | Get unread message count | `src/api/messages.ts` |

## Event/Notification Routes (`/events/*`)

| Method | Route | Description | File |
|--------|-------|-------------|------|
| GET | `/events/unread-count` | Get unread notification count | `src/api/notifications.ts` |
| GET | `/events` | Get all events/notifications for current user | `src/api/notifications.ts` |
| POST | `/events/:id/read` | Mark a specific event as read | `src/api/notifications.ts` |
| POST | `/events/read-all` | Mark all events as read | `src/api/notifications.ts` |
| POST | `/events/track` | Track frontend-triggered events | `src/api/notifications.ts` |

## Search Routes

| Method | Route | Description | File |
|--------|-------|-------------|------|
| GET | `/players/search?q={query}` | Search for players and colleges | `src/api/search.ts` |

---

## Summary by Category

- **Authentication**: 7 routes
- **Players**: 8 routes
- **Coaches**: 5 routes
- **Postings**: 9 routes
- **Applications**: 8 routes
- **Messages**: 6 routes
- **Events/Notifications**: 5 routes
- **Search**: 1 route

**Total: 49 API routes used in frontend**

---

## Notes

- All routes use the `apiClient` from `src/api/client.ts` which automatically adds authentication headers
- Some routes use `publicApiClient` for public endpoints (no auth required)
- The `/api/` prefix is handled by the API client base URL configuration
- All routes are RESTful and follow standard HTTP methods (GET, POST, PUT, PATCH, DELETE)

