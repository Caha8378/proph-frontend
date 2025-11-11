# Backend Fix for Coach Postings

## Issues Fixed in Frontend

1. ✅ Logo sizing and overflow in header
2. ✅ School logo display in PostingCardCoach
3. ✅ Deadline now uses `application_deadline` from database

## Backend Query Update Needed

The current backend query doesn't JOIN with the `schools` table, so `school_logo` won't be available. The frontend will show a placeholder if the logo is missing.

### Current Query (Missing School Data):
```javascript
const [postings] = await connection.execute(
  `SELECT 
    rp.*,
    cp.name AS created_by_coach_name,
    COUNT(DISTINCT ra.id) AS application_count
  FROM recruitment_postings rp
  LEFT JOIN coach_profiles cp ON rp.coach_user_id = cp.user_id
  LEFT JOIN recruitment_applications ra ON rp.id = ra.posting_id
  WHERE rp.school_id = ?
  GROUP BY rp.id
  ORDER BY rp.is_active DESC, rp.created_at DESC`,
  [school_id]
);
```

### Recommended Query (With School Data):
```javascript
const [postings] = await connection.execute(
  `SELECT 
    rp.*,
    cp.name AS created_by_coach_name,
    s.name AS school_name,
    s.logo_url AS school_logo,
    s.division AS school_division,
    s.city AS school_city,
    s.state AS school_state,
    s.conference AS school_conference,
    COUNT(DISTINCT ra.id) AS application_count
  FROM recruitment_postings rp
  LEFT JOIN coach_profiles cp ON rp.coach_user_id = cp.user_id
  LEFT JOIN schools s ON rp.school_id = s.id
  LEFT JOIN recruitment_applications ra ON rp.id = ra.posting_id
  WHERE rp.school_id = ?
  GROUP BY rp.id, s.id, s.name, s.logo_url, s.division, s.city, s.state, s.conference
  ORDER BY rp.is_active DESC, rp.created_at DESC`,
  [school_id]
);
```

## Required Fields

The backend response should include:
- ✅ `application_deadline` - Already in `rp.*`, frontend now uses it
- ⚠️ `school_logo` (as `school_logo`) - Need to add JOIN with schools table
- ⚠️ `school_name` - Need to add JOIN with schools table
- ⚠️ `school_division` - Need to add JOIN with schools table

## Frontend Handling

The frontend will:
- Use `application_deadline` if provided, otherwise default to 30 days from creation
- Display school logo if `school_logo` is available
- Show placeholder if logo is missing
- Format deadline as "MMM DD" (e.g., "Dec 01", "Nov 15")

