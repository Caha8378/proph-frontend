# Search Functionality Design Discussion

## Current State

### SearchBar Component Usage
- **LandingPage**: Uses `SearchBar` component
- **PlayerHomePage**: Uses `SearchBar` component  
- **CoachHome**: Uses `SearchBar` component
- **SupporterHomePage**: Uses `SearchBar` component

**Answer: Yes, they all use the same `SearchBar` component** - it's a reusable component in `src/components/common/SearchBar.tsx`

### SearchDropdown Component
- **PostingFeedPage**: Uses `SearchDropdown` (different component, for filtering postings)
- This is more of a filter dropdown, not a general search

## Proposed Search Scope

### Your Initial Proposal:
1. ✅ **Schools** - Search by school name
2. ✅ **Players** - Search by name and high school
3. ✅ **Coaching Staff** - Search by schools (to find coaches at schools)
4. ❌ **Postings** - You said no, and I agree for general search

## Professional Search Functionality Considerations

### What Most Platforms Include:

#### 1. **Unified Search Results**
Most platforms (LinkedIn, GitHub, etc.) show results in **categories**:
- **People** (players, coaches)
- **Organizations** (schools)
- **Content** (postings) - *but you're excluding this, which is fine*

#### 2. **Smart Query Parsing**
- Detect if query looks like a school name vs person name
- Handle partial matches intelligently
- Support multiple search terms

#### 3. **Search Result Types to Consider:**

**Players:**
- ✅ Name (first, last, full)
- ✅ High school name
- ✅ Current school (if they're in college)
- ✅ Position (optional - but useful)
- ✅ Graduation year (optional - "Class of 2025")

**Schools:**
- ✅ School name
- ✅ City/State (e.g., "Denver" or "Colorado")
- ✅ Division (D1, D2, D3, NAIA)
- ✅ Conference (optional)

**Coaches:**
- ✅ Coach name
- ✅ School they coach at
- ✅ Position title (Head Coach, Assistant, etc.)

#### 4. **What About Postings?**

**Arguments FOR including postings:**
- Users might search "Point Guard positions" or "D1 opportunities"
- Could be useful for players browsing opportunities
- Some platforms (like job boards) include postings in search

**Arguments AGAINST (your reasoning):**
- Postings are more time-sensitive and should be browsed via filters
- Postings page already has robust filtering
- Keeps search focused on entities (people/organizations)

**My Recommendation:** 
- **Exclude postings from general search** ✅
- Postings should be found via:
  - Dedicated postings page with filters
  - School pages (showing all postings for that school)
  - Recommended postings algorithm

#### 5. **Additional Considerations:**

**Recent Searches:**
- Store recent searches in localStorage
- Show in dropdown as user types

**Search Suggestions/Autocomplete:**
- Show suggestions as user types (debounced)
- Group by category (Schools, Players, Coaches)
- Highlight matching text

**Result Prioritization:**
- Exact matches first
- Then partial matches
- Consider popularity/activity (e.g., verified players first)

**Empty States:**
- "No results found" with suggestions
- "Did you mean...?" for typos
- Link to browse all schools/players

## Recommended Search Scope

### Primary Results:
1. **Schools** - By name, city, state, division
2. **Players** - By name, high school, current school
3. **Coaches** - By name, school they coach at

### Secondary (Nice to Have):
- **Position filtering** - "Point Guards" or "Shooting Guards"
- **Location filtering** - "Players in Colorado"
- **Graduation year** - "Class of 2025"

## Backend API Design

### Suggested Endpoint:
```
GET /api/search?q={query}&type={schools|players|coaches|all}&limit={number}
```

**Response:**
```json
{
  "query": "duke",
  "results": {
    "schools": [
      {
        "id": 1,
        "name": "Duke University",
        "logo": "...",
        "division": "D1",
        "location": "Durham, NC"
      }
    ],
    "players": [
      {
        "id": 123,
        "name": "John Duke",
        "school": "Lincoln High",
        "position": "PG",
        "photo": "..."
      }
    ],
    "coaches": [
      {
        "id": 45,
        "name": "Coach Duke",
        "school": "Duke University",
        "position_title": "Head Coach",
        "photo": "..."
      }
    ]
  },
  "total": 3
}
```

### Search Logic:

**For Players:**
```sql
SELECT * FROM player_profiles 
WHERE 
  name LIKE '%query%' 
  OR school LIKE '%query%'
  OR city LIKE '%query%'
  OR state LIKE '%query%'
LIMIT 10
```

**For Schools:**
```sql
SELECT * FROM schools
WHERE 
  name LIKE '%query%'
  OR city LIKE '%query%'
  OR state LIKE '%query%'
  OR conference LIKE '%query%'
LIMIT 10
```

**For Coaches:**
```sql
SELECT cp.*, s.name AS school_name, s.logo_url AS school_logo
FROM coach_profiles cp
LEFT JOIN schools s ON cp.school_id = s.id
WHERE 
  cp.name LIKE '%query%'
  OR s.name LIKE '%query%'
LIMIT 10
```

## UI/UX Considerations

### SearchBar Behavior:
1. **On Type** (debounced 300ms):
   - Show dropdown with suggestions
   - Group by category
   - Show top 3-5 per category

2. **On Submit/Enter**:
   - Navigate to search results page
   - Show all results grouped by category
   - Allow filtering by type

3. **On Click Result**:
   - Navigate to that entity's page
   - School → `/school/:schoolId`
   - Player → `/player/:playerId` or open modal
   - Coach → Coach profile page (if exists)

### Search Results Page:
- Tabs: "All", "Schools", "Players", "Coaches"
- Cards showing key info
- Click to navigate to detail page

## Questions to Consider

1. **Should search be global (Header) or page-specific?**
   - Currently it's on home pages
   - Could add to Header for global access

2. **Should search show suggestions as you type?**
   - Yes, for better UX
   - Requires debounced API calls

3. **Should search be scoped by user role?**
   - Players might care more about schools/coaches
   - Coaches care more about players
   - Could prioritize results by role

4. **Should we include "recent searches" or "trending searches"?**
   - Recent: localStorage-based
   - Trending: Backend analytics

## My Recommendations

✅ **Include in Search:**
- Schools (by name, location, division)
- Players (by name, high school, current school)
- Coaches (by name, school)

❌ **Exclude from Search:**
- Postings (use dedicated postings page with filters)

🎯 **Additional Features:**
- Autocomplete/suggestions as user types
- Recent searches
- Result grouping by category
- Click result → navigate to entity page

## Implementation Priority

**Phase 1 (MVP):**
- Basic search endpoint returning schools, players, coaches
- Simple search results page
- Click result → navigate to entity

**Phase 2 (Enhanced):**
- Autocomplete/suggestions
- Recent searches
- Result prioritization

**Phase 3 (Advanced):**
- Typo correction
- Search analytics
- Trending searches

