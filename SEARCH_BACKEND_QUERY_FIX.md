# Backend Query Fix for Search Results

## Current Issue

The backend query is missing `s.id` which is needed for navigation to school pages. Also, `logo_url` needs to be included in the GROUP BY clause.

## Current Query

```javascript
const [coachingStaffs] = await connection.execute(`
  SELECT 
    s.name as school,
    s.state, 
    s.conference, 
    s.division, 
    s.logo_url,
    COUNT(*) as coach_count
  FROM coach_profiles cp
  LEFT JOIN schools s ON cp.school_id = s.id
  WHERE s.name IS NOT NULL
    AND s.name != ''
  GROUP BY s.name, s.state, s.conference, s.division
  ORDER BY coach_count DESC, s.name ASC
`);
```

## Problems

1. **Missing `s.id`** - Needed for navigation (`/school/:schoolId`)
2. **Missing `s.logo_url` in GROUP BY** - MySQL requires all non-aggregated columns in GROUP BY
3. **Missing `s.conference` in GROUP BY** - Same issue

## Fixed Query

```javascript
const [coachingStaffs] = await connection.execute(`
  SELECT 
    s.id as school_id,
    s.name as school,
    s.state, 
    s.conference, 
    s.division, 
    s.logo_url,
    COUNT(*) as coach_count
  FROM coach_profiles cp
  LEFT JOIN schools s ON cp.school_id = s.id
  WHERE s.name IS NOT NULL
    AND s.name != ''
  GROUP BY s.id, s.name, s.state, s.conference, s.division, s.logo_url
  ORDER BY coach_count DESC, s.name ASC
`);
```

## Changes

1. ✅ Added `s.id as school_id` to SELECT
2. ✅ Added all non-aggregated columns to GROUP BY:
   - `s.id`
   - `s.name`
   - `s.state`
   - `s.conference`
   - `s.division`
   - `s.logo_url`

## Response Structure

The response will now include:
```json
{
  "coachingStaffs": [
    {
      "school_id": 123,
      "school": "Duke University",
      "state": "NC",
      "conference": "ACC",
      "division": "D1",
      "logo_url": "https://...",
      "coach_count": 5
    }
  ]
}
```

This ensures:
- ✅ `school_id` is available for navigation
- ✅ `logo_url` is preserved
- ✅ `state` is available for display
- ✅ Query is SQL-compliant (no GROUP BY errors)

