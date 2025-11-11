# Coach Backend Requirements

## Overview
The frontend now fetches coach profile data to display verification status and profile images. The backend needs to ensure the coach profile endpoint returns the required fields.

## Required Backend Endpoint

### GET `/api/coaches/me/profile`
**Authentication:** Required (JWT token)

**Response should include:**
```json
{
  "id": 123,
  "user_id": 456,
  "school_id": 789,
  "name": "Coach Name",
  "position_title": "Head Coach",
  "bio": "Coach bio...",
  "profile_image_url": "https://...",
  "is_verified": 1,  // REQUIRED: 0 or 1 (tinyint)
  "email": "coach@example.com",
  "phone_number": "123-456-7890",
  "gender_coached": "male"
}
```

## Required Fields

### Critical Fields (Must be included):
1. **`is_verified`** (tinyint(1))
   - Used to determine if coach can create postings
   - Stored in localStorage as `coachVerified`
   - Frontend checks: `is_verified === true || is_verified === 1`

2. **`profile_image_url`** (varchar(255))
   - Used as icon in "My Team" tab in bottom navigation
   - Stored in localStorage as `profilePhoto`
   - Falls back to Users icon if not available

### Optional Fields (Nice to have):
- `email`
- `phone_number`
- `gender_coached`
- `bio`
- `position_title`

## Frontend Implementation

### What the Frontend Does:

1. **Fetches Profile on Load:**
   - Uses `useProfile()` hook
   - Calls `GET /api/coaches/me/profile`
   - Stores `is_verified` in localStorage
   - Stores `profile_image_url` in localStorage

2. **Uses Verification Status:**
   - Shows/hides "Pending Verification" banner
   - Enables/disables "Create New Posting" button
   - Shows lock icon if not verified

3. **Uses Profile Image:**
   - Displays in "My Team" tab in bottom navigation
   - Falls back to Users icon if image fails to load

## Testing Checklist

- [ ] Endpoint returns `is_verified` field (0 or 1)
- [ ] Endpoint returns `profile_image_url` field
- [ ] Unverified coaches see "Pending Verification" banner
- [ ] Unverified coaches cannot create postings
- [ ] Verified coaches can create postings
- [ ] Profile image displays in "My Team" tab
- [ ] Falls back to icon if image URL is invalid

## Notes

- The frontend already handles both boolean and numeric (0/1) values for `is_verified`
- Profile image is cached in localStorage for quick access
- Verification status is cached in localStorage for quick access
- If backend doesn't return these fields, the frontend will fall back to localStorage values or defaults

